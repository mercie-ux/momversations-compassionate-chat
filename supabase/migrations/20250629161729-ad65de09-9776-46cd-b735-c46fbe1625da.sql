
-- Create a table to store chat messages
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  is_user BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) - for now we'll make it public since we don't have user auth
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policy that allows anyone to read messages (since no auth yet)
CREATE POLICY "Anyone can view messages" 
  ON public.messages 
  FOR SELECT 
  USING (true);

-- Create policy that allows anyone to insert messages (since no auth yet)
CREATE POLICY "Anyone can create messages" 
  ON public.messages 
  FOR INSERT 
  WITH CHECK (true);

-- Create an index for better performance when querying by session
CREATE INDEX idx_messages_session_id ON public.messages(session_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);
