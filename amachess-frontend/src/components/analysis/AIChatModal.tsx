import React, { useState, useRef, useEffect } from 'react';
import { ChatSession, ChatMessage, StoredGame, ChatRequest } from '../../types';

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  game?: StoredGame | null;
  sessionId?: string;
}

const AIChatModal: React.FC<AIChatModalProps> = ({ isOpen, onClose, game, sessionId }) => {
  const [message, setMessage] = useState('');
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userGames, setUserGames] = useState<StoredGame[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const API_BASE_URL = 'http://localhost:3001/api';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load user's games and session when modal opens
  useEffect(() => {
    if (isOpen) {
      loadUserGames();
      if (sessionId) {
        loadChatSession(sessionId);
      } else if (game) {
        createGameSession();
      } else {
        createGeneralSession();
      }
    }
  }, [isOpen, sessionId, game]);

  const loadUserGames = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/user-games/my-games`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserGames(data.games || []);
      }
    } catch (error) {
      console.error('Failed to load user games:', error);
    }
  };

  const loadChatSession = async (id: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/chat/sessions/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentSession(data.session);
        setMessages(data.session.messages || []);
      }
    } catch (error) {
      console.error('Failed to load chat session:', error);
      setError('Failed to load chat session');
    } finally {
      setLoading(false);
    }
  };

  const createGameSession = async () => {
    if (!game) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/chat/sessions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameId: game.id,
          sessionType: 'game_analysis',
          title: `Analysis: ${game.opponent ? `vs ${game.opponent}` : 'Training Game'}`,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentSession(data.session);
        setMessages([]);
        
        // Send initial AI message
        sendInitialGameMessage();
      }
    } catch (error) {
      console.error('Failed to create game session:', error);
      setError('Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  const createGeneralSession = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/chat/sessions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionType: 'general_improvement',
          title: 'Chess Improvement Chat',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentSession(data.session);
        setMessages([]);
        
        // Send initial AI message
        sendInitialGeneralMessage();
      }
    } catch (error) {
      console.error('Failed to create general session:', error);
      setError('Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  const sendInitialGameMessage = async () => {
    if (!currentSession || !game) return;

    const initialMessage = `Hello! I'm your AI chess coach. I can see you want to discuss your ${game.gameType === 'training' ? 'training' : ''} game ${game.opponent ? `against ${game.opponent}` : ''}. 

I have access to your complete game history (${userGames.length} games) and can provide insights about:
• Your playing style and patterns
• Common mistakes and improvements
• Opening repertoire analysis
• Tactical and strategic themes
• Performance trends over time

What would you like to explore about this game or your overall chess improvement?`;

    const aiMessage: ChatMessage = {
      id: Date.now().toString(),
      sessionId: currentSession.id,
      sender: 'ai',
      message: initialMessage,
      messageType: 'text',
      createdAt: new Date().toISOString(),
    };

    setMessages([aiMessage]);
  };

  const sendInitialGeneralMessage = async () => {
    if (!currentSession) return;

    const initialMessage = `Hello! I'm your AI chess coach. I have access to your complete game history (${userGames.length} games) and can help you improve your chess in many ways:

• **Game Analysis**: We can review any of your recent games
• **Pattern Recognition**: I can identify recurring themes in your play
• **Opening Study**: Analyze your opening repertoire and suggest improvements
• **Tactical Training**: Focus on tactical weaknesses I've observed
• **Strategic Planning**: Develop better strategic understanding
• **Performance Tracking**: Review your progress over time

What aspect of your chess would you like to work on today?`;

    const aiMessage: ChatMessage = {
      id: Date.now().toString(),
      sessionId: currentSession.id,
      sender: 'ai',
      message: initialMessage,
      messageType: 'text',
      createdAt: new Date().toISOString(),
    };

    setMessages([aiMessage]);
  };

  const sendMessage = async () => {
    if (!message.trim() || !currentSession) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sessionId: currentSession.id,
      sender: 'user',
      message: message.trim(),
      messageType: 'text',
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const chatRequest: ChatRequest = {
        message: userMessage.message,
        sessionId: currentSession.id,
        sessionType: currentSession.sessionType,
      };

      if (game?.id) {
        chatRequest.gameId = game.id;
      }

      const response = await fetch(`${API_BASE_URL}/chat/message`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chatRequest),
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sessionId: currentSession.id,
          sender: 'ai',
          message: data.response.message,
          messageType: data.response.messageType || 'text',
          metadata: data.response.metadata,
          createdAt: new Date().toISOString(),
        };

        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message. Please try again.');
      
      // Add fallback AI response
      const fallbackMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sessionId: currentSession.id,
        sender: 'ai',
        message: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
        messageType: 'text',
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getQuickSuggestions = () => {
    const general = [
      'Analyze my recent games',
      'What are my main weaknesses?',
      'Help me improve my opening repertoire',
      'Show me tactical patterns I should study'
    ];

    const gameSpecific = [
      'Analyze this game\'s opening',
      'Find my mistakes in this game',
      'What should I have played instead?',
      'Explain the key moments'
    ];

    return game ? gameSpecific : general;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-start sm:items-center justify-center z-50 p-2 sm:p-4 pt-4 sm:pt-4">
      <div className="bg-[#272e45] rounded-xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#374162] flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-white truncate">Coach B • Groq LLaMA</h2>
              <p className="text-xs sm:text-sm text-[#97a1c4] truncate">
                {game 
                  ? `Analyzing: ${game.opponent ? `vs ${game.opponent}` : 'Training Game'} • ${userGames.length} games accessible`
                  : `Chess Improvement Chat • ${userGames.length} games accessible`
                }
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

        {/* Game Info (if specific game) */}
        {game && (
          <div className="bg-[#374162] p-3 sm:p-4 border-b border-[#455173] flex-shrink-0">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm">
              <div>
                <span className="text-[#97a1c4]">Result:</span>
                <span className="text-white ml-1 sm:ml-2">{game.result || 'Ongoing'}</span>
              </div>
              <div>
                <span className="text-[#97a1c4]">Date:</span>
                <span className="text-white ml-1 sm:ml-2">{new Date(game.createdAt).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-[#97a1c4]">Moves:</span>
                <span className="text-white ml-1 sm:ml-2">{game.moveCount}</span>
              </div>
              <div>
                <span className="text-[#97a1c4]">Opening:</span>
                <span className="text-white ml-1 sm:ml-2">{game.opening || 'Unknown'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-600/20 border border-red-600/50 p-3 mx-4 mt-3 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
            <button 
              onClick={() => setError('')}
              className="text-red-300 hover:text-red-100 text-sm mt-1"
            >
              Dismiss
            </button>
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
                <div className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                  {msg.message}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className={`text-xs ${
                    msg.sender === 'user' ? 'text-blue-200' : 'text-[#97a1c4]'
                  }`}>
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </p>
                  {msg.sender === 'ai' && (
                    <p className="text-xs text-[#7c8db5] opacity-60">
                      ⚡ Groq LLaMA
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-[#374162] rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400"></div>
                  <p className="text-white text-sm">Coach B is thinking...</p>
                </div>
                <p className="text-xs text-[#97a1c4] mt-1">Powered by Groq LLaMA</p>
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
                placeholder="Ask about your games, request analysis, or get chess advice..."
                className="w-full bg-[#374162] text-white rounded-lg px-3 sm:px-4 py-2 sm:py-3 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base placeholder-[#97a1c4]"
                rows={2}
                disabled={loading}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!message.trim() || loading}
              className="px-3 sm:px-4 py-2 sm:py-3 bg-purple-800 hover:bg-purple-700 disabled:bg-[#374162] disabled:text-[#97a1c4] text-white rounded-lg transition-colors flex items-center justify-center flex-shrink-0"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          
          {/* Quick Suggestions */}
          <div className="mt-3 sm:mt-4 flex flex-wrap gap-2">
            {getQuickSuggestions().map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setMessage(suggestion)}
                disabled={loading}
                className="text-xs sm:text-sm bg-[#374162] hover:bg-[#455173] text-[#97a1c4] hover:text-white px-2 sm:px-3 py-1 sm:py-2 rounded-full transition-colors disabled:opacity-50"
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

export default AIChatModal;
