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
	{
		files: ["src/app/**/*.ts"],
		ignores: [
			"src/app/database/**/*.ts",
			"src/app/**/*.repository.ts",
			"src/app/**/*.integration.test.ts",
		],
		rules: {
			"no-restricted-imports": [
				"error",
				{
					patterns: [
						{
							group: [
								"**/database/prisma.service",
								"**/generated/prisma/client",
							],
							message:
								"Domain code must access persistence through an injected repository.",
						},
					],
				},
			],
		},
	},
];
