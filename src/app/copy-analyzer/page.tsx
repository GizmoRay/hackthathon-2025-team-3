"use client";

import { useState, useEffect } from "react";
import styles from "./styles.module.css";
import Image from "next/image";
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

interface Highlight {
	text: string;
	type: "grammar" | "legal" | "brand" | "readability";
	start: number;
	end: number;
}

function extractHighlights(text: string, feedback: any): Highlight[] {
	const highlights: Highlight[] = [];

	if (!feedback.highlighted?.issues) return highlights;

	// Map the API's highlight types to our component's types
	const typeMap: {
		[key: string]: "grammar" | "legal" | "brand";
	} = {
		Grammar: "grammar",
		Legal: "legal",
		"Brand Voice": "brand",
	};

	// Process each highlight type
	Object.entries(feedback.highlighted.issues).forEach(
		([type, highlightedText]) => {
			if (typeMap[type] && typeof highlightedText === "string") {
				// Handle comma-separated highlights for grammar
				if (type === "Grammar") {
					const words = highlightedText.split(", ");
					words.forEach((word) => {
						const textPosition = text.indexOf(word);
						if (textPosition >= 0) {
							highlights.push({
								text: word,
								type: typeMap[type],
								start: textPosition,
								end: textPosition + word.length,
							});
						}
					});
				} else {
					const textPosition = text.indexOf(highlightedText);
					if (textPosition >= 0) {
						highlights.push({
							text: highlightedText,
							type: typeMap[type],
							start: textPosition,
							end: textPosition + highlightedText.length,
						});
					}
				}
			}
		}
	);

	return highlights;
}

function HighlightedText({
	text,
	highlights,
}: {
	text: string;
	highlights: Highlight[];
}) {
	console.log("Text:", text);
	console.log("Highlights:", highlights);
	// Split text into segments that preserve spaces
	const segments = text.split(/([\s\n])/);
	let currentPos = 0;

	return (
		<>
			{segments.map((segment, index) => {
				const start = currentPos;
				const end = start + segment.length;
				currentPos = end;

				// Find any highlight that overlaps with this segment
				const highlight = highlights.find(
					(h) =>
						(start >= h.start && start < h.end) ||
						(end > h.start && end <= h.end)
				);

				if (highlight) {
					return (
						<mark key={index} className={styles[highlight.type]}>
							{segment}
						</mark>
					);
				}
				return <span key={index}>{segment}</span>;
			})}
		</>
	);
}

function HighlightedTextarea({
	text,
	highlights,
	onChange,
	onSubmit,
	isAnalyzing,
}: {
	text: string;
	highlights: Highlight[];
	onChange: (text: string) => void;
	onSubmit: (e: React.KeyboardEvent) => void;
	isAnalyzing: boolean;
}) {
	return (
		<div className={styles.textareaWrapper}>
			<Image
				src="/Stars.svg"
				alt="ai stars icon"
				width={21}
				height={21}
				className={styles.aiIcon}
			/>
			<textarea
				value={text}
				onChange={(e) => onChange(e.target.value)}
				placeholder="Paste your copy here..."
				className={styles.textInput}
				onKeyDown={(e) => {
					if (e.key === "Enter" && !e.shiftKey) {
						e.preventDefault();
						onSubmit(e);
					}
				}}
			/>
			<div className={styles.highlights}>
				<HighlightedText text={text} highlights={highlights} />
			</div>
			<div
				className={`${styles.spinner} ${isAnalyzing ? styles.visible : ""}`}
			/>
			<div
				className={`${styles.voiceButton} ${
					isAnalyzing ? styles.invisible : ""
				}`}
			>
				<Image
					src="/voice-button.svg"
					alt="voice button icon"
					width={50}
					height={50}
					className={styles.aiIcon}
				/>
			</div>
		</div>
	);
}

export default function CopyAnalyzer() {
	const [text, setText] = useState("");
	const [feedback, setFeedback] = useState<Feedback | null>(null);
	const [highlights, setHighlights] = useState<Highlight[]>([]);
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

	useEffect(() => {
		if (feedback) {
			setHighlights(extractHighlights(text, feedback));
		}
	}, [feedback, text]);

	console.log("feedback", feedback);

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
						<HighlightedTextarea
							text={text}
							highlights={highlights}
							onChange={(value) => setText(value)}
							onSubmit={handleSubmit}
							isAnalyzing={isAnalyzing}
						/>
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
