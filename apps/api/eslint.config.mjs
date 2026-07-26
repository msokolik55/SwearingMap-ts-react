import baseConfig from "../../eslint.config.js";
import globals from "globals";

export default [
	...baseConfig,
	{
		files: ["src/**/*.ts"],
		languageOptions: {
			globals: globals.node,
		},
		rules: {
			"react-refresh/only-export-components": "off",
		},
	},
];
