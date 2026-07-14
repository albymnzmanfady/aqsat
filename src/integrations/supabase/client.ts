import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://vrksblmxjjcvswhledee.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZya3NibG14ampjdnN3aGxlZGVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5OTA1NjYsImV4cCI6MjA5OTU2NjU2Nn0.ZOmXviMpmBSGVjOYNDKXrT1t5eqTCkkAuIA5EVwvj_Q";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);