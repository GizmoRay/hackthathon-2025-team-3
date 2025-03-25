"use client";

import { FC } from "react";
import styles from "./Navigation.module.css";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const Navigation: FC = () => {
	const pathname = usePathname();

	return (
		<nav className={styles.nav}>
			<div className={styles.container}>
				<Link href="/" className={styles.logoContainer}>
					<div className={styles.logo}>
						<Image
							src="/Stars.svg"
							alt="ServiceNow Intelligent Style Guide"
							width={21}
							height={21}
						/>
					</div>
					<div className={styles.title}>ServiceNow Intelligent Style Guide</div>
				</Link>
				<nav className={styles.navLinks}>
					<Link
						href="/copy-analyzer"
						className={`${styles.toolButton} ${
							pathname === "/copy-analyzer" ? styles.active : ""
						}`}
					>
						<span>Copy Analyzer</span>
					</Link>

					<Link
						href="/ask"
						className={`${styles.toolButton} ${
							pathname === "/ask" ? styles.active : ""
						}`}
					>
						<span>Style Guide Wizard</span>
					</Link>

					<Link
						href="/regional"
						className={`${styles.toolButton} ${
							pathname === "/regional" ? styles.active : ""
						}`}
					>
						<span>Regional Experience</span>
					</Link>
				</nav>
			</div>
		</nav>
	);
};

export default Navigation;
