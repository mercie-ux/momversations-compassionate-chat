import express, { json } from 'express';
import { createClient } from '@supabase/supabase-js';
import { Configuration, OpenAIApi } from 'openai';
require('dotenv').config();

const app = express();
app.use(json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
);

app.get('/api/messages/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/messages', async (req, res) => {
  const { sessionId, content } = req.body;

  if (!sessionId || !content) {
    return res.status(400).json({ error: 'Missing sessionId or content' });
  }

  try {
    // Save user message
    const { data: userMessage, error: userError } = await supabase
      .from('messages')
      .insert([
        {
          session_id: sessionId,
          content,
          is_user: true,
        },
      ])
      .select()
      .single();

    if (userError) throw userError;

    // Generate bot response using Open AI
    const prompt = `
      You are a compassionate AI assistant for moms, providing empathetic and supportive responses.
      Focus on emotional support, validation, and practical advice for motherhood challenges.
      Respond to the following message in a warm, understanding tone, as if speaking to a close friend.
      User message: "${content}"
    `;

    const response = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content },
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    const botResponse = response.data.choices[0].message.content;

    // Save bot response
    const { data: botMessage, error: botError } = await supabase
      .from('messages')
      .insert([
        {
          session_id: sessionId,
          content: botResponse,
          is_user: false,
        },
      ])
      .select()
      .single();

    if (botError) throw botError;

    res.json({ userMessage, botMessage });
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});