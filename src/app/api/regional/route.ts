import { NextResponse } from "next/server";

interface RegionalResponse {
	convertedText: string;
	changes: Array<{
		original: string;
		converted: string;
		position: number;
	}>;
}

function findChanges(
	originalText: string,
	convertedText: string
): Array<{
	original: string;
	converted: string;
	position: number;
}> {
	const changes: Array<{
		original: string;
		converted: string;
		position: number;
	}> = [];

	// Split into words and maintain spacing
	const originalWords = originalText.match(/\S+|\s+/g) || [];
	const convertedWords = convertedText.match(/\S+|\s+/g) || [];

	let position = 0;

	// Compare words exactly
	for (let i = 0; i < originalWords.length; i++) {
		const originalWord = originalWords[i].trim();
		const convertedWord = convertedWords[i]?.trim();

		// Only record actual changes, ignoring whitespace
		if (
			convertedWord &&
			originalWord !== convertedWord &&
			originalWord &&
			convertedWord
		) {
			changes.push({
				original: originalWord,
				converted: convertedWord,
				position: position,
			});
		}

		// Update position with original word length including any whitespace
		position += originalWords[i].length;
	}

	return changes;
}

async function waitForResult(
	runId: string,
	apiKey: string
): Promise<RegionalResponse> {
	const maxAttempts = 20;
	let attempts = 0;

	while (attempts < maxAttempts) {
		try {
			const response = await fetch(
				`https://api.copy.ai/api/workflow/WCFG-5eed4feb-7d2e-4d40-958d-5ee62c759311/run/${runId}`,
				{
					method: "GET",
					headers: {
						Accept: "application/json",
						"x-copy-ai-api-key": apiKey,
					},
				}
			);

			const responseText = await response.text();
			console.log(`Raw response (${attempts + 1}):`, responseText);

			if (!response.ok) {
				console.error(`Error response (${response.status}):`, responseText);
				throw new Error(`Failed to fetch result: ${response.status}`);
			}

			const data = JSON.parse(responseText);
			console.log(`Parsed data (${attempts + 1}):`, data);

			if (data.status === "success" && data.data.status === "COMPLETE") {
				const formatOutput = JSON.parse(data.data.output.format_output);
				const originalText = data.data.input.copy;
				let convertedText = formatOutput.regionalized_copy;

				// Handle case when convertedText is an object with 'en' property
				if (typeof convertedText === "object" && convertedText !== null) {
					console.log("convertedText is an object:", convertedText);

					if (convertedText.en && typeof convertedText.en === "string") {
						convertedText = convertedText.en;
					} else {
						// If 'en' property doesn't exist or isn't a string, stringify the object
						convertedText = JSON.stringify(convertedText);
					}
				}

				// Final safety check to ensure convertedText is a string
				if (typeof convertedText !== "string") {
					convertedText = String(convertedText || "");
				}

				return {
					convertedText,
					changes: findChanges(originalText, convertedText),
				};
			} else if (data.data?.error) {
				throw new Error("Workflow processing failed");
			}
		} catch (error) {
			console.error(`Attempt ${attempts + 1} failed:`, error);
		}

		attempts++;
		await new Promise((resolve) => setTimeout(resolve, 2000));
	}

	throw new Error("Timeout waiting for result");
}

export async function POST(request: Request) {
	try {
		const { text } = await request.json();
		const apiKey = process.env.COPY_AI_API_KEY || "";

		if (!apiKey) {
			throw new Error("API key not configured");
		}

		const initResponse = await fetch(
			"https://api.copy.ai/api/workflow/WCFG-5eed4feb-7d2e-4d40-958d-5ee62c759311/run",
			{
				method: "POST",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
					"x-copy-ai-api-key": apiKey,
				},
				body: JSON.stringify({
					startVariables: {
						copy: text,
						start_region: "American English",
						end_region: "British English",
					},
				}),
			}
		);

		const initResponseText = await initResponse.text();
		console.log("Initial response:", initResponseText);

		if (!initResponse.ok) {
			console.error(
				`Error response (${initResponse.status}):`,
				initResponseText
			);
			throw new Error(`Failed to start conversion: ${initResponse.status}`);
		}

		const { data } = JSON.parse(initResponseText);
		console.log("Parsed initial response:", data);

		const result = await waitForResult(data.id, apiKey);
		return NextResponse.json(result);
	} catch (error) {
		console.error("Error in regional conversion:", error);
		return NextResponse.json(
			{
				error:
					error instanceof Error ? error.message : "Failed to convert text",
			},
			{ status: 500 }
		);
	}
}
