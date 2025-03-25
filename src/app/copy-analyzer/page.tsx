"use client";

import { useState } from "react";
import styles from "./styles.module.css";
import Title from "@/components/Title/Title";
import Sidebar from "@/components/Sidebar/Sidebar";

interface Feedback {
	readability: {
		score: string;
		status: "good" | "needs-improvement" | "bad";
		details: string;
	};
	grammar: {
		issues: string[];
	};
	legal: {
		issues: string[];
	};
	brandVoice: {
		issues: string[];
	};
	characterCount: number;
}

export default function CopyAnalyzer() {
	const [text, setText] = useState("");
	const [feedback, setFeedback] = useState<Feedback | null>(null);
	const [isAnalyzing, setIsAnalyzing] = useState(false);

	const analyzeCopy = async () => {
		if (!text.trim()) return;

		setIsAnalyzing(true);

		try {
			const response = await fetch("/api/analyze", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ text }),
			});

			if (!response.ok) {
				throw new Error("Failed to analyze copy");
			}

			const data = await response.json();
			setFeedback(data);
		} catch (error) {
			console.error("Error analyzing copy:", error);
		} finally {
			setIsAnalyzing(false);
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		analyzeCopy();
	};

	return (
		<div className={styles.container}>
			<Sidebar type="stats">
				<div className={styles.readabilityStats}>
					<h2>Readability rating:</h2>
					{feedback && (
						<div
							className={`${styles.score} ${
								styles[feedback.readability.status]
							}`}
						>
							{feedback.readability.status === "good"
								? "Good"
								: "Needs improvement"}
						</div>
					)}
				</div>

				<div className={styles.characterStats}>
					<h3>Characters</h3>
					<div>{text.length} characters including spaces</div>
				</div>

				{feedback && (
					<>
						<div className={`${styles.statItem} ${styles.grammarStats}`}>
							<h3>Grammar and spelling</h3>
							<div>{feedback.grammar.issues.length} items found</div>
						</div>

						<div className={`${styles.statItem} ${styles.legalStats}`}>
							<h3>Legal</h3>
							<div>{feedback.legal.issues.length} items found</div>
						</div>

						<div className={`${styles.statItem} ${styles.brandStats}`}>
							<h3>Brand Voice and Tone</h3>
							<div>{feedback.brandVoice.issues.length} items found</div>
						</div>
					</>
				)}
			</Sidebar>

			<div className={styles.mainColumn}>
				<Title
					title="Copy Analyzer"
					description="Input your text in the box below. Errors in grammar, punctuation, brand voice, and more will appear with highlights. Click the suggestion links to learn more."
				/>

				<div className={styles.editorContainer}>
					<form onSubmit={handleSubmit}>
						<div className={styles.textareaWrapper}>
							<textarea
								value={text}
								onChange={(e) => setText(e.target.value)}
								placeholder="Paste your copy here..."
								className={styles.textInput}
								onKeyDown={(e) => {
									if (e.key === "Enter" && !e.shiftKey) {
										e.preventDefault();
										handleSubmit(e);
									}
								}}
							/>
							<div
								className={`${styles.spinner} ${
									isAnalyzing ? styles.visible : ""
								}`}
							/>
						</div>
					</form>
				</div>
			</div>
			{feedback && (
				<Sidebar type="list" className={styles.recommendationsColumn}>
					<div className={`${styles.grammarSection} ${styles.statItem}`}>
						<h3>Grammar suggestion:</h3>
						<ul>
							{feedback?.grammar.issues.map((issue, index) => (
								<li key={`grammar-${index}`}>{issue}</li>
							))}
						</ul>
					</div>

					<div className={`${styles.legalSection} ${styles.statItem}`}>
						<h3>Legal suggestion:</h3>
						<ul>
							{feedback?.legal.issues.map((issue, index) => (
								<li key={`legal-${index}`}>{issue}</li>
							))}
						</ul>
					</div>

					<div className={`${styles.brandSection} ${styles.statItem}`}>
						<h3>Brand Voice and Tone:</h3>
						<ul>
							{feedback?.brandVoice.issues.map((issue, index) => (
								<li key={`brand-${index}`}>{issue}</li>
							))}
						</ul>
					</div>
				</Sidebar>
			)}
		</div>
	);
}
