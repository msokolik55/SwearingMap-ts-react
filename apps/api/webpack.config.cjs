const { NxAppWebpackPlugin } = require("@nx/webpack/app-plugin");
const { join } = require("path");

module.exports = {
	output: {
		path: join(__dirname, "../../dist/apps/api"),
		clean: true,
		...(process.env.NODE_ENV !== "production" && {
			devtoolModuleFilenameTemplate: "[absolute-resource-path]",
		}),
	},
	plugins: [
		new NxAppWebpackPlugin({
			target: "node",
			compiler: "tsc",
			main: "./src/main.ts",
			tsConfig: "./tsconfig.app.json",
			assets: ["./src/assets"],
			optimization: false,
			outputHashing: "none",
			externalDependencies: [
				"@nestjs/common",
				"@nestjs/config",
				"@nestjs/core",
				"@nestjs/platform-express",
				"@nestjs/swagger",
				"@prisma/adapter-pg",
				"@prisma/client",
				"class-transformer",
				"class-validator",
				"pg",
				"reflect-metadata",
				"rxjs",
			],
			generatePackageJson: true,
			sourceMap: true,
		}),
	],
};
