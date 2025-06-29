import React, { useState, useRef, useEffect } from 'react';
import { Send, Heart, Baby, Coffee, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useMessages } from '@/hooks/useMessages';

interface LocalMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const Index = () => {
  // Generate a session ID that persists for this browser session
  const [sessionId] = useState(() => {
    const stored = sessionStorage.getItem('momversation-session-id');
    if (stored) return stored;
    const newId = crypto.randomUUID();
    sessionStorage.setItem('momversation-session-id', newId);
    return newId;
  });

  const { messages: dbMessages, addMessage, isLoading } = useMessages(sessionId);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Convert database messages to local format for display
  const messages: LocalMessage[] = dbMessages.map(msg => ({
    id: msg.id,
    text: msg.content,
    isUser: msg.is_user,
    timestamp: new Date(msg.created_at)
  }));

  const quickTopics = [
    { icon: Baby, text: "New mom anxiety", color: "bg-pink-100 hover:bg-pink-200 text-pink-700" },
    { icon: Moon, text: "Sleep struggles", color: "bg-purple-100 hover:bg-purple-200 text-purple-700" },
    { icon: Heart, text: "Emotional support", color: "bg-rose-100 hover:bg-rose-200 text-rose-700" },
    { icon: Coffee, text: "Self-care tips", color: "bg-amber-100 hover:bg-amber-200 text-amber-700" }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add welcome message if no messages exist and not loading
  useEffect(() => {
    if (!isLoading && messages.length === 0) {
      const welcomeMessage = "Hello beautiful mama! 💕 I'm here to support you through your motherhood journey. Whether you're expecting, a new mom, or navigating the ups and downs of raising little ones, I'm here to listen and help. What's on your heart today?";
      addMessage(welcomeMessage, false);
    }
  }, [isLoading, messages.length, addMessage]);

  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('anxiety') || lowerMessage.includes('anxious') || lowerMessage.includes('worried')) {
      return "I hear you, mama. Anxiety is so common in motherhood - you're not alone in feeling this way. It's completely normal to worry about doing things 'right.' Remember: there's no perfect mother, but there are a million ways to be a great one. Take deep breaths, trust your instincts, and be gentle with yourself. What specific worries are weighing on you today? 💙";
    } else if (lowerMessage.includes('sleep') || lowerMessage.includes('tired') || lowerMessage.includes('exhausted')) {
      return "Oh sweet mama, sleep deprivation is one of the hardest parts of motherhood. Your exhaustion is valid, and it's okay to feel overwhelmed. Remember: this phase won't last forever, even though it feels endless right now. Try to rest when baby rests, accept help when offered, and know that 'good enough' parenting on little sleep is still wonderful parenting. You're doing better than you think! 🌙✨";
    } else if (lowerMessage.includes('support') || lowerMessage.includes('lonely') || lowerMessage.includes('alone')) {
      return "You're so brave for reaching out, and I want you to know that you're never truly alone in this journey. Motherhood can feel isolating, but there's a whole community of mamas who understand exactly what you're going through. Your feelings are valid, your struggles are real, and your strength is incredible. I'm here to listen whenever you need. What's been the hardest part lately? 💕";
    } else if (lowerMessage.includes('self-care') || lowerMessage.includes('me time') || lowerMessage.includes('overwhelmed')) {
      return "Self-care isn't selfish, mama - it's essential! Even 5-10 minutes can make a difference. Try: a warm cup of tea while it's still hot, a few deep breaths on the porch, a quick face mask during naptime, or even just sitting in your car for a moment of quiet. You deserve care and kindness, especially from yourself. What small thing could you do for yourself today? ☕💆‍♀️";
    } else if (lowerMessage.includes('preparing') || lowerMessage.includes('expecting') || lowerMessage.includes('pregnant')) {
      return "What an exciting and sometimes overwhelming time! Preparing for motherhood is both magical and nerve-wracking. Trust that your body knows what to do, and your heart will guide you. Read what feels helpful, but don't feel pressured to have everything figured out. The most important thing is love - and you already have that in abundance. What aspects of becoming a mom feel most exciting or scary to you? 🤱💖";
    } else {
      return "Thank you for sharing with me, beautiful. Whatever you're going through, please know that your feelings are valid and you're doing better than you think. Motherhood is the hardest job in the world, and you're handling it with such grace. I'm here to listen and support you however I can. Tell me more about what's on your mind today. 💕";
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    // Add user message to database
    await addMessage(message, true);
    setInputMessage('');
    setIsTyping(true);

    // Simulate typing delay and add bot response
    setTimeout(async () => {
      const botResponse = getBotResponse(message);
      await addMessage(botResponse, false);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickTopic = (topic: string) => {
    handleSendMessage(topic);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputMessage);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading your conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Momversation
          </h1>
          <p className="text-gray-600 text-lg">
            Your supportive companion through motherhood 💕
          </p>
        </div>

        {/* Chat Container */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 mb-6">
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    message.isUser
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
                      : 'bg-gray-100 text-gray-800 border'
                  } transition-all duration-300 hover:scale-105`}
                >
                  <p className="text-sm leading-relaxed">{message.text}</p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-gray-100 px-4 py-3 rounded-2xl border max-w-xs">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </Card>

        {/* Quick Topics */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-3 text-center">Quick support topics:</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {quickTopics.map((topic) => (
              <Button
                key={topic.text}
                variant="outline"
                onClick={() => handleQuickTopic(topic.text)}
                className={`${topic.color} border-0 transition-all duration-300 hover:scale-105 hover:shadow-md`}
              >
                <topic.icon className="w-4 h-4 mr-2" />
                <span className="text-xs">{topic.text}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
          <form onSubmit={handleSubmit} className="p-4">
            <div className="flex space-x-3">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Share what's on your heart, mama..."
                className="flex-1 border-gray-200 focus:border-pink-400 focus:ring-pink-400 rounded-full px-4"
              />
              <Button
                type="submit"
                disabled={!inputMessage.trim() || isTyping}
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 rounded-full px-6 transition-all duration-300 hover:scale-105"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Index;
