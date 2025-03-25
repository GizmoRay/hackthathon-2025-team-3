"use client";

import { FC } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import styles from "./Title.module.css";
import Arrow from "@/components/Arrow/Arrow";

interface TitleProps {
	title?: string;
	type?: "hub" | "";
	description: string;
}

const Title: FC<TitleProps> = ({
	title = "Intelligent Style Guide Toolkit",
	description,
	type,
}) => {
	const pathname = usePathname();

	return (
		<section className={`${styles.titleSection}, ${styles[type!]}`}>
			<div className={styles.container}>
				<h2 className={styles.title}>{title}</h2>
				<p className={styles.description}>{description}</p>
			</div>
			{/* {type !== "hub" && (
				<div className={styles.toolSwitcher}>
					<Link
						href="/copy-analyzer"
						className={`${styles.toolButton} ${
							pathname === "/copy-analyzer" ? styles.active : ""
						}`}
					>
						Copy Analyzer
					</Link>
					<Link
						href="/ask"
						className={`${styles.toolButton} ${
							pathname === "/ask" ? styles.active : ""
						}`}
					>
						Ask a Question
					</Link>
					<Link
						href="/regional"
						className={`${styles.toolButton} ${
							pathname === "/regional" ? styles.active : ""
						}`}
					>
						Regional Experience
					</Link>
				</div>
			)} */}
			{type === "hub" && (
				<div className={styles.hubSwapper}>
					<div className={styles.hubItem}>
						<Image
							src="/analyze.png"
							alt="ServiceNow Intelligent Style Guide"
							width={299}
							height={168}
							className={styles.hubImage}
						/>
						<h2>Copy Analyzer</h2>
						<p>
							Paste in draft copy and watch the magic. This tool highlights
							grammar, style, and legal issues and links to info on corrections.
						</p>
						<Link
							href="/copy-analyzer"
							className={`${styles.outlineButton} ${
								pathname === "/copy-analyzer" ? styles.active : ""
							}`}
						>
							Try Now <Arrow size={16} />
						</Link>
					</div>
					<div className={styles.hubItem}>
						<Image
							src="/ask.png"
							alt="ServiceNow Intelligent Style Guide"
							width={299}
							height={168}
							className={styles.hubImage}
						/>
						<h2>Style Guide Wizard</h2>
						<p>
							Use this search bar style tool to ask a question or search for
							answers on a specific style guide question.
						</p>
						<Link
							href="/ask"
							className={`${styles.outlineButton} ${
								pathname === "/ask" ? styles.active : ""
							}`}
						>
							Try Now <Arrow size={16} />
						</Link>
					</div>
					<div className={styles.hubItem}>
						<Image
							src="/regional.png"
							alt="ServiceNow Intelligent Style Guide"
							width={299}
							height={168}
							className={styles.hubImage}
						/>
						<h2>Regional Experience BETA</h2>
						<p>
							Want to re-purpose your US copy for a UK campaign? This tool
							highlights spelling and word choices that might be an issue.
						</p>
						<Link
							href="/regional"
							className={`${styles.outlineButton} ${
								pathname === "/regional" ? styles.active : ""
							}`}
						>
							Try Now <Arrow size={16} />
						</Link>
					</div>
				</div>
			)}
		</section>
	);
};

export default Title;
