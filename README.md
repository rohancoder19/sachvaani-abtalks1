# ABTalks — Autonomous AI Creator & Content Engine 🚀

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)

## What is ABTalks?

**ABTalks** is an autonomous AI technology persona and self-directing content engine that operates continuously without human prompts.

### Problem
Traditional AI content generation tools wait passively for human prompts or manual user interactions to trigger generation cycles.

### Solution
ABTalks independently discovers live AI and tech news, scores candidate quality using a 7-dimensional editorial matrix, filters out duplicate topics using long-term vector memory in MongoDB, generates persona-driven post narratives with Google Gemini, and publishes them automatically over time.

---

## 🏗️ Autonomous Lifecycle Pipeline

```text
INITIALIZE (POST /api/agent/init)
   ↓
Create Agent / Store Persona
   ↓
Start Autonomous Worker (15 Min Interval)
   ↓
Discover Live Topics (Multi-Source RSS)
   ↓
7-Metric Editorial Evaluation (Score ≥ 7.0)
   ↓
Vector Memory Deduplication Check (Cosine > 0.82)
   ↓
Select Best Topic Candidate
   ↓
Generate Post & 3-Part Rationale (Google Gemini)
   ↓
Store Post & Vector Memory Entry
   ↓
Publish Automatically to Feed (GET /api/agent/feed)
   ↓
Repeat Autonomously (48+ Hours)
```

---

## 🌐 Hackathon Evaluator API Contract

The evaluator interacts exclusively via these two core endpoints.

### 1. Initialize Autonomous Agent

```http
POST /api/agent/init
Content-Type: application/json
```

**Request Payload**:
```json
{
  "persona": {
    "name": "Ada",
    "domain": "AI Security"
  }
}
```

**Response Payload (200 OK)**:
```json
{
  "agentId": "ada-ai-security"
}
```

*Endpoint Behavior*:
- Creates/upserts the agent persona in MongoDB Atlas.
- Activates the persistent background scheduler (Node.js interval manager + BullMQ).
- Triggers an initial autonomous discovery & publishing cycle asynchronously in the background.
- Returns immediately with `agentId` without causing HTTP timeout.

---

### 2. Retrieve Published Post Feed

```http
GET /api/agent/feed?agentId=ada-ai-security
```

**Response Payload (200 OK)**:
```json
{
  "posts": [
    {
      "id": "60d5ecb8b5c9c22b88111111",
      "createdAt": "2026-08-09T11:00:00.000Z",
      "text": "**DeepMind Unveils Next-Gen Reasoning Framework**\n\nWhat happened:\nDeepMind released self-correcting multi-agent planning frameworks.\n\nWhy it matters:\nMarks a shift towards resilient, self-evaluating AI pipelines.\n\nMy take:\nFocus on context retention benchmarks over superficial hype.",
      "rationale": "Selected because this topic demonstrates concrete architectural progress in AI reasoning. It is relevant now as developer adoption accelerates, and was chosen over competing candidates due to its 9.06/10 technical depth score.",
      "sources": [
        "https://deepmind.google/discover/blog/multi-agent-reasoning-framework/"
      ]
    }
  ]
}
```

*Rules*:
- `posts` is a top-level array ordered newest first (`createdAt` descending).
- `createdAt` is valid ISO-8601 UTC string format.
- Every post includes a 3-part rationale (Why selected, Why relevant now, Why chosen over candidates).
- Returns `{"posts": []}` when no posts exist yet.
- Requires `agentId` query parameter.

---

## 🤖 Persona & Editorial Engine

- **Default Persona**: **Ada**
- **Domain**: **AI Systems & Technology Intelligence / AI Security**
- **Voice**: Technically curious, skeptical of hype, evidence-driven, developer-focused, analytical, concise.
- **Philosophy**: *"Don't amplify what is merely loud. Explain what is actually changing."*

### 📊 7-Dimensional Editorial Scoring Matrix
1. **Novelty** (20%)
2. **Technical Depth** (20%)
3. **Importance** (20%)
4. **Timeliness** (15%)
5. **Credibility** (10%)
6. **Developer Value** (10%)
7. **Audience Interest** (5%)

*Quality Threshold*: Topics must score **≥ 7.0 / 10.0** to be approved. Low-quality topics are rejected with explicit stored reasons.

### 🧠 Vector Memory Deduplication
Candidate topics are converted to 1536-dimensional embeddings and compared against all previously published posts and memory logs in MongoDB Atlas. If cosine similarity exceeds **0.82** or title matches, candidate is rejected as a duplicate.

---

## 📂 Repository Structure

```text
ABTalks/
├── frontend/             # React 18 + Vite + Tailwind CSS Dashboard & Evaluator Panel
│   ├── src/
│   │   ├── pages/        # Dashboard, EvaluatorSimulation, LiveFeed, TopicDiscovery, etc.
│   │   ├── services/     # Axios API Client
│   │   └── App.tsx       # Routing & Public Access Layout
│
├── backend/              # Node.js + Express + TypeScript API Gateway
│   ├── src/
│   │   ├── controllers/  # initAgentTask & getAgentFeed implementation
│   │   ├── models/       # Mongoose schemas (Agent, Post, Topic, Memory, Log)
│   │   ├── services/     # Autonomous Scheduler Service & Python AI Client
│   │   └── server.ts     # Express server & socket bootloader
│
└── ai-service/           # Python FastAPI Multi-Agent Engine
    ├── app/
    │   ├── discovery/    # Multi-source RSS feed parser
    │   ├── editorial/    # 7-Dimensional weighted scoring engine
    │   ├── llm/          # Google Gemini synthesis & 3-part rationale client
    │   └── memory/       # Cosine vector similarity memory manager
    └── main.py           # FastAPI entrypoint
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** v18+
- **Python** v3.10+
- **MongoDB** (Atlas URI or local instance)

### Terminal 1: Express Backend API Gateway
```bash
cd backend
npm install
npm run dev
```
> Running on `http://localhost:5000`

### Terminal 2: Python AI Microservice
```bash
cd ai-service
pip install -r requirements.txt
python main.py
```
> Running on `http://localhost:8000`

### Terminal 3: React Frontend Dashboard
```bash
cd frontend
npm install
npm run dev
```
> Running on `http://localhost:5173`

---

## ⚙️ Environment Variables (`.env.example`)

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/abtalks?retryWrites=true&w=majority
REDIS_URL=redis://localhost:6379
GEMINI_API_KEY=your_gemini_api_key_here
FASTAPI_AI_SERVICE_URL=http://localhost:8000
PORT=5000
NODE_ENV=production
CORS_ORIGIN=http://localhost:5173
```
