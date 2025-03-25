import { NextResponse } from "next/server";

const encoder = new TextEncoder();

async function waitForResult(runId: string, apiKey: string): Promise<string> {
	const maxAttempts = 10;
	let attempts = 0;

	while (attempts < maxAttempts) {
		try {
			const response = await fetch(
				`https://api.copy.ai/api/workflow/WCFG-5475d3a8-e5d7-4c96-92be-cb62bc2777af/run/${runId}`,
				{
					method: "GET",
					headers: {
						Accept: "application/json",
						"x-copy-ai-api-key": apiKey,
					},
				}
			);

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
		const { message } = await request.json();
		const apiKey = process.env.COPY_AI_API_KEY || "";

		if (!apiKey) {
			throw new Error("API key not configured");
		}

		// Start the workflow
		const initResponse = await fetch(
			"https://api.copy.ai/api/workflow/WCFG-5475d3a8-e5d7-4c96-92be-cb62bc2777af/run",
			{
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
			}
		);

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
		const answer = await waitForResult(data.id, apiKey);

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
