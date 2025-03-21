"use client";

import { useState } from "react";
import styles from "./styles.module.css";

interface Feedback {
	readability: {
		score: string;
		details?: string;
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
			const options = {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"x-copy-ai-api-key": process.env.NEXT_PUBLIC_COPY_AI_API_KEY || "",
				},
				body: JSON.stringify({
					startVariables: { copy: text },
					metadata: { api: true },
				}),
			};

			const response = await fetch(
				"https://api.copy.ai/api/workflow/WCFG-c611eac4-35bd-405b-8887-93a2450a4d8e/run",
				options
			);

			if (!response.ok) {
				throw new Error("Failed to analyze copy");
			}

			const data = await response.json();

			// Assuming the API response matches our Feedback interface
			// You might need to transform the data to match the interface
			setFeedback({
				readability: {
					score: data.readabilityScore || "Good",
					details: data.readabilityDetails,
				},
				grammar: {
					issues: data.grammarIssues || [],
				},
				legal: {
					issues: data.legalIssues || [],
				},
				brandVoice: {
					issues: data.brandIssues || [],
				},
				characterCount: text.length,
			});
		} catch (error) {
			console.error("Error analyzing copy:", error);
			// You might want to show an error message to the user
		} finally {
			setIsAnalyzing(false);
		}
	};

	return (
		<div className={styles.analyzerContainer}>
			<div className={styles.inputSection}>
				<h2>Readability</h2>
				<textarea
					value={text}
					onChange={(e) => setText(e.target.value)}
					placeholder="Paste your copy here..."
					className={styles.textInput}
				/>
				<div className={styles.characterCount}>
					Characters: {text.length} including spaces
				</div>
				<button
					onClick={analyzeCopy}
					className={styles.analyzeButton}
					disabled={isAnalyzing || !text.trim()}
				>
					{isAnalyzing ? "Analyzing..." : "Analyze Copy"}
				</button>
			</div>

			{feedback && (
				<div className={styles.feedbackSection}>
					<div className={styles.readabilityScore}>
						<h2>Readability</h2>
						<div className={styles.score}>{feedback.readability.score}</div>
						{feedback.readability.details && (
							<p>{feedback.readability.details}</p>
						)}
					</div>

					<div className={`${styles.feedbackCategory} ${styles.grammar}`}>
						<h2>Grammar suggestion:</h2>
						<ul>
							{feedback.grammar.issues.map((issue, index) => (
								<li key={`grammar-${index}`}>{issue}</li>
							))}
						</ul>
					</div>

					<div className={`${styles.feedbackCategory} ${styles.legal}`}>
						<h2>Legal suggestion:</h2>
						<ul>
							{feedback.legal.issues.map((issue, index) => (
								<li key={`legal-${index}`}>{issue}</li>
							))}
						</ul>
					</div>

					<div className={`${styles.feedbackCategory} ${styles.brand}`}>
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
