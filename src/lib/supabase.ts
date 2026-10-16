import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jaxzhajwycysazovcnro.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpheHpoYWp3eWN5c2F6b3ZjbnJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxMzkyOTIsImV4cCI6MjEwMDcxNTI5Mn0.dOVQym97-1Op9ppFb8aQf_7bPYqL5c7zVlC1G7IyfwE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
