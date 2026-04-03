// src/screens/onboarding/LoginScreen.tsx
//
// Handles both email/password sign-in/sign-up AND Google OAuth.
// This screen is only shown if the user does NOT have an existing
// Supabase session (checked in SplashScreen).
//
// Auth flow overview:
//   1. User enters email + password → handleAuthentication()
//   2. OR user taps "Continue with Google" → handleGoogleSignIn()
//   3. On success, supabase.auth.onAuthStateChange fires → navigates to Main

import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    SafeAreaView,
    Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../theme/colors';

// expo-web-browser: Opens Google OAuth in an in-app secure browser (ASWebAuthenticationSession on iOS)
import * as WebBrowser from 'expo-web-browser';
// QueryParams: Official Supabase-recommended way to parse tokens from OAuth redirect URLs
import * as QueryParams from 'expo-auth-session/build/QueryParams';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Toggle between Sign In and Sign Up modes
    const [isSignUp, setIsSignUp] = useState(false);

    // ── Auth State Listener ────────────────────────────────────────────
    // Supabase fires onAuthStateChange whenever the user signs in or out.
    // When a successful sign-in occurs (from email/password OR Google OAuth),
    // the 'SIGNED_IN' event fires and we navigate to the Main screen.
    // We also check 'INITIAL_SESSION' in case a session was restored from storage.

    // Skip this screen too if there is a session
    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (session && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
                    // Replace (not push) so the user can't swipe back to Login
                    navigation.replace('Main');
                }
            }
        );
        // Cleanup: unsubscribe when LoginScreen unmounts
        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, []);

    // Entry Point for Email/Password Authentication
    async function handleAuthentication() {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password.');
            return;
        }

        setLoading(true);

        if (isSignUp) {
            const { data: { session }, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) {
                Alert.alert('Signup Error', error.message);
            } else if (!session) {
                Alert.alert('Success', 'Please check your inbox for email verification!');
                setIsSignUp(false);
            } else {
                navigation.replace('Main');
            }
        } else {
            const { data: { session }, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                Alert.alert('Login Error', error.message);
            } else if (session) {
                navigation.replace('Main');
            }
        }

        setLoading(false);
    }

    // Entry Point for Google Authentication
    async function handleGoogleSignIn() {
        try {
            setLoading(true);

            // Use the app's scheme directly from app.json (sparring://google-auth)
            // This works because ASWebAuthenticationSession on iOS intercepts 
            // redirects by scheme, regardless of whether it's registered system-wide.
            // The 'sparring://**' entry in Supabase redirect URLs will match this.
            const redirectUrl = 'sparring://google-auth';
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectUrl,
                    skipBrowserRedirect: true,
                    queryParams: {
                        prompt: 'select_account',
                    },
                },
            });

            if (error) throw error;

            if (data?.url) {
                // Open the secure browser to authenticate
                const result = await WebBrowser.openAuthSessionAsync(
                    data.url,
                    redirectUrl,
                    { showInRecents: true },
                );

                if (result.type === 'success') {
                    const { url } = result;
                    await createSessionFromUrl(url);
                }
            }
        } catch (error: any) {
            Alert.alert('Google Sign-In Error', error?.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    }

    // Helper: Extract tokens from the redirect URL and create a Supabase session
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
        // The onAuthStateChange effect will catch the new session and redirect to Main!
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                {/* Header */}
                <View style={styles.headerContainer}>
                    <Text style={styles.title}>
                        {isSignUp ? 'Create Account' : 'Welcome Back'}
                    </Text>
                    <Text style={styles.subtitle}>
                        {isSignUp
                            ? 'Sign up to start your sparring journey.'
                            : 'Sign in to jump back into the action.'}
                    </Text>
                </View>

                {/* Form */}
                <View style={styles.formContainer}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            onChangeText={setEmail}
                            value={email}
                            placeholder="email@address.com"
                            placeholderTextColor={Colors.text.muted}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={styles.input}
                            onChangeText={setPassword}
                            value={password}
                            secureTextEntry={true}
                            placeholder="Your password"
                            placeholderTextColor={Colors.text.muted}
                        />
                    </View>

                    {/* Primary Action Button */}
                    <TouchableOpacity
                        style={[styles.primaryButton, loading && styles.buttonDisabled]}
                        onPress={handleAuthentication}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator color={Colors.white} />
                        ) : (
                            <Text style={styles.primaryButtonText}>
                                {isSignUp ? 'Sign Up' : 'Sign In'}
                            </Text>
                        )}
                    </TouchableOpacity>

                    {/* Divider */}
                    <View style={styles.dividerContainer}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>OR</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Google Auth Button */}
                    <TouchableOpacity
                        style={[styles.googleButton, loading && styles.buttonDisabled]}
                        onPress={handleGoogleSignIn}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        <Image
                            source={require('../../../assets/google-icon.png')}
                            style={styles.googleImage}
                            resizeMode="contain"
                        />
                        <Text style={styles.googleButtonText}>
                            Continue with Google
                        </Text>
                    </TouchableOpacity>

                    {/* Toggle Mode Button */}
                    <View style={styles.toggleContainer}>
                        <Text style={styles.toggleText}>
                            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                        </Text>
                        <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
                            <Text style={styles.toggleActionText}>
                                {isSignUp ? ' Sign In' : ' Sign Up'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.dark.bg,
    },
    container: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
    },
    headerContainer: {
        marginBottom: 40,
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.text.primary,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.text.secondary,
        textAlign: 'center',
    },
    formContainer: {
        width: '100%',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text.secondary,
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        backgroundColor: Colors.dark.surface,
        borderColor: Colors.dark.border,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: Colors.text.primary,
    },
    primaryButton: {
        backgroundColor: Colors.primary.default,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        shadowColor: Colors.primary.default,
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
        elevation: 6,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    primaryButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: Colors.dark.border,
    },
    dividerText: {
        marginHorizontal: 16,
        color: Colors.text.muted,
        fontSize: 14,
        fontWeight: '600',
    },
    googleButton: {
        flexDirection: 'row',
        backgroundColor: Colors.white,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#FFF',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    googleImage: {
        width: 24,
        height: 24,
        marginRight: 12,
    },
    googleButtonText: {
        color: '#000000',
        fontSize: 16,
        fontWeight: '600',
    },
    toggleContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 32,
    },
    toggleText: {
        color: Colors.text.secondary,
        fontSize: 14,
    },
    toggleActionText: {
        color: Colors.primary.default,
        fontSize: 14,
        fontWeight: 'bold',
    },
});