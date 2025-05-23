import { db } from "@/firebase/admin";
import { ParseResumeSchema } from "@/lib/schema/resume.schema";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { NextRequest, NextResponse } from "next/server";

const system = `You are an AI assistant tasked with analyzing two inputs:

1. A text input labeled as "Text Input".
2. A file input labeled as "File Input".

Your tasks are:
- Determine if the "Text Input" is a job description. Set \`isJobDescription\` to true only if the text clearly outlines job responsibilities, qualifications, or requirements.
- Determine if the "File Input" is a resume. Set \`isResume\` to true only if the file contains a candidate's personal information, skills, and professional history.
- If \`isResume\` is true:
  - Extract the capitalized \`userName\` from the resume.
  - Provide a 3-4 sentence \`summary\` of the candidate's professional experience and skills.

Avoid making assumptions. If unsure, return false for the respective boolean fields.`;

export async function POST(req: NextRequest) {
  const genAI = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GEMINI_API_KEY,
  });
  try {
    const formData = await req.formData();
    const jobDescription = formData.get("jobDescription") as string;
    const file = formData.get("resume") as File | null;
    if (file) {
      const mimeType = file.type;
      console.log(mimeType);
      const buffer = await file.arrayBuffer();
      console.log("File buffer:", buffer);
      const uint8Array = new Uint8Array(buffer);
      const { object } = await generateObject({
        model: genAI("gemini-1.5-flash"),
        schema: ParseResumeSchema,
        system,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Text Input:\n\n${jobDescription}`,
              },
              {
                type: "file",
                mimeType,
                data: uint8Array,
                filename: file.name,
              },
            ],
          },
        ],
      });
      if (object.isResume && object.isJobDescription) {
        const interview = {
          userName: object.userName,
          jobDescription: jobDescription,
          resumeSummary: object.summary,
          createdAt: new Date().toISOString(),
        };
        const docRef = await db.collection("interviews").add(interview);
        return Response.json(
          { success: true, data: { ...object, id: docRef.id } },
          { status: 200 }
        );
      }
      return Response.json(
        { success: true, data: { ...object, id: "" } },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ success: false, error: error }, { status: 500 });
  }
}
