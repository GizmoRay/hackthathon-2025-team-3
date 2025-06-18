"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./styles.module.css";
import Title from "@/components/Title/Title";
import Sidebar from "@/components/Sidebar/Sidebar";
import TrendingQuestions from "@/components/TrendingQuestions/TrendingQuestions";
import Image from "next/image";

interface Message {
	role: "user" | "assistant";
	content: string;
	status: "complete" | "streaming";
}

export default function CompetitiveIntelligenceAssistant() {
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [extractedText, setExtractedText] = useState<string | null>(null);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setSelectedFile(file);
		const formData = new FormData();
		formData.append("file", file);

		try {
			const response = await fetch("/api/extract-text", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				throw new Error("Failed to extract text");
			}

			const data = await response.json();
			setExtractedText(data.text);

			// Add a system message to show that a file was processed
			setMessages((prev) => [
				...prev,
				{
					role: "assistant",
					content: `File uploaded: ${file.name}\n\nText has been extracted. You can now ask questions about this document.`,
					status: "complete",
				},
			]);
		} catch (error) {
			console.error("Error extracting text:", error);
			setMessages((prev) => [
				...prev,
				{
					role: "assistant",
					content: `Error processing file: ${file.name}. Please try again with a different file.`,
					status: "complete",
				},
			]);
		}
	};

	const triggerFileUpload = () => {
		fileInputRef.current?.click();
	};

	const handleSubmit = async (e: React.FormEvent, trendingQuestion?: string) => {
		e.preventDefault();
		const userMessage = trendingQuestion || input.trim();

		if (!userMessage || isLoading) return;
		setInput("");
		setIsLoading(true);

		// Add user message immediately
		setMessages((prev) => [
			...prev,
			{ role: "user", content: userMessage, status: "complete" },
			{ role: "assistant", content: "", status: "streaming" },
		]);

		try {
			const response = await fetch("/api/competitive-intelligence-assistant", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					message: userMessage,
					documentText: extractedText || undefined,
				}),
			});

			if (!response.ok || !response.body) {
				throw new Error("Failed to get response");
			}

			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			let currentResponse = "";

			while (true) {
				const { value, done } = await reader.read();
				if (done) break;

				const text = decoder.decode(value);
				currentResponse += text;

				// Update the last message with the current response
				setMessages((prev) => {
					const newMessages = [...prev];
					newMessages[newMessages.length - 1] = {
						role: "assistant",
						content: currentResponse,
						status: "streaming",
					};
					return newMessages;
				});
			}

			// Mark the message as complete
			setMessages((prev) => {
				const newMessages = [...prev];
				newMessages[newMessages.length - 1].status = "complete";
				return newMessages;
			});
		} catch (error) {
			console.error("Error:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className={styles.container}>
			<div className={styles.sideColumn}>
				<Sidebar type="stats">
					<div className={styles.chatInfo}>
						<h3>Chat History</h3>
						<div className={styles.statItem}>
							<span className={styles.label}>Messages:</span>
							<span className={styles.value}>{messages.length}</span>
						</div>
						{selectedFile && (
							<div className={styles.statItem}>
								<span className={styles.label}>Uploaded file:</span>
								<span className={styles.value}>{selectedFile.name}</span>
							</div>
						)}
					</div>
				</Sidebar>

				<TrendingQuestions title="Trending Questions" questions={['question 1', 'question 2', 'question 3']} onFormSubmit={handleSubmit}>
				</TrendingQuestions>
			</div>

			<div className={styles.mainColumn}>
				<Title
					title="Competitive Intelligence Assistant"
					description="Ask questions about competitors and how they compare to ServiceNow."
				/>

				<div className={styles.chatContainer}>
					<div className={styles.messagesContainer}>
						{messages.map((message, index) => (
							<div
								key={index}
								className={`${styles.message} ${styles[message.role]}`}
							>
								<div className={styles.messageContent}>
									{message.content}
									{message.status === "streaming" && (
										<span className={styles.cursor} />
									)}
								</div>
							</div>
						))}
						<div ref={messagesEndRef} />
					</div>

					<form onSubmit={handleSubmit} className={styles.inputForm}>
						<input
							type="file"
							ref={fileInputRef}
							onChange={handleFileChange}
							className={styles.fileInput}
							accept=".doc,.docx,.pdf,.txt,.rtf,.ppt,.pptx,.xls,.xlsx"
							style={{ display: "none" }}
						/>
						<button
							type="button"
							onClick={triggerFileUpload}
							className={styles.fileButton}
							disabled={isLoading}
						>
							<Image
								src="/upload.svg"
								width={21}
								height={21}
								alt="upload icon"
							/>
						</button>
						<textarea
							value={input}
							onChange={(e) => setInput(e.target.value)}
							placeholder={
								selectedFile
									? `Ask about ${selectedFile.name}...`
									: "Ask about guidelines..."
							}
							className={styles.input}
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									handleSubmit(e);
								}
							}}
							disabled={isLoading}
						/>
						<button
							type="submit"
							className={styles.sendButton}
							disabled={isLoading}
						>
							<Image src="/send.svg" width={21} height={21} alt="send icon" />
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
