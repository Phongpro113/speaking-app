# Speaking App

A simple English speaking practice app that uses speech recognition in the browser and an AI backend to correct grammar, give feedback, and ask follow-up questions.

## Features

- Speak with your microphone in the browser
- Get grammar correction and short feedback
- Ask follow-up questions to continue the conversation
- Replay pronunciation with the 🔊 button
- Keep conversation history during the session

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- AI: OpenAI or Google Gemini

## Project Structure

- `index.html` - frontend UI
- `server.js` - OpenAI backend
- `server-gemini.js` - Gemini backend
- `package.json` - scripts and dependencies

## Prerequisites

- Node.js 18 or newer
- npm
- A browser that supports Speech Recognition, such as Google Chrome
- An API key for either OpenAI or Gemini

## Setup After Cloning

### 1. Install dependencies

```bash
npm install
```

### 2. Create environment file

Create a `.env` file in the project root.

For OpenAI:

```env
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
```

For Gemini:

```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODELS=gemini-flash-latest
PORT=3000
```

You only need to set the variables for the backend you want to run.

### 3. Start the backend

OpenAI backend:

```bash
npm start
```

Gemini backend:

```bash
npm run start:gemini
```

### 4. Open the app

Open your browser and go to:

```text
http://localhost:3000
```

## Development Scripts

- `npm start` - run OpenAI server
- `npm run dev` - run OpenAI server with watch mode
- `npm run start:gemini` - run Gemini server
- `npm run dev:gemini` - run Gemini server with watch mode

## Notes

- Allow microphone permission when the browser asks for it.
- If Speech Recognition is unavailable, use Chrome.
- If Gemini returns a model error, check `GEMINI_MODELS` and your Google AI quota/billing.
- If the API key is missing, the server will still start, but chat requests will fail until the key is set.

## Troubleshooting

### Cannot GET /

Make sure you are running the correct server and that `index.html` is in the project root.

### Mic does not work

- Use Chrome
- Check browser microphone permissions
- Make sure your device has a working microphone

### AI request fails

- Verify the correct API key in `.env`
- Confirm billing/quota for the selected AI provider
- Check the terminal for error messages

## License

MIT
