# StudyFlow — AI-Powered Interactive Study Assistant

StudyFlow is a full-stack AI-powered study assistant that transforms free-form study notes into interactive flashcards and multiple-choice quizzes. It uses Google's Gemini API to generate structured learning material and validates the generated content before displaying it in the application.

## Features

- **AI-powered generation:** Generate flashcards, quizzes, or both from user-provided notes.
- **Interactive flashcards:** Flip cards, navigate using buttons or keyboard arrow keys, and mark concepts as mastered.
- **Interactive quizzes:** Answer multiple-choice questions, receive instant feedback, view explanations, and calculate scores.
- **Mistake-based retesting:** Retry questions answered incorrectly.
- **Structured AI output:** Generate JSON responses using Gemini's structured-output mode.
- **Response validation:** Validate incoming requests and AI-generated responses using Zod on the backend, with additional validation on the frontend.
- **Error handling:** Handle malformed AI responses, API failures, timeouts, and invalid input gracefully.
- **Request management:** Prevent duplicate submissions while loading and protect against stale responses.
- **Responsive interface:** Designed for desktop and mobile screens.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React, JavaScript |
| UI | CSS, Lucide React |
| Build tool | Vite |
| Backend | Node.js, Express.js |
| AI integration | Google Gemini API |
| Validation | Zod |
| Security | Helmet, CORS, Express Rate Limit |

## Project Structure

```text
studyflow/
├── client/
│   ├── src/
│   │   ├── utils/
│   │   │   └── validateStudySet.js
│   │   ├── App.jsx
│   │   └── ...
│   └── package.json
├── server/
│   ├── index.js
│   ├── .env.example
│   └── package.json
├── package.json
├── .gitignore
└── README.md
```

## Requirements

- Node.js 18.18 or later (Node.js 20 LTS recommended).
- npm.
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/).

## Installation and Setup

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd studyflow
```

### 2. Install dependencies

```bash
npm install
npm --prefix client install
npm --prefix server install
```

### 3. Configure environment variables

Create a `.env` file inside the `server` directory by copying the example file.

**Windows PowerShell:**

```powershell
Copy-Item server/.env.example server/.env
```

**Linux/macOS:**

```bash
cp server/.env.example server/.env
```

Add your configuration to `server/.env`:

```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=your_working_gemini_model
PORT=3001
CLIENT_ORIGIN=http://localhost:5173
```

Replace the API key and model name with your actual working configuration.

**Security:** Never commit `server/.env` or expose your Gemini API key in frontend code.

### 4. Start the application

From the project root:

```bash
npm run dev
```

### 5. Open the application

Visit:

http://localhost:5173

The frontend communicates with the Express backend running on port 3001.

## How to Use StudyFlow

1. Paste your study notes into the input area.
2. Choose the desired output:
   - Both flashcards and quizzes
   - Flashcards only
   - Quiz only
3. Select the number of questions or cards.
4. Click **Generate study set**.
5. Review and interact with your generated learning material.

## API Documentation

### POST `/api/generate`

Generates study material from the submitted notes.

**Request body:**

```json
{
  "notes": "Your study notes go here.",
  "mode": "both",
  "count": 8
}
```

Parameters:

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

Checks whether the backend service is running.

## Error Handling and Reliability

StudyFlow includes several safeguards to handle unreliable AI responses and network failures.

- **Input validation:** Rejects invalid requests before calling the AI provider.
- **Structured output:** Requests JSON responses from Gemini.
- **JSON parsing:** Handles fenced JSON and attempts to extract a JSON object from surrounding text.
- **Schema validation:** Uses Zod to validate generated flashcards, quizzes, fields, options, and answer indexes.
- **Duplicate ID detection:** Rejects study sets containing duplicate item identifiers.
- **Timeout handling:** Uses server-side and frontend request timeouts.
- **Retry handling:** Retries eligible temporary provider failures.
- **Rate limiting:** Restricts excessive API requests.
- **API-key protection:** Keeps the Gemini API key on the backend.
- **Frontend validation:** Checks the response structure before rendering it.
- **Stale-response protection:** Prevents outdated requests from replacing newer results.
- **User feedback:** Provides loading indicators, error messages, and retry options.

## AI Usage Disclosure

AI assistance was used during development to help with implementation, debugging, code review, and documentation.

Google Gemini is also integrated at runtime to generate flashcards and quiz questions from user-provided study notes.

The implementation has been reviewed and tested, and the developer is responsible for understanding and maintaining the submitted code.

## Known Limitations

- AI-generated content may contain factual inaccuracies. Users should verify important information against their original course materials.
- Study sessions and learning progress are currently stored in React state and are not persisted after refreshing the page.
- The application does not currently include authentication or a database.
- AI generation depends on Gemini API availability, model access, and account quotas.
- Automated tests have not yet been added.

## Running a Production Build

Build the frontend:

```bash
npm run build
```

The generated frontend files are placed in the client's build output directory.

For deployment, configure the frontend and Express backend so that API requests reach the backend correctly. When hosting them separately, configure the frontend API URL and the backend's allowed client origin.

## Available Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start frontend and backend development servers |
| `npm run build` | Build the frontend |
| `npm start` | Start the backend API |

## Future Improvements

- Save and retrieve previous study sessions.
- Add user authentication and persistent learning progress.
- Introduce automated tests for API responses and validation.
- Add study analytics and topic-wise performance tracking.
- Allow users to refine generated questions and flashcards.

## Time Spent

Record the actual development, debugging, testing, and documentation time before submission.

---

**StudyFlow — Learn smarter, one concept at a time.**