import React, { useCallback, useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    Alert,
    StatusBar,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, SparringSession } from '../../types';
import { Colors } from '../../theme/colors';
import { useApp } from '../../context/AppContext';
import SessionListItem from '../../components/home/SessionListItem';
import UploadSection from '../../components/home/UploadSection';
import Footer from '../../components/navigation/Footer';
import UpgradeModal from '../../components/common/UpgradeModal';
import { Crown } from 'lucide-react-native';
import { usePullToRefreshMascot, PullToRefreshMascot } from '../../components/common/PullToRefreshMascot';
import { APP_NAME } from '../../constants';
import { getAllSessions } from '../../services/supabase/mainFunctions';

type Props = NativeStackScreenProps<RootStackParamList, 'Main'>;

const MainScreen: React.FC<Props> = ({ navigation }) => {
    const {
        user,
        sessions,
        setSessions,
        canUploadToday,
        upgradePromptVisible,
        setUpgradePromptVisible,
        incrementDailyUpload,
    } = useApp();

    const [loading, setLoading] = useState(true);

    // Fetch sessions from Supabase on mount
    const fetchSessions = useCallback(async () => {
        try {
            setLoading(true);
            const videos = await getAllSessions();

            const mapped: SparringSession[] = videos.map((v) => ({
                id: String(v.video_id),
                title: v.title || 'Sparring Session',
                date: v.created_at || new Date().toISOString(),
                videoUri: v.video_bucket_url || '',
                score: 85, // TODO: extract from ai_analysis / json_dump when available
                analysisText: v.ai_analysis ?? undefined,
                bulletPoints: v.ai_analysis
                    ? ['Review AI analysis for detailed feedback.']
                    : undefined,
            }));

            setSessions(mapped);
        } catch (err) {
            console.warn('Failed to load sessions:', err);
        } finally {
            setLoading(false);
        }
    }, [setSessions]);

    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    // Navigation Callbacks
    const handleUploadAttempt = useCallback(() => {
        if (!canUploadToday()) {
            setUpgradePromptVisible(true);
            return;
        }
        navigation.navigate('SelectVideo');
    }, [canUploadToday, setUpgradePromptVisible, navigation]);

    const handleSessionPress = useCallback((session: SparringSession) => {
        navigation.navigate('SessionDetail', { session });
    }, [navigation]);

    const handleSettings = useCallback(() => {
        navigation.navigate('Settings');
    }, [navigation]);

    const handleProfile = useCallback(() => {
        navigation.navigate('Profile');
    }, [navigation]);

    const isPremium = user?.plan === 'premium';

    // Pull-Down Mascot Animation
    const { scrollY, spinValue, handleScroll } = usePullToRefreshMascot();

    // ── Render ────
    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" />

            <SafeAreaView style={styles.safeTop}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={{ color: "white", fontSize: 26, fontWeight: 'bold' }}>{APP_NAME}</Text>
                    {/* Plan badge — tapping it opens Settings */}
                    <TouchableOpacity
                        style={[styles.planBadge, isPremium ? styles.planPremium : styles.planFree]}
                        onPress={handleSettings}
                        activeOpacity={0.8}
                    >
                        {isPremium && <Crown size={12} color={Colors.warning} style={{ marginRight: 4 }} />}
                        <Text style={[styles.planText, isPremium ? styles.planTextPremium : styles.planTextFree]}>
                            {isPremium ? 'Premium' : 'Free Plan'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <PullToRefreshMascot scrollY={scrollY} spinValue={spinValue} topOffset={100} />

            {/* Session list — bounces={true} enables iOS overscroll which
                drives the mascot animation via onScroll */}
            <FlatList
                data={sessions}
                keyExtractor={item => item.id}
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                bounces={true}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                ListHeaderComponent={
                    <>
                        {/* Upload Section */}
                        <UploadSection onUpload={handleUploadAttempt} />

                        {/* Section title */}
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Sessions</Text>
                        </View>
                    </>
                }
                renderItem={({ item }) => (
                    <SessionListItem
                        session={item}
                        onPress={() => handleSessionPress(item)}
                    />
                )}
                ListEmptyComponent={
                    <View style={styles.emptyWrapper}>
                        {loading ? (
                            <ActivityIndicator size="large" color={Colors.primary.default} />
                        ) : (
                            <>
                                <Text style={styles.emptyText}>No sessions yet.</Text>
                                <Text style={styles.emptySubText}>Upload your first sparring session above!</Text>
                            </>
                        )}
                    </View>
                }
            />

            {/* Footer navigation bar */}
            <Footer onUpload={handleUploadAttempt} onSettings={handleSettings} onProfile={handleProfile} />

            {/* Upgrade Modal — shown when free users exceed daily upload limit */}
            <UpgradeModal
                visible={upgradePromptVisible}
                onClose={() => setUpgradePromptVisible(false)}
                onUpgrade={() => {
                    setUpgradePromptVisible(false);
                    Alert.alert('Upgrade', 'Connect your payment provider (e.g. RevenueCat) to enable premium.');
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: Colors.dark.bg,
    },
    safeTop: {
        backgroundColor: Colors.dark.bg,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    planBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderWidth: 1,
    },
    planFree: {
        borderColor: Colors.dark.border,
        backgroundColor: Colors.dark.card,
    },
    planPremium: {
        borderColor: Colors.warning,
        backgroundColor: 'rgba(250,204,21,0.10)',
    },
    planText: {
        fontSize: 12,
        fontWeight: '600',
    },
    planTextFree: {
        color: Colors.text.secondary,
    },
    planTextPremium: {
        color: Colors.warning,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    sectionHeader: {
        paddingHorizontal: 20,
        paddingTop: 28,
        paddingBottom: 14,
    },
    sectionTitle: {
        color: Colors.text.primary,
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 2,
    },
    emptyWrapper: {
        alignItems: 'center',
        paddingTop: 40,
        gap: 10,
    },
    emptyText: {
        color: Colors.text.secondary,
        fontSize: 16,
        fontWeight: '600',
    },
    emptySubText: {
        color: Colors.text.muted,
        fontSize: 14,
    },
});

export default MainScreen;
