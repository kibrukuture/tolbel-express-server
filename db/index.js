import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const projectKey = process.env.PROJECT_API_URL,
  anonKey = process.env.ANON_API_KEY;
export const supabase = createClient(projectKey, anonKey);
