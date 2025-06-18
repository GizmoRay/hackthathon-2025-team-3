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
					<div className={styles.title}>ServiceNow OneVoice Assist</div>
				</Link>
				<nav className={styles.navLinks}>
					<Link
						href="/copy-analyzer"
						className={`${styles.toolButton} ${
							pathname === "/copy-analyzer" ? styles.active : ""
						}`}
					>
						<span>ServiceNow Writing Buddy</span>
					</Link>

					<div className={styles.dropdown}>
						<button className={styles.toolButton}>
							<span>Assistants</span>
							<span className={styles.caret}>
								<Image
									src="/caret-down.svg"
									alt="caret down icon"
									width={16}
									height={16}
								/>
							</span>
						</button>
						<div className={styles.dropdownContent}>
							<Link
								href="/ask"
								className={`${styles.dropdownItem} ${
									pathname === "/ask" ? styles.active : ""
								}`}
							>
								Brand Style Checker
							</Link>
							<Link
								href="/ai-messaging-assistant"
								className={`${styles.dropdownItem} ${
									pathname === "/ai-messaging-assistant" ? styles.active : ""
								}`}
							>
								AI Messaging Assistant
							</Link>
							<Link
								href="/competitive-intelligence-assistant"
								className={`${styles.dropdownItem} ${
									pathname === "/competitive-intelligence-assistant"
										? styles.active
										: ""
								}`}
							>
								Competitive Intelligence Assistant
							</Link>
						</div>
					</div>
				</nav>
				<div className={styles.sideApps}>
					<Image
						src="/microphone.svg"
						alt="microphone icon"
						width={40}
						height={20}
					/>
					<Image
						src="/language-globe.svg"
						alt="language globe icon"
						width={20}
						height={20}
					/>
				</div>
			</div>
		</nav>
	);
};

export default Navigation;
