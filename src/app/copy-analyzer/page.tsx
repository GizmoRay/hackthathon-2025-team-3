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

interface Feedback {
	highlighted: {
		issues: {
			grammar_feedback?: string[];
			legal_feedback?: string[];
			brand_voice_feedback?: string[];
		};
	};
	suggestedRevisedCopy: string;
}

function extractHighlights(text: string, feedback: Feedback): Highlight[] {
	const highlights: Highlight[] = [];

	if (!feedback.highlighted?.issues) return highlights;

	// First collect all highlights
	const allHighlights: Highlight[] = [];

	// Process grammar feedback
	if (feedback.highlighted.issues.grammar_feedback) {
		feedback.highlighted.issues.grammar_feedback.forEach((highlightedText) => {
			if (text.includes(highlightedText)) {
				const textPosition = text.indexOf(highlightedText);
				allHighlights.push({
					text: highlightedText,
					type: "grammar",
					start: textPosition,
					end: textPosition + highlightedText.length,
				});
			}
		});
	}

	// Process legal feedback
	if (feedback.highlighted.issues.legal_feedback) {
		feedback.highlighted.issues.legal_feedback.forEach((highlightedText) => {
			if (text.includes(highlightedText)) {
				const textPosition = text.indexOf(highlightedText);
				allHighlights.push({
					text: highlightedText,
					type: "legal",
					start: textPosition,
					end: textPosition + highlightedText.length,
				});
			}
		});
	}

	// Process brand voice feedback
	if (feedback.highlighted.issues.brand_voice_feedback) {
		feedback.highlighted.issues.brand_voice_feedback.forEach(
			(highlightedText) => {
				if (text.includes(highlightedText)) {
					const textPosition = text.indexOf(highlightedText);
					allHighlights.push({
						text: highlightedText,
						type: "brand",
						start: textPosition,
						end: textPosition + highlightedText.length,
					});
				}
			}
		);
	}

	// Sort highlights by length (shortest first) to prioritize specific terms
	allHighlights.sort((a, b) => a.text.length - b.text.length);

	// Add highlights, ensuring no overlap with existing shorter highlights
	allHighlights.forEach((highlight) => {
		// Check if this highlight overlaps with any existing ones
		const hasOverlap = highlights.some(
			(existing) =>
				(highlight.start >= existing.start && highlight.start < existing.end) ||
				(highlight.end > existing.start && highlight.end <= existing.end)
		);

		if (!hasOverlap) {
			highlights.push(highlight);
		}
	});

	return highlights;
}

function HighlightedText({
	text,
	highlights,
}: {
	text: string;
	highlights: Highlight[];
}) {
	// Create an array of all highlight boundaries
	const boundaries = highlights.reduce<
		{ pos: number; highlight: Highlight | null }[]
	>((acc, highlight) => {
		// Add start and end positions for each highlight
		acc.push({ pos: highlight.start, highlight });
		acc.push({ pos: highlight.end, highlight: null });
		return acc;
	}, []);

	// Sort boundaries by position
	boundaries.sort((a, b) => a.pos - b.pos);

	// Split text into segments based on highlight boundaries
	const segments: { text: string; highlights: Highlight[] }[] = [];
	let currentPos = 0;
	let activeHighlights: Highlight[] = [];

	boundaries.forEach(({ pos, highlight }) => {
		if (pos > currentPos) {
			// Add segment from current position to this boundary
			segments.push({
				text: text.slice(currentPos, pos),
				highlights: [...activeHighlights],
			});
		}

		if (highlight) {
			// Start of a highlight
			activeHighlights.push(highlight);
		} else {
			// End of a highlight
			activeHighlights = activeHighlights.filter((h) => h.end !== pos);
		}
		currentPos = pos;
	});

	// Add final segment if there's remaining text
	if (currentPos < text.length) {
		segments.push({
			text: text.slice(currentPos),
			highlights: [],
		});
	}

	return (
		<>
			{segments.map((segment, index) => {
				if (segment.highlights.length === 0) {
					return <span key={index}>{segment.text}</span>;
				}

				// Apply all highlight classes
				const classes = segment.highlights.map((h) => styles[h.type]).join(" ");

				return (
					<mark key={index} className={classes}>
						{segment.text}
					</mark>
				);
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
					title="ServiceNow Writing Buddy"
					description="Input your text in the box below. Errors in grammar, punctuation, brand voice, and more will appear with highlights."
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
				{feedback && feedback.suggestedRevisedCopy !== "" && (
					<div className={styles.revisedCopyContainer}>
						<h3>Writing web copy? Consider this revised version:</h3>
						{feedback && (
							<div className={styles.revisedCopy}>
								<q>
									<HighlightedText
										text={feedback.suggestedRevisedCopy}
										highlights={extractHighlights(
											feedback.suggestedRevisedCopy,
											feedback
										)}
									/>
								</q>
							</div>
						)}
					</div>
				)}
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
