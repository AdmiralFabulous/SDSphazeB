import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase';

/**
 * GET /api/auth/callback
 *
 * Handles authentication callback from Supabase after magic link click or OAuth redirect.
 * Exchanges the authorization code for a session and sets secure cookies.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const error_description = requestUrl.searchParams.get('error_description');

  // Handle OAuth/magic link errors
  if (error) {
    console.error('Auth error:', error, error_description);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error_description || error)}`, requestUrl.origin)
    );
  }

  // No code provided - redirect to login
  if (!code) {
    return NextResponse.redirect(new URL('/login', requestUrl.origin));
  }

  const supabase = await createRouteHandlerClient();

  try {
    // Exchange code for session
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('Code exchange error:', exchangeError);
      return NextResponse.redirect(
        new URL('/login?error=auth_failed', requestUrl.origin)
      );
    }

    if (!data.user) {
      console.error('No user data returned after code exchange');
      return NextResponse.redirect(
        new URL('/login?error=no_user_data', requestUrl.origin)
      );
    }

    // Check if user record exists in the users table
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', data.user.id)
      .single();

    // Create user record if it doesn't exist
    if (!existingUser) {
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.user_metadata?.full_name || null,
          avatar_url: data.user.user_metadata?.avatar_url || null,
        });

      if (insertError) {
        console.error('Error creating user record:', insertError);
        // Continue with login even if user record creation fails
        // The user is authenticated, just the database record failed
      }
    }

    // Check for pending session to claim
    const pendingSessionId = requestUrl.searchParams.get('session_id');
    if (pendingSessionId) {
      const { error: updateError } = await supabase
        .from('sessions')
        .update({ user_id: data.user.id })
        .eq('id', pendingSessionId)
        .is('user_id', null);

      if (updateError) {
        console.error('Error claiming pending session:', updateError);
        // Continue with redirect even if session claiming fails
      }
    }

    // Redirect to dashboard or intended destination
    const redirectTo = requestUrl.searchParams.get('redirect') || '/dashboard';
    return NextResponse.redirect(new URL(redirectTo, requestUrl.origin));

  } catch (err) {
    console.error('Callback error:', err);
    return NextResponse.redirect(
      new URL('/login?error=unexpected', requestUrl.origin)
    );
  }
}
