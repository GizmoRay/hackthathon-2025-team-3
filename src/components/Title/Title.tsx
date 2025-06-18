"use client";

import { FC, JSX } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import styles from "./Title.module.css";
import Arrow from "@/components/Arrow/Arrow";

interface TitleProps {
	title?: string | JSX.Element;
	type?: "hub" | "";
	description: string;
}

const Title: FC<TitleProps> = ({ title = "", description, type }) => {
	const pathname = usePathname();

	return (
		<section className={`${styles.titleSection}, ${styles[type!]}`}>
			<div className={styles.container}>
				<h2 className={styles.title}>{title}</h2>
				<p className={styles.description}>{description}</p>
			</div>
			{type === "hub" && (
				<div className={styles.hubSwapper}>
					<div className={styles.hubItem}>
						<Image
							src="/writing_buddy.png"
							alt="ServiceNow Intelligent Style Guide"
							width={299}
							height={168}
							className={styles.hubImage}
						/>
						<p>
							Find grammar, style, and legal issues in your copy with links to
							guidelines.
						</p>
						<Link
							href="/copy-analyzer"
							className={`${styles.solidButton} ${
								pathname === "/copy-analyzer" ? styles.active : ""
							}`}
						>
							Try Now <Arrow size={16} />
						</Link>
					</div>
					<div className={styles.hubItem}>
						<Image
							src="/brand-style.png"
							alt="ServiceNow Intelligent Style Guide"
							width={299}
							height={168}
							className={styles.hubImage}
						/>
						<p>Search for answers on specific style guide questions.</p>
						<Link
							href="/ask"
							className={`${styles.solidButton} ${
								pathname === "/ask" ? styles.active : ""
							}`}
						>
							Try Now <Arrow size={16} />
						</Link>
					</div>
					<div className={styles.hubItem}>
						<Image
							src="/ai-messaging-assistant.png"
							alt="ServiceNow Intelligent Style Guide"
							width={299}
							height={168}
							className={styles.hubImage}
						/>
						<p>Find the latest messaging and P5 leadership quotes about AI.</p>
						<Link
							href="/ai-messaging-assistant"
							className={`${styles.solidButton} ${
								pathname === "/ai-messaging-assistant" ? styles.active : ""
							}`}
						>
							Try Now <Arrow size={16} />
						</Link>
					</div>
					<div className={styles.hubItem}>
						<Image
							src="/comp-intell-assistant.png"
							alt="ServiceNow Intelligent Style Guide"
							width={299}
							height={168}
							className={styles.hubImage}
						/>
						<p>
							Ask questions about competitors and see how they compare to
							ServiceNow.
						</p>
						<Link
							href="/competitive-intelligence-assistant"
							className={`${styles.solidButton} ${
								pathname === "/competitive-intelligence-assistant"
									? styles.active
									: ""
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
