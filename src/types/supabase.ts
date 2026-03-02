export type Database = {
  public: {
    Tables: {
      sessions: {
        Row: {
          id: string
          admin_id: string
          pin: string
          current_slide_index: number
          current_state: 'SLIDE_CONTENT' | 'POLL_ACTIVE' | 'BROKEN_TELEPHONE' | 'AI_PROMPT_BUILDER' | 'RAG_VISUALIZER' | 'AGENT_SIMULATOR' | 'END_SESSION'
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          admin_id: string
          pin: string
          current_slide_index?: number
          current_state?: 'SLIDE_CONTENT' | 'POLL_ACTIVE' | 'BROKEN_TELEPHONE' | 'AI_PROMPT_BUILDER' | 'RAG_VISUALIZER' | 'AGENT_SIMULATOR' | 'END_SESSION'
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          admin_id?: string
          pin?: string
          current_slide_index?: number
          current_state?: 'SLIDE_CONTENT' | 'POLL_ACTIVE' | 'BROKEN_TELEPHONE' | 'AI_PROMPT_BUILDER' | 'RAG_VISUALIZER' | 'AGENT_SIMULATOR' | 'END_SESSION'
          is_active?: boolean
          created_at?: string
        }
      }
      participants: {
        Row: {
          id: string
          session_id: string
          name: string
          email: string | null
          joined_at: string
        }
        Insert: {
          id?: string
          session_id: string
          name: string
          email?: string | null
          joined_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          name?: string
          email?: string | null
          joined_at?: string
        }
      }
      questions: {
        Row: {
          id: string
          slide_index: number
          question_type: 'MULTIPLE_CHOICE' | 'OPEN_TEXT' | 'BROKEN_TELEPHONE'
          question_text: string
          options: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          slide_index: number
          question_type?: 'MULTIPLE_CHOICE' | 'OPEN_TEXT' | 'BROKEN_TELEPHONE'
          question_text: string
          options?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          slide_index?: number
          question_type?: 'MULTIPLE_CHOICE' | 'OPEN_TEXT' | 'BROKEN_TELEPHONE'
          question_text?: string
          options?: string[] | null
          created_at?: string
        }
      }
      answers: {
        Row: {
          id: string
          session_id: string
          question_id: string
          participant_id: string
          answer_text: string
          answered_at: string
        }
        Insert: {
          id?: string
          session_id: string
          question_id: string
          participant_id: string
          answer_text: string
          answered_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          question_id?: string
          participant_id?: string
          answer_text?: string
          answered_at?: string
        }
      }
      qa_messages: {
        Row: {
          id: string
          session_id: string
          participant_id: string
          message: string
          is_resolved: boolean
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          participant_id: string
          message: string
          is_resolved?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          participant_id?: string
          message?: string
          is_resolved?: boolean
          created_at?: string
        }
      }
    }
  }
}
