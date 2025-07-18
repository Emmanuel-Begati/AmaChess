import React from 'react';

const TestPage = () => {
  console.log('TestPage rendering...');
  
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Test Page</h1>
        
        <div className="grid gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Basic Functionality Test</h2>
            <p className="text-gray-600">
              If you can see this page, React is working correctly.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Navigation Links</h2>
            <div className="space-y-2">
              <a href="/" className="block text-blue-600 hover:underline">Home</a>
              <a href="/chess" className="block text-blue-600 hover:underline">Chess Game</a>
              <a href="/test" className="block text-blue-600 hover:underline">ChessBoard Test</a>
              <a href="/minimal" className="block text-blue-600 hover:underline">Minimal Chess Test</a>
              <a href="/drop" className="block text-blue-600 hover:underline">Simple Drop Test</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
