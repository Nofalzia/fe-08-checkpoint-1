import { createGroq } from '@ai-sdk/groq';
import { streamText } from 'ai';

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  /**
   * SABOTAGE BLOCK: Rate Limit Simulation
   * Uncomment the return below to test the client's 429 error state.
   */
  // return new Response('Rate limit exceeded', { status: 429 });

  try {
    const { messages } = await req.json();

    const result = streamText({
      model: groq('qwen/qwen3.6-27b'),
      messages,
    });

    return result.toUIMessageStreamResponse();
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