<div align="center">
  <br />
  <div>
    <img src="https://img.shields.io/badge/-Next.JS-black?style=for-the-badge&logoColor=white&logo=nextdotjs&color=black" alt="next.js" />
    <img src="https://img.shields.io/badge/-Deepgram-white?style=for-the-badge&color=3e4ef7" alt="deepgram" />
    <img src="https://img.shields.io/badge/-Tailwind_CSS-black?style=for-the-badge&logoColor=white&logo=tailwindcss&color=06B6D4" alt="tailwindcss" />
    <img src="https://img.shields.io/badge/-Firebase-black?style=for-the-badge&logoColor=white&logo=firebase&color=DD2C00" alt="firebase" />
    <img src="https://img.shields.io/badge/-Vercel%20AI%20SDK-black?style=for-the-badge&logoColor=white&logo=vercel&color=000000" alt="vercel ai sdk" />
  </div>

  <h3 align="center">AI-Interviewer: A job interview platform powered by AI voice agents</h3>
</div>

---

## 📋 Table of Contents

1. 🤖 [Introduction](#introduction)
2. ⚙️ [Tech Stack](#tech-stack)
3. 🚀 [Quick Start](#quick-start)

---

## 🤖 Introduction

**AI-Interviewer** is a full-stack interview platform that simulates real interviews using AI voice agents. It combines the power of **Next.js**, **Firebase**, **Deepgram**, **Google Gemini**, and the **Vercel AI SDK** to offer personalized and immersive interview experiences with instant feedback — all wrapped in a modern and intuitive interface.

---

## ⚙️ Tech Stack

- **Next.js** – Frontend & backend framework
- **Firebase** – Authentication & database
- **Tailwind CSS** – UI styling
- **Google Gemini** – AI model for generating interview questions and feedback
- **Deepgram** – Live speech-to-text transcription
- **Vercel AI SDK** – Unified toolkit for integrating LLMs across providers
- **shadcn/ui** – Accessible UI components
- **Zod** – Schema validation

---

## 🚀 Quick Start

**1. Prerequisites**

- Git
- Node.js
- npm

**2. Clone & Install**

```bash
git clone https://github.com/HimadriPathak/ai_interviewer.git
cd ai_interviewer
npm install --legacy-peer-deps or npm run install:legacy"
```

**3. Configure Environment**

Create a `.env.local` file in the root with the following values:

```
FIREBASE_PROJECT_ID
FIREBASE_PRIVATE_KEY
FIREBASE_CLIENT_EMAIL
GOOGLE_GEMINI_API_KEY
DEEPGRAM_API_KEY
DEEPGRAM_PROJECT_ID
```

**4. Run Locally**

```bash
npm run dev
```
