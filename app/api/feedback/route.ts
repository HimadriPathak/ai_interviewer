import { db } from "@/firebase/admin";
import { feedbackSchema } from "@/lib/schema/feedback.schema";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const genAI = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GEMINI_API_KEY,
  });
  try {
    const formData = await req.formData();

    const interviewId = formData.get("interviewId") as string;
    const userName = formData.get("userName") as string;
    const feedbackId = formData.get("feedbackId") as string | null;
    const messages = JSON.parse(formData.get("messages") as string) as {
      role: string;
      content: string;
    }[];

    const formattedTranscript = messages
      .map((sentence) => `- ${sentence.role}: ${sentence.content}\n`)
      .join("");

    const response = await generateObject({
      model: genAI("gemini-1.5-flash"),
      schema: feedbackSchema,
      prompt: `
        You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
        Transcript:
        ${formattedTranscript}

        Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
        - **Communication Skills**: Clarity, articulation, structured responses.
        - **Technical Knowledge**: Understanding of key concepts for the role.
        - **Problem-Solving**: Ability to analyze problems and propose solutions.
        - **Cultural & Role Fit**: Alignment with company values and job role.
        - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
        `,
      system:
        "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
    });
    const object = response.object;
    const feedback = {
      interviewId,
      userName,
      totalScore: object.totalScore,
      categoryScores: object.categoryScores,
      strengths: object.strengths,
      areasForImprovement: object.areasForImprovement,
      finalAssessment: object.finalAssessment,
      createdAt: new Date().toISOString(),
    };

    const feedbackRef = feedbackId
      ? db.collection("feedback").doc(feedbackId)
      : db.collection("feedback").doc();

    await feedbackRef.set(feedback);

    return NextResponse.json({ success: true, feedbackId: feedbackRef.id });
  } catch (error) {
    console.error("Error generating feedback:", error);
    return NextResponse.json(
      { success: false, error: error?.toString() },
      { status: 500 }
    );
  }
}
