const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const CODE_SOURCES = [
  { url: 'https://leekduck.com/pokemongo-promo-codes/', name: 'LeekDuck' },
  { url: 'https://www.eurogamer.net/pokemon-go-promo-codes-list', name: 'Eurogamer' },
  { url: 'https://www.pockettactics.com/pokemon-go/codes', name: 'PocketTactics' },
];

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

    return new Response(
      JSON.stringify({ success: true, codes: uniqueCodes, scrapedAt: new Date().toISOString() }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in scrape-promo-codes:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function extractCodes(markdown: string, source: string): { code: string; reward: string; source: string; active: boolean }[] {
  const codes: { code: string; reward: string; source: string; active: boolean }[] = [];
  
  // Match common promo code patterns - typically ALL CAPS with numbers, 10+ chars
  const codePattern = /\b([A-Z0-9]{8,30})\b/g;
  const lines = markdown.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const matches = line.match(codePattern);
    if (!matches) continue;
    
    for (const code of matches) {
      // Filter out common false positives
      if (code.length < 8 || code.length > 25) continue;
      if (/^[0-9]+$/.test(code)) continue; // Pure numbers
      if (/^[A-Z]+$/.test(code) && code.length < 10) continue; // Short all-letters
      
      // Try to find reward description nearby
      const context = lines.slice(Math.max(0, i - 2), i + 3).join(' ');
      const isExpired = /expired|inactive|no longer|invalid/i.test(context);
      
      // Extract reward from context
      let reward = 'Promo reward';
      const rewardMatch = context.match(/(?:reward|get|receive|claim|redeem)[:\s]+([^.!\n]{5,80})/i);
      if (rewardMatch) {
        reward = rewardMatch[1].trim();
      } else {
        // Use the line itself as context
        const cleanLine = line.replace(code, '').replace(/[|*`#\-]/g, '').trim();
        if (cleanLine.length > 5 && cleanLine.length < 100) {
          reward = cleanLine;
        }
      }

      codes.push({ code, reward, source, active: !isExpired });
    }
  }
  
  return codes;
}
