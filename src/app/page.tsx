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
				title={
					<div>
						<span style={{ color: "#62D84E" }}>ServiceNow </span>
						<span>OneVoice Assist</span>
					</div>
				}
				description="Get instant answers about ServiceNow style guidelines, AI messaging, and competitive intelligence."
			/>
		</div>
	);
}
