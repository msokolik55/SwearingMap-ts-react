import type { Metadata } from "next";

import "./styles.css";

export const metadata: Metadata = {
	title: {
		default: "Swearing Map",
		template: "%s · Swearing Map",
	},
	description:
		"Explore how expressive language changes across borders and cultural contexts.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
