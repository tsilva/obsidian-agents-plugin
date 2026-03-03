#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VAULTS_FILE="$HOME/Library/Application Support/obsidian/obsidian.json"

echo "🔍 Detecting Obsidian vaults..."

# Function to parse vaults from obsidian.json using available tools
parse_vaults_from_json() {
    if [[ ! -f "$VAULTS_FILE" ]]; then
        return 1
    fi

    local vaults_json
    vaults_json=$(cat "$VAULTS_FILE" 2>/dev/null) || return 1

    # Try jq first (most reliable)
    if command -v jq &>/dev/null; then
        echo "$vaults_json" | jq -r '.vaults | to_entries[] | .value.path' 2>/dev/null
        return 0
    fi

    # Try python3 fallback
    if command -v python3 &>/dev/null; then
        python3 -c "
import json
import sys
try:
    data = json.load(sys.stdin)
    for vault in data.get('vaults', {}).values():
        print(vault.get('path', ''))
except: pass
" <<< "$vaults_json" 2>/dev/null
        return 0
    fi

    # Fallback to grep/sed (less reliable but functional)
    echo "$vaults_json" | grep -o '"path"[^}]*' | grep -o ':"[^"]*"' | sed 's/://; s/"//g' 2>/dev/null
    return 0
}

# Function to validate vault path
is_valid_vault() {
    local path="$1"
    [[ -d "$path" && -d "$path/.obsidian" ]]
}

# Function to search for vaults by looking for .obsidian directories
search_for_vaults() {
    local search_dirs=("$HOME/Documents" "$HOME/Desktop" "$HOME")
    local found_vaults=()

    for dir in "${search_dirs[@]}"; do
        if [[ -d "$dir" ]]; then
            while IFS= read -r -d '' obsidian_dir; do
                local vault_path
                vault_path=$(dirname "$obsidian_dir")
                if is_valid_vault "$vault_path"; then
                    found_vaults+=("$vault_path")
                fi
            done < <(find "$dir" -maxdepth 3 -name ".obsidian" -type d -print0 2>/dev/null)
        fi
    done

    # Remove duplicates and print
    printf '%s\n' "${found_vaults[@]}" | sort -u
}

# Collect valid vaults
VALID_VAULTS=()

# First, try to get vaults from obsidian.json
if [[ -f "$VAULTS_FILE" ]]; then
    while IFS= read -r path; do
        if [[ -n "$path" ]] && is_valid_vault "$path"; then
            VALID_VAULTS+=("$path")
        fi
    done < <(parse_vaults_from_json)
fi

# If no vaults found from JSON, search filesystem
if [[ ${#VALID_VAULTS[@]} -eq 0 ]]; then
    echo "   No vaults found in obsidian.json, searching common directories..."
    while IFS= read -r path; do
        if [[ -n "$path" ]]; then
            # Check if not already in array
            local already_exists=false
            for existing in "${VALID_VAULTS[@]}"; do
                if [[ "$existing" == "$path" ]]; then
                    already_exists=true
                    break
                fi
            done
            if [[ "$already_exists" == false ]]; then
                VALID_VAULTS+=("$path")
            fi
        fi
    done < <(search_for_vaults)
fi

# Handle vault selection
if [[ ${#VALID_VAULTS[@]} -eq 0 ]]; then
    echo "   ⚠️  No vaults detected automatically."
    echo ""
    read -rp "Enter the path to your Obsidian vault: " VAULT_PATH
    if [[ ! -d "$VAULT_PATH/.obsidian" ]]; then
        echo "❌ Error: '$VAULT_PATH' does not appear to be a valid Obsidian vault (missing .obsidian/ directory)"
        exit 1
    fi
    SELECTED_VAULT="$VAULT_PATH"
elif [[ ${#VALID_VAULTS[@]} -eq 1 ]]; then
    SELECTED_VAULT="${VALID_VAULTS[0]}"
    echo "   ✅ Found vault: $SELECTED_VAULT"
else
    echo ""
    echo "Multiple vaults detected:"
    for i in "${!VALID_VAULTS[@]}"; do
        echo "   [$i] ${VALID_VAULTS[$i]}"
    done
    echo ""
    while true; do
        read -rp "Select vault number [0-$(( ${#VALID_VAULTS[@]} - 1 ))]: " selection
        if [[ "$selection" =~ ^[0-9]+$ ]] && [[ "$selection" -lt ${#VALID_VAULTS[@]} ]]; then
            SELECTED_VAULT="${VALID_VAULTS[$selection]}"
            break
        fi
        echo "   Invalid selection. Please try again."
    done
fi

echo ""
echo "📦 Selected vault: $SELECTED_VAULT"

# Build if needed
if [[ ! -f "$SCRIPT_DIR/main.js" ]]; then
    echo "🔨 Building plugin..."
    if [[ ! -d "$SCRIPT_DIR/node_modules" ]]; then
        echo "   Installing dependencies..."
        npm install --prefix "$SCRIPT_DIR"
    fi
    npm run build --prefix "$SCRIPT_DIR"
    echo "   ✅ Build complete"
else
    echo "   ✅ Plugin already built"
fi

# Create symlink
PLUGINS_DIR="$SELECTED_VAULT/.obsidian/plugins"
TARGET_LINK="$PLUGINS_DIR/obsidian-agents"

echo ""
echo "🔗 Installing plugin..."

# Ensure plugins directory exists
mkdir -p "$PLUGINS_DIR"

# Check if already installed correctly
if [[ -L "$TARGET_LINK" ]]; then
    current_target=$(readlink "$TARGET_LINK")
    if [[ "$current_target" == "$SCRIPT_DIR" ]]; then
        echo "   ✅ Plugin already installed and linked correctly"
    else
        echo "   ⚠️  Symlink exists but points to: $current_target"
        read -rp "   Replace with correct link? [Y/n]: " confirm
        if [[ "$confirm" =~ ^[Nn]$ ]]; then
            echo "   ❌ Installation cancelled"
            exit 1
        fi
        rm "$TARGET_LINK"
        ln -s "$SCRIPT_DIR" "$TARGET_LINK"
        echo "   ✅ Symlink updated"
    fi
elif [[ -e "$TARGET_LINK" ]]; then
    echo "   ⚠️  $TARGET_LINK exists but is not a symlink"
    read -rp "   Remove and create symlink? [Y/n]: " confirm
    if [[ "$confirm" =~ ^[Nn]$ ]]; then
        echo "   ❌ Installation cancelled"
        exit 1
    fi
    rm -rf "$TARGET_LINK"
    ln -s "$SCRIPT_DIR" "$TARGET_LINK"
    echo "   ✅ Symlink created"
else
    ln -s "$SCRIPT_DIR" "$TARGET_LINK"
    echo "   ✅ Plugin linked to vault"
fi

echo ""
echo "🎉 Installation complete!"
echo ""
echo "Next steps:"
echo "   1. Open Obsidian"
echo "   2. Go to Settings → Community Plugins"
echo "   3. Enable 'Obsidian Agents'"
echo "   4. Right-click any file or folder → 'Open with Claude Code'"
echo ""
