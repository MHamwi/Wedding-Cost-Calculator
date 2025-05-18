import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create a dummy client if environment variables are not available
let supabase: any

if (supabaseUrl && supabaseAnonKey) {
  // Create a single supabase client for interacting with your database
  supabase = createClient(supabaseUrl, supabaseAnonKey)
} else {
  // Create a mock client that doesn't throw errors but logs warnings
  console.warn('Supabase environment variables not found. Using mock client.')
  supabase = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: () => ({ data: null, error: null, subscription: { unsubscribe: () => {} } }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null }),
          limit: () => Promise.resolve({ data: [], error: null }),
        }),
      }),
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => Promise.resolve({ data: null, error: null }),
      delete: () => Promise.resolve({ data: null, error: null }),
    }),
  }
}

export { supabase }
