import { createGroq } from '@ai-sdk/groq';
import { streamText } from 'ai';

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    /**
     * SABOTAGE BLOCK: Rate Limit Simulation
     * Uncomment the line below to simulate a 429 Rate Limit error.
     * This tests mid-stream error handling and the retry flow in the UI.
     * Remove this block before production deployment.
     */
    // throw new Error('Rate limit exceeded: 429');

    const result = streamText({
      model: groq('llama-3.3-70b-versatile'),
      messages,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal Server Error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}