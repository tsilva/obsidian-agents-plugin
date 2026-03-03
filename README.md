<div align="center">
  <img src="logo.png" alt="obsidian-agents" width="512"/>

  # obsidian-agents

  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
  [![Obsidian](https://img.shields.io/badge/Obsidian-plugin-7c3aed.svg)](https://obsidian.md)
  [![Desktop Only](https://img.shields.io/badge/platform-desktop-blue.svg)]()

  🚀 Launch AI agents from your Obsidian vault — right-click any file or folder to open a terminal with context 🤖

</div>

## Overview

**The Pain:** Switching between Obsidian and the terminal to work with AI agents breaks your flow. You have to navigate to the right directory, remember file paths, and manually set up context.

**The Solution:** obsidian-agents adds right-click context menu items directly in Obsidian. Click any file or folder to instantly launch your AI agent in a terminal, already pointed at the right path.

**The Result:** Zero context-switching — go from reading notes to AI-assisted coding in one click.

## Features

- ⚡ **One-click launch** — right-click any file or folder to open your configured AI agent
- 📁 **Smart context** — files open your agent with the file path pre-loaded; folders open the agent in that directory
- 🖥️ **Terminal choice** — supports Terminal.app and iTerm2
- ⚙️ **Configurable** — customize the agent command and terminal app in settings

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

3. Right-click any file or folder in the file explorer → **Open with AI Agent**

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

3. Right-click any file or folder in the file explorer → **Open with AI Agent**

### First-Time Setup (Important!)

The first time you use the plugin, macOS will block it with error **-1743** (permission denied). You must grant Obsidian permission to control your terminal:

1. Open **System Settings → Privacy & Security → Automation**
2. Find **Obsidian** in the list
3. Enable the checkbox next to **Terminal** (or **iTerm2** if using that)
4. Try right-clicking again in Obsidian — it should now work

> 💡 **Tip:** If you don't see the permission prompt, manually trigger the error once by right-clicking a file and selecting "Open with AI Agent", then check System Settings.

### Settings

| Setting | Default | Description |
|---------|---------|-------------|
| Terminal App | Terminal.app | Choose between Terminal.app and iTerm2 |
| Agent Command | `claude` | Command to launch the AI agent (e.g., `claude`, `codex`) |

## How It Works

- **Right-click a file** → Opens a terminal in the file's parent directory with your AI agent and the file path pre-loaded
- **Right-click a folder** → Opens a terminal in that folder with your AI agent ready to go

The plugin uses AppleScript to launch your preferred terminal emulator (macOS only).

## Requirements

- macOS (desktop only)
- An AI agent CLI installed (e.g., [Claude Code](https://docs.anthropic.com/en/docs/claude-code), [Codex](https://github.com/openai/codex), etc.)
- Obsidian v1.0.0+

## License

[MIT](LICENSE)
