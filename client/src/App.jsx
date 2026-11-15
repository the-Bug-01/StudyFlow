
import { useEffect, useRef, useState } from 'react';
import {
  BookOpen,
  Brain,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  FileText,
  GraduationCap,
  Layers3,
  LoaderCircle,
  RotateCcw,
  Sparkles,
  Target,
  X
} from 'lucide-react';

import { validateStudySet } from './utils/validateStudySet';

const EXAMPLE_NOTES = `TCP (Transmission Control Protocol) is a connection-oriented transport layer protocol. It provides reliable, ordered and error-checked delivery of data between applications. Before data transfer, TCP establishes a connection using a three-way handshake: SYN, SYN-ACK and ACK. TCP uses sequence numbers to keep data in order and acknowledgements to confirm successful receipt. If data is lost, it can be retransmitted. Flow control prevents a sender from overwhelming a receiver, while congestion control helps avoid overloading the network. Unlike TCP, UDP is connectionless and does not guarantee delivery or ordering.`;

function App() {
  const [notes, setNotes] = useState('');
  const [mode, setMode] = useState('both');
  const [count, setCount] = useState(8);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('flashcards');
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [retestOnly, setRetestOnly] = useState(false);
  const [retestIds, setRetestIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [lastRequest, setLastRequest] = useState(null);

  const requestId = useRef(0);

  const flashcards = result?.flashcards ?? [];
  const quiz = result?.quiz ?? [];

  const scoredQuiz = retestOnly
    ? quiz.filter((q) => retestIds.includes(q.id))
    : quiz;

  const wrongIds = scoredQuiz
    .filter((q) => submitted && answers[q.id] !== q.answerIndex)
    .map((q) => q.id);

  const visibleQuiz = retestOnly
    ? quiz.filter((q) => retestIds.includes(q.id))
    : quiz;

  const score = scoredQuiz.filter(
    (q) => answers[q.id] === q.answerIndex
  ).length;

  const currentCard = flashcards[cardIndex];

  useEffect(() => {
    function onKeyDown(event) {
      if (
        activeTab !== 'flashcards' ||
        !currentCard ||
        event.target?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (event.key === 'ArrowRight') moveCard(1);
      if (event.key === 'ArrowLeft') moveCard(-1);

      if (event.key === ' ' && event.target?.tagName !== 'BUTTON') {
        event.preventDefault();
        setFlipped((v) => !v);
      }
    }

    window.addEventListener('keydown', onKeyDown);

    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeTab, currentCard, cardIndex, flashcards.length]);

  function moveCard(direction) {
    setCardIndex((index) =>
      Math.min(
        flashcards.length - 1,
        Math.max(0, index + direction)
      )
    );

    setFlipped(false);
  }

  async function generate(payload = { notes, mode, count }) {
    if (!payload.notes.trim()) {
      setError('Add some notes before generating your study set.');
      return;
    }

    if (payload.notes.trim().length < 20) {
      setError(
        'Please add at least 20 characters so the AI has enough context.'
      );
      return;
    }

    const id = ++requestId.current;

    setLastRequest(payload);
    setLoading(true);
    setError('');
    setNotice('');

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 65000);

      let response;

      try {
        response = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        });
      } finally {
        clearTimeout(timeout);
      }

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          body.error ||
          `The server returned an error (${response.status}).`
        );
      }

      if (id !== requestId.current) return;

      // Validate the complete AI response before rendering it.
      if (!validateStudySet(body.data, payload.mode)) {
        throw new Error(
          'The AI returned incomplete or invalid study material. Please try again.'
        );
      }

      const data = body.data;

      setResult(data);
      setCardIndex(0);
      setFlipped(false);
      setKnown([]);
      setAnswers({});
      setSubmitted(false);
      setRetestOnly(false);
      setRetestIds([]);

      setActiveTab(
        data.flashcards?.length ? 'flashcards' : 'quiz'
      );

      setNotice(
        'Your study set is ready. Check the answers and explanations as you practise.'
      );

    } catch (err) {
      if (id !== requestId.current) return;

      setError(
        err.name === 'AbortError'
          ? 'The request took too long. Check your connection and try again.'
          : (
              err.message ||
              'Something went wrong. Please try again.'
            )
      );

    } finally {
      if (id === requestId.current) {
        setLoading(false);
      }
    }
  }

  function chooseAnswer(questionId, optionIndex) {
    if (submitted) return;

    setAnswers((previous) => ({
      ...previous,
      [questionId]: optionIndex
    }));
  }

  function resetQuiz() {
    setAnswers({});
    setSubmitted(false);
    setRetestOnly(false);
    setRetestIds([]);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="StudyFlow home">
          <span className="brand-mark">
            <GraduationCap size={21} />
          </span>

          <span>
            studyflow<span className="brand-dot">.</span>
          </span>
        </a>

        <div className="topbar-right">
          <span className="saved-label">
            <span className="status-dot" />
            Your personal study space
          </span>

          <div className="avatar">S</div>
        </div>
      </header>

      <main id="top" className="main-content">
        <section className="hero">
          <div className="eyebrow">
            <Sparkles size={14} />
            YOUR AI STUDY PARTNER
          </div>

          <h1>
            Make every study<br className="mobile-break" />
            session <span>count.</span>
          </h1>

          <p>
            Drop in your notes. Get clear flashcards and quizzes.
            <br className="desktop-break" />
            Spend less time preparing, more time learning.
          </p>
        </section>

        <section className="workspace-grid">
          <aside className="input-panel panel">
            <div className="panel-heading">
              <div>
                <span className="step-label">STEP 01</span>
                <h2>Bring your notes</h2>
              </div>

              <span className="heading-icon">
                <FileText size={18} />
              </span>
            </div>

            <label className="field-label" htmlFor="notes">
              PASTE YOUR STUDY MATERIAL
            </label>

            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Paste a topic, lecture notes, or a textbook excerpt here..."
              maxLength={18000}
            />

            <div className="textarea-footer">
              <span>
                {notes.length.toLocaleString()} / 18,000 characters
              </span>

              <button
                className="text-button"
                onClick={() => setNotes(EXAMPLE_NOTES)}
              >
                Try example notes
              </button>
            </div>

            <div className="divider-line" />

            <div className="options-heading">
              <span className="step-label">STEP 02</span>
              <span className="field-label">
                CUSTOMIZE YOUR STUDY SET
              </span>
            </div>

            <div
              className="mode-options"
              role="group"
              aria-label="Study material type"
            >
              <button
                className={`mode-option ${mode === 'both' ? 'selected' : ''}`}
                onClick={() => setMode('both')}
              >
                <Layers3 size={17} />
                <span>
                  <b>Both</b>
                  <small>Cards + quiz</small>
                </span>
                {mode === 'both' && <Check size={15} />}
              </button>

              <button
                className={`mode-option ${mode === 'flashcards' ? 'selected' : ''}`}
                onClick={() => setMode('flashcards')}
              >
                <BookOpen size={17} />
                <span>
                  <b>Flashcards</b>
                  <small>Learn concepts</small>
                </span>
                {mode === 'flashcards' && <Check size={15} />}
              </button>

              <button
                className={`mode-option ${mode === 'quiz' ? 'selected' : ''}`}
                onClick={() => setMode('quiz')}
              >
                <CircleHelp size={17} />
                <span>
                  <b>Quiz</b>
                  <small>Test yourself</small>
                </span>
                {mode === 'quiz' && <Check size={15} />}
              </button>
            </div>

            <div className="count-row">
              <label className="field-label" htmlFor="count">
                QUESTIONS / CARDS
              </label>

              <select
                id="count"
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
              >
                <option value={5}>5 — Quick review</option>
                <option value={8}>8 — Balanced</option>
                <option value={12}>12 — Deep dive</option>
                <option value={15}>15 — Challenge</option>
              </select>
            </div>

            <button
              className="generate-button"
              onClick={() => generate()}
              disabled={loading || !notes.trim()}
            >
              {loading ? (
                <>
                  <LoaderCircle className="spin" size={18} />
                  Building your study set...
                </>
              ) : (
                <>
                  <Sparkles size={17} />
                  Generate study set
                  <span>→</span>
                </>
              )}
            </button>

            <p className="privacy-note">
              <CheckCircle2 size={13} />
              Your notes are processed to generate this session.
            </p>

            {error && (
              <div className="error-box" role="alert">
                <div>
                  <X size={17} />
                  <b>We couldn't generate your study set</b>
                </div>

                <p>{error}</p>

                <button
                  onClick={() => generate(lastRequest || undefined)}
                  disabled={loading}
                >
                  Try again
                  <RotateCcw size={13} />
                </button>
              </div>
            )}

            {notice && !error && (
              <p className="success-note" role="status">
                <CheckCircle2 size={15} />
                {notice}
              </p>
            )}
          </aside>

          <section className="output-panel panel" aria-live="polite">
            {!result && !loading ? (
              <div className="empty-state">
                <div className="empty-illustration">
                  <div className="illustration-card card-back" />

                  <div className="illustration-card card-front">
                    <Brain size={31} />
                    <span />
                    <span />
                  </div>

                  <Sparkles className="sparkle-one" size={19} />
                  <Sparkles className="sparkle-two" size={13} />
                </div>

                <span className="step-label">YOUR STUDY SPACE</span>

                <h2>
                  Your next breakthrough<br />
                  starts here.
                </h2>

                <p>
                  Your generated flashcards and quizzes
                  <br />
                  will appear here, ready when you are.
                </p>

                <div className="empty-hint">
                  <Target size={15} />
                  A little practice goes a long way.
                </div>
              </div>
            ) : loading ? (
              <div className="loading-state">
                <div className="loading-orbit">
                  <Brain size={30} />
                </div>

                <h2>Making sense of your notes...</h2>

                <p>
                  Finding the key ideas and creating your study set.
                </p>

                <div className="loading-bar">
                  <span />
                </div>

                <small>This can take a few moments.</small>
              </div>
            ) : (
              <>
                <div className="result-header">
                  <div>
                    <span className="step-label">
                      STEP 03 · READY TO LEARN
                    </span>

                    <h2>Your study set</h2>

                    <p>
                      {result.title || 'Your personalized learning materials'}
                    </p>
                  </div>

                  <span className="ready-pill">
                    <span />
                    READY
                  </span>
                </div>

                <div
                  className="result-tabs"
                  role="tablist"
                  aria-label="Study modes"
                >
                  {flashcards.length > 0 && (
                    <button
                      role="tab"
                      aria-selected={activeTab === 'flashcards'}
                      className={
                        activeTab === 'flashcards' ? 'active' : ''
                      }
                      onClick={() => setActiveTab('flashcards')}
                    >
                      <Layers3 size={16} />
                      Flashcards
                      <span>{flashcards.length}</span>
                    </button>
                  )}

                  {quiz.length > 0 && (
                    <button
                      role="tab"
                      aria-selected={activeTab === 'quiz'}
                      className={activeTab === 'quiz' ? 'active' : ''}
                      onClick={() => setActiveTab('quiz')}
                    >
                      <CircleHelp size={16} />
                      Quiz
                      <span>{quiz.length}</span>
                    </button>
                  )}
                </div>

                {activeTab === 'flashcards' && currentCard && (
                  <div className="flashcard-area">
                    <div className="card-progress-row">
                      <span>
                        CARD {cardIndex + 1} <i>/ {flashcards.length}</i>
                      </span>

                      <span>{known.length} mastered</span>
                    </div>

                    <div className="progress-track">
                      <span
                        style={{
                          width: `${((cardIndex + 1) / flashcards.length) * 100}%`
                        }}
                      />
                    </div>

                    <button
                      className={`flashcard ${flipped ? 'is-flipped' : ''}`}
                      onClick={() => setFlipped((v) => !v)}
                      aria-label="Flip flashcard"
                    >
                      <span className="card-face-label">
                        {flipped ? 'ANSWER' : 'QUESTION'}
                      </span>

                      <span className="card-content">
                        {flipped ? currentCard.answer : currentCard.question}
                      </span>

                      <span className="flip-hint">
                        <RotateCcw size={13} />
                        Click to flip
                      </span>
                    </button>

                    <div className="card-actions">
                      <button
                        className="secondary-button"
                        onClick={() => moveCard(-1)}
                        disabled={cardIndex === 0}
                      >
                        <ChevronLeft size={17} />
                        Previous
                      </button>

                      <button
                        className={`mastered-button ${known.includes(currentCard.id) ? 'is-known' : ''}`}
                        onClick={() =>
                          setKnown((prev) =>
                            prev.includes(currentCard.id)
                              ? prev.filter((id) => id !== currentCard.id)
                              : [...prev, currentCard.id]
                          )
                        }
                      >
                        {known.includes(currentCard.id) ? (
                          <>
                            <CheckCircle2 size={16} />
                            Mastered
                          </>
                        ) : (
                          <>
                            <Check size={16} />
                            I know this
                          </>
                        )}
                      </button>

                      <button
                        className="secondary-button next-button"
                        onClick={() => moveCard(1)}
                        disabled={cardIndex === flashcards.length - 1}
                      >
                        Next
                        <ChevronRight size={17} />
                      </button>
                    </div>

                    {currentCard.explanation && (
                      <div className="explanation">
                        <b>Remember this</b>
                        <p>{currentCard.explanation}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'quiz' && (
                  <div className="quiz-area">
                    {submitted && (
                      <div className="score-banner">
                        <div className="score-circle">
                          {Math.round(
                            (score / Math.max(quiz.length, 1)) * 100
                          )}
                          <small>%</small>
                        </div>

                        <div>
                          <b>
                            {score} out of {quiz.length} correct
                          </b>

                          <p>
                            {score === quiz.length
                              ? 'Excellent work. You got everything right!'
                              : 'Review the explanations, then try the questions you missed.'}
                          </p>
                        </div>
                      </div>
                    )}

                    {submitted && wrongIds.length > 0 && (
                      <div className="retest-row">
                        <span>
                          {wrongIds.length} question
                          {wrongIds.length === 1 ? '' : 's'} to review
                        </span>

                        <button
                          onClick={() => {
                            setRetestIds(wrongIds);
                            setRetestOnly(true);
                            setSubmitted(false);
                            setAnswers({});
                          }}
                        >
                          Retest mistakes
                          <RotateCcw size={14} />
                        </button>
                      </div>
                    )}

                    {retestOnly && (
                      <div className="retest-label">
                        RETEST MODE · QUESTIONS YOU MISSED
                      </div>
                    )}

                    {visibleQuiz.map((q, i) => (
                      <div className="question-card" key={q.id}>
                        <div className="question-meta">
                          <span>QUESTION {i + 1}</span>

                          {submitted && (
                            <span
                              className={
                                answers[q.id] === q.answerIndex
                                  ? 'correct-text'
                                  : 'wrong-text'
                              }
                            >
                              {answers[q.id] === q.answerIndex
                                ? 'Correct'
                                : 'Incorrect'}
                            </span>
                          )}
                        </div>

                        <h3>{q.question}</h3>

                        <div className="answer-options">
                          {q.options.map((option, optionIndex) => {
                            const selected =
                              answers[q.id] === optionIndex;

                            const isCorrect =
                              q.answerIndex === optionIndex;

                            let cls = selected ? 'chosen' : '';

                            if (submitted && isCorrect) {
                              cls = 'answer-correct';
                            } else if (submitted && selected) {
                              cls = 'answer-wrong';
                            }

                            return (
                              <button
                                key={optionIndex}
                                className={`answer-option ${cls}`}
                                onClick={() =>
                                  chooseAnswer(q.id, optionIndex)
                                }
                                disabled={submitted}
                              >
                                <span className="option-letter">
                                  {String.fromCharCode(65 + optionIndex)}
                                </span>

                                <span>{option}</span>

                                {submitted && isCorrect && (
                                  <CheckCircle2 size={16} />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {submitted && (
                          <div className="answer-explanation">
                            <b>
                              {answers[q.id] === q.answerIndex
                                ? 'Why this is correct'
                                : 'Correct answer: ' + q.options[q.answerIndex]}
                            </b>

                            <p>{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    ))}

                    {visibleQuiz.length === 0 && (
                      <div className="empty-quiz">
                        No incorrect answers to retest. Great work!
                      </div>
                    )}

                    <div className="quiz-footer">
                      {!submitted ? (
                        <button
                          className="generate-button submit-quiz"
                          disabled={
                            visibleQuiz.length === 0 ||
                            visibleQuiz.some(
                              (q) => answers[q.id] === undefined
                            )
                          }
                          onClick={() => setSubmitted(true)}
                        >
                          Check my answers
                          <span>→</span>
                        </button>
                      ) : (
                        <button
                          className="secondary-button"
                          onClick={resetQuiz}
                        >
                          <RotateCcw size={16} />
                          Try quiz again
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'flashcards' && !currentCard && (
                  <div className="empty-quiz">
                    No flashcards were generated for this set.
                  </div>
                )}
              </>
            )}
          </section>
        </section>

        <section className="bottom-note">
          <div>
            <Clock3 size={16} />
            <span>
              <b>Small steps, big progress.</b>
              Consistent practice helps ideas stick.
            </span>
          </div>

          <span>
            Made for curious minds <span className="heart">♥</span>
          </span>
        </section>
      </main>

      <footer className="footer">
        <span>© 2026 StudyFlow</span>
        <span>Learn at your own pace.</span>
      </footer>
    </div>
  );
}

export default App;
