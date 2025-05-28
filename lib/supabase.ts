import { createClient } from "@supabase/supabase-js"

// For server components
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, supabaseKey)
}

// For client components
let supabaseClient: ReturnType<typeof createClient> | null = null

export const getSupabaseClient = () => {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    supabaseClient = createClient(supabaseUrl, supabaseKey)
  }
  return supabaseClient
}

export type Database = {
  public: {
    Tables: {
      crossword_submissions: {
        Row: {
          id: string
          student_name: string | null
          crossword_answers: Record<string, string>
          essay: string
          score: number | null
          submitted_at: string
        }
        Insert: {
          id?: string
          student_name?: string | null
          crossword_answers: Record<string, string>
          essay: string
          score?: number | null
          submitted_at?: string
        }
        Update: {
          id?: string
          student_name?: string | null
          crossword_answers?: Record<string, string>
          essay?: string
          score?: number | null
          submitted_at?: string
        }
      }
    }
  }
}
