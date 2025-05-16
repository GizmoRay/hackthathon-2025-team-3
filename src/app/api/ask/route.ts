import { NextResponse } from "next/server";

const encoder = new TextEncoder();

function getPersonaApiUrl(persona: string): string {
	switch (persona) {
		case "cio":
			return "https://api.copy.ai/api/workflow/WCFG-56c972b6-d4e5-4ab4-b0f9-8b862d3e4a96/run";
		case "cco":
			return "https://api.copy.ai/api/workflow/WCFG-d1182027-180c-4181-9104-7f9e7b815521/run";
		case "paitw":
			return "https://api.copy.ai/api/workflow/WCFG-bf0f45b0-09f1-48aa-9051-ba450545690b/run";
		default:
			throw new Error("Invalid persona");
	}
}

async function waitForResult(
	runId: string,
	apiKey: string,
	personaUrl: string
): Promise<string> {
	const maxAttempts = 10;
	let attempts = 0;

	while (attempts < maxAttempts) {
		try {
			const response = await fetch(`${personaUrl}/${runId}`, {
				method: "GET",
				headers: {
					Accept: "application/json",
					"x-copy-ai-api-key": apiKey,
				},
			});

			if (!response.ok) {
				throw new Error(`Failed to fetch result: ${response.status}`);
			}

			const data = await response.json();
			console.log(`Attempt ${attempts + 1} response:`, data);

			if (data.status === "success" && data.data.status === "COMPLETE") {
				const answer = data.data.output.generate_text;
				if (!answer) {
					throw new Error("No answer in response");
				}
				return answer;
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

async function* streamResponse(text: string) {
	if (!text) {
		throw new Error("No text to stream");
	}

	const chunks = text.split(" ");
	for (const chunk of chunks) {
		yield encoder.encode(chunk + " ");
		await new Promise((resolve) => setTimeout(resolve, 50)); // Simulate typing
	}
}

export async function POST(request: Request) {
	try {
		const { message, persona } = await request.json();
		const apiKey = process.env.COPY_AI_API_KEY || "";

		if (!apiKey) {
			throw new Error("API key not configured");
		}

		if (!message) {
			return NextResponse.json(
				{ error: "Message is required" },
				{ status: 400 }
			);
		}
		if (!persona) {
			return NextResponse.json(
				{ error: "Persona is required" },
				{ status: 400 }
			);
		}

		const personaApiUrl = getPersonaApiUrl(persona);
		if (!personaApiUrl) {
			return NextResponse.json({ error: "Invalid persona" }, { status: 400 });
		}

		// Start the workflow
		const initResponse = await fetch(personaApiUrl, {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				"x-copy-ai-api-key": apiKey,
			},
			body: JSON.stringify({
				startVariables: {
					question: message,
				},
			}),
		});

		const initResponseText = await initResponse.text();
		console.log("Initial response:", initResponseText);

		if (!initResponse.ok) {
			console.error(
				`Error response (${initResponse.status}):`,
				initResponseText
			);
			throw new Error(`Failed to start workflow: ${initResponse.status}`);
		}

		const { data } = JSON.parse(initResponseText);
		console.log("Parsed initial response:", data);

		// Wait for and get the final answer
		const answer = await waitForResult(data.id, apiKey, personaApiUrl);

		if (!answer) {
			throw new Error("No answer received");
		}

		// Stream the response back to the client
		const stream = new TransformStream();
		const writer = stream.writable.getWriter();

		(async () => {
			try {
				for await (const chunk of streamResponse(answer)) {
					await writer.write(chunk);
				}
			} catch (error) {
				console.error("Error streaming response:", error);
			} finally {
				writer.close();
			}
		})();

		return new Response(stream.readable, {
			headers: {
				"Content-Type": "text/plain; charset=utf-8",
			},
		});
	} catch (error) {
		console.error("Error in ask endpoint:", error);
		return NextResponse.json(
			{
				error:
					error instanceof Error ? error.message : "Failed to get response",
			},
			{ status: 500 }
		);
	}
}
