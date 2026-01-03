// This file will be generated from your Supabase project
// Run: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > client/src/lib/database.types.ts
// For now, using a placeholder type

export type Database = {
  public: {
    Tables: {
      transactions: {
        Row: {
          id: string
          user_id: string
          title: string
          amount: string
          category: string
          subcategory: string | null
          date: string
          month: string
          year: string
          notes: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          amount: string
          category: string
          subcategory?: string | null
          date: string
          month: string
          year: string
          notes?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          amount?: string
          category?: string
          subcategory?: string | null
          date?: string
          month?: string
          year?: string
          notes?: string | null
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          name: string
          target_amount: string
          current_amount: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          target_amount: string
          current_amount: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          target_amount?: string
          current_amount?: string
        }
      }
      users: {
        Row: {
          id: string
          username: string
          password: string
        }
        Insert: {
          id?: string
          username: string
          password: string
        }
        Update: {
          id?: string
          username?: string
          password?: string
        }
      }
    }
  }
}

