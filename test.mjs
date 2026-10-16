import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jaxzhajwycysazovcnro.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpheHpoYWp3eWN5c2F6b3ZjbnJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxMzkyOTIsImV4cCI6MjEwMDcxNTI5Mn0.dOVQym97-1Op9ppFb8aQf_7bPYqL5c7zVlC1G7IyfwE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInsert() {
  console.log("Testing insert into cloud_cafes...");
  const { data, error } = await supabase.from('cloud_cafes').insert([{
    cafe_name: 'Test Cafe',
    cafe_unique_id: 'TEST-002',
    longitude: 0,
    latitude: 0,
    area: 'Test',
    city: 'Test',
    state: 'Test',
    pin_code: '000000',
    status: 'closed'
  }]).select().single();

  if (error) {
    console.error("Insert Error:", error);
  } else {
    console.log("Insert Success:", data);
  }
}

testInsert();
