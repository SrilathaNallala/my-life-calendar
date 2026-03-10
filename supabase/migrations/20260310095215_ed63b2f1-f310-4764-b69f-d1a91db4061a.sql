
-- Create memories table
CREATE TABLE public.memories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  text_entry TEXT,
  mood TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create media table
CREATE TABLE public.media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  memory_id UUID NOT NULL REFERENCES public.memories(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('photo', 'video', 'audio')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- RLS policies for memories
CREATE POLICY "Users can view own memories" ON public.memories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own memories" ON public.memories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own memories" ON public.memories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own memories" ON public.memories FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for media (through memory ownership)
CREATE POLICY "Users can view own media" ON public.media FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.memories WHERE memories.id = media.memory_id AND memories.user_id = auth.uid())
);
CREATE POLICY "Users can create media for own memories" ON public.media FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.memories WHERE memories.id = media.memory_id AND memories.user_id = auth.uid())
);
CREATE POLICY "Users can delete own media" ON public.media FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.memories WHERE memories.id = media.memory_id AND memories.user_id = auth.uid())
);

-- Indexes
CREATE INDEX idx_memories_user_date ON public.memories(user_id, date);
CREATE INDEX idx_media_memory ON public.media(memory_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_memories_updated_at
  BEFORE UPDATE ON public.memories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for media
INSERT INTO storage.buckets (id, name, public) VALUES ('memories-media', 'memories-media', true);

-- Storage policies
CREATE POLICY "Users can upload own media files" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'memories-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view media files" ON storage.objects FOR SELECT
  USING (bucket_id = 'memories-media');

CREATE POLICY "Users can delete own media files" ON storage.objects FOR DELETE
  USING (bucket_id = 'memories-media' AND auth.uid()::text = (storage.foldername(name))[1]);
