import React, { useState, useRef, useEffect } from 'react';

const BookChatModal = ({ onClose, book, currentChapter, currentPage, selectedText }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'coach',
      text: selectedText 
        ? `I see you've selected "${selectedText}" from ${book?.title}. What would you like me to explain about this concept?`
        : `I'm here to help you understand ${book?.title}. What questions do you have about Chapter ${currentChapter + 1}, Page ${currentPage + 1}?`,
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

  const bookCoachResponses = [
    "That's an excellent question about this chess concept! Let me break it down for you.",
    "This principle is fundamental to improving your chess understanding. Here's a simpler way to think about it...",
    "Based on the position shown in this chapter, the key idea is to understand the relationship between pieces.",
    "This concept builds on what we learned in the previous chapter. The connection is...",
    "Let me explain this with a practical example that you might encounter in your games.",
    "This is a common pattern that appears frequently in chess. The important thing to remember is...",
    "The author emphasizes this point because it's often misunderstood by players at your level.",
    "Think of this concept as a tool in your chess toolkit. You would use it when..."
  ];

  const bookQuickSuggestions = [
    "Explain this in simpler terms",
    "How does this apply to my games?",
    "What are the key takeaways?",
    "Show me a practical example",
    "Why is this concept important?",
    "Connect this to previous chapters",
    "What should I practice next?",
    "Common mistakes to avoid?"
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

    // Simulate AI response with book context
    setTimeout(() => {
      setIsTyping(false);
      const randomResponse = bookCoachResponses[Math.floor(Math.random() * bookCoachResponses.length)];
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
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Book Study Assistant</h2>
              <p className="text-[#97a1c4] text-sm">
                Studying: {book?.title} • Chapter {currentChapter + 1}, Page {currentPage + 1}
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

        {/* Selected Text Context */}
        {selectedText && (
          <div className="p-4 bg-[#272e45] border-b border-[#374162]">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-800 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1.586l-4 4z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-[#97a1c4] text-sm mb-1">Selected text for discussion:</p>
                <p className="text-white bg-[#374162] rounded-lg p-3 text-sm italic">
                  "{selectedText}"
                </p>
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
            {bookQuickSuggestions.map((suggestion, index) => (
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
              placeholder="Ask me about this chapter, position, or chess concept..."
              className="flex-1 bg-[#272e45] text-white placeholder-[#97a1c4] rounded-lg px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-purple-800"
              rows={2}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              className="bg-purple-800 hover:bg-purple-700 disabled:bg-[#374162] disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-colors"
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

export default BookChatModal;
