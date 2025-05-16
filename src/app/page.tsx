import styles from "./page.module.css";
import Title from "@/components/Title/Title";

export default function Home() {
	return (
		<div className={styles.hub}>
			{/*<Image
				src={"/Banner.png"}
				width={952}
				height={238}
				alt="Banner image for overview page. We are One Voice"
			/>*/}
			<Title
				type="hub"
				title="ServiceNow Persona Agents"
				description="Get instant answers to questions about the personas of ServiceNow."
			/>
		</div>
	);
}
