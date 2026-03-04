import obsidianmd from "eslint-plugin-obsidianmd";
import tseslint from "typescript-eslint";

export default [
  tseslint.configs.base,
  {
    files: ["src/**/*.ts"],
    plugins: {
      obsidianmd,
    },
    rules: {
      ...obsidianmd.configs.recommended,
      "obsidianmd/ui/sentence-case": ["error", { brands: ["iTerm2"] }],
      // Disable rules that require type-aware linting
      "obsidianmd/no-plugin-as-component": "off",
      "obsidianmd/no-tfile-tfolder-cast": "off",
      "obsidianmd/no-view-references-in-plugin": "off",
      "obsidianmd/prefer-file-manager-trash-file": "off",
    },
  },
];
