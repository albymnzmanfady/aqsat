import { createClient } from '@supabase/supabase-js';

// Use service_role key for server-side operations (bypasses RLS)
// In production, set this as an environment variable
const SUPABASE_URL = "https://vrksblmxjjcvswhledee.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZya3NibG14ampjdnN3aGxlZGVlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Mzk5MDU2NiwiZXhwIjoyMDk5NTY2NTY2fQ.9zH0zQ9zH0zQ9zH0zQ9zH0zQ9zH0zQ9zH0zQ9zH0zQ";

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);