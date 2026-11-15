
export function validateStudySet(data, mode = 'both') {
  // Check the main response structure.
  if (
    !data ||
    typeof data !== 'object' ||
    typeof data.title !== 'string' ||
    !Array.isArray(data.flashcards) ||
    !Array.isArray(data.quiz)
  ) {
    return false;
  }

  // Check flashcards.
  const validFlashcards = data.flashcards.every((card) =>
    card &&
    typeof card.id === 'string' &&
    typeof card.question === 'string' &&
    typeof card.answer === 'string' &&
    typeof (card.explanation ?? '') === 'string'
  );

  // Check quiz questions.
  const validQuiz = data.quiz.every((question) =>
    question &&
    typeof question.id === 'string' &&
    typeof question.question === 'string' &&
    Array.isArray(question.options) &&
    question.options.length === 4 &&
    question.options.every((option) => typeof option === 'string') &&
    Number.isInteger(question.answerIndex) &&
    question.answerIndex >= 0 &&
    question.answerIndex <= 3 &&
    typeof question.explanation === 'string'
  );

  if (!validFlashcards || !validQuiz) {
    return false;
  }

  // Ensure the selected mode has the required content.
  if (mode !== 'quiz' && data.flashcards.length === 0) {
    return false;
  }

  if (mode !== 'flashcards' && data.quiz.length === 0) {
    return false;
  }

  // Reject duplicate IDs.
  const ids = [...data.flashcards, ...data.quiz].map((item) => item.id);

  if (new Set(ids).size !== ids.length) {
    return false;
  }

  return true;
}
