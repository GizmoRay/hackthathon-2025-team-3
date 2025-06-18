"use client";

import { FC, useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import styles from "./Navigation.module.css";

const Navigation: FC = () => {
	const pathname = usePathname();
	const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
	const [assistantsDropdownOpen, setAssistantsDropdownOpen] = useState(false);
	const languageDropdownRef = useRef<HTMLDivElement>(null);
	const assistantsDropdownRef = useRef<HTMLDivElement>(null);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			// Close language dropdown if click is outside
			if (
				languageDropdownRef.current &&
				!languageDropdownRef.current.contains(event.target as Node)
			) {
				setLanguageDropdownOpen(false);
			}

			// Close assistants dropdown if click is outside
			if (
				assistantsDropdownRef.current &&
				!assistantsDropdownRef.current.contains(event.target as Node)
			) {
				setAssistantsDropdownOpen(false);
			}
		};

		// Add event listener
		document.addEventListener("mousedown", handleClickOutside);

		// Clean up
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

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
					<div className={styles.dropdown} ref={assistantsDropdownRef}>
						<button
							className={styles.toolButton}
							onClick={() => setAssistantsDropdownOpen((prev) => !prev)}
							aria-expanded={assistantsDropdownOpen}
						>
							<span>Assistants</span>
							<span
								className={
									assistantsDropdownOpen ? styles.caretUp : styles.caret
								}
							>
								<Image
									src="/caret-down.svg"
									alt="caret down icon"
									width={16}
									height={16}
								/>
							</span>
						</button>
						<div
							className={`${styles.dropdownContent} ${
								assistantsDropdownOpen ? styles.show : ""
							}`}
						>
							<Link
								href="/ask"
								className={`${styles.dropdownItem} ${
									pathname === "/ask" ? styles.active : ""
								}`}
								onClick={() => setAssistantsDropdownOpen(false)}
							>
								Brand Style Checker
							</Link>
							<Link
								href="/ai-messaging-assistant"
								className={`${styles.dropdownItem} ${
									pathname === "/ai-messaging-assistant" ? styles.active : ""
								}`}
								onClick={() => setAssistantsDropdownOpen(false)}
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
								onClick={() => setAssistantsDropdownOpen(false)}
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
						className={styles.microphoneIcon}
					/>
					<div className={styles.languageDropdown} ref={languageDropdownRef}>
						<button
							className={styles.languageButton}
							onClick={() => setLanguageDropdownOpen((prev) => !prev)}
							aria-expanded={languageDropdownOpen}
						>
							<Image
								src="/language-globe.svg"
								alt="language globe icon"
								width={20}
								height={20}
							/>
							<span
								className={languageDropdownOpen ? styles.caretUp : styles.caret}
							>
								<Image
									src="/caret-down.svg"
									alt="caret down icon"
									width={12}
									height={12}
								/>
							</span>
						</button>
						<div
							className={`${styles.languageContent} ${
								languageDropdownOpen ? styles.show : ""
							}`}
							role="menu"
						>
							<button
								className={`${styles.languageItem} ${styles.active}`}
								role="menuitem"
							>
								English
							</button>
							<button className={styles.languageItem} role="menuitem">
								French
							</button>
							<button className={styles.languageItem} role="menuitem">
								German
							</button>
							<button className={styles.languageItem} role="menuitem">
								Japanese
							</button>
							<button className={styles.languageItem} role="menuitem">
								Spanish
							</button>
							<button className={styles.languageItem} role="menuitem">
								Korean
							</button>
							<button className={styles.languageItem} role="menuitem">
								Italian
							</button>
							<button className={styles.languageItem} role="menuitem">
								Portuguese
							</button>
						</div>
					</div>
				</div>
			</div>
		</nav>
	);
};

export default Navigation;
