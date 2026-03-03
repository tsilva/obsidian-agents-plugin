# CLAUDE.md

## Project: obsidian-agents

An Obsidian plugin that adds right-click context menu items to launch Claude Code in the system terminal. macOS-only, desktop-only.

## Architecture

Single-file plugin (`src/main.ts`) built with esbuild. Registers a `file-menu` event handler that adds "Open with Claude Code" to the right-click context menu. Uses AppleScript via `child_process.execFile` to launch Terminal.app or iTerm2.

- **File right-click**: Opens terminal in the file's parent directory, pre-feeds `claude "Regarding <path>: "`
- **Folder right-click**: Opens terminal in that directory with `claude`

## Build

```bash
npm install
npm run build    # production build → main.js
npm run dev      # watch mode
```

## Key Files

- `src/main.ts` — plugin source (entry point, menu handler, terminal launcher, settings)
- `manifest.json` — Obsidian plugin manifest
- `esbuild.config.mjs` — build configuration
- `install.sh` — automated install script with vault auto-detection
- `main.js` — build output (gitignored)

## Testing

Install into an Obsidian vault:
```bash
ln -s /path/to/obsidian-agents /path/to/vault/.obsidian/plugins/obsidian-agents
```
Enable in Settings → Community Plugins, then right-click files/folders in the file explorer.

## Maintenance

README.md must be kept up to date with any significant project changes.
