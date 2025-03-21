"use client";

import { useState } from "react";
import styles from "./styles.module.css";
import Title from "@/components/Title/Title";
import Sidebar from "@/components/Sidebar/Sidebar";
import Skeleton from "@/components/Skeleton/Skeleton";

interface RegionalResponse {
	convertedText: string;
	changes: {
		original: string;
		converted: string;
		position: number;
	}[];
}

function HighlightedText({
	text,
	changes,
}: {
	text: string;
	changes: Array<{ position: number; converted: string; original: string }>;
}) {
	const words = text.match(/\S+|\s+/g) || [];
	let currentPos = 0;

	return (
		<>
			{words.map((word, index) => {
				const pos = currentPos;
				currentPos += word.length;

				// Find any change that matches this word's position
				const change = changes.find(
					(c) => Math.abs(c.position - pos) < word.length
				);

				if (change) {
					return (
						<mark key={index} title={`Changed from: ${change.original}`}>
							{word}
						</mark>
					);
				}
				return <span key={index}>{word}</span>;
			})}
		</>
	);
}

export default function RegionalExperience() {
	const [sourceText, setSourceText] = useState("");
	const [result, setResult] = useState<RegionalResponse | null>(null);
	const [isConverting, setIsConverting] = useState(false);

	const convertText = async () => {
		if (!sourceText.trim()) return;

		setIsConverting(true);

		try {
			const response = await fetch("/api/regional", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ text: sourceText }),
			});

			console.log("API response status:", response.status);
			const responseText = await response.text();
			console.log("API response body:", responseText);

			if (!response.ok) {
				throw new Error(`Failed to convert text: ${responseText}`);
			}

			const data = JSON.parse(responseText);
			setResult(data);
		} catch (error) {
			console.error("Detailed error converting text:", error);
		} finally {
			setIsConverting(false);
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		convertText();
	};

	// Calculate stats from the result
	const getStats = () => {
		if (!result) return null;

		const wordCount = result.convertedText.trim().split(/\s+/).length;
		const changedWords = result.changes.length;
		const changePercentage = ((changedWords / wordCount) * 100).toFixed(1);

		return {
			wordCount,
			changedWords,
			changePercentage,
		};
	};

	const stats = getStats();

	return (
		<div className={styles.container}>
			<Title
				title="Regional Experience - BETA"
				description="Make your content work for our geo teams. Input text to get a side-by-side comparison of your copy with local nuances."
			/>

			<div className={styles.editorGrid}>
				<Sidebar type="stats">
					<div className={styles.readabilityStats}>
						<h3>Conversion Results</h3>
						{stats ? (
							<>
								<div className={styles.statItem}>
									<span className={styles.label}>Total Words:</span>
									<span className={styles.value}>{stats.wordCount}</span>
								</div>
								<div className={styles.statItem}>
									<span className={styles.label}>Words Changed:</span>
									<span className={styles.value}>{stats.changedWords}</span>
								</div>
								<div className={styles.statItem}>
									<span className={styles.label}>Change Rate:</span>
									<span className={styles.value}>
										{stats.changePercentage}%
									</span>
								</div>
							</>
						) : (
							<div className={styles.placeholder}>
								<Skeleton length={120} />
							</div>
						)}
					</div>
				</Sidebar>

				<div className={styles.sourceSection}>
					<h3>US English</h3>
					<form onSubmit={handleSubmit}>
						<div className={styles.textareaWrapper}>
							<textarea
								value={sourceText}
								onChange={(e) => setSourceText(e.target.value)}
								placeholder="Enter your US English text here..."
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
									isConverting ? styles.visible : ""
								}`}
							/>
						</div>
					</form>
				</div>

				<div className={styles.resultSection}>
					<h3>UK English</h3>
					<div className={styles.resultText}>
						{result ? (
							<div className={styles.highlightedText}>
								<HighlightedText
									text={result.convertedText}
									changes={result.changes}
								/>
							</div>
						) : (
							<div className={styles.placeholder}>
								Converted text will appear here...
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
