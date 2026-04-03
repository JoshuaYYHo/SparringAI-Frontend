// src/screens/session/SessionDetailScreen.tsx
// Hero video layout with pull-up details and share button

import React, { useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    SafeAreaView,
    StatusBar,
    Dimensions,
    Share,
    Platform,
    NativeScrollEvent,
    NativeSyntheticEvent,
    PanResponder,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { Colors } from '../../theme/colors';
import ScoreBadge from '../../components/common/ScoreBadge';
import {
    ChevronLeft,
    ChevronUp,
    Play,
    Brain,
    CheckCircle,
    BarChart2,
    Share2,
} from 'lucide-react-native';
import { usePullToRefreshMascot, PullToRefreshMascot } from '../../components/common/PullToRefreshMascot';

type Props = NativeStackScreenProps<RootStackParamList, 'SessionDetail'>;

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
// Video takes most of the screen minus space for the info bar (~160px) and status bar
const INFO_BAR_H = 160;
const VIDEO_H = SCREEN_H - INFO_BAR_H;

const MOCK_STATS = [
    { label: 'Punch volumes and types thrown', you: '142 (Mix)', opp: '98 (Heavy)' },
    { label: 'Punch accuracy', you: '68%', opp: '45%' },
    { label: 'Balance and stance stability', you: 'Solid', opp: 'Poor' },
    { label: 'Distance Management', you: 'Excellent', opp: 'Fair' },
    { label: 'Foot Positioning', you: 'Active', opp: 'Flat' },
    { label: 'Torso Positioning', you: 'Upright', opp: 'Leaning' },
    { label: 'Head Positioning', you: 'Off-center', opp: 'Static' },
    { label: 'Arm Guard Positioning', you: 'High', opp: 'Dropped' },
];

const SCROLL_THRESHOLD = 30; // px scrolled before hint fades out

const SessionDetailScreen: React.FC<Props> = ({ navigation, route }) => {
    const { session } = route.params;
    const circle = session.userCircle || null;
    const analysisReady = !!session.analysisText;

    const { scrollY, spinValue, handleScroll } = usePullToRefreshMascot();

    const pullScale = scrollY.interpolate({
        inputRange: [-60, 0],
        outputRange: [1.05, 1],
        extrapolate: 'clamp',
    });

    const pullHintOpacity = scrollY.interpolate({
        inputRange: [0, SCROLL_THRESHOLD],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });



    const date = new Date(session.date);
    const dateStr = date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out my sparring session: "${session.title}" — I scored ${session.score}/100! 🥊`,
            });
        } catch (_) {
            // User cancelled or share failed
        }
    };

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" />

            <PullToRefreshMascot scrollY={scrollY} spinValue={spinValue} topOffset={40} />

            <Animated.View style={[styles.elasticContainer]}>
                <Animated.ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    bounces={true}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                >

                    {/* ── Hero Video ────────────────────────────────────────── */}
                    <Animated.View style={[styles.heroSection, { transform: [{ scale: pullScale }] }]}>
                        <View style={styles.videoPlaceholder}>
                            <View style={styles.playIconWrapper}>
                                <Play size={48} color={Colors.white} fill={Colors.white} />
                            </View>

                            {/* SVG circle overlay */}
                            <Svg
                                style={StyleSheet.absoluteFillObject}
                                width={SCREEN_W}
                                height={VIDEO_H}
                                pointerEvents="none"
                            >
                                {circle && (
                                    <Circle
                                        cx={circle.x}
                                        cy={circle.y}
                                        r={circle.radius}
                                        stroke={Colors.primary.default}
                                        strokeWidth={3}
                                        fill="rgba(255,0,0,0.12)"
                                        strokeDasharray="8 4"
                                    />
                                )}
                            </Svg>
                        </View>

                        {/* Floating navbar over video */}
                        <SafeAreaView style={styles.floatingNav}>
                            <View style={styles.floatingNavRow}>
                                <TouchableOpacity
                                    onPress={() => navigation.goBack()}
                                    style={styles.navBtn}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <ChevronLeft size={26} color={Colors.white} />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={handleShare}
                                    style={styles.navBtn}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Share2 size={22} color={Colors.white} />
                                </TouchableOpacity>
                            </View>
                        </SafeAreaView>

                        {/* Gradient fade at bottom of video */}
                        <View style={styles.videoGradient} />
                    </Animated.View>

                    {/* ── Session Info Bar ──────────────────────────────────── */}
                    <View style={styles.infoBar}>
                        <View style={styles.infoContent}>
                            <View style={styles.infoLeft}>
                                <Text style={styles.sessionTitle} numberOfLines={1}>{session.title}</Text>
                                <Text style={styles.sessionDate}>{dateStr}</Text>
                            </View>
                            <ScoreBadge score={session.score} size="lg" />
                        </View>

                        {/* Pull-up arrow hint */}
                        <Animated.View style={[styles.pullHint, { opacity: pullHintOpacity }]}>
                            <ChevronUp size={20} color={Colors.text.muted} />
                            <Text style={styles.pullHintText}>Swipe up for details</Text>
                        </Animated.View>
                    </View>

                    {/* ── Details (revealed on scroll) ─────────────────────── */}
                    <View style={styles.detailsSection}>
                        {/* Analysis CTA if not ready */}
                        {!analysisReady && (
                            <View style={styles.analysisCta}>
                                <View style={styles.analysisCtaInner}>
                                    <Brain size={28} color={Colors.secondary.default} />
                                    <Text style={styles.analysisCtaTitle}>AI Analysis Pending</Text>
                                    <Text style={styles.analysisCtaSub}>
                                        We're preparing your analysis. This normally takes a few seconds.
                                    </Text>
                                </View>
                            </View>
                        )}

                        {/* Analysis Result */}
                        {analysisReady && (
                            <>
                                {/* Full text analysis */}
                                <View style={styles.card}>
                                    <View style={styles.cardHeader}>
                                        <Brain size={18} color={Colors.secondary.default} />
                                        <Text style={styles.cardTitle}>AI Analysis</Text>
                                    </View>
                                    <Text style={styles.analysisText}>{session.analysisText}</Text>
                                </View>

                                {/* Bullet improvements */}
                                {session.bulletPoints && session.bulletPoints.length > 0 && (
                                    <View style={styles.card}>
                                        <View style={styles.cardHeader}>
                                            <CheckCircle size={18} color={Colors.primary.default} />
                                            <Text style={styles.cardTitle}>Areas to Improve</Text>
                                        </View>
                                        <View style={styles.bulletList}>
                                            {session.bulletPoints.map((point, i) => (
                                                <View key={i} style={styles.bulletRow}>
                                                    <View style={styles.bulletDot} />
                                                    <Text style={styles.bulletText}>{point}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                )}

                                {/* Statistics */}
                                <View style={styles.card}>
                                    <View style={styles.cardHeader}>
                                        <BarChart2 size={18} color={Colors.secondary.default} />
                                        <Text style={styles.cardTitle}>Statistics</Text>
                                    </View>

                                    <View style={styles.statsHeader}>
                                        <Text style={[styles.statsHeaderText, { flex: 2 }]}></Text>
                                        <Text style={styles.statsHeaderText}>You</Text>
                                        <Text style={styles.statsHeaderText}>Opponent</Text>
                                    </View>

                                    <View style={styles.statsList}>
                                        {MOCK_STATS.map((stat, i) => (
                                            <View key={i} style={styles.statRow}>
                                                <Text style={styles.statLabel}>{stat.label}</Text>
                                                <Text style={styles.statValueYou}>{stat.you}</Text>
                                                <Text style={styles.statValueOpp}>{stat.opp}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            </>
                        )}

                        <View style={{ height: 40 }} />
                    </View>
                </Animated.ScrollView>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.dark.bg },
    elasticContainer: { flex: 1 },

    scroll: { flex: 1 },
    scrollContent: { flexGrow: 1, position: 'relative' },

    // Ghosts
    topGhostWrapper: {
        position: 'absolute',
        top: -60,
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 5,
    },
    bottomGhostWrapper: {
        position: 'absolute',
        bottom: -90,
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 5,
    },

    // ── Hero ──────────────────────────────────────────────────
    heroSection: {
        width: SCREEN_W,
        height: VIDEO_H,
        position: 'relative',
    },
    videoPlaceholder: {
        width: SCREEN_W,
        height: VIDEO_H,
        backgroundColor: '#0D0D0D',
        alignItems: 'center',
        justifyContent: 'center',
    },
    playIconWrapper: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.12)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Floating nav
    floatingNav: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    floatingNavRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    navBtn: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: 'rgba(0,0,0,0.45)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Gradient at bottom of video
    videoGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        backgroundColor: 'transparent',
        // Simulated gradient via shadow
        borderTopWidth: 0,
    },

    // ── Info Bar ──────────────────────────────────────────────
    infoBar: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 12,
        backgroundColor: Colors.dark.bg,
    },
    infoContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    infoLeft: {
        flex: 1,
        marginRight: 16,
    },
    sessionTitle: {
        color: Colors.text.primary,
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 4,
    },
    sessionDate: {
        color: Colors.text.muted,
        fontSize: 13,
    },

    // Pull-up hint
    pullHint: {
        alignItems: 'center',
        marginTop: 14,
        gap: 2,
        opacity: 0.5,
    },
    pullHintText: {
        color: Colors.text.muted,
        fontSize: 11,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },

    // ── Details ──────────────────────────────────────────────
    detailsSection: {
        backgroundColor: Colors.dark.bg,
    },

    // Analysis CTA
    analysisCta: {
        padding: 16,
    },
    analysisCtaInner: {
        backgroundColor: Colors.dark.card,
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: Colors.secondary.dark,
    },
    analysisCtaTitle: {
        color: Colors.text.primary,
        fontSize: 18,
        fontWeight: '700',
        marginTop: 4,
    },
    analysisCtaSub: {
        color: Colors.text.secondary,
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },

    // Cards
    card: {
        backgroundColor: Colors.dark.card,
        borderRadius: 20,
        padding: 20,
        margin: 16,
        marginBottom: 0,
        borderWidth: 1,
        borderColor: Colors.dark.border,
        gap: 14,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    cardTitle: {
        color: Colors.text.primary,
        fontSize: 16,
        fontWeight: '700',
    },
    analysisText: {
        color: Colors.text.secondary,
        fontSize: 14,
        lineHeight: 22,
    },

    // Bullets
    bulletList: {
        gap: 12,
    },
    bulletRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
    },
    bulletDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.primary.default,
        marginTop: 6,
        flexShrink: 0,
    },
    bulletText: {
        flex: 1,
        color: Colors.text.secondary,
        fontSize: 14,
        lineHeight: 21,
    },

    // Stats
    statsHeader: {
        flexDirection: 'row',
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: Colors.dark.border,
        marginTop: 4,
    },
    statsHeaderText: {
        flex: 1,
        color: Colors.text.muted,
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    statsList: {
        gap: 12,
        marginTop: 8,
    },
    statRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    statLabel: {
        flex: 2,
        color: Colors.text.primary,
        fontSize: 13,
        paddingRight: 8,
    },
    statValueYou: {
        flex: 1,
        color: Colors.primary.default,
        fontSize: 13,
        fontWeight: '600',
    },
    statValueOpp: {
        flex: 1,
        color: Colors.text.secondary,
        fontSize: 13,
        fontWeight: '500',
    },
});

export default SessionDetailScreen;
