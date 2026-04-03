// src/services/supabase/useSessionGuard.ts
//
// Shared hook that checks for an active Supabase session
// and navigates away when one is found.
//
// Used by both SplashScreen (one-shot check) and LoginScreen (reactive listener).

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

type NavigateFn = (screen: string) => void;

/**
 * Checks for an existing Supabase session on mount AND listens for new
 * sign-in events. Calls `onSessionFound` whenever a valid session is detected.
 *
 * @returns `checkingSession` — true while the initial session check is in progress.
 */
export function useSessionGuard(onSessionFound: () => void) {
    const [checkingSession, setCheckingSession] = useState(true);

    useEffect(() => {
        let active = true;

        // 1) One-shot check for an existing session (covers app relaunch)
        async function checkExistingSession() {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session && active) {
                    onSessionFound();
                    return;
                }
            } catch (error) {
                console.warn('Session check failed:', error);
            }

            if (active) setCheckingSession(false);
        }

        checkExistingSession();

        // 2) Reactive listener for new sign-ins (covers OAuth / email-password)
        const { data: authListener } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (session && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
                    if (active) onSessionFound();
                }
            }
        );

        return () => {
            active = false;
            authListener?.subscription.unsubscribe();
        };
    }, []);

    return { checkingSession };
}
