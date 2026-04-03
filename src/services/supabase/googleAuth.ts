import { supabase } from '../../lib/supabase';
import * as WebBrowser from 'expo-web-browser';
import * as QueryParams from 'expo-auth-session/build/QueryParams';

const REDIRECT_URL = 'sparring://google-auth';
/**
 * Extract tokens from the OAuth redirect URL and establish a Supabase session.
 */
async function createSessionFromUrl(url: string) {
    const { params, errorCode } = QueryParams.getQueryParams(url);

    if (errorCode) {
        throw new Error(errorCode);
    }

    const { access_token, refresh_token } = params;

    if (!access_token) return;

    const { error: sessionError } = await supabase.auth.setSession({
        access_token,
        refresh_token,
    });

    if (sessionError) throw sessionError;
}

/**
 * Initiate Google OAuth sign-in via Supabase.
 *
 * Opens an in-app secure browser (ASWebAuthenticationSession on iOS),
 * handles the redirect, and sets the Supabase session on success.
 *
 * @throws Error with a user-friendly message on failure.
 */
export async function signInWithGoogle(): Promise<void> {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: REDIRECT_URL,
            skipBrowserRedirect: true,
            queryParams: {
                prompt: 'select_account',
            },
        },
    });

    if (error) throw error;

    if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(
            data.url,
            REDIRECT_URL,
            { showInRecents: true },
        );

        if (result.type === 'success') {
            await createSessionFromUrl(result.url);
        }
    }
}
