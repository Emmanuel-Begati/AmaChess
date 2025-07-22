# 🤖 AI Chess Coach - GPT-4o Setup Guide

## Quick Setup

To enable the AI Chess Coach powered by GPT-4o, you need to configure your OpenAI API key:

### Step 1: Get Your OpenAI API Key

1. 🌐 Visit [OpenAI Platform](https://platform.openai.com/account/api-keys)
2. 🔐 Sign in to your account (create one if needed)
3. ➕ Click "Create new secret key"
4. 📋 Copy the key (starts with `sk-...`)

### Step 2: Configure Your API Key

1. 📁 Open `amachess-backend/.env`
2. 🔍 Find the line: `OPENAI_API_KEY=your-openai-api-key-here`
3. ✏️ Replace it with: `OPENAI_API_KEY=sk-your-actual-key-here`

### Step 3: Restart the Server

```bash
cd amachess-backend
npm run dev
```

## ✅ Verification

After starting the server, you should see:
```
✅ OpenAI Configuration Ready!
🤖 AI Chess Coach: GPT-4o Enabled
```

If you see warnings about API key configuration, double-check your setup.

## 🎯 Features Enabled

Once configured, your AI Chess Coach will provide:

- **🎯 Real-time Move Analysis**: Get instant feedback on your moves
- **💡 Strategic Hints**: Receive guided hints without spoiling the solution  
- **📚 Educational Commentary**: Learn chess principles as you play
- **🎭 Personalized Coaching**: Magnus Carlsen's coaching style
- **⚡ GPT-4o Power**: Latest AI model for advanced chess understanding

## 💰 API Costs

- **Typical Usage**: $0.01-0.05 per training session
- **Model**: GPT-4o (latest and most capable)
- **Optimization**: Smart prompting to minimize tokens

## 🔧 Troubleshooting

### ❌ "API key not configured"
- Check your `.env` file has the correct API key
- Ensure no extra spaces around the key
- Restart the server after changes

### ❌ "Invalid API key format"  
- API key should start with `sk-`
- Should be 50+ characters long
- Copy the full key from OpenAI platform

### ❌ "Rate limit exceeded"
- You've hit OpenAI's usage limits
- Check your [usage dashboard](https://platform.openai.com/account/usage)
- Upgrade your plan or wait for limits to reset

### ❌ "Insufficient credits"
- Add billing information to your OpenAI account
- Purchase credits at [OpenAI Platform](https://platform.openai.com/account/billing)

## 🎮 Using the AI Coach

1. 🎯 Open the **AI Coach Modal** in AmaChess
2. 🎲 Select your skill level (1-10)  
3. ▶️ Click "Start Training Game"
4. 🏃‍♂️ Make moves and receive real-time coaching
5. 💡 Use the "Hint" button when stuck

Enjoy your personalized chess training with GPT-4o! 🚀
