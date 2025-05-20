// app/login/actions.ts
'use server';

import { createServerComponentClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

export async function login(formData: { email: string; password: string }) {
  const cookieStore = await cookies();
  const supabase = await createServerComponentClient();
  
  const { error } = await supabase.auth.signInWithPassword(formData);
  
  if (error) {
    return { error: error.message };
  }

  redirect('/dashboard');
} 