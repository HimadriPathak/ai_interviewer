import Retell from "retell-sdk";

const client = new Retell({
  apiKey: process.env.RETELL_API_KEY || "",
});

async function main() {
  const params: Retell.AgentCreateParams = {
    response_engine: {
      llm_id: "llm_234sdertfsdsfsdf",
      type: "retell-llm",
    },
    voice_id: "11labs-Adrian",
  };
  const agentResponse = await client.agent.create(params);
}
