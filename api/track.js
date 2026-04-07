import { put, get } from '@vercel/blob';
import { getClientIP } from './_rateLimit.js';

export const config = { maxDuration: 10 };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { event, fingerprint, data } = req.body;
    if (!event) return res.status(400).json({ error: 'Missing event' });

    const ip = getClientIP(req);
    const now = new Date();
    const dateKey = now.toISOString().slice(0, 10);

    const entry = {
      ts: now.toISOString(),
      event,
      fingerprint: fingerprint || 'unknown',
      ip,
      ua: (req.headers['user-agent'] || '').slice(0, 120),
      ...(data || {}),
    };

    // Append to daily log blob
    const blobPath = `analytics/${dateKey}.jsonl`;

    let existing = '';
    try {
      const blob = await get(blobPath, { access: 'public' });
      if (blob) {
        existing = await new Response(blob.stream).text();
      }
    } catch { /* first entry of the day */ }

    const newContent = existing + JSON.stringify(entry) + '\n';
    await put(blobPath, newContent, { access: 'public', addRandomSuffix: false, allowOverwrite: true });

    console.log('[track]', JSON.stringify(entry));

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Track failed:', error);
    return res.status(500).json({ error: 'Track failed' });
  }
}
