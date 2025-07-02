import React, { useState, useRef, useEffect } from 'react';

const GameChatModal = ({ onClose, game }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'coach',
      text: game 
        ? `I've analyzed your game against ${game.opponent}. What would you like to discuss about this ${game.result.toLowerCase()}?`
        : "Hello! I'm here to help you improve your chess. What would you like to discuss?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const coachResponses = [
    "That's a great question! Let me analyze that position for you.",
    "Based on your game, I noticed you had some tactical opportunities you missed. Let's work on pattern recognition.",
    "Your opening was solid, but in the middlegame, piece coordination could be improved.",
    "Time management seems to be affecting your decisions. Try to allocate your time more efficiently in critical positions.",
    "I recommend studying this endgame type more. It appears frequently at your level.",
    "Your tactical vision is improving! Keep practicing those puzzle themes we discussed."
  ];

  const quickSuggestions = [
    "How can I improve my opening play?",
    "What tactical patterns should I study?",
    "How do I manage time better?",
    "Analyze my biggest mistake",
    "What endgames should I learn?",
    "How to improve calculation?"
  ];

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newUserMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      setIsTyping(false);
      const randomResponse = coachResponses[Math.floor(Math.random() * coachResponses.length)];
      const coachMessage = {
        id: messages.length + 2,
        sender: 'coach',
        text: randomResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, coachMessage]);
    }, 1500);
  };

  const handleQuickSuggestion = (suggestion) => {
    setInputMessage(suggestion);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#121621] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#374162]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-blue-600 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Chat with AI Coach</h2>
              <p className="text-[#97a1c4] text-sm">
                {game ? `Discussing game vs ${game.opponent}` : 'General chess coaching'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-[#97a1c4] hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Game Info (if discussing specific game) */}
        {game && (
          <div className="p-4 bg-[#272e45] border-b border-[#374162]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">{game.opponent}</p>
                <p className="text-[#97a1c4] text-sm">
                  {game.result} • {game.date} • {game.timeControl}
                </p>
              </div>
              <div className="text-right">
                <p className="text-white font-medium">{game.rating}</p>
                <p className="text-[#97a1c4] text-sm">Your Rating</p>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 p-6 overflow-y-auto min-h-0">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-blue-800 text-white'
                      : 'bg-[#374162] text-white'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-blue-200' : 'text-[#97a1c4]'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-[#374162] text-white px-4 py-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-[#97a1c4] rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-[#97a1c4] rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-[#97a1c4] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Quick Suggestions */}
        <div className="px-6 py-3 border-t border-[#374162]">
          <p className="text-[#97a1c4] text-sm mb-2">Quick questions:</p>
          <div className="flex flex-wrap gap-2">
            {quickSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleQuickSuggestion(suggestion)}
                className="bg-[#374162] hover:bg-[#455173] text-white text-xs px-3 py-1 rounded-full transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-6 border-t border-[#374162]">
          <div className="flex gap-3">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about chess or your games..."
              className="flex-1 bg-[#272e45] text-white placeholder-[#97a1c4] rounded-lg px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-800"
              rows={2}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              className="bg-blue-800 hover:bg-blue-700 disabled:bg-[#374162] disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameChatModal;
