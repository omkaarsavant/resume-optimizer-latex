# LaTeX Editor AI: Resume Tailor 🚀

An AI-powered LaTeX resume tailoring tool that optimizes your professional documents for specific job descriptions. 

![Project Banner](client/src/assets/banner.png) <!-- Ensure you have a banner or update this link -->

## ✨ Features

- **AI Resume Tailoring**: Automatically adjust your LaTeX resume to match specific job descriptions using Google Gemini Pro.
- **Interactive Refinement**: Use the "Continue" flow to request specific modifications (e.g., "Make my summary more impactful" or "Expand on my React experience").
- **Live LaTeX Editor**: Professional editing experience powered by Monaco Editor (the heart of VS Code).
- **One-Page Optimization**: Built-in rules to ensure your tailored resume stays within professional length constraints.
- **Vercel Ready**: Full-stack architecture designed to run on Vercel with serverless functions.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Shadcn UI, Lucide Icons.
- **Backend**: Node.js, Express, tRPC.
- **AI**: Google Generative AI (Gemini 1.5 Pro / 2.0 / 3.1 Flash-Lite).
- **Editor**: Monaco Editor.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm or pnpm
- A Gemini API Key from [Google AI Studio](https://aistudio.google.com)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/latex-editor-ai.git
   cd latex-editor-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup environment variables:
   ```bash
   npm run setup
   ```
   Open `.env.local` and add your `GEMINI_API_KEY`.

### Running Locally

Run both the frontend and backend simultaneously:

```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
npm run backend:dev
```

The app will be available at `http://localhost:3000`.

## 🌐 Deployment (Vercel)

This project is configured for one-click deployment to Vercel.

1. Push your code to GitHub.
2. Connect the repository to Vercel.
3. Add `GEMINI_API_KEY` to your Vercel Environment Variables.
4. Deployment settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/public`
5. Deploy!

## 📜 License

MIT License. Feel free to use and modify for your own job search!
