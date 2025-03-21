"use client";

import { useState } from "react";
import styles from "./styles.module.css";
import Title from "@/components/Title/Title";

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

	return (
		<div className={styles.container}>
			<Title
				title="Regional Experience"
				description="Convert your text between US and UK English. See word-by-word changes highlighted in real-time."
			/>

			<div className={styles.editorGrid}>
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
