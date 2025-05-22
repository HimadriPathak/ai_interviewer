import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";
const InterviewSchema = z.object({
  role: z.literal("assistant"),
  content: z
    .string()
    .describe("A concise interview question in less than 150 characters."),
  endInterview: z.boolean().describe("Whether to end the interview."),
});

const SystemPrompt = `
You are a professional AI interviewer conducting a real-time voice interview with a candidate.

You will be given:
- A job description
- A summary of the candidate’s resume
- A transcript of the conversation so far
- The number of questions already asked

Your goals:
1. If there is no prior conversation, start by warmly welcoming the candidate and asking the first relevant question.
2. If the conversation has started, ask a relevant follow-up question based on the candidate’s previous answer.
3. If the candidate has already been asked 5 or more questions, or says they want to stop, end the interview politely and professionally.
4. Your output must follow this format:
   {
     role: "assistant",
     content: "your short and friendly question or message",
     endInterview: true or false
   }

Style Guidelines:
- Keep responses short and natural, like in a voice interview.
- Maintain a warm, official, and professional tone.
- Never sound robotic or repetitive.
- Never exceed 6 questions in total.
- Do not repeat questions or restate candidate inputs.
- Do not say you’re an AI or mention the schema.

Examples:
- “Hello! Thank you for taking the time to speak with me today. I'm excited to learn more about you and your experience.”
- “What attracted you to this role?”
- “Could you tell me more about your recent project?”
- “Thanks for sharing. What was your biggest challenge in that project?”
- “It was great speaking with you today! Our team will be in touch soon. Have a wonderful day.”
`;

export async function POST(req: NextRequest) {
  const genAI = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GEMINI_API_KEY,
  });
  try {
    const formData = await req.formData();
    const jobDescription = formData.get("jobDescription") as string;
    const resumeSummary = formData.get("resumeSummary") as string;
    const chatHistory = JSON.parse(formData.get("messages") as string) as {
      role: string;
      content: string;
    }[];

    const assistantMessages = chatHistory.filter(
      (msg) => msg.role === "assistant"
    ).length;

    const prompt = `
Job Description: "${jobDescription}"
Resume Summary: "${resumeSummary}"
Conversation History: ${JSON.stringify(chatHistory)}
Questions Asked So Far: ${assistantMessages}
`;

    const { object } = await generateObject({
      model: genAI("gemini-1.5-flash"),
      schema: InterviewSchema,
      system: SystemPrompt,
      prompt,
    });
    return Response.json({ success: true, object }, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ success: false, error: error }, { status: 500 });
  }
}
