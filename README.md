
# StudyFlow — AI-Powered Interactive Study Assistant

StudyFlow is a full-stack AI-powered study assistant that transforms free-form study notes into interactive flashcards and multiple-choice quizzes.

It uses Google's Gemini API to generate structured learning material, which is validated and presented through an interactive React interface.

The goal of StudyFlow is to make studying more effective by turning regular course notes into practice material that students can actively engage with.

## Live Demo

**StudyFlow is deployed and publicly accessible.**

- **Live Application:** https://study-flow-nine-kappa.vercel.app/
- **Backend API:** https://studyflow-api-lfai.onrender.com

### Deployment Architecture

| Component | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| AI Provider | Google Gemini API |

The React frontend communicates with the Express backend through a configurable API URL. The backend securely handles Gemini API requests and validates generated study material.

**Note:** The backend uses Render's free instance, which may sleep after periods of inactivity. The first request after inactivity can take approximately 50 seconds or longer to respond.

## Features

- **AI-powered generation:** Generate flashcards, quizzes, or both from user-provided study notes.
- **Interactive flashcards:** Flip cards to reveal answers, navigate using buttons or keyboard arrow keys, and mark concepts as mastered.
- **Interactive quizzes:** Answer multiple-choice questions, receive feedback, view explanations, and calculate your score.
- **Mistake-based retesting:** Retry questions that were answered incorrectly.
- **Structured AI output:** Uses Gemini's structured-output capabilities to generate JSON responses.
- **Response validation:** Validates incoming requests and AI-generated responses using Zod on the backend, with additional validation on the frontend.
- **Error handling:** Handles malformed AI responses, API failures, timeouts, and invalid input gracefully.
- **Request management:** Prevents duplicate submissions while generating content and protects against stale responses.
- **Responsive interface:** Provides a responsive experience across desktop and mobile screen sizes.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React, JavaScript |
| Styling | CSS |
| Icons | Lucide React |
| Build Tool | Vite |
| Backend | Node.js, Express.js |
| AI Integration | Google Gemini API |
| Validation | Zod |
| Security | Helmet, CORS, Express Rate Limit |

## Project Structure

```text
StudyFlow/
├── client/
│   ├── src/
│   │   ├── utils/
│   │   │   └── validateStudySet.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── index.js
│   ├── .env.example
│   └── package.json
│
├── package.json
├── package-lock.json
├── .gitignore
├── IMPLEMENTATION_NOTES.md
└── README.md
```

## Requirements

- Node.js 18.18 or later (Node.js 20 LTS recommended).
- npm.
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/).

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/the-Bug-01/StudyFlow.git
cd StudyFlow
```

### 2. Install dependencies

Run the following commands from the project root:

```bash
npm install
npm --prefix client install
npm --prefix server install
```

### 3. Configure environment variables

Create a `.env` file inside the `server` directory using the provided example file.

**Windows PowerShell:**

```powershell
Copy-Item server/.env.example server/.env
```

**Linux/macOS:**

```bash
cp server/.env.example server/.env
```

Add your Gemini configuration to `server/.env`:

```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=your_available_gemini_model
PORT=3001
CLIENT_ORIGIN=http://localhost:5173
```

Replace the API key and model name with your own valid Gemini credentials and an available model.

**Security:** The Gemini API key is stored on the backend and is never exposed in the frontend. The actual `server/.env` file is excluded from Git.

### 4. Start the application

From the project root, run:

```bash
npm run dev
```

This starts both the frontend development server and the Express backend.

### 5. Open the application

Visit:

```text
http://localhost:5173
```

The frontend communicates with the Express backend running on port `3001` through the Vite development proxy.

## How to Use StudyFlow

1. Paste your study notes into the input area.
2. Choose the type of study material you want:
   - Both flashcards and quizzes
   - Flashcards only
   - Quiz only
3. Select the desired number of questions or flashcards.
4. Click **Generate Study Set**.
5. Review the generated flashcards and quiz questions.
6. Flip flashcards to reveal answers and use the quiz section to test your understanding.
7. Review your score and explanations, and retry incorrectly answered questions.

## API Documentation

### POST `/api/generate`

Generates study material from the submitted study notes.

**Request body:**

```json
{
  "notes": "Your study notes go here.",
  "mode": "both",
  "count": 8
}
```

**Parameters:**

| Parameter | Description |
|---|---|
| `notes` | Source text, between 20 and 18,000 characters |
| `mode` | `both`, `flashcards`, or `quiz` |
| `count` | Number of requested items, between 5 and 15 |

**Successful response:**

```json
{
  "data": {
    "title": "Operating Systems Study Guide",
    "flashcards": [
      {
        "id": "fc-1",
        "question": "What is memory management?",
        "answer": "The process of managing main memory.",
        "explanation": "It supports efficient allocation of memory."
      }
    ],
    "quiz": [
      {
        "id": "q-1",
        "question": "Which component manages memory?",
        "options": [
          "Operating System",
          "Compiler",
          "Browser",
          "Text Editor"
        ],
        "answerIndex": 0,
        "explanation": "The operating system manages memory allocation."
      }
    ]
  }
}
```

The API returns empty arrays for content types that were not requested.

### GET `/api/health`

Checks the health and availability of the backend service.

## Error Handling and Reliability

AI-generated responses can be unpredictable, so StudyFlow includes multiple validation and error-handling mechanisms.

- **Input validation:** Rejects invalid requests before sending them to the AI provider.
- **Structured output:** Requests JSON-formatted responses from Gemini.
- **JSON parsing:** Handles fenced JSON and attempts to extract a JSON object from surrounding text.
- **Schema validation:** Uses Zod to validate generated flashcards, quiz questions, fields, options, and answer indexes.
- **Duplicate ID detection:** Rejects generated study sets containing duplicate item identifiers.
- **Timeout handling:** Uses server-side and frontend request timeouts.
- **Retry handling:** Retries eligible temporary failures from the AI provider.
- **Rate limiting:** Restricts excessive API requests.
- **API-key protection:** Keeps the Gemini API key on the backend.
- **Frontend validation:** Checks the response structure before rendering generated content.
- **Stale-response protection:** Prevents outdated requests from overwriting newer results.
- **User feedback:** Provides loading indicators, error messages, and retry options.

## Production Deployment

StudyFlow is deployed using separate frontend and backend hosting services.

### Frontend — Vercel

The React application is hosted on Vercel.

- Root directory: `client`
- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`

Frontend environment variable:

```env
VITE_API_BASE_URL=https://studyflow-api-lfai.onrender.com
```

### Backend — Render

The Express API is hosted on Render.

- Root directory: `server`
- Build command: `npm install`
- Start command: `npm start`

Backend environment variables:

```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.5-flash
CLIENT_ORIGIN=https://study-flow-nine-kappa.vercel.app
```

Render automatically provides the `PORT` environment variable.

The frontend API URL and backend CORS origin must be configured correctly for production communication.

## AI Usage Disclosure

AI assistance was used during development for implementation support, debugging, code review, and documentation.

Google Gemini is integrated into the application at runtime to generate flashcards and quiz questions from user-provided study notes.

The generated implementation has been reviewed and tested by the developer, who is responsible for understanding and maintaining the submitted code.

## Known Limitations

- AI-generated content may contain factual inaccuracies. Users should verify important information against their original study materials.
- Study sessions and learning progress are stored in React state and are not persisted after refreshing the page.
- The application does not currently include user authentication or a database.
- AI generation depends on Gemini API availability, model access, and account quotas.
- The Render free instance may sleep after inactivity, resulting in slower initial requests.
- Automated tests have not yet been implemented.

## Production Build

To create a production build of the frontend, run:

```bash
npm run build
```

The generated production files are placed in the client's `dist` directory.

## Available Scripts

Run these commands from the project root:

| Command | Description |
|---|---|
| `npm run dev` | Starts the frontend and backend development servers |
| `npm run build` | Creates a production build of the frontend |
| `npm start` | Starts the backend API server |

## Future Improvements

Some potential improvements for future versions include:

- Saving and retrieving previous study sessions.
- Adding user authentication and persistent learning progress.
- Introducing automated tests for API responses and validation.
- Adding study analytics and topic-wise performance tracking.
- Allowing users to refine generated flashcards and quiz questions.

---

**StudyFlow — Learn smarter, one concept at a time.**
