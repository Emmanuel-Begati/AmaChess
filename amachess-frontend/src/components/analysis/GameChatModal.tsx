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

  const API_BASE_URL = 'http://localhost:3001/api';

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
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-start sm:items-center justify-center z-50 p-2 sm:p-4 pt-4 sm:pt-4">
      <div className="bg-[#272e45] rounded-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#374162] flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-white truncate">Game Discussion • Groq LLaMA</h2>
              <p className="text-xs sm:text-sm text-[#97a1c4] truncate">
                {game ? `${game.result} vs ${game.opponent}` : 'Chat with Magnus about your game'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-[#97a1c4] hover:text-white transition-colors p-2 hover:bg-[#374162] rounded-lg flex-shrink-0"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Game Info */}
        {game && (
          <div className="bg-[#374162] p-3 sm:p-4 border-b border-[#455173] flex-shrink-0">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm">
              <div>
                <span className="text-[#97a1c4]">Result:</span>
                <span className="text-white ml-1 sm:ml-2">{game.result}</span>
              </div>
              <div>
                <span className="text-[#97a1c4]">Date:</span>
                <span className="text-white ml-1 sm:ml-2">{game.date}</span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-[#97a1c4]">Time:</span>
                <span className="text-white ml-1 sm:ml-2">{game.timeControl}</span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-[#97a1c4]">Rating:</span>
                <span className="text-white ml-1 sm:ml-2">{game.rating}</span>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] sm:max-w-[80%] rounded-lg p-3 sm:p-4 ${
                msg.sender === 'user' 
                  ? 'bg-blue-800 text-white' 
                  : 'bg-[#374162] text-white'
              }`}>
                <p className="text-sm sm:text-base leading-relaxed">{msg.text}</p>
                <p className={`text-xs mt-2 ${
                  msg.sender === 'user' ? 'text-blue-200' : 'text-[#97a1c4]'
                }`}>
                  {msg.timestamp}
                </p>
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[#374162] text-white rounded-lg p-3 sm:p-4 max-w-[85%] sm:max-w-[80%]">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-[#97a1c4] rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-[#97a1c4] rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-[#97a1c4] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <p className="text-[#97a1c4] text-sm">Magnus is analyzing...</p>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-[#374162] p-4 sm:p-6 flex-shrink-0">
          <div className="flex gap-2 sm:gap-3">
            <div className="flex-1 relative">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about this game..."
                className="w-full bg-[#374162] text-white rounded-lg px-3 sm:px-4 py-2 sm:py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base placeholder-[#97a1c4]"
                rows={2}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!message.trim() || isLoading}
              className="px-3 sm:px-4 py-2 sm:py-3 bg-blue-800 hover:bg-blue-700 disabled:bg-[#374162] disabled:text-[#97a1c4] text-white rounded-lg transition-colors flex items-center justify-center flex-shrink-0"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
              ) : (
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
          
          {/* Quick Questions */}
          <div className="mt-3 sm:mt-4 flex flex-wrap gap-2">
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
                className="text-xs sm:text-sm bg-[#374162] hover:bg-[#455173] disabled:opacity-50 text-[#97a1c4] hover:text-white px-2 sm:px-3 py-1 sm:py-2 rounded-full transition-colors"
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
