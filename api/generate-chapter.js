import { generateText } from 'ai';
import { gateway } from 'ai';
import { checkRateLimit, getRateLimitHeaders } from './_rateLimit.js';

export const config = {
  maxDuration: 60,
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const rl = checkRateLimit(req);
  for (const [k, v] of Object.entries(getRateLimitHeaders(rl))) res.setHeader(k, v);
  if (!rl.allowed) {
    return res.status(429).json({ error: 'Daily limit reached (20 AI requests/day). Try again tomorrow!', remaining: 0 });
  }

  try {
    const { weakTopics, level, completedTopics, chapterNumber } = req.body;

    if (!weakTopics || !Array.isArray(weakTopics)) {
      return res.status(400).json({ error: 'Missing weakTopics array' });
    }

    const tierLabel = level >= 7 ? 'expert' : level >= 4 ? 'intermediate' : 'beginner';

    // Step 1: Get recent AI news related to weak topics
    const { text: newsContext } = await generateText({
      model: gateway('perplexity/sonar-pro'),
      prompt: `What are the latest developments in AI related to these topics: ${weakTopics.join(', ')}?
Focus on news from the last 7 days. Include specific companies, tools, and product launches.
Keep it concise — 3-5 key developments with one sentence each.`,
    });

    // Step 2: Generate chapter content
    const { text: chapterContent } = await generateText({
      model: gateway('anthropic/claude-sonnet-4.5'),
      prompt: `You are a content generator for "AI PM Daily", a Duolingo-style AI learning app for product managers.

The user has completed basic AI fundamentals and needs a NEW chapter focused on their weak areas.

Weak topics (areas they got wrong in quizzes): ${weakTopics.join(', ')}
Topics already completed: ${(completedTopics || []).join(', ')}
User level: ${tierLabel} (${level}/10)
Chapter number: ${chapterNumber || 8}

Recent AI news for context:
${newsContext}

Generate a JSON object with this EXACT structure (no markdown, just valid JSON):
{
  "day": ${chapterNumber || 8},
  "theme": "A catchy theme title incorporating the weak topics (max 50 chars)",
  "emoji": "A single relevant emoji",
  "color": "A hex color string like #6366F1",
  "briefing": [
    {
      "text": "A clear explanation for ${tierLabel} level. 2-3 sentences, max 60 words. Incorporate recent AI news where relevant.",
      "advancedText": "A technical explanation with architecture details and code patterns. 2-3 sentences, max 60 words.",
      "example": "A real-world analogy or example for beginners. 1-2 sentences.",
      "advancedExample": "A specific technical example referencing real tools/companies. 1-2 sentences."
    }
  ],
  "quiz": [
    {
      "question": "A quiz question testing understanding (max 30 words)",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": 0,
      "learnLinks": [
        { "title": "Short video title", "url": "https://www.youtube.com/results?search_query=relevant+search" }
      ]
    }
  ],
  "isGenerated": true,
  "generatedAt": "${new Date().toISOString()}",
  "basedOn": ${JSON.stringify(weakTopics)}
}

Requirements:
- Include exactly 5 briefing items
- Include exactly 5 quiz questions
- Spread correct quiz answers across different positions (0, 1, 2, 3)
- Content must directly address the weak topics
- Incorporate at least 2 references to the recent AI news provided
- Make it feel fresh and current, not textbook-like
- Return ONLY valid JSON, no markdown fences`,
    });

    let parsed;
    try {
      const cleaned = chapterContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch (parseError) {
      return res.status(500).json({ error: 'Failed to parse generated content' });
    }

    return res.status(200).json(parsed);

  } catch (error) {
    console.error('Chapter generation failed:', error);
    return res.status(500).json({ error: 'Failed to generate chapter', message: error.message });
  }
}
