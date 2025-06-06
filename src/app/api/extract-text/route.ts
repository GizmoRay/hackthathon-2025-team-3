import { NextRequest, NextResponse } from "next/server";
import { getTextExtractor } from "office-text-extractor";

export async function POST(req: NextRequest) {
	try {
		const formData = await req.formData();
		const file = formData.get("file") as File;

		if (!file) {
			return NextResponse.json({ error: "No file provided" }, { status: 400 });
		}

		// Log the file details for debugging
		console.log("File received:", {
			name: file.name,
			type: file.type,
			size: file.size,
		});

		// Create the extractor
		const extractor = getTextExtractor();

		// Convert to buffer
		const bytes = await file.arrayBuffer();
		const buffer = Buffer.from(bytes);

		// Determine mime type from file extension if not provided
		let mimeType = file.type;
		if (!mimeType) {
			const extension = file.name.split(".").pop()?.toLowerCase();
			if (extension) {
				const mimeTypes: Record<string, string> = {
					pdf: "application/pdf",
					docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
					doc: "application/msword",
					pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
					xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
					txt: "text/plain",
				};
				mimeType = mimeTypes[extension] || "";
			}
		}

		// Extract text with better error handling
		console.log("Extracting text with mime type:", mimeType);

		// Define extraction options with proper typing
		const extractionOptions: {
			input: Buffer;
			type: "buffer";
			mimeType?: string;
		} = {
			input: buffer,
			type: "buffer",
			mimeType: mimeType || undefined,
		};

		const text = await extractor.extractText(extractionOptions);

		if (!text || typeof text !== "string") {
			console.warn("Empty or invalid text result:", text);
			return NextResponse.json({
				text: "",
				warning: "No text could be extracted from this file",
			});
		}

		console.log(`Successfully extracted ${text.length} characters`);
		return NextResponse.json({ text });
	} catch (error) {
		console.error("Error extracting text:", error);
		return NextResponse.json(
			{
				error:
					error instanceof Error ? error.message : "Failed to extract text",
			},
			{ status: 500 }
		);
	}
}

// Next.js API config to disable automatic body parsing
export const config = {
	api: {
		bodyParser: false,
	},
};
