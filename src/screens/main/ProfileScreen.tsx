// src/screens/main/ProfileScreen.tsx
import React, { useMemo, useCallback, useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, SparringSession } from '../../types';
import { Colors } from '../../theme/colors';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, User } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { usePullToRefreshMascot, PullToRefreshMascot } from '../../components/common/PullToRefreshMascot';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
    const { user } = useApp();
    const [profileName, setProfileName] = useState<string>('');

    const FIGHT_STYLE = "Agile footwork with strong counter-punching. Similar to: Vasyl Lomachenko, Floyd Mayweather, Naoya Inoue.";

    const ALL_TIME_ANALYTICS = [
        { label: 'Punches Thrown', you: '1,245', opp: '1,102' },
        { label: 'Punches Landed', you: '412', opp: '380' },
        { label: 'Guard Drops', you: '14', opp: '18' },
        { label: 'Strike Accuracy', you: '33%', opp: '34%' },
    ];

    const PROFILE_NAME_CACHE_KEY = '@profile_name_cache';

    // Fetch the user's name from the Supabase Profile table
    const fetchProfile = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const { data, error } = await supabase
            .from('Profile')
            .select('name')
            .eq('user_id', session.user.id)
            .single();

        if (data?.name) {
            setProfileName(data.name);
            AsyncStorage.setItem(PROFILE_NAME_CACHE_KEY, data.name).catch(() => {});
        }
    };

    const { scrollY, spinValue, handleScroll } = usePullToRefreshMascot(fetchProfile);

    const handleBack = () => navigation.goBack();

    useEffect(() => {
        const loadCache = async () => {
            try {
                const cached = await AsyncStorage.getItem(PROFILE_NAME_CACHE_KEY);
                if (cached) {
                    setProfileName(cached);
                }
            } catch (e) {
                // ignore cache read errors
            }
        };
        loadCache();
        fetchProfile();
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <SafeAreaView style={styles.safeTop}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.7}>
                        <ArrowLeft size={24} color={Colors.text.primary} />
                    </TouchableOpacity>
                    <Text style={styles.navTitle}>Profile</Text>
                </View>

            </SafeAreaView>

            <PullToRefreshMascot scrollY={scrollY} spinValue={spinValue} topOffset={100} />

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                bounces={true}
                onScroll={handleScroll}
                scrollEventThrottle={16}
            >
                {/* Fighter Info Card */}
                <View style={styles.fighterCard}>
                    <View style={styles.avatarWrap}>
                        <User size={40} color={Colors.text.secondary} />
                    </View>
                    <Text style={styles.fighterName}>{profileName || user?.name || "Fighter"}</Text>

                    <View style={styles.statsBox}>
                        <Text style={styles.statsTitle}>Fight Style & Comparisons</Text>
                        <Text style={styles.statsDesc}>
                            {FIGHT_STYLE}
                        </Text>
                    </View>

                    <View style={[styles.statsBox, { marginTop: 16 }]}>
                        <Text style={styles.statsTitle}>All-Time Analytics</Text>
                        <View style={styles.analyticsHeader}>
                            <Text style={[styles.analyticsHeaderText, { flex: 2 }]}></Text>
                            <Text style={styles.analyticsHeaderText}>You</Text>
                            <Text style={styles.analyticsHeaderText}>All Opps</Text>
                        </View>
                        <View style={styles.analyticsList}>
                            {ALL_TIME_ANALYTICS.map((stat, i) => (
                                <View key={i} style={styles.analyticsRow}>
                                    <Text style={styles.analyticsLabel}>{stat.label}</Text>
                                    <Text style={styles.analyticsValueYou}>{stat.you}</Text>
                                    <Text style={styles.analyticsValueOpp}>{stat.opp}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
            </ScrollView>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.dark.bg,
    },
    safeTop: {
        backgroundColor: Colors.dark.bg,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.dark.border,
    },
    backBtn: {
        position: 'absolute',
        left: 16,
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
    navTitle: {
        color: Colors.text.primary,
        fontSize: 18,
        fontWeight: '600',
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    fighterCard: {
        backgroundColor: Colors.dark.surface,
        margin: 16,
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.dark.border,
    },
    avatarWrap: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.dark.border,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    fighterName: {
        color: Colors.text.primary,
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 20,
    },
    statsBox: {
        width: '100%',
        backgroundColor: Colors.dark.bg,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.dark.border,
    },
    statsTitle: {
        color: Colors.text.primary,
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 8,
    },
    statsDesc: {
        color: Colors.text.secondary,
        fontSize: 14,
        lineHeight: 20,
    },
    analyticsHeader: {
        flexDirection: 'row',
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: Colors.dark.border,
        marginTop: 4,
    },
    analyticsHeaderText: {
        flex: 1,
        color: Colors.text.muted,
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    analyticsList: {
        gap: 12,
        marginTop: 8,
    },
    analyticsRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    analyticsLabel: {
        flex: 2,
        color: Colors.text.primary,
        fontSize: 13,
        paddingRight: 8,
    },
    analyticsValueYou: {
        flex: 1,
        color: Colors.primary.default,
        fontSize: 13,
        fontWeight: '600',
    },
    analyticsValueOpp: {
        flex: 1,
        color: Colors.text.secondary,
        fontSize: 13,
        fontWeight: '500',
    },
    sectionHeader: {
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 14,
    },
    sectionTitle: {
        color: Colors.text.primary,
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 2,
    },
    sectionSub: {
        color: Colors.text.muted,
        fontSize: 13,
    },
    topSessionsContainer: {
        marginBottom: 16,
    },
});

export default ProfileScreen;
