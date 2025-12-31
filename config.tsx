import { createClient } from '@supabase/supabase-js';

// --- JDBB Design System Constants ---
export const COLORS = {
  limeCream: '#BCE784',   // Success, Review, Positive
  emerald: '#5DD39E',     // Primary Action, Active
  pacificCyan: '#348AA7', // Info, Timeline, Neutral
  dustyGrape: '#525174',  // Secondary, Admin Structure
  vintageGrape: '#513B56',// Alerts, Overdue, Emphasis
  white: '#FFFFFF',
  textMain: '#1E293B',    // Slate 800
  textLight: '#64748B',   // Slate 500
};

// Database Enums
export const ROLES = {
  ADMIN_TECH: 'admin_technologist',
  ADMIN_INSTRUCTOR: 'admin_instructor',
  MONITOR: 'monitor',
  STUDENT: 'student',
};

// --- Supabase Client Configuration ---

const STORED_URL = localStorage.getItem('jdbb_supabase_url');
const STORED_KEY = localStorage.getItem('jdbb_supabase_key');

// HARDCODED CREDENTIALS
const CODE_URL = 'https://yqptmvtlsjyuxtzaegun.supabase.co';
const CODE_KEY: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxcHRtdnRsc2p5dXh0emFlZ3VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxNDcwODcsImV4cCI6MjA4MjcyMzA4N30.N7jNEZ46E1GvMTLBtm7N494hQqiho-szgvAWchSHvnE';

// Helper to validate URL format
const isValidUrl = (urlString) => {
  try { return Boolean(new URL(urlString)); } catch(e) { return false; }
};

export const activeUrl = isValidUrl(STORED_URL) ? STORED_URL : (isValidUrl(CODE_URL) ? CODE_URL : null);
const activeKey = STORED_KEY || (CODE_KEY !== 'INSERT_YOUR_SUPABASE_ANON_KEY_HERE' ? CODE_KEY : null);

export const isSupabaseConfigured = Boolean(activeUrl && activeKey);

// Safely initialize client
export const supabase = isSupabaseConfigured ? createClient(activeUrl, activeKey) : null;

export const saveConfiguration = (url, key) => {
  localStorage.setItem('jdbb_supabase_url', url);
  localStorage.setItem('jdbb_supabase_key', key);
  window.location.reload();
};

export const clearConfiguration = () => {
  localStorage.removeItem('jdbb_supabase_url');
  localStorage.removeItem('jdbb_supabase_key');
  window.location.reload();
};
