import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navigation from "@/components/Navigation/Navigation";
import styles from "./layout.module.css";

const snSans = localFont({
	variable: "--font-sn-sans",
	src: [
		{
			path: "./fonts/ServiceNowSans-Regular.woff2",
			weight: "400",
			style: "normal",
		},
		{
			path: "./fonts/ServiceNowSans-DisplayBold.woff2",
			weight: "700",
			style: "normal",
		},
		{
			path: "./fonts/ServiceNowSans-Light.woff2",
			weight: "300",
			style: "normal",
		},
		{
			path: "./fonts/ServiceNowSans-Thin.woff2",
			weight: "100",
			style: "normal",
		},
		{
			path: "./fonts/ServiceNowSans-DisplayMedium.woff2",
			weight: "500",
			style: "normal",
		},
	],
});

export const metadata: Metadata = {
	title: "Content Tools",
	description: "Content Tools",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className={`${snSans.className}`}>
				<Navigation />
				<main className={styles.main}>{children}</main>
			</body>
		</html>
	);
}
