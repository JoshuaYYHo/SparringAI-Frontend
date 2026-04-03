// src/screens/onboarding/SplashScreen.tsx
//
// This is the FIRST screen users see when the app launches.
// It checks if the user already has a valid Supabase session:
//   → If yes: skip the splash animation and go straight to Main.
//   → If no:  play the intro animation, then show a "Get Started" button
//             that navigates to the Login screen.

import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { Colors } from '../../theme/colors';
import { APP_NAME, APP_CAPTION } from '../../constants';
import { ChevronRight } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const SplashScreen: React.FC<Props> = ({ navigation }) => {
    // Track whether we're still checking for an existing session
    const [checkingSession, setCheckingSession] = useState(true);

    // ── Animation values ───────────────────────────────────────────────
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const logoScale = useRef(new Animated.Value(0.75)).current;
    const captionOpacity = useRef(new Animated.Value(0)).current;
    const captionY = useRef(new Animated.Value(20)).current;
    const btnOpacity = useRef(new Animated.Value(0)).current;

    // If the user already has a session
    useEffect(() => {
        async function checkExistingSession() {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                // If they already logged in
                if (session) {
                    navigation.replace('Main');
                    return;
                }
            } catch (error) {
                console.warn('Session check failed:', error);
            }

            // No active session found — show the splash animation
            setCheckingSession(false);
        }

        checkExistingSession();
    }, []);

    // ── Splash Animation ───────────────────────────────────────────────
    // If there is no current session
    useEffect(() => {
        if (checkingSession) return; // Don't animate while still checking

        Animated.sequence([
            // 1) Logo fades in and scales up with a spring bounce
            Animated.parallel([
                Animated.timing(logoOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
                Animated.spring(logoScale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
            ]),
            // 2) Brief pause before the caption
            Animated.delay(200),
            // 3) Caption text slides up and fades in
            Animated.parallel([
                Animated.timing(captionOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
                Animated.timing(captionY, { toValue: 0, duration: 600, useNativeDriver: true }),
            ]),
            // 4) Brief pause before the button
            Animated.delay(300),
            // 5) "Get Started" button fades in
            Animated.timing(btnOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        ]).start();
    }, [checkingSession]);

    // ── Loading state ──────────────────────────────────────────────────
    // While checking for an existing session, show a minimal loading screen
    // so the user doesn't see a flash of the splash animation.
    if (checkingSession) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" />
                <ActivityIndicator size="large" color={Colors.primary.default} />
            </View>
        );
    }

    // ── Splash UI ──────────────────────────────────────────────────────
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* App Logo / Name */}
            <View style={styles.centerContent}>
                <Animated.View style={[styles.logoWrapper, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
                    <Text style={{ color: "white", fontSize: 52, fontWeight: 'bold' }}>{APP_NAME}</Text>
                </Animated.View>

                {/* Tagline / Caption */}
                <Animated.Text
                    style={[
                        styles.caption,
                        { opacity: captionOpacity, transform: [{ translateY: captionY }] },
                    ]}
                >
                    {APP_CAPTION}
                </Animated.Text>
            </View>

            {/* "Get Started" Button — navigates to the Login screen */}
            <Animated.View style={[styles.btnWrapper, { opacity: btnOpacity }]}>
                <TouchableOpacity
                    style={styles.nextBtn}
                    onPress={() => navigation.replace('Login')}
                    activeOpacity={0.85}
                >
                    <Text style={styles.nextLabel}>Get Started</Text>
                    <ChevronRight size={20} color={Colors.white} />
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.dark.bg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerContent: {
        alignItems: 'center',
        gap: 18,
        paddingHorizontal: 32,
    },
    logoWrapper: {
        alignItems: 'center',
        marginBottom: 6,
    },
    caption: {
        color: Colors.text.secondary,
        fontSize: 18,
        fontStyle: 'italic',
        textAlign: 'center',
        letterSpacing: 0.5,
        lineHeight: 26,
    },
    btnWrapper: {
        position: 'absolute',
        bottom: 60,
        width: '100%',
        paddingHorizontal: 32,
    },
    nextBtn: {
        flexDirection: 'row',
        backgroundColor: Colors.primary.default,
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: Colors.primary.default,
        shadowOpacity: 0.5,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 16,
        elevation: 10,
    },
    nextLabel: {
        color: Colors.white,
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
});

export default SplashScreen;
