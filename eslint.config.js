import js from "@eslint/js";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
	{ ignores: [".pnpm-store", "coverage", "dist", "node_modules"] },
	js.configs.recommended,
	...tseslint.configs.recommended,
	{
		files: ["**/*.{ts,tsx}"],
		languageOptions: {
			globals: globals.browser,
		},
		plugins: {
			"jsx-a11y": jsxA11y,
			"react-hooks": reactHooks,
			"react-refresh": reactRefresh,
		},
		rules: {
			...jsxA11y.flatConfigs.recommended.rules,
			...reactHooks.configs.recommended.rules,
			"react-refresh/only-export-components": [
				"error",
				{ allowConstantExport: true },
			],
		},
	},
	{
		files: ["**/*.{js,cjs,mjs}"],
		languageOptions: {
			globals: globals.node,
		},
		rules: {
			"@typescript-eslint/no-require-imports": "off",
		},
	}
);
