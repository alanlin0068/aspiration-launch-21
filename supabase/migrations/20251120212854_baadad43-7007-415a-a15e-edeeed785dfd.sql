-- Add more detailed charity information
ALTER TABLE public.charities
ADD COLUMN IF NOT EXISTS overview TEXT,
ADD COLUMN IF NOT EXISTS cost_effectiveness TEXT,
ADD COLUMN IF NOT EXISTS evidence_of_impact TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Update existing charities with detailed information
UPDATE public.charities
SET 
  overview = 'Releaf the Planet is a nonprofit focused on large-scale ecological restoration, having planted over 2.1 million native trees across three high-deforestation regions. Its programs prioritize interventions with demonstrated ecological returns, such as improving canopy cover, water retention, and long-term soil stability.',
  cost_effectiveness = 'Through streamlined logistics and local partnerships, the organization plants a tree for an average of $0.42, allowing donors to create significant impact at low cost. Annual financial reports show that over 88% of funding goes directly to on-the-ground restoration work.',
  evidence_of_impact = 'Satellite monitoring indicates that restored areas show a 22-35% increase in vegetation density within three years of intervention. Independent estimates suggest that each $50 donation results in approximately 1.8 tons of CO₂ sequestered over the projected lifespan of the new forest growth.',
  image_url = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800'
WHERE name = 'Releaf the Planet';

UPDATE public.charities
SET 
  overview = 'Wells of Hope provides sustainable clean water access to underserved communities through well construction and water purification systems.',
  cost_effectiveness = 'Each well serves an average of 500 people and costs approximately $3,000 to build, providing clean water for 15-20 years.',
  evidence_of_impact = 'Communities with Wells of Hope installations report 60% reduction in waterborne illnesses and 40% increase in school attendance.',
  image_url = 'https://images.unsplash.com/photo-1594312915251-48db9280c8f1?w=800'
WHERE name = 'Wells of Hope';

UPDATE public.charities
SET 
  overview = 'Full Plate Project combats food insecurity through community food banks, meal programs, and agricultural education initiatives.',
  cost_effectiveness = 'Every $1 donated provides 4 nutritious meals to families in need, with 92% of funds going directly to food distribution.',
  evidence_of_impact = 'The program has served over 2 million meals and helped 15,000 families achieve food security through education programs.',
  image_url = 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800'
WHERE name = 'Full Plate Project';

UPDATE public.charities
SET 
  overview = 'Animal Ark Alliance protects endangered wildlife through habitat conservation, anti-poaching programs, and species rehabilitation.',
  cost_effectiveness = 'Conservation efforts protect over 50,000 acres of critical habitat at $12 per acre annually, providing safe haven for endangered species.',
  evidence_of_impact = 'Wildlife populations in protected areas have increased by 35% over 5 years, with successful rehabilitation of over 1,000 animals.',
  image_url = 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=800'
WHERE name = 'Animal Ark Alliance';

-- Create donations table
CREATE TABLE public.donations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  charity_id UUID NOT NULL REFERENCES public.charities ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('one-time', 'round-up')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS on donations
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Donations policies
CREATE POLICY "Users can view their own donations"
  ON public.donations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own donations"
  ON public.donations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create payment_methods table
CREATE TABLE public.payment_methods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  round_up_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS on payment_methods
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- Payment methods policies
CREATE POLICY "Users can view their own payment methods"
  ON public.payment_methods
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment methods"
  ON public.payment_methods
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment methods"
  ON public.payment_methods
  FOR UPDATE
  USING (auth.uid() = user_id);