import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { Snippet, Quiz, VocabWord, DailyLongReadEntry, Roadmap } from '@/types/admin';

interface AdminContextType {
  isLoggedIn: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;

  snippets: Snippet[];
  isLoadingSnippets: boolean;
  addSnippet: (snippet: Omit<Snippet, 'id' | 'createdAt'>) => Promise<void>;
  updateSnippet: (id: string, snippet: Partial<Snippet>) => Promise<void>;
  deleteSnippet: (id: string) => Promise<void>;
  toggleSnippetStatus: (id: string) => Promise<void>;
  refreshSnippets: () => Promise<void>;

  getDailyQuiz: (date: string) => Promise<Quiz | undefined>;
  setDailyQuiz: (date: string, quiz: Quiz) => Promise<void>;

  getDailyVocab: (date: string) => Promise<VocabWord[] | undefined>;
  setDailyVocab: (date: string, words: VocabWord[]) => Promise<void>;

  getDailyLongRead: (date: string) => Promise<DailyLongReadEntry | undefined>;
  setDailyLongRead: (date: string, data: Omit<DailyLongReadEntry, 'date'>) => Promise<void>;

  roadmaps: Roadmap[];
  isLoadingRoadmaps: boolean;
  addRoadmap: (roadmap: Omit<Roadmap, 'id' | 'createdAt'>) => Promise<void>;
  updateRoadmap: (id: string, roadmap: Partial<Roadmap>) => Promise<void>;
  deleteRoadmap: (id: string) => Promise<void>;
  toggleRoadmapStatus: (id: string) => Promise<void>;
  refreshRoadmaps: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | null>(null);

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
};

// Map Supabase row → admin Snippet type
function mapSnippet(row: any): Snippet {
  return {
    id: row.id,
    title: row.title,
    category: row.topic,
    imageUrl: row.image_url || '',
    body: row.content,
    quiz: { questions: Array.isArray(row.quiz) ? row.quiz : [] },
    status: row.status || 'draft',
    createdAt: row.created_at,
  };
}

// Map admin Snippet → Supabase columns
function snippetToRow(s: Omit<Snippet, 'id' | 'createdAt'>) {
  return {
    title: s.title,
    topic: s.category,
    image_url: s.imageUrl,
    content: s.body,
    example: '',
    quiz: s.quiz?.questions || [],
    status: s.status,
    updated_at: new Date().toISOString(),
  };
}

// Map Supabase row → admin Roadmap type
function mapRoadmap(row: any): Roadmap {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    coverImage: row.cover_image || '',
    description: row.description,
    units: Array.isArray(row.units) ? row.units : [],
    status: row.status || 'draft',
    createdAt: row.created_at,
  };
}

// Map admin Roadmap → Supabase columns
function roadmapToRow(r: Omit<Roadmap, 'id' | 'createdAt'>) {
  return {
    title: r.title,
    category: r.category,
    cover_image: r.coverImage,
    description: r.description,
    units: r.units || [],
    snippet_count: r.units?.length || 0,
    status: r.status,
    updated_at: new Date().toISOString(),
  };
}

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [isLoadingSnippets, setIsLoadingSnippets] = useState(false);
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [isLoadingRoadmaps, setIsLoadingRoadmaps] = useState(false);

  const login = (email: string, password: string) => {
    if (email && password) { setIsLoggedIn(true); return true; }
    return false;
  };
  const logout = () => setIsLoggedIn(false);

  // ── Snippets ──────────────────────────────────────────────
  const fetchSnippets = async () => {
    setIsLoadingSnippets(true);
    try {
      const { data, error } = await supabase
        .from('snippets')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setSnippets((data || []).map(mapSnippet));
    } catch (err) {
      console.error('Error fetching snippets:', err);
    } finally {
      setIsLoadingSnippets(false);
    }
  };

  const addSnippet = async (s: Omit<Snippet, 'id' | 'createdAt'>) => {
    const { data, error } = await supabase
      .from('snippets')
      .insert(snippetToRow(s))
      .select()
      .single();
    if (error) { console.error(error); throw error; }
    setSnippets(prev => [mapSnippet(data), ...prev]);
  };

  const updateSnippet = async (id: string, s: Partial<Snippet>) => {
    const row: any = {};
    if (s.title !== undefined) row.title = s.title;
    if (s.category !== undefined) row.topic = s.category;
    if (s.imageUrl !== undefined) row.image_url = s.imageUrl;
    if (s.body !== undefined) row.content = s.body;
    if (s.quiz !== undefined) row.quiz = s.quiz?.questions || [];
    if (s.status !== undefined) row.status = s.status;
    row.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('snippets')
      .update(row)
      .eq('id', id)
      .select()
      .single();
    if (error) { console.error(error); throw error; }
    setSnippets(prev => prev.map(sn => sn.id === id ? mapSnippet(data) : sn));
  };

  const deleteSnippet = async (id: string) => {
    const { error } = await supabase.from('snippets').delete().eq('id', id);
    if (error) { console.error(error); throw error; }
    setSnippets(prev => prev.filter(s => s.id !== id));
  };

  const toggleSnippetStatus = async (id: string) => {
    const sn = snippets.find(s => s.id === id);
    if (!sn) return;
    await updateSnippet(id, { status: sn.status === 'draft' ? 'published' : 'draft' });
  };

  // ── Roadmaps ──────────────────────────────────────────────
  const fetchRoadmaps = async () => {
    setIsLoadingRoadmaps(true);
    try {
      const { data, error } = await supabase
        .from('roadmaps')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setRoadmaps((data || []).map(mapRoadmap));
    } catch (err) {
      console.error('Error fetching roadmaps:', err);
    } finally {
      setIsLoadingRoadmaps(false);
    }
  };

  const addRoadmap = async (r: Omit<Roadmap, 'id' | 'createdAt'>) => {
    const { data, error } = await supabase
      .from('roadmaps')
      .insert(roadmapToRow(r))
      .select()
      .single();
    if (error) { console.error(error); throw error; }
    setRoadmaps(prev => [mapRoadmap(data), ...prev]);
  };

  const updateRoadmap = async (id: string, r: Partial<Roadmap>) => {
    const existing = roadmaps.find(rm => rm.id === id);
    if (!existing) return;
    const merged = { ...existing, ...r };
    const row = roadmapToRow(merged as Omit<Roadmap, 'id' | 'createdAt'>);
    const { data, error } = await supabase
      .from('roadmaps')
      .update(row)
      .eq('id', id)
      .select()
      .single();
    if (error) { console.error(error); throw error; }
    setRoadmaps(prev => prev.map(rm => rm.id === id ? mapRoadmap(data) : rm));
  };

  const deleteRoadmap = async (id: string) => {
    const { error } = await supabase.from('roadmaps').delete().eq('id', id);
    if (error) { console.error(error); throw error; }
    setRoadmaps(prev => prev.filter(r => r.id !== id));
  };

  const toggleRoadmapStatus = async (id: string) => {
    const rm = roadmaps.find(r => r.id === id);
    if (!rm) return;
    await updateRoadmap(id, { status: rm.status === 'draft' ? 'published' : 'draft' });
  };

  // ── Daily content — persisted to Supabase daily_content table ────────────
  // Table: daily_content (date text, type text, data jsonb, PRIMARY KEY (date, type))
  const getDailyQuiz = async (date: string): Promise<Quiz | undefined> => {
    const { data } = await supabase
      .from('daily_content')
      .select('data')
      .eq('date', date)
      .eq('type', 'quiz')
      .single();
    return data?.data as Quiz | undefined;
  };
  const setDailyQuiz = async (date: string, quiz: Quiz) => {
    await supabase.from('daily_content').upsert({ date, type: 'quiz', data: quiz }, { onConflict: 'date,type' });
  };
  const getDailyVocab = async (date: string): Promise<VocabWord[] | undefined> => {
    const { data } = await supabase
      .from('daily_content')
      .select('data')
      .eq('date', date)
      .eq('type', 'vocab')
      .single();
    return data?.data as VocabWord[] | undefined;
  };
  const setDailyVocab = async (date: string, words: VocabWord[]) => {
    await supabase.from('daily_content').upsert({ date, type: 'vocab', data: words }, { onConflict: 'date,type' });
  };
  const getDailyLongRead = async (date: string): Promise<DailyLongReadEntry | undefined> => {
    const { data } = await supabase
      .from('daily_content')
      .select('data')
      .eq('date', date)
      .eq('type', 'longread')
      .single();
    return data ? { ...(data.data as any), date } : undefined;
  };
  const setDailyLongRead = async (date: string, payload: Omit<DailyLongReadEntry, 'date'>) => {
    await supabase.from('daily_content').upsert({ date, type: 'longread', data: payload }, { onConflict: 'date,type' });
  };

  // Fetch on mount
  useEffect(() => {
    fetchSnippets();
    fetchRoadmaps();
  }, []);

  return (
    <AdminContext.Provider value={{
      isLoggedIn, login, logout,
      snippets, isLoadingSnippets, addSnippet, updateSnippet, deleteSnippet,
      toggleSnippetStatus, refreshSnippets: fetchSnippets,
      getDailyQuiz, setDailyQuiz,
      getDailyVocab, setDailyVocab,
      getDailyLongRead, setDailyLongRead,
      roadmaps, isLoadingRoadmaps, addRoadmap, updateRoadmap, deleteRoadmap,
      toggleRoadmapStatus, refreshRoadmaps: fetchRoadmaps,
    }}>
      {children}
    </AdminContext.Provider>
  );
};
