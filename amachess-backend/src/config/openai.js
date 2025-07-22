/**
 * OpenAI Configuration Helper
 * Provides clear instructions and validation for OpenAI API setup
 */

const checkOpenAIConfiguration = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error(`
❌ OpenAI API Key Missing!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

To enable the AI Chess Coach with GPT-4o, please follow these steps:

1. 🔑 Get your OpenAI API key:
   → Visit: https://platform.openai.com/account/api-keys
   → Create a new API key
   → Copy the key (starts with sk-...)

2. ⚙️ Add it to your .env file:
   → Open: amachess-backend/.env  
   → Replace: OPENAI_API_KEY=your-openai-api-key-here
   → With: OPENAI_API_KEY=sk-your-actual-key-here

3. 💰 Ensure you have API credits:
   → Check: https://platform.openai.com/account/usage
   → Add billing if needed

4. 🔄 Restart the server:
   → npm run dev

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The AI Coach will use fallback responses until configured.
`);
    return false;
  }
  
  if (apiKey === 'your-openai-api-key-here') {
    console.warn(`
⚠️ OpenAI API Key Not Configured!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Please replace the placeholder with your actual OpenAI API key:

📝 Edit file: amachess-backend/.env
🔄 Change: OPENAI_API_KEY=your-openai-api-key-here  
✅ To: OPENAI_API_KEY=sk-your-actual-key-here

Get your API key: https://platform.openai.com/account/api-keys

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The AI Coach will use fallback responses until configured.
`);
    return false;
  }
  
  if (!apiKey.startsWith('sk-') || apiKey.length < 20) {
    console.error(`
❌ Invalid OpenAI API Key Format!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The API key should:
✅ Start with 'sk-'
✅ Be much longer (50+ characters)

Current key: ${apiKey.substring(0, 10)}...

Please double-check your API key from:
https://platform.openai.com/account/api-keys

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
    return false;
  }
  
  console.log(`
✅ OpenAI Configuration Ready!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🤖 AI Chess Coach: GPT-4o Enabled
🎯 Features Available:
   • Real-time move analysis
   • Personalized coaching tips  
   • Strategic hints and guidance
   • Interactive chess training

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
  return true;
};

const getOpenAIStatus = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey || apiKey === 'your-openai-api-key-here') {
    return {
      configured: false,
      status: 'not_configured',
      message: 'OpenAI API key not set. AI Coach will use fallback responses.'
    };
  }
  
  if (!apiKey.startsWith('sk-') || apiKey.length < 20) {
    return {
      configured: false,
      status: 'invalid_key',
      message: 'Invalid OpenAI API key format. Please check your configuration.'
    };
  }
  
  return {
    configured: true,
    status: 'ready',
    message: 'GPT-4o AI Chess Coach ready!',
    model: 'gpt-4o'
  };
};

module.exports = {
  checkOpenAIConfiguration,
  getOpenAIStatus
};
