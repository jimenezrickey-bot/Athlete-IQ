import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tdouxumnbfmitkrdfxix.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkb3V4dW1uYmZtaXRrcmRmeGl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxMjczNjEsImV4cCI6MjA5NTcwMzM2MX0.fcYXd1XSkw1qXpryNzCbnNSDCW5km5i1wur9p_xmtQ0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
