const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const CODE_SOURCES = [
  { url: 'https://www.dexerto.com/pokemon/pokemon-go-promo-codes-free-items-1350276/', name: 'Dexerto' },
  { url: 'https://www.pockettactics.com/pokemon-go/codes', name: 'PocketTactics' },
  { url: 'https://www.codesofexisting.com/pokemon-go-promo-codes/', name: 'CodesOfExisting' },
];

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'FIRECRAWL_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const allCodes: { code: string; reward: string; source: string; active: boolean }[] = [];

    // Scrape each source in parallel
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

    console.log(`Found ${uniqueCodes.length} unique codes from scraping`);

    // Persist to database
    if (uniqueCodes.length > 0) {
      for (const c of uniqueCodes) {
        const { error } = await supabase.from('promo_codes').upsert(
          {
            code: c.code,
            reward: c.reward,
            source: c.source,
            active: c.active,
            expires: c.active ? 'Active' : 'Expired',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'code' }
        );
        if (error) console.error(`Failed to upsert code ${c.code}:`, error);
      }
    }

    // Mark codes as expired if:
    // 1. Scraped sources explicitly say expired
    // 2. Code was previously active but NOT found in ANY scraped source anymore (removed = likely expired)
    const { data: existingCodes } = await supabase.from('promo_codes').select('code, active');
    if (existingCodes) {
      const scrapedActiveSet = new Set(uniqueCodes.filter(c => c.active).map(c => c.code.toUpperCase()));
      const scrapedExpiredSet = new Set(uniqueCodes.filter(c => !c.active).map(c => c.code.toUpperCase()));
      const allScrapedSet = new Set(uniqueCodes.map(c => c.code.toUpperCase()));

      for (const existing of existingCodes) {
        const upperCode = existing.code.toUpperCase();
        // If found as expired OR no longer listed on any source → mark expired
        if (existing.active && (scrapedExpiredSet.has(upperCode) || !allScrapedSet.has(upperCode))) {
          // Only auto-expire if we actually got results from scraping (avoid marking all expired on scrape failure)
          if (uniqueCodes.length > 0) {
            await supabase.from('promo_codes').update({
              active: false,
              expires: 'Expired',
              updated_at: new Date().toISOString(),
            }).eq('code', existing.code);
            console.log(`Marked ${existing.code} as expired (not found in active sources)`);
          }
        }
      }
    }

    const responseBody = JSON.stringify({ success: true, codesFound: uniqueCodes.length, scrapedAt: new Date().toISOString() });

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

  // Strategy 1: Parse markdown tables
  const tableRowRegex = /\|\s*\*{0,2}([A-Za-z0-9]{6,30})\*{0,2}\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|/g;
  let match;
  while ((match = tableRowRegex.exec(markdown)) !== null) {
    const code = match[1].trim();
    const reward = match[2].replace(/\*{1,2}/g, '').trim();
    const expiryInfo = match[3].replace(/\*{1,2}/g, '').trim();
    if (/^(code|---)/i.test(code)) continue;
    if (code.length < 6) continue;
    const isExpired = checkIfExpired(expiryInfo);
    codes.push({ code, reward, source, active: !isExpired });
  }

  // Strategy 2: Inline code blocks with context (e.g. "Promo Code: `CODE`" or "**`CODE`**")
  const inlineCodeRegex = /(?:promo\s*code|code)[:\s]*[`*]*([A-Z0-9]{8,30})[`*]*/gi;
  const existingCodes = new Set(codes.map(c => c.code.toUpperCase()));
  while ((match = inlineCodeRegex.exec(markdown)) !== null) {
    const code = match[1].trim();
    if (existingCodes.has(code.toUpperCase())) continue;
    existingCodes.add(code.toUpperCase());

    // Get surrounding context for reward
    const start = Math.max(0, match.index - 200);
    const end = Math.min(markdown.length, match.index + 200);
    const context = markdown.substring(start, end);
    const isExpired = checkIfExpired(context);

    let reward = 'Promo reward';
    const rewardMatch = context.match(/(?:get|receive|gives?|provides?|reward)[:\s]+([^.!\n|`]{5,80})/i);
    if (rewardMatch) reward = rewardMatch[1].replace(/\*{1,2}/g, '').trim();

    codes.push({ code, reward, source, active: !isExpired });
  }

  // Strategy 3: Standalone all-caps codes
  const lines = markdown.split('\n');
  let inExpiredSection = false;
  const codePattern = /\b([A-Z0-9]{8,30})\b/g;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/#{1,3}\s*.*(expired|old|past|previous|invalid)/i.test(line)) inExpiredSection = true;
    if (/#{1,3}\s*.*(active|current|working|new|available)/i.test(line)) inExpiredSection = false;

    const matches = line.match(codePattern);
    if (!matches) continue;

    for (const code of matches) {
      if (existingCodes.has(code.toUpperCase())) continue;
      if (code.length < 8 || code.length > 25) continue;
      if (/^[0-9]+$/.test(code)) continue;
      if (/^[A-Z]+$/.test(code) && code.length < 10) continue;
      if (/^(UPDATED|POKEMON|MARCH|APRIL|FEBRUARY|JANUARY|IMAGE|TABLE|GUIDE|NIANTIC|DEXERTO)/i.test(code)) continue;

      const context = lines.slice(Math.max(0, i - 2), i + 3).join(' ');
      const isExpired = inExpiredSection || checkIfExpired(context);

      let reward = 'Promo reward';
      const rewardMatch = context.match(/(?:reward|get|receive|claim|redeem|gives?|provides?)[:\s]+([^.!\n|]{5,80})/i);
      if (rewardMatch) reward = rewardMatch[1].replace(/\*{1,2}/g, '').trim();
      else {
        const cleanLine = line.replace(code, '').replace(/[|*`#\-]/g, '').trim();
        if (cleanLine.length > 5 && cleanLine.length < 100) reward = cleanLine;
      }

      existingCodes.add(code.toUpperCase());
      codes.push({ code, reward, source, active: !isExpired });
    }
  }

  return codes;
}

function checkIfExpired(context: string): boolean {
  if (/expired|inactive|no longer|invalid|has ended|not working/i.test(context)) return true;
  const dateMatch = context.match(/(?:expire[sd]?|valid until|ends?|ended)\s+(?:on\s+)?(\w+\.?\s+\d{1,2}(?:,?\s*\d{4})?)/i);
  if (dateMatch) {
    try {
      const parsed = new Date(dateMatch[1]);
      if (!isNaN(parsed.getTime()) && parsed < new Date()) return true;
    } catch { /* ignore */ }
  }
  return false;
}
