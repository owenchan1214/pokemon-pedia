CREATE TABLE public.promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  reward text NOT NULL DEFAULT 'Promo reward',
  source text,
  active boolean NOT NULL DEFAULT true,
  expires text,
  scraped_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(code)
);

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read codes (public feature)
CREATE POLICY "Anyone can read promo codes"
  ON public.promo_codes FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only service role can insert/update (edge function uses service role)
CREATE POLICY "Service role can manage promo codes"
  ON public.promo_codes FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);