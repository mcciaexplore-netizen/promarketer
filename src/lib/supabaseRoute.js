import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const getSupabaseRoute = () => createRouteHandlerClient({ cookies })
