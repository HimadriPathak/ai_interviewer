import { db } from "@/firebase/admin";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";
const ResumeSchema = z.object({
  userName: z
    .string()
    .describe("The capitalized name of the person on the resume"),
  summary: z
    .string()
    .describe(
      "A concise summary of the candidate's professional experience and skills, ideally 3-4 sentences long."
    ),
  // questions: z
  //   .array(z.string())
  //   .describe(
  //     "A list of 3-5 questions to ask the candidate during the interview based on the resume and job description."
  //   ),
});

export async function POST(req: NextRequest) {
  const genAI = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GEMINI_API_KEY,
  });
  try {
    const formData = await req.formData();
    const jobDescription = formData.get("jobDescription") as string;
    const file = formData.get("resume") as File | null;
    if (file) {
      const buffer = await file.arrayBuffer();
      console.log("File buffer:", buffer);
      const uint8Array = new Uint8Array(buffer);
      const { object } = await generateObject({
        model: genAI("gemini-1.5-flash"),
        schema: ResumeSchema,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Here is a job description: ${jobDescription}. Please analyze the following resume in the context of this job description.`,
              },
              {
                type: "file",
                mimeType: "application/pdf", // Use the correct MIME type
                data: uint8Array,
                filename: file.name || "example.pdf", // Use originalFilename
              },
            ],
          },
        ],
      });
      const interview = {
        userName: object.userName,
        jobDescription: jobDescription,
        resumeSummary: object.summary,
        // questions: object.questions,
        createdAt: new Date().toISOString(),
      };
      console.log("Parsed interview data:", interview);
      const docRef = await db.collection("interviews").add(interview);

      return Response.json({ success: true, id: docRef.id }, { status: 200 });
    }
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ success: false, error: error }, { status: 500 });
  }
}
