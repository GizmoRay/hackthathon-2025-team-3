"use client";

import { useState } from "react";
import styles from "./styles.module.css";

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

	return (
		<div className={styles.analyzerContainer}>
			<div className={styles.statsColumn}>
				<div className={styles.readabilityStats}>
					<h2>Readability</h2>
					{feedback && (
						<div
							className={`${styles.score} ${
								styles[feedback.readability.status]
							}`}
						>
							{feedback.readability.status === "good"
								? "Good."
								: "Needs improvement."}
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
			</div>

			<div className={styles.mainContent}>
				<textarea
					value={text}
					onChange={(e) => setText(e.target.value)}
					placeholder="Paste your copy here..."
					className={styles.textInput}
				/>
				<button
					onClick={analyzeCopy}
					className={styles.analyzeButton}
					disabled={isAnalyzing || !text.trim()}
				>
					{isAnalyzing ? "Analyzing..." : "Analyze Copy"}
				</button>
			</div>

			{feedback && (
				<div className={styles.recommendationsColumn}>
					<div className={`${styles.grammarSection} ${styles.statItem}`}>
						<h2>Grammar suggestion:</h2>
						<ul>
							{feedback.grammar.issues.map((issue, index) => (
								<li key={`grammar-${index}`}>{issue}</li>
							))}
						</ul>
					</div>

					<div className={`${styles.legalSection} ${styles.statItem}`}>
						<h2>Legal suggestion:</h2>
						<ul>
							{feedback.legal.issues.map((issue, index) => (
								<li key={`legal-${index}`}>{issue}</li>
							))}
						</ul>
					</div>

					<div className={`${styles.brandSection} ${styles.statItem}`}>
						<h2>Brand Voice and Tone:</h2>
						<ul>
							{feedback.brandVoice.issues.map((issue, index) => (
								<li key={`brand-${index}`}>{issue}</li>
							))}
						</ul>
					</div>
				</div>
			)}
		</div>
	);
}
