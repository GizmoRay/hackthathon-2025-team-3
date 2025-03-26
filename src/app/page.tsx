import Image from "next/image";
import styles from "./page.module.css";
import Title from "@/components/Title/Title";

export default function Home() {
	return (
		<div className={styles.hub}>
			/*<Image
				src={"/Banner.png"}
				width={952}
				height={238}
				alt="Banner image for overview page. We are One Voice"
			/>*/
			<Title
				type="hub"
				title="Intelligent Style Guide Toolkit"
				description="Get instant answers about ServiceNow style guidelines and best practices."
			/>
		</div>
	);
}
