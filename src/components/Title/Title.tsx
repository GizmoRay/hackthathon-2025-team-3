"use client";

import { FC } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Title.module.css";

interface TitleProps {
	title?: string;
	description: string;
}

const Title: FC<TitleProps> = ({
	title = "Intelligent Style Guide Toolkit",
	description,
}) => {
	const pathname = usePathname();

	return (
		<section className={styles.titleSection}>
			<div className={styles.container}>
				<h2 className={styles.title}>{title}</h2>
				<p className={styles.description}>{description}</p>
			</div>
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
		</section>
	);
};

export default Title;
