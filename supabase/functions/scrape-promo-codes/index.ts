const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const CODE_SOURCES = [
  { url: 'https://www.dexerto.com/pokemon/pokemon-go-promo-codes-free-items-1350276/', name: 'Dexerto' },
];

// In-memory rate limiting: max 1 request per 60 seconds per IP
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_WINDOW_MS = 60_000;

// Cache last successful response for 5 minutes
let cachedResponse: { data: string; timestamp: number } | null = null;
const CACHE_TTL_MS = 5 * 60_000;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting by IP
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                     req.headers.get('cf-connecting-ip') || 'unknown';
    const now = Date.now();
    const lastRequest = rateLimitMap.get(clientIp);
    if (lastRequest && now - lastRequest < RATE_LIMIT_WINDOW_MS) {
      if (cachedResponse && now - cachedResponse.timestamp < CACHE_TTL_MS) {
        return new Response(cachedResponse.data, {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      return new Response(
        JSON.stringify({ success: false, error: 'Rate limit exceeded. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    rateLimitMap.set(clientIp, now);

    // Clean up old entries
    if (rateLimitMap.size > 1000) {
      for (const [ip, ts] of rateLimitMap) {
        if (now - ts > RATE_LIMIT_WINDOW_MS) rateLimitMap.delete(ip);
      }
    }

    // Return cached response if still fresh
    if (cachedResponse && now - cachedResponse.timestamp < CACHE_TTL_MS) {
      return new Response(cachedResponse.data, {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'FIRECRAWL_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const allCodes: { code: string; reward: string; source: string; active: boolean }[] = [];

    const scrapePromises = CODE_SOURCES.map(async (source) => {
      try {
        console.log(`Scraping ${source.name}: ${source.url}`);
        const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: source.url,
            formats: ['markdown'],
            onlyMainContent: true,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          console.error(`Failed to scrape ${source.name}:`, data);
          return [];
        }

        const markdown = data.data?.markdown || data.markdown || '';
        console.log(`Got ${markdown.length} chars from ${source.name}`);
        return extractCodes(markdown, source.name);
      } catch (err) {
        console.error(`Error scraping ${source.name}:`, err);
        return [];
      }
    });

    const results = await Promise.all(scrapePromises);
    for (const codes of results) {
      allCodes.push(...codes);
    }

    // Deduplicate by code string
    const seen = new Set<string>();
    const uniqueCodes = allCodes.filter((c) => {
      const key = c.code.toUpperCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    console.log(`Found ${uniqueCodes.length} unique codes`);

    const responseBody = JSON.stringify({ success: true, codes: uniqueCodes, scrapedAt: new Date().toISOString() });
    cachedResponse = { data: responseBody, timestamp: Date.now() };

    return new Response(responseBody, {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in scrape-promo-codes:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'An internal error occurred. Please try again later.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function extractCodes(markdown: string, source: string): { code: string; reward: string; source: string; active: boolean }[] {
  const codes: { code: string; reward: string; source: string; active: boolean }[] = [];

  // Strategy 1: Parse markdown tables (e.g. "| **CODE** | Reward | Expires |")
  const tableRowRegex = /\|\s*\*{0,2}([A-Za-z0-9]{6,30})\*{0,2}\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|/g;
  let match;
  while ((match = tableRowRegex.exec(markdown)) !== null) {
    const code = match[1].trim();
    const reward = match[2].replace(/\*{1,2}/g, '').trim();
    const expiryInfo = match[3].replace(/\*{1,2}/g, '').trim();

    // Skip table headers
    if (/^(code|---)/i.test(code)) continue;
    if (code.length < 6) continue;

    const isExpired = checkIfExpired(expiryInfo);
    codes.push({ code, reward, source, active: !isExpired });
  }

  // Strategy 2: Look for codes in context with surrounding text
  const lines = markdown.split('\n');
  const codePattern = /\b([A-Z0-9]{8,30})\b/g;
  const existingCodes = new Set(codes.map(c => c.code.toUpperCase()));

  // Track whether we're in an "active" or "expired" section
  let inExpiredSection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect section headers
    if (/#{1,3}\s*.*(expired|old|past|previous|invalid)/i.test(line)) {
      inExpiredSection = true;
    }
    if (/#{1,3}\s*.*(active|current|working|new|available)/i.test(line)) {
      inExpiredSection = false;
    }

    const matches = line.match(codePattern);
    if (!matches) continue;

    for (const code of matches) {
      if (existingCodes.has(code.toUpperCase())) continue;
      if (code.length < 8 || code.length > 25) continue;
      if (/^[0-9]+$/.test(code)) continue;
      if (/^[A-Z]+$/.test(code) && code.length < 10) continue;
      // Filter common false positives (headers, IDs, etc.)
      if (/^(UPDATED|POKEMON|MARCH|APRIL|FEBRUARY|JANUARY|IMAGE|TABLE|GUIDE)/i.test(code)) continue;

      const context = lines.slice(Math.max(0, i - 2), i + 3).join(' ');
      const isExpired = inExpiredSection || checkIfExpired(context);

      let reward = 'Promo reward';
      const rewardMatch = context.match(/(?:reward|get|receive|claim|redeem|gives?|provides?)[:\s]+([^.!\n|]{5,80})/i);
      if (rewardMatch) {
        reward = rewardMatch[1].trim();
      } else {
        const cleanLine = line.replace(code, '').replace(/[|*`#\-]/g, '').trim();
        if (cleanLine.length > 5 && cleanLine.length < 100) {
          reward = cleanLine;
        }
      }

      existingCodes.add(code.toUpperCase());
      codes.push({ code, reward, source, active: !isExpired });
    }
  }

  return codes;
}

function checkIfExpired(context: string): boolean {
  if (/expired|inactive|no longer|invalid|has ended|not working/i.test(context)) {
    return true;
  }

  // Check for past dates
  const dateMatch = context.match(/(?:expire[sd]?|valid until|ends?|ended)\s+(?:on\s+)?(\w+\.?\s+\d{1,2}(?:,?\s*\d{4})?)/i);
  if (dateMatch) {
    try {
      const parsed = new Date(dateMatch[1]);
      if (!isNaN(parsed.getTime()) && parsed < new Date()) {
        return true;
      }
    } catch {
      // ignore
    }
  }

  return false;
}
