"use client";

import { FC, Key, MouseEvent, useState } from "react";
import styles from "./TrendingQuestions.module.css";

interface TrendingQuestions {
	title?: string;
	className?: string;
	questions: string[];
	onFormSubmit: Function;
}

const TrendingQuestions: FC<TrendingQuestions> = ({
	title,
	className = "",
	questions = [],
	onFormSubmit = () => {},
}) => {
	
	const [currentIndex, setCurrentIndex] = useState<number>();
	const clickHandler = (e: MouseEvent, text: string, index: number) => {
		setCurrentIndex(index);
		onFormSubmit(e, text);
	}

	return (
		<div className={`${styles.trendingQuestions} ${className}`}>
			{title && <h2 className={styles.title}>{title}</h2>}
			<div className={styles.content}>{questions.map((question: string, index: number) => (
				<span key={index} onClick={(e)=>clickHandler(e, question, index)} className={index === currentIndex ? styles.selected : ''}>{question}</span>
			))}</div>
		</div>
	);
};

export default TrendingQuestions;
