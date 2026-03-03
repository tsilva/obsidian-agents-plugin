# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project: Agents (Obsidian Plugin)

An Obsidian community plugin (ID: `agents`) that launches AI agents from your vault. Right-click any file or folder to open a terminal with context. macOS only.

- Plugin ID: `agents` (no "obsidian" in ID/name — required by community plugin validator)
- Entry point: `src/main.ts`
- Build: `npm run build` (runs tsc + esbuild)
- Release: push a semver tag (e.g., `git tag 1.0.0 && git push origin 1.0.0`) to trigger the GitHub Actions release workflow

## Maintenance

README.md must be kept up to date with any significant project changes.
