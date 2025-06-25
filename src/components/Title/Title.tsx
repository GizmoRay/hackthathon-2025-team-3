"use client";

import { FC, JSX } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import styles from "./Title.module.css";
import Arrow from "@/components/Arrow/Arrow";
import Modal from "react-modal";
import { useState } from "react";

interface TitleProps {
	title?: string | JSX.Element;
	type?: "hub" | "";
	description: string;
}

const Title: FC<TitleProps> = ({ title = "", description, type }) => {
	const pathname = usePathname();
	const [isModalOpen, setIsModalOpen] = useState(false);

	const customStyles = {
		overlay: {
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			backgroundColor: "rgba(3,45,66, 0.65)",
		},
		content: {
			top: "50%",
			left: "50%",
			right: "auto",
			bottom: "auto",
			width: "80%",
			height: "auto",
			display: "flex",
			backgroundColor: "rbga(255, 255, 255, 0.9)",
			flexDirection: "column" as React.CSSProperties["flexDirection"],
			alignItems: "center" as React.CSSProperties["alignItems"],
			justifyContent: "center" as React.CSSProperties["justifyContent"],
			padding: "50px",
			transform: "translate(-50%, -50%)",
		},
	};

	return (
		<section className={`${styles.titleSection}, ${styles[type!]}`}>
			<div className={styles.container}>
				<h2 className={styles.title}>{title}</h2>
				<p className={styles.description}>{description}</p>
			</div>
			{type === "hub" && (
				<div className={styles.painPointsContainer}>
					<>
						<Link
							href="#"
							className={`${styles.outlineButton} ${
								pathname === "/pain-points" ? styles.active : ""
							}`}
							onClick={(e) => {
								e.preventDefault();
								setIsModalOpen(true);
							}}
						>
							See Customer Research Behind OneVoice
							<Arrow color="white" size={16} />
						</Link>
						<Modal
							isOpen={isModalOpen}
							onRequestClose={() => setIsModalOpen(false)}
							contentLabel="Customer Research Video"
							ariaHideApp={false}
							className={styles.modal}
							style={customStyles}
							overlayClassName={styles.modalOverlay}
						>
							<button
								className={styles.closeButton}
								onClick={() => setIsModalOpen(false)}
							>
								<Image
									src="/Close.svg"
									alt="Close modal"
									width={24}
									height={24}
								/>
							</button>
							<video
								width="100%"
								height="auto"
								controls
								autoPlay
								style={{ borderRadius: 8, display: "block" }}
								onEnded={() => setIsModalOpen(false)}
							>
								<source src="/customer-research.mp4" type="video/mp4" />
								Your browser does not support the video tag.
							</video>
						</Modal>
					</>
				</div>
			)}
			{type === "hub" && (
				<div className={styles.hubSwapper}>
					<div className={styles.hubItem}>
						<Image
							src="/coach.png"
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
							Check My Copy <Arrow size={16} />
						</Link>
					</div>
					<div className={styles.hubItem}>
						<Image
							src="/buddy.png"
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
							Ask Questions <Arrow size={16} />
						</Link>
					</div>
					<div className={styles.hubItem}>
						<Image
							src="/assistant.jpg"
							alt="ServiceNow Intelligent Style Guide"
							width={299}
							height={168}
							className={styles.hubImage}
						/>
						<p>
							Find the latest brand messaging and P5 leadership quotes about AI.
						</p>
						<Link
							href="/ai-messaging-assistant"
							className={`${styles.solidButton} ${
								pathname === "/ai-messaging-assistant" ? styles.active : ""
							}`}
						>
							Get AI Info <Arrow size={16} />
						</Link>
					</div>
					<div className={styles.hubItem}>
						<Image
							src="/agent.jpg"
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
							See How We Win <Arrow size={16} />
						</Link>
					</div>
				</div>
			)}
		</section>
	);
};

export default Title;
