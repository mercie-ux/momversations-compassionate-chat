
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

type Message = Tables<'messages'>;
type NewMessage = TablesInsert<'messages'>;

export const useMessages = (sessionId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load messages for the current session
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error loading messages:', error);
          return;
        }

        setMessages(data || []);
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [sessionId]);

  const addMessage = async (content: string, isUser: boolean = false) => {
    try {
      const newMessage: NewMessage = {
        session_id: sessionId,
        content,
        is_user: isUser,
      };

      const { data, error } = await supabase
        .from('messages')
        .insert([newMessage])
        .select()
        .single();

      if (error) {
        console.error('Error saving message:', error);
        return null;
      }

      setMessages(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Error saving message:', error);
      return null;
    }
  };

  return {
    messages,
    addMessage,
    isLoading,
  };
};
