import { generateText } from 'ai';
import { gateway } from 'ai';

export const config = {
  maxDuration: 60,
};

// Cache the generated content for 12 hours
let cachedContent = null;
let cachedAt = 0;
const CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours

export default async function handler(req, res) {
  // CORS headers for frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=43200, stale-while-revalidate=3600');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const now = Date.now();

    // Return cached content if fresh enough
    if (cachedContent && (now - cachedAt) < CACHE_DURATION) {
      return res.status(200).json(cachedContent);
    }

    // Step 1: Get today's date for the briefing
    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    // Step 2: Use AI Gateway to generate fresh AI news briefing
    const { text: newsContent } = await generateText({
      model: gateway('perplexity/sonar-pro'),
      prompt: `What are the top 5 most important AI news stories and developments from the last 48 hours (as of ${today})?
For each story, provide:
1. A one-line headline
2. A 2-sentence summary of what happened
3. Why it matters for product managers

Focus on: new AI model releases, AI product launches, AI company news, AI regulation, and notable AI tools/features.
Be specific with names, companies, and dates. Only include real, verified news.`,
    });

    // Step 3: Use Claude to structure it into our app format
    const { text: structuredContent } = await generateText({
      model: gateway('anthropic/claude-sonnet-4.5'),
      prompt: `You are a content generator for "AI PM Daily", a learning app for product managers.

Based on this latest AI news:
---
${newsContent}
---

Generate a JSON object with this EXACT structure (no markdown, just valid JSON):
{
  "date": "${today}",
  "headline": "One catchy headline summarizing today's AI landscape (max 60 chars)",
  "briefing": [
    {
      "title": "Short title for this news item (max 50 chars)",
      "text": "2-3 sentence explanation of what happened and why it matters. Written for a PM who is smart but not deeply technical. Max 80 words.",
      "pmTakeaway": "One sentence: what should a PM do or think differently because of this? Start with an action verb."
    }
  ],
  "quiz": [
    {
      "question": "A quiz question testing understanding of one of today's news items (max 30 words)",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": 0,
      "explanation": "One sentence explaining why this is correct"
    }
  ],
  "toolSpotlight": {
    "name": "Name of an AI tool mentioned in or related to today's news",
    "description": "What it does in 2 sentences",
    "tryIt": "A specific action the PM can take to try this tool today",
    "url": "URL to the tool"
  }
}

Requirements:
- Include exactly 5 briefing items
- Include exactly 3 quiz questions
- Spread correct quiz answers across different positions (not all the same)
- Make quiz questions test understanding, not memorization
- The toolSpotlight should be a real, accessible tool related to today's news
- All content must be factual and based on the news provided
- Return ONLY valid JSON, no markdown fences or extra text`,
    });

    // Parse the structured content
    let parsed;
    try {
      // Strip any markdown fences if present
      const cleaned = structuredContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return res.status(500).json({ error: 'Failed to generate content', details: 'Parse error' });
    }

    // Cache the result
    cachedContent = parsed;
    cachedAt = now;

    return res.status(200).json(parsed);

  } catch (error) {
    console.error('Daily pulse generation failed:', error);
    return res.status(500).json({
      error: 'Failed to generate daily content',
      message: error.message,
    });
  }
}
