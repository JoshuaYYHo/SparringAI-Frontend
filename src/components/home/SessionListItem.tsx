// src/components/home/SessionListItem.tsx
// YouTube-style session card with video thumbnail skeleton

import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Image } from 'react-native';
import { SparringSession } from '../../types';
import { Colors } from '../../theme/colors';
import ScoreBadge from '../common/ScoreBadge';
import { ChevronRight, Play } from 'lucide-react-native';

interface Props {
    session: SparringSession;
    onPress: () => void;
}

const SessionListItem: React.FC<Props> = ({ session, onPress }) => {
    const date = new Date(session.date);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const hasThumbnail = !!session.thumbnailUri;

    return (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.75}>
            {/* Video Thumbnail (YouTube-style) */}
            <View style={styles.thumbnailWrapper}>
                {hasThumbnail ? (
                    <Image
                        source={{ uri: session.thumbnailUri }}
                        style={styles.thumbnailImage}
                        resizeMode="cover"
                    />
                ) : (
                    /* Skeleton placeholder — dark surface with subtle lines */
                    <View style={styles.thumbnailSkeleton}>
                        <View style={styles.skeletonLineWide} />
                        <View style={styles.skeletonLineMedium} />
                        <View style={styles.skeletonLineShort} />
                    </View>
                )}

                {/* Bottom shadow bar for contrast */}
                <View style={styles.thumbnailBottomShadow} />

                {/* Centered play button */}
                <View style={styles.playButtonOuter}>
                    <View style={styles.playButton}>
                        <Play size={16} color={Colors.white} fill={Colors.white} />
                    </View>
                </View>

                {/* Score badge in top-right corner */}
                <View style={styles.scoreBadgeOverlay}>
                    <ScoreBadge score={session.score} size="sm" />
                </View>
            </View>

            {/* Info row below the thumbnail */}
            <View style={styles.infoRow}>
                <View style={styles.info}>
                    <Text style={styles.title} numberOfLines={1}>{session.title}</Text>
                    <Text style={styles.date}>{dateStr}</Text>
                </View>
                <ChevronRight size={18} color={Colors.text.muted} />
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.dark.card,
        borderRadius: 16,
        marginBottom: 12,
        marginHorizontal: 16,
        borderWidth: 1,
        borderColor: Colors.dark.border,
        overflow: 'hidden',
    },
    /* ── Thumbnail ─────────────────────────────────────── */
    thumbnailWrapper: {
        width: '100%',
        aspectRatio: 16 / 9,
        backgroundColor: Colors.dark.surface,
        position: 'relative',
    },
    thumbnailImage: {
        width: '100%',
        height: '100%',
    },
    thumbnailSkeleton: {
        flex: 1,
        backgroundColor: Colors.dark.muted,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 40,
    },
    skeletonLineWide: {
        width: '80%',
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(255,255,255,0.06)',
    },
    skeletonLineMedium: {
        width: '55%',
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(255,255,255,0.04)',
    },
    skeletonLineShort: {
        width: '35%',
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    thumbnailBottomShadow: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 40,
        backgroundColor: 'rgba(0,0,0,0.45)',
    },
    /* ── Play Button ───────────────────────────────────── */
    playButtonOuter: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
    },
    playButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,0,0,0.85)',
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: 3,
    },
    /* ── Overlaid badges ───────────────────────────────── */
    scoreBadgeOverlay: {
        position: 'absolute',
        top: 8,
        right: 8,
    },
    /* ── Info row ──────────────────────────────────────── */
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    info: {
        flex: 1,
        gap: 3,
    },
    title: {
        color: Colors.text.primary,
        fontSize: 15,
        fontWeight: '600',
    },
    date: {
        color: Colors.text.muted,
        fontSize: 12,
    },
});

export default SessionListItem;
