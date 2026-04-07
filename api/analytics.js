import { list, get } from '@vercel/blob';

export const config = { maxDuration: 10 };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 'no-cache');

  // Simple auth — pass ?key=YOUR_SECRET to view analytics
  const authKey = process.env.ANALYTICS_KEY;
  if (authKey && req.query.key !== authKey) {
    return res.status(401).json({ error: 'Unauthorized. Pass ?key=YOUR_ANALYTICS_KEY' });
  }

  try {
    const daysBack = parseInt(req.query.days) || 7;
    const dates = [];
    for (let i = 0; i < daysBack; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().slice(0, 10));
    }

    const allEvents = [];
    for (const date of dates) {
      try {
        const blob = await get(`analytics/${date}.jsonl`, { access: 'public' });
        if (blob) {
          const text = await new Response(blob.stream).text();
          const lines = text.trim().split('\n').filter(Boolean);
          for (const line of lines) {
            try { allEvents.push(JSON.parse(line)); } catch { /* skip bad lines */ }
          }
        }
      } catch { /* no data for this day */ }
    }

    // Build summary
    const uniqueUsers = new Set(allEvents.map(e => e.fingerprint));
    const uniqueIPs = new Set(allEvents.map(e => e.ip));
    const eventCounts = {};
    const dailyCounts = {};
    const userActivity = {};

    for (const e of allEvents) {
      eventCounts[e.event] = (eventCounts[e.event] || 0) + 1;

      const day = e.ts.slice(0, 10);
      if (!dailyCounts[day]) dailyCounts[day] = { events: 0, users: new Set() };
      dailyCounts[day].events++;
      dailyCounts[day].users.add(e.fingerprint);

      if (!userActivity[e.fingerprint]) userActivity[e.fingerprint] = { events: 0, lastSeen: e.ts, ip: e.ip };
      userActivity[e.fingerprint].events++;
      userActivity[e.fingerprint].lastSeen = e.ts;
    }

    // Serialize Sets
    const daily = {};
    for (const [day, data] of Object.entries(dailyCounts)) {
      daily[day] = { events: data.events, uniqueUsers: data.users.size };
    }

    return res.status(200).json({
      period: `${dates[dates.length - 1]} to ${dates[0]}`,
      totalEvents: allEvents.length,
      uniqueUsers: uniqueUsers.size,
      uniqueIPs: uniqueIPs.size,
      eventBreakdown: eventCounts,
      daily,
      users: userActivity,
      recentEvents: allEvents.slice(-20).reverse(),
    });
  } catch (error) {
    console.error('Analytics failed:', error);
    return res.status(500).json({ error: 'Analytics failed', message: error.message });
  }
}
