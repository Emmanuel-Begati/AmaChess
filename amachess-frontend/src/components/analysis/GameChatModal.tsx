import { useState, useRef, useEffect } from 'react';

interface GameChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  game?: any;
}

const GameChatModal = ({ isOpen, onClose, game }: GameChatModalProps) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: `I'd be happy to discuss your game! ${game ? `I see you played against ${game.opponent} with a ${game.result}.` : ''} What would you like to know?`,
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!isOpen) return null;

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const newMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: message,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages([...messages, newMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      // Use the existing coach/game-chat endpoint with Groq
      const response = await fetch(`${API_BASE_URL}/coach/game-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameData: game,
          userMessage: message,
          conversationHistory: messages.slice(1) // Exclude the initial AI message
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiResponse = {
          id: messages.length + 2,
          sender: 'ai',
          text: data.response.text,
          timestamp: new Date().toLocaleTimeString()
        };
        setMessages(prev => [...prev, aiResponse]);
      } else {
        // Fallback response
        const aiResponse = {
          id: messages.length + 2,
          sender: 'ai',
          text: "I'm having trouble connecting right now, but I'd love to help analyze your game. Could you try rephrasing your question?",
          timestamp: new Date().toLocaleTimeString()
        };
        setMessages(prev => [...prev, aiResponse]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Fallback response
      const aiResponse = {
        id: messages.length + 2,
        sender: 'ai',
        text: "I'm experiencing some connection issues. Let me try to help anyway - what specific aspect of your game would you like to discuss?",
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, aiResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-start sm:items-center justify-center z-50 p-2 sm:p-4 pt-4 sm:pt-4">
      <div className="bg-gradient-to-br from-[#0d1220] to-[#131a2e] rounded-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col border border-slate-700/50 shadow-2xl shadow-black/40">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-700/40 bg-slate-800/20 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative">
              <div className="w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0d1220]"></div>
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-white truncate">Chat with Coach B</h2>
              <p className="text-xs text-gray-400 truncate">
                {game ? `${game.result} vs ${game.opponent}` : 'Ask anything about chess'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-white hover:bg-slate-700/60 transition-all duration-200 p-1.5 rounded-lg flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Game Info */}
        {game && (
          <div className="bg-slate-800/30 p-3 sm:p-4 border-b border-slate-700/30 flex-shrink-0">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
              <div className="flex items-center gap-1.5">
                <span className="text-gray-500 text-xs">Result</span>
                <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
                  game.result === 'win' ? 'bg-emerald-500/20 text-emerald-400' :
                  game.result === 'loss' ? 'bg-red-500/20 text-red-400' :
                  'bg-amber-500/20 text-amber-400'
                }`}>{game.result}</span>
              </div>
              <div>
                <span className="text-gray-500 text-xs">Date </span>
                <span className="text-gray-300 text-xs">{game.date}</span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-gray-500 text-xs">Time </span>
                <span className="text-gray-300 text-xs">{game.timeControl}</span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-gray-500 text-xs">Rating </span>
                <span className="text-gray-300 text-xs font-medium">{game.rating}</span>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 sm:space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
              {msg.sender === 'ai' && (
                <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-white text-[10px] font-bold">B</span>
                </div>
              )}
              <div className={`max-w-[85%] sm:max-w-[80%] p-3 sm:p-3.5 ${
                msg.sender === 'user' 
                  ? 'bg-gradient-to-r from-[#115fd4] to-[#4a90e2] rounded-xl rounded-tr-sm text-white shadow-md shadow-blue-500/10' 
                  : 'bg-slate-800/60 rounded-xl rounded-tl-sm text-gray-200 border border-slate-700/30'
              }`}>
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <p className={`text-[10px] mt-1.5 ${
                  msg.sender === 'user' ? 'text-blue-200/70' : 'text-gray-500'
                }`}>
                  {msg.timestamp}
                </p>
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex justify-start gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-white text-[10px] font-bold">B</span>
              </div>
              <div className="bg-slate-800/60 rounded-xl rounded-tl-sm p-3 border border-slate-700/30">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <p className="text-gray-400 text-xs">Coach B is thinking...</p>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-slate-700/40 p-3 sm:p-4 flex-shrink-0 bg-slate-800/20">
          <div className="flex gap-2 sm:gap-3">
            <div className="flex-1 relative">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about this game..."
                className="w-full bg-slate-900/60 text-white rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 border border-slate-700/40 focus:border-purple-500/50 text-sm placeholder-gray-500 transition-all"
                rows={2}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!message.trim() || isLoading}
              className="px-3 sm:px-4 self-end py-2.5 sm:py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 flex items-center justify-center flex-shrink-0 shadow-md shadow-purple-500/20 disabled:shadow-none"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white/30 border-t-white"></div>
              ) : (
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
          
          {/* Quick Questions */}
          <div className="mt-2.5 sm:mt-3 flex flex-wrap gap-1.5 sm:gap-2">
            {['Analyze opening', 'Find my mistakes', 'Suggest improvements', 'Explain this position'].map((suggestion) => (
              <button
                key={suggestion}
                onClick={async () => {
                  if (isLoading) return;
                  setMessage(suggestion);
                  
                  // Auto-send the suggestion
                  const userMessage = {
                    id: messages.length + 1,
                    sender: 'user',
                    text: suggestion,
                    timestamp: new Date().toLocaleTimeString()
                  };

                  setMessages(prev => [...prev, userMessage]);
                  setMessage('');
                  setIsLoading(true);

                  try {
                    const response = await fetch(`${API_BASE_URL}/coach/game-chat`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        gameData: game,
                        userMessage: suggestion,
                        conversationHistory: messages.slice(1)
                      }),
                    });

                    if (response.ok) {
                      const data = await response.json();
                      const aiResponse = {
                        id: messages.length + 2,
                        sender: 'ai',
                        text: data.response.text,
                        timestamp: new Date().toLocaleTimeString()
                      };
                      setMessages(prev => [...prev, aiResponse]);
                    } else {
                      const aiResponse = {
                        id: messages.length + 2,
                        sender: 'ai',
                        text: "I'm having trouble connecting right now, but I'd love to help analyze your game. Could you try rephrasing your question?",
                        timestamp: new Date().toLocaleTimeString()
                      };
                      setMessages(prev => [...prev, aiResponse]);
                    }
                  } catch (error) {
                    console.error('Error sending quick suggestion:', error);
                    const aiResponse = {
                      id: messages.length + 2,
                      sender: 'ai',
                      text: "I'm experiencing some connection issues. Let me try to help anyway - what specific aspect of your game would you like to discuss?",
                      timestamp: new Date().toLocaleTimeString()
                    };
                    setMessages(prev => [...prev, aiResponse]);
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={isLoading}
                className="text-xs bg-slate-800/60 hover:bg-purple-500/20 hover:text-purple-300 hover:border-purple-500/30 disabled:opacity-50 text-gray-400 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-700/30 transition-all duration-200"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameChatModal;
