import { createClient } from "@deepgram/sdk";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { text } = await req.json();

  if (!text) {
    return NextResponse.json({ error: "No text provided" }, { status: 400 });
  }

  const deepgram = createClient(process.env.DEEPGRAM_API_KEY!);

  const response = await deepgram.speak.request(
    { text },
    {
      model: "aura-2-thalia-en",
      encoding: "linear16",
      container: "wav",
    }
  );

  const stream = await response.getStream();

  if (!stream) {
    return NextResponse.json(
      { error: "Failed to get audio stream" },
      { status: 500 }
    );
  }

  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const audioBuffer = Buffer.concat(chunks.map((c) => Buffer.from(c)));

  return new NextResponse(audioBuffer, {
    status: 200,
    headers: {
      "Content-Type": "audio/wav",
    },
  });
}
