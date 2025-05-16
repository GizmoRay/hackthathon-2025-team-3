"use client";

import { FC } from "react";
import Link from "next/link";
import Image from "next/image";
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
							src="/CIO.png"
							alt="ServiceNow Intelligent Style Guide"
							width={299}
							height={168}
							className={styles.hubImage}
						/>
						<h2>CIO</h2>
						<p>
							Ask questions to a CIO persona, to understand their needs around
							ServiceNow, and their industry.
						</p>
						<Link href="/ask?persona=cio" className={`${styles.outlineButton}`}>
							Try Now <Arrow size={16} />
						</Link>
					</div>
					<div className={styles.hubItem}>
						<Image
							src="/CRM.png"
							alt="ServiceNow Intelligent Style Guide"
							width={299}
							height={168}
							className={styles.hubImage}
						/>
						<h2>CCO</h2>
						<p>
							Ask questions to a CCO persona, to understand their needs around
							ServiceNow, and their industry.
						</p>
						<Link href="/ask?persona=cco" className={`${styles.outlineButton}`}>
							Try Now <Arrow size={16} />
						</Link>
					</div>
					<div className={styles.hubItem}>
						<Image
							src="/PAITW.png"
							alt="ServiceNow Intelligent Style Guide"
							width={299}
							height={168}
							className={styles.hubImage}
						/>
						<h2>PAITW</h2>
						<p>
							Ask questions to the Put AI to Work persona—understand what the
							segment needs.
						</p>
						<Link
							href="/ask?persona=paitw"
							className={`${styles.outlineButton}`}
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
