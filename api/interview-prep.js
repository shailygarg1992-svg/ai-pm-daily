import { generateText } from 'ai';
import { gateway } from 'ai';

export const config = {
  maxDuration: 60,
};

// Cache per company for 24 hours
const cache = {};
const CACHE_TTL = 24 * 60 * 60 * 1000;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=3600');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { company, level } = req.body;

    if (!company) return res.status(400).json({ error: 'Missing company' });

    const cacheKey = `${company}_${level || 5}`;
    if (cache[cacheKey] && (Date.now() - cache[cacheKey].at) < CACHE_TTL) {
      return res.status(200).json(cache[cacheKey].data);
    }

    const tierLabel = level >= 7 ? 'expert (technical depth, system design)' :
                      level >= 4 ? 'intermediate (product sense, practical)' :
                      'beginner (fundamentals, frameworks)';

    const { text: newsContext } = await generateText({
      model: gateway('perplexity/sonar-pro'),
      prompt: `What are ${company}'s latest AI products, launches, and strategic moves in the last 30 days?
Include specific product names, features, and any organizational changes.
Keep it to 5 key points, one sentence each.`,
    });

    const { text: content } = await generateText({
      model: gateway('anthropic/claude-sonnet-4.5'),
      prompt: `You are a content generator for "AI PM Daily", an AI learning app for product managers preparing for interviews.

Generate interview prep content for: ${company}
User level: ${tierLabel}

Latest news about ${company}:
${newsContext}

Generate a JSON object with this EXACT structure (no markdown, just valid JSON):
{
  "company": "${company}",
  "overview": "3-4 sentences about the company's AI strategy, key products, and what they look for in AI PMs. Reference recent news.",
  "keyProducts": ["Product 1", "Product 2", "Product 3", "Product 4", "Product 5"],
  "interviewQuestions": [
    {
      "question": "A realistic PM interview question this company would ask",
      "category": "product_sense | technical | strategy | execution | behavioral",
      "sampleFramework": "A 3-4 sentence framework for answering this question well",
      "tips": "One sentence of insider advice"
    }
  ],
  "caseStudy": {
    "scenario": "A realistic product case study scenario (3-4 sentences) that ${company} might use in interviews. Reference their actual products.",
    "promptQuestions": ["Question 1 to consider", "Question 2 to consider", "Question 3 to consider"],
    "sampleApproach": "A structured 4-5 sentence approach to solving this case"
  },
  "tips": [
    "Tip 1 specific to interviewing at ${company}",
    "Tip 2",
    "Tip 3",
    "Tip 4",
    "Tip 5"
  ]
}

Requirements:
- Include exactly 6 interview questions spread across categories
- Make questions specific to ${company}'s actual products and challenges
- The case study must reference real ${company} products
- Tips should be actionable and specific, not generic
- Incorporate the latest news into at least 2 questions
- Return ONLY valid JSON, no markdown fences`,
    });

    let parsed;
    try {
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      return res.status(500).json({ error: 'Failed to parse content' });
    }

    cache[cacheKey] = { data: parsed, at: Date.now() };
    return res.status(200).json(parsed);

  } catch (error) {
    console.error('Interview prep generation failed:', error);
    return res.status(500).json({ error: 'Failed to generate content', message: error.message });
  }
}
