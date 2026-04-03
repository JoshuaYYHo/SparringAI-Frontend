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

import React, { useState } from 'react';
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
import { signInWithGoogle } from '../../services/supabase/googleAuth';
import { useSessionGuard } from '../../services/supabase/useSessionGuard';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {

    // Variables
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);

    // Skip this screen if there is already a session in place
    useSessionGuard(() => navigation.replace('Main'));

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
            await signInWithGoogle();

        } catch (error: any) {
            Alert.alert('Google Sign-In Error', error?.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
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