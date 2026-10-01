import obsidianmd from "eslint-plugin-obsidianmd";
import tseslint from "typescript-eslint";

// Keep the existing Obsidian rule scope when consuming the plugin's flat configs.
const obsidianRules = Object.fromEntries(
  obsidianmd.configs.recommended.flatMap((config) =>
    Object.entries(config.rules ?? {}).filter(([name]) => name.startsWith("obsidianmd/")),
  ),
);

export default [
  tseslint.configs.base,
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    plugins: {
      obsidianmd,
    },
    rules: {
      ...obsidianRules,
      // Disable rules that require type-aware linting
      "obsidianmd/no-plugin-as-component": "off",
      "obsidianmd/no-tfile-tfolder-cast": "off",
      "obsidianmd/no-view-references-in-plugin": "off",
      "obsidianmd/prefer-file-manager-trash-file": "off",
    },
  },
];
