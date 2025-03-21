import Link from "next/link";

export default function Home() {
	return (
		<div>
			<h1>Content Tools</h1>
			<nav>
				<Link href="/copy-analyzer">
					<h2>Copy Analyzer</h2>
					<p>Analyze and improve your content with AI-powered suggestions</p>
				</Link>

				<Link href="/ask">
					<h2>Ask a Question</h2>
					<p>Get answers about content guidelines and best practices</p>
				</Link>

				<Link href="/localization">
					<h2>Regional Localization</h2>
					<p>Translate and adapt content for different regions</p>
				</Link>
			</nav>
		</div>
	);
}
