const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const CODE_SOURCES = [
  { url: 'https://www.dexerto.com/pokemon/pokemon-go-promo-codes-free-items-1350276/', name: 'Dexerto' },
  { url: 'https://www.pockettactics.com/pokemon-go/codes', name: 'PocketTactics' },
];

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!firecrawlKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'FIRECRAWL_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'LOVABLE_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Scrape each source in parallel
    const scrapePromises = CODE_SOURCES.map(async (source) => {
      try {
        console.log(`Scraping ${source.name}: ${source.url}`);
        const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${firecrawlKey}`,
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
          return { source: source.name, markdown: '' };
        }

        const markdown = data.data?.markdown || data.markdown || '';
        console.log(`Got ${markdown.length} chars from ${source.name}`);
        return { source: source.name, markdown };
      } catch (err) {
        console.error(`Error scraping ${source.name}:`, err);
        return { source: source.name, markdown: '' };
      }
    });

    const scrapedResults = await Promise.all(scrapePromises);
    const combinedMarkdown = scrapedResults
      .filter(r => r.markdown.length > 0)
      .map(r => `=== SOURCE: ${r.source} ===\n${r.markdown}`)
      .join('\n\n');

    if (!combinedMarkdown) {
      return new Response(
        JSON.stringify({ success: false, error: 'No content scraped from any source' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use AI to extract codes accurately
    const today = new Date().toISOString().split('T')[0];
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You extract Pokemon GO promo codes from website content. Today's date is ${today}. Return ONLY a JSON array of objects with: code (string), reward (string, brief description of what you get), active (boolean - true only if the code is currently working and not expired as of today), source (string - which source website it came from). Include BOTH active and expired/old codes you find - mark expired ones with active: false. Be strict: only include actual promo codes (alphanumeric strings that can be redeemed in Pokemon GO). Do NOT include: page navigation text, website names, random words, user comments, or anything that is clearly not a real Pokemon GO promo code. Return raw JSON array only, no markdown fences.`
          },
          {
            role: 'user',
            content: `Extract all Pokemon GO promo codes from this scraped content:\n\n${combinedMarkdown.substring(0, 15000)}`
          }
        ],
        temperature: 0.1,
      }),
    });

    if (!aiResponse.ok) {
      console.error('AI extraction failed:', await aiResponse.text());
      return new Response(
        JSON.stringify({ success: false, error: 'AI extraction failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || '';
    console.log('AI response:', content.substring(0, 500));

    let extractedCodes: { code: string; reward: string; active: boolean; source: string }[] = [];
    try {
      // Strip markdown code fences if present
      const cleaned = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      extractedCodes = JSON.parse(cleaned);
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to parse AI response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Deduplicate
    const seen = new Set<string>();
    const uniqueCodes = extractedCodes.filter((c) => {
      const key = c.code.toUpperCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    console.log(`AI extracted ${uniqueCodes.length} unique codes (${uniqueCodes.filter(c => c.active).length} active)`);

    // Persist to database
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

    // Mark existing DB codes as expired if not found as active in scrape
    if (uniqueCodes.length > 0) {
      const { data: existingCodes } = await supabase.from('promo_codes').select('code, active');
      const scrapedActiveSet = new Set(uniqueCodes.filter(c => c.active).map(c => c.code.toUpperCase()));

      if (existingCodes) {
        for (const existing of existingCodes) {
          if (existing.active && !scrapedActiveSet.has(existing.code.toUpperCase())) {
            await supabase.from('promo_codes').update({
              active: false,
              expires: 'Expired',
              updated_at: new Date().toISOString(),
            }).eq('code', existing.code);
            console.log(`Marked ${existing.code} as expired`);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, codesFound: uniqueCodes.length, activeCount: uniqueCodes.filter(c => c.active).length, scrapedAt: new Date().toISOString() }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in scrape-promo-codes:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'An internal error occurred.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
