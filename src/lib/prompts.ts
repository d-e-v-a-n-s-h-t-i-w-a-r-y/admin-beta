// SwiftEd AI content generation prompts
// Each function returns the user prompt string for the Gemini API.

export const SYSTEM_PROMPT = `You are a curriculum designer for a serious, mobile-first learning platform called SwiftEd.

Your task is to generate concise, structured educational content that respects the learner's time.

Core rules:
- Neutral, instructional tone
- No emojis
- No motivational fluff
- No storytelling unless explicitly requested
- No references to social media, scrolling, reels, or dopamine
- No introductions like "In this snippet" or conclusions like "To summarize"
- Assume the learner is intelligent and time-constrained

All content must be factual, clear, and cognitively dense.
Follow the requested structure exactly. Any deviation is an error.

IMPORTANT: You MUST respond with valid JSON matching the schema described in each prompt. Do NOT wrap the JSON in markdown code fences. Output raw JSON only.`;

// ── Snippet ──────────────────────────────────────────────
export function snippetPrompt(category: string, topic: string): string {
    return `Generate ONE main-feed learning snippet for SwiftEd.

Category: ${category}
Topic: ${topic}
Target reading time: ~3 minutes

Respond with this exact JSON structure:
{
  "title": "Max 8 words, concept-focused, not catchy",
  "body": "Markdown string. Must contain: Core Explanation (90-130 words explaining exactly ONE idea, no metaphors unless unavoidable, no historical storytelling) followed by a Practical Example (short, concrete, applied, using bullets or short paragraph).",
  "quiz": {
    "questions": [
      {
        "text": "Question text",
        "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
        "correctIndex": 0,
        "explanation": "1-line explanation"
      }
    ]
  }
}

Requirements for the quiz:
- 2 to 3 multiple-choice questions
- 4 options each
- correctIndex is 0-based (0=A, 1=B, 2=C, 3=D)
- 1-line explanation per question

The body must be valid Markdown. No images. No extra commentary.`;
}

// ── Daily Quiz ───────────────────────────────────────────
export function dailyQuizPrompt(category: string): string {
    return `Generate a Daily Quiz for SwiftEd.

Category: ${category}
Goal: Test understanding and application, not memorization

Respond with this exact JSON structure:
{
  "questions": [
    {
      "text": "Question text",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correctIndex": 0,
      "explanation": "1-2 line explanation"
    }
  ]
}

Requirements:
- Exactly 5 MCQs
- Each question must test reasoning or application
- Avoid definition-only questions
- No trick questions
- No repeated concepts
- correctIndex is 0-based (0=A, 1=B, 2=C, 3=D)
- Neutral instructional tone`;
}

// ── Daily Vocab ──────────────────────────────────────────
export function dailyVocabPrompt(): string {
    return `Generate ONE Daily Vocabulary item for SwiftEd.

Category: General English / Professional English
Word difficulty: Common but useful

Respond with this exact JSON structure:
{
  "word": "The vocabulary word",
  "meaning": "Clear definition in 1 sentence",
  "example": "Realistic, professional or academic example sentence"
}

Constraints:
- No synonyms list
- No etymology
- Keep it simple and practical`;
}

// ── Daily Long Read ──────────────────────────────────────
export function dailyLongReadPrompt(category: string, topic: string): string {
    return `Generate ONE Daily Long Read for SwiftEd.

Category: ${category}
Topic: ${topic}
Target reading time: ~15 minutes

Respond with this exact JSON structure:
{
  "title": "Clear, descriptive, non-clickbait title",
  "body": "Markdown string containing: Context (2-3 paragraphs), 3 to 5 Core Sections (each with Markdown heading and covering ONE idea), and an Applied Insight section.",
  "quiz": {
    "questions": [
      {
        "text": "Question text",
        "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
        "correctIndex": 0,
        "explanation": "Brief explanation"
      }
    ]
  }
}

Requirements:
- Body must be valid Markdown with ## headings for sections
- Context: 2-3 paragraphs explaining why the topic matters
- Core Sections: 3-5 sections, each covering ONE idea
- Applied Insight: Real-world implication or decision-making lens
- Quiz: Exactly 3 MCQs (Reflection Check) with correct answers and brief explanations
- correctIndex is 0-based
- No images, no personal anecdotes, no motivational language`;
}

// ── Roadmap Unit ─────────────────────────────────────────
export function roadmapUnitPrompt(roadmapName: string, unitNumber: number, topic: string): string {
    return `Generate ONE roadmap learning unit for SwiftEd.

Roadmap Name: ${roadmapName}
Unit Number: ${unitNumber}
Topic: ${topic}

Respond with this exact JSON structure:
{
  "title": "Unit title",
  "body": "Markdown string containing: Unit Objective (1-2 sentences), Concept Explanation (150-180 words), and Worked Example (step-by-step or applied).",
  "quiz": {
    "questions": [
      {
        "text": "Question text",
        "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
        "correctIndex": 0,
        "explanation": "Explanation"
      }
    ]
  }
}

Requirements:
- Body must be valid Markdown
- Unit Objective: 1-2 sentences stating what the learner will understand
- Concept Explanation: 150-180 words, build logically, no redundancy
- Worked Example: Step-by-step or applied explanation
- Quiz: Exactly 3 MCQs requiring real understanding to pass
- correctIndex is 0-based
- No references to future units, no summaries, no images`;
}
