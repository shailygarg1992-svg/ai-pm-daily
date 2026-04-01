import { generateText } from 'ai';
import { gateway } from 'ai';

export const config = {
  maxDuration: 30,
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { question, topic, briefingContext, level } = req.body;

    if (!question || !topic) {
      return res.status(400).json({ error: 'Missing question or topic' });
    }

    const tierLabel = level >= 7 ? 'expert (technical, uses architecture terms)' :
                      level >= 4 ? 'intermediate (practical, some technical detail)' :
                      'beginner (simple analogies, no jargon)';

    const { text } = await generateText({
      model: gateway('anthropic/claude-sonnet-4.5'),
      system: `You are a friendly AI tutor inside "AI PM Daily", a learning app for product managers.
The user is studying the topic: "${topic}".
Their knowledge level is: ${tierLabel}.

Context from the current lesson:
${briefingContext || 'General AI product management concepts.'}

Rules:
- Keep answers concise (2-4 sentences max for simple questions, up to 6 for complex ones)
- Use real-world examples and analogies PMs would relate to
- If they ask something outside AI/PM scope, gently redirect
- Be encouraging and conversational, like a smart coworker in a chat
- Never use markdown headers. Use plain text. Keep it chat-friendly.`,
      prompt: question,
    });

    return res.status(200).json({ answer: text });

  } catch (error) {
    console.error('Ask agent failed:', error);
    return res.status(500).json({
      error: 'Failed to get answer',
      message: error.message,
    });
  }
}
