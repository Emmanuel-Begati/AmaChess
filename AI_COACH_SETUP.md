# 🤖 AI Chess Coach - Groq LLaMA Setup Guide

## Quick Setup

To enable the AI Chess Coach powered by Groq LLaMA, you need to configure your Groq API key:

### Step 1: Get Your Groq API Key

1. 🌐 Visit [Groq Console](https://console.groq.com/keys)
2. 🔐 Sign in to your account (create one if needed)
3. ➕ Click "Create API Key"
4. 📋 Copy the key (starts with `gsk_...`)

### Step 2: Configure Your API Key

1. 📁 Open `amachess-backend/.env`
2. 🔍 Find the line: `GROQ_API_KEY=your-groq-api-key-here`
3. ✏️ Replace it with: `GROQ_API_KEY=gsk-your-actual-key-here`

### Step 3: Restart the Server

```bash
cd amachess-backend
npm run dev
```

## ✅ Verification

After starting the server, you should see:
```
✅ Groq Configuration Ready!
🤖 AI Chess Coach: Groq LLaMA Enabled
```

If you see warnings about API key configuration, double-check your setup.

## 🎯 Features Enabled

Once configured, your AI Chess Coach will provide:

- **🎯 Real-time Move Analysis**: Get instant feedback on your moves
- **💡 Strategic Hints**: Receive guided hints without spoiling the solution  
- **📚 Educational Commentary**: Learn chess principles as you play
- **🎭 Personalized Coaching**: Coach B's coaching style
- **⚡ Groq LLaMA Power**: Fast inference with LLaMA 3.3 70B model

## 💰 API Costs

- **Typical Usage**: $0.001-0.01 per training session
- **Model**: LLaMA 3.3 70B Versatile (fast and capable)
- **Optimization**: Smart prompting to minimize tokens

## 🔧 Troubleshooting

### ❌ "API key not configured"
- Check your `.env` file has the correct API key
- Ensure no extra spaces around the key
- Restart the server after changes

### ❌ "Invalid API key format"  
- API key should start with `gsk_`
- Should be 20+ characters long
- Copy the full key from Groq Console

### ❌ "Rate limit exceeded"
- You've hit Groq's usage limits
- Check your [usage dashboard](https://console.groq.com/settings/billing)
- Upgrade your plan or wait for limits to reset

### ❌ "Insufficient credits"
- Add billing information to your Groq account
- Purchase credits at [Groq Console](https://console.groq.com/settings/billing)

## 🎮 Using the AI Coach

1. 🎯 Open the **AI Coach Modal** in AmaChess
2. 🎲 Select your skill level (1-10)  
3. ▶️ Click "Start Training Game"
4. 🏃‍♂️ Make moves and receive real-time coaching
5. 💡 Use the "Hint" button when stuck

Enjoy your personalized chess training with GPT-4o! 🚀
