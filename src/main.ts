import { Plugin, TFile, TFolder, Menu, TAbstractFile, PluginSettingTab, App, Setting, Notice } from "obsidian";
import { execFile } from "child_process";

interface ObsidianAgentsSettings {
  terminalApp: "terminal" | "iterm2";
  agentCommand: string;
}

const DEFAULT_SETTINGS: ObsidianAgentsSettings = {
  terminalApp: "terminal",
  agentCommand: "claude",
};

export default class ObsidianAgentsPlugin extends Plugin {
  settings: ObsidianAgentsSettings = DEFAULT_SETTINGS;

  async onload() {
    if (process.platform !== "darwin") {
      new Notice("Agents plugin requires macOS.");
      return;
    }

    await this.loadSettings();

    this.registerEvent(
      this.app.workspace.on("file-menu", (menu: Menu, file: TAbstractFile) => {
        menu.addItem((item) => {
          item
            .setTitle("Open with agent")
            .setIcon("terminal")
            .onClick(() => this.launchAgent(file));
        });
      })
    );

    this.addSettingTab(new ObsidianAgentsSettingTab(this.app, this));
  }

  private getVaultBasePath(): string | null {
    const adapter = this.app.vault.adapter as unknown as { basePath: string };
    return adapter.basePath ?? null;
  }

  private launchAgent(file: TAbstractFile) {
    const basePath = this.getVaultBasePath();
    if (!basePath) {
      new Notice("Could not determine vault path");
      return;
    }

    let cwd: string;
    let args: string;

    if (file instanceof TFile) {
      // For files: CWD is parent directory, pass file path as context
      const parentPath = file.parent ? file.parent.path : "";
      cwd = parentPath ? `${basePath}/${parentPath}` : basePath;
      const relativePath = file.path;
      args = ` ${JSON.stringify(`We are going to work on ${relativePath}. Please prompt me for the next instruction.`)}`;
    } else if (file instanceof TFolder) {
      // For folders: CWD is the folder itself
      cwd = file.path === "/" ? basePath : `${basePath}/${file.path}`;
      args = "";
    } else {
      return;
    }

    const agentCmd = this.settings.agentCommand;
    const command = `cd ${this.shellQuote(cwd)} && ${agentCmd}${args}`;

    let script: string;
    if (this.settings.terminalApp === "iterm2") {
      script = this.buildITermScript(command);
    } else {
      script = this.buildTerminalScript(command);
    }

    execFile("osascript", ["-e", script], (error) => {
      if (error) {
        new Notice(`Failed to launch terminal: ${error.message}`);
      }
    });
  }

  private shellQuote(s: string): string {
    return JSON.stringify(s);
  }

  private buildTerminalScript(command: string): string {
    const escaped = command.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    return `tell application "Terminal"
  activate
  do script "${escaped}"
end tell`;
  }

  private buildITermScript(command: string): string {
    const escaped = command.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    return `tell application "iTerm2"
  create window with default profile
  tell current session of current window
    write text "${escaped}"
  end tell
end tell`;
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

class ObsidianAgentsSettingTab extends PluginSettingTab {
  plugin: ObsidianAgentsPlugin;

  constructor(app: App, plugin: ObsidianAgentsPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("Terminal application")
      .setDesc("Which terminal to open the agent in")
      .addDropdown((dropdown) =>
        dropdown
          .addOption("terminal", "Terminal.app")
          .addOption("iterm2", "iTerm 2")
          .setValue(this.plugin.settings.terminalApp)
          .onChange(async (value) => {
            this.plugin.settings.terminalApp = value as "terminal" | "iterm2";
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Agent command")
      .setDesc("Command to launch the agent (e.g., claude, codex)")
      .addText((text) =>
        text
          .setPlaceholder("claude")
          .setValue(this.plugin.settings.agentCommand)
          .onChange(async (value) => {
            this.plugin.settings.agentCommand = value || "claude";
            await this.plugin.saveSettings();
          })
      );
  }
}
