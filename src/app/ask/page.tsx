"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./styles.module.css";
import Title from "@/components/Title/Title";
import Sidebar from "@/components/Sidebar/Sidebar";

interface Message {
	role: "user" | "assistant";
	content: string;
	status: "complete" | "streaming";
}

export default function AskPage() {
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim() || isLoading) return;

		const userMessage = input.trim();
		setInput("");
		setIsLoading(true);

		// Add user message immediately
		setMessages((prev) => [
			...prev,
			{ role: "user", content: userMessage, status: "complete" },
			{ role: "assistant", content: "", status: "streaming" },
		]);

		try {
			const response = await fetch("/api/ask", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ message: userMessage }),
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
			<Sidebar type="stats">
				<div className={styles.chatInfo}>
					<h3>Chat History</h3>
					<div className={styles.statItem}>
						<span className={styles.label}>Messages:</span>
						<span className={styles.value}>{messages.length}</span>
					</div>
				</div>
			</Sidebar>

			<div className={styles.mainColumn}>
				<Title
					title="Ask a Question"
					description="Get instant answers about ServiceNow style guidelines and best practices."
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
						<textarea
							value={input}
							onChange={(e) => setInput(e.target.value)}
							placeholder="Ask about style guidelines..."
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
							Send
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
