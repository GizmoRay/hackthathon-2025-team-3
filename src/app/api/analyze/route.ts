import { NextResponse } from "next/server";

// Add this debug section at the top
console.log("Available env vars:", {
	COPY_AI_API_KEY: process.env.COPY_AI_API_KEY,
	NODE_ENV: process.env.NODE_ENV,
});

// Add this helper function before the POST handler
const getReadabilityStatus = (score: string) => {
	const numericScore = parseInt(score.replace("%", ""));
	if (numericScore >= 75) return "good";
	if (numericScore >= 50) return "needs-improvement";
	return "bad";
};

export async function POST(request: Request) {
	try {
		const body = await request.json();

		if (!process.env.COPY_AI_API_KEY) {
			throw new Error("API key not configured");
		}

		// Step 1: Start the workflow run
		const runResponse = await fetch(
			"https://api.copy.ai/api/workflow/WCFG-c611eac4-35bd-405b-8887-93a2450a4d8e/run",
			{
				method: "POST",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
					"x-copy-ai-api-key": process.env.COPY_AI_API_KEY,
				},
				body: JSON.stringify({
					startVariables: { copy: body.text },
					metadata: { api: true },
				}),
			}
		);

		if (!runResponse.ok) {
			const errorText = await runResponse.text();
			throw new Error(`Failed to start analysis: ${errorText}`);
		}

		const runData = await runResponse.json();
		console.log("Run response:", runData);

		// Make sure we have a run ID in the correct structure
		if (!runData.data?.id) {
			throw new Error("No run ID received from API");
		}

		const runId = runData.data.id;

		// Step 2: Poll for results
		await new Promise((resolve) => setTimeout(resolve, 2000));

		let attempts = 0;
		const maxAttempts = 10;
		const delay = 5000;

		while (attempts < maxAttempts) {
			const resultsResponse = await fetch(
				`https://api.copy.ai/api/workflow/WCFG-c611eac4-35bd-405b-8887-93a2450a4d8e/run/${runId}`,
				{
					headers: {
						Accept: "application/json",
						"x-copy-ai-api-key": process.env.COPY_AI_API_KEY,
					},
				}
			);

			console.log(`Attempt ${attempts + 1} status:`, resultsResponse.status);

			if (!resultsResponse.ok) {
				const errorText = await resultsResponse.text();
				console.log(`Attempt ${attempts + 1} error:`, errorText);

				// If we get a 404, wait and try again
				if (resultsResponse.status === 404) {
					await new Promise((resolve) => setTimeout(resolve, delay));
					attempts++;
					continue;
				}

				throw new Error(`Failed to get results: ${errorText}`);
			}

			const resultsData = await resultsResponse.json();
			console.log(`Attempt ${attempts + 1} data:`, resultsData);

			// Check if the analysis is complete and has output
			if (
				resultsData.data.status === "COMPLETE" &&
				resultsData.data.output?.extract_feedback
			) {
				const feedback = resultsData.data.output.extract_feedback[0];

				console.log("Extract feedback:", feedback);
				console.log("Data", resultsData.data.output?.final_output);
				// Clean up the feedback strings by:
				// 1. Removing line breaks
				// 2. Converting bullet points to proper list items
				// 3. Removing any double spaces
				const cleanFeedback = (text: string) => {
					return text
						.replace(/\n/g, " ") // Replace line breaks with spaces
						.replace(/\s+/g, " ") // Replace multiple spaces with single space
						.trim() // Remove leading/trailing whitespace
						.split(/\s*\*\s*/) // Split on asterisks with optional whitespace
						.filter(Boolean) // Remove empty strings
						.map((item) => item.trim()); // Clean up each item
				};

				return NextResponse.json({
					readability: {
						score: feedback.readability_score || "70%",
						status: getReadabilityStatus(feedback.readability_score || "70%"),
						details: resultsData.data.output.review_copy,
					},
					grammar: {
						issues: cleanFeedback(feedback.grammar_feedback),
					},
					legal: {
						issues: cleanFeedback(feedback.legal_feedback),
					},
					brandVoice: {
						issues: cleanFeedback(feedback.brand_voice_feedback),
					},
					highlighted: {
						issues: feedback.highlighted_text,
					},
					characterCount: body.text.length,
				});
			}

			await new Promise((resolve) => setTimeout(resolve, delay));
			attempts++;
		}

		throw new Error("Analysis timed out");
	} catch (error) {
		console.error("Detailed error:", error);
		return NextResponse.json(
			{
				error:
					error instanceof Error ? error.message : "Failed to analyze copy",
			},
			{ status: 500 }
		);
	}
}
