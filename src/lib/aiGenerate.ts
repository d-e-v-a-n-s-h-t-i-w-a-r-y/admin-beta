// AI content generation service using Google Gemini REST API
import { QuizQuestion, VocabWord } from '@/types/admin';
import {
    SYSTEM_PROMPT,
    snippetPrompt,
    dailyQuizPrompt,
    dailyVocabPrompt,
    dailyLongReadPrompt,
    roadmapUnitPrompt,
} from './prompts';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL = 'gemini-2.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;

// ── Response types ───────────────────────────────────────

export interface GeneratedSnippet {
    title: string;
    body: string;
    quiz: { questions: QuizQuestion[] };
}

export interface GeneratedDailyQuiz {
    questions: QuizQuestion[];
}

export interface GeneratedDailyVocab {
    word: string;
    meaning: string;
    example: string;
}

export interface GeneratedLongRead {
    title: string;
    body: string;
    quiz: { questions: QuizQuestion[] };
}

export interface GeneratedRoadmapUnit {
    title: string;
    body: string;
    quiz: { questions: QuizQuestion[] };
}

// ── Core API call ────────────────────────────────────────

const genId = () => Math.random().toString(36).substr(2, 9);

function addIdsToQuestions(questions: any[]): QuizQuestion[] {
    return (questions || []).map((q: any) => ({
        id: genId(),
        text: q.text || '',
        options: q.options || ['', '', '', ''],
        correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
        explanation: q.explanation || '',
    }));
}

async function callGemini(userPrompt: string, retries = 2): Promise<string> {
    if (!GEMINI_API_KEY) {
        throw new Error('Missing VITE_GEMINI_API_KEY in .env.local');
    }

    const res = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: [{ parts: [{ text: userPrompt }] }],
            generationConfig: {
                temperature: 0.7,
                topP: 0.95,
                maxOutputTokens: 4096,
            },
        }),
    });

    if (res.status === 429 && retries > 0) {
        // Rate limited — wait and retry
        await new Promise(r => setTimeout(r, 3000));
        return callGemini(userPrompt, retries - 1);
    }

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Gemini API error (${res.status}): ${err}`);
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty response from Gemini');
    return text;
}

function parseJSON<T>(raw: string): T {
    // Strip markdown code fences if present
    let cleaned = raw.trim();
    if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
    }
    return JSON.parse(cleaned);
}

// ── Public generation functions ──────────────────────────

export async function generateSnippet(category: string, topic: string): Promise<GeneratedSnippet> {
    const raw = await callGemini(snippetPrompt(category, topic));
    const parsed = parseJSON<any>(raw);
    return {
        title: parsed.title || '',
        body: parsed.body || '',
        quiz: { questions: addIdsToQuestions(parsed.quiz?.questions) },
    };
}

export async function generateDailyQuiz(category: string): Promise<GeneratedDailyQuiz> {
    const raw = await callGemini(dailyQuizPrompt(category));
    const parsed = parseJSON<any>(raw);
    return {
        questions: addIdsToQuestions(parsed.questions),
    };
}

export async function generateDailyVocab(): Promise<GeneratedDailyVocab> {
    const raw = await callGemini(dailyVocabPrompt());
    const parsed = parseJSON<any>(raw);
    return {
        word: parsed.word || '',
        meaning: parsed.meaning || '',
        example: parsed.example || '',
    };
}

export async function generateLongRead(category: string, topic: string): Promise<GeneratedLongRead> {
    const raw = await callGemini(dailyLongReadPrompt(category, topic));
    const parsed = parseJSON<any>(raw);
    return {
        title: parsed.title || '',
        body: parsed.body || '',
        quiz: { questions: addIdsToQuestions(parsed.quiz?.questions) },
    };
}

export async function generateRoadmapUnit(
    roadmapName: string,
    unitNumber: number,
    topic: string,
): Promise<GeneratedRoadmapUnit> {
    const raw = await callGemini(roadmapUnitPrompt(roadmapName, unitNumber, topic));
    const parsed = parseJSON<any>(raw);
    return {
        title: parsed.title || '',
        body: parsed.body || '',
        quiz: { questions: addIdsToQuestions(parsed.quiz?.questions) },
    };
}
