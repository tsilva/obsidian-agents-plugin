<div align="center">

# obsidian-agents

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Obsidian](https://img.shields.io/badge/Obsidian-plugin-7c3aed.svg)](https://obsidian.md)
[![Desktop Only](https://img.shields.io/badge/platform-desktop-blue.svg)]()

🚀 Launch Claude Code from your Obsidian vault — right-click any file or folder to open a terminal with context 🤖

</div>

## Overview

**The Pain:** Switching between Obsidian and the terminal to work with Claude Code breaks your flow. You have to navigate to the right directory, remember file paths, and manually set up context.

**The Solution:** obsidian-agents adds right-click context menu items directly in Obsidian. Click any file or folder to instantly launch Claude Code in your terminal, already pointed at the right path.

**The Result:** Zero context-switching — go from reading notes to AI-assisted coding in one click.

## Features

- ⚡ **One-click launch** — right-click any file or folder to open Claude Code
- 📁 **Smart context** — files open Claude with the file path pre-loaded; folders open Claude in that directory
- 🖥️ **Terminal choice** — supports Terminal.app and iTerm2
- ⚙️ **Configurable** — customize the Claude command path and terminal app in settings

## Quick Start

### Automated Install (Recommended)

1. Clone and install:
   ```bash
   git clone https://github.com/tsilva/obsidian-agents.git
   cd obsidian-agents
   npm install
   bash install.sh
   ```

2. Enable the plugin in Obsidian: **Settings → Community Plugins → Obsidian Agents**

3. Right-click any file or folder in the file explorer → **Open with Claude Code**

### Manual Install

If the automated installer doesn't detect your vault or you prefer full control:

1. Clone this repo into your vault's plugin directory:
   ```bash
   cd /path/to/vault/.obsidian/plugins
   git clone https://github.com/tsilva/obsidian-agents.git
   cd obsidian-agents
   npm install && npm run build
   ```

2. Enable the plugin in Obsidian: **Settings → Community Plugins → Obsidian Agents**

3. Right-click any file or folder in the file explorer → **Open with Claude Code**

### Settings

| Setting | Default | Description |
|---------|---------|-------------|
| Terminal App | Terminal.app | Choose between Terminal.app and iTerm2 |
| Claude Command | `claude` | Path to the Claude CLI executable |

## How It Works

- **Right-click a file** → Opens a terminal in the file's parent directory with `claude "Regarding <path>: "`
- **Right-click a folder** → Opens a terminal in that folder with `claude` ready to go

The plugin uses AppleScript to launch your preferred terminal emulator (macOS only).

## Requirements

- macOS (desktop only)
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) CLI installed
- Obsidian v1.0.0+

## License

[MIT](LICENSE)
