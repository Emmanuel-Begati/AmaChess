/**
 * Groq Configuration Helper
 * Provides clear instructions and validation for Groq API setup
 */

const checkGroqConfiguration = () => {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    console.error(`
❌ Groq API Key Missing!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

To enable the AI Chess Coach with Groq, please follow these steps:

1. 🔑 Get your Groq API key:
   → Visit: https://console.groq.com/keys
   → Create a new API key
   → Copy the key (starts with gsk_...)

2. ⚙️ Add it to your .env file:
   → Open: amachess-backend/.env  
   → Replace: GROQ_API_KEY=your-groq-api-key-here
   → With: GROQ_API_KEY=gsk-your-actual-key-here

3. 💰 Ensure you have API credits:
   → Check: https://console.groq.com/settings/billing
   → Add billing if needed

4. 🔄 Restart the server:
   → npm run dev

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The AI Coach will use fallback responses until configured.
`);
    return false;
  }
  
  if (apiKey === 'your-groq-api-key-here') {
    console.warn(`
⚠️ Groq API Key Not Configured!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Please replace the placeholder with your actual Groq API key:

📝 Edit file: amachess-backend/.env
🔄 Change: GROQ_API_KEY=your-groq-api-key-here  
✅ To: GROQ_API_KEY=gsk-your-actual-key-here

Get your API key: https://console.groq.com/keys

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The AI Coach will use fallback responses until configured.
`);
    return false;
  }
  
  if (!apiKey.startsWith('gsk_') || apiKey.length < 20) {
    console.error(`
❌ Invalid Groq API Key Format!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The API key should:
✅ Start with 'gsk_'
✅ Be much longer (50+ characters)

Current key: ${apiKey.substring(0, 10)}...

Please double-check your API key from:
https://console.groq.com/keys

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
    return false;
  }
  
  console.log(`
✅ Groq Configuration Ready!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🤖 AI Chess Coach: Groq LLaMA 3.3 Enabled
🎯 Features Available:
   • Real-time move analysis
   • Personalized coaching tips  
   • Strategic hints and guidance
   • Interactive chess training

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
  return true;
};

const getGroqStatus = () => {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey || apiKey === 'your-groq-api-key-here') {
    return {
      configured: false,
      status: 'not_configured',
      message: 'Groq API key not set. AI Coach will use fallback responses.'
    };
  }
  
  if (!apiKey.startsWith('gsk_') || apiKey.length < 20) {
    return {
      configured: false,
      status: 'invalid_key',
      message: 'Invalid Groq API key format. Please check your configuration.'
    };
  }
  
  return {
    configured: true,
    status: 'ready',
    message: 'Groq LLaMA AI Chess Coach ready!',
    model: 'llama-3.3-70b-versatile'
  };
};

module.exports = {
  checkGroqConfiguration,
  getGroqStatus
};
