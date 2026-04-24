// src/screens/upload/UploadScreen.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    Dimensions,
    Alert,
    Animated,
    TextInput,
    PanResponder,
    GestureResponderEvent,
    LayoutChangeEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { RootStackParamList, SparringSession } from '../../types';
import { Colors } from '../../theme/colors';
import Button from '../../components/common/Button';
import { useApp } from '../../context/AppContext';
import { ChevronLeft, Image as ImageIcon, Play, Pause } from 'lucide-react-native';
import { uploadVideo } from '../../services/backend/mainFunctions';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEvent } from 'expo';

type Props = NativeStackScreenProps<RootStackParamList, 'Upload'>;

const { width: SCREEN_W } = Dimensions.get('window');
const VIDEO_H = (SCREEN_W * 9) / 16; // 16:9 aspect ratio

const UploadScreen: React.FC<Props> = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { addSession } = useApp();
    const [videoUri, setVideoUri] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [circleStart, setCircleStart] = useState<{x: number, y: number} | null>(null);
    const [circleCurrent, setCircleCurrent] = useState<{x: number, y: number} | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStage, setUploadStage] = useState('');
    const animatedProgress = useRef(new Animated.Value(0)).current;
    const [scrubBarWidth, setScrubBarWidth] = useState(0);
    const [isScrubbing, setIsScrubbing] = useState(false);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt) => {
                const { locationX, locationY } = evt.nativeEvent;
                setCircleStart({ x: locationX, y: locationY });
                setCircleCurrent({ x: locationX, y: locationY });
            },
            onPanResponderMove: (evt) => {
                const { locationX, locationY } = evt.nativeEvent;
                setCircleCurrent({ x: locationX, y: locationY });
            },
            onPanResponderRelease: () => {},
        })
    ).current;

    useEffect(() => {
        Animated.timing(animatedProgress, {
            toValue: uploadProgress,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }, [uploadProgress]);

    const player = useVideoPlayer(videoUri, (p) => {
        p.loop = true;
        p.muted = true;
        p.timeUpdateEventInterval = 0.1;
        p.pause();
    });

    const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });
    const { currentTime } = useEvent(player, 'timeUpdate', { currentTime: 0, currentLiveTimestamp: null, currentOffsetFromLive: null, bufferedPosition: 0 });
    const duration = player.duration || 0;

    const handlePlayPause = useCallback(() => {
        if (player.playing) {
            player.pause();
        } else {
            player.play();
        }
    }, [player]);

    const handleScrub = useCallback((locationX: number) => {
        if (scrubBarWidth <= 0 || duration <= 0) return;
        const ratio = Math.max(0, Math.min(1, locationX / scrubBarWidth));
        const seekTime = ratio * duration;
        player.currentTime = seekTime;
    }, [scrubBarWidth, duration, player]);

    const scrubPanResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt) => {
                setIsScrubbing(true);
                if (player.playing) player.pause();
                handleScrub(evt.nativeEvent.locationX);
            },
            onPanResponderMove: (evt) => {
                handleScrub(evt.nativeEvent.locationX);
            },
            onPanResponderRelease: () => {
                setIsScrubbing(false);
            },
        })
    );

    // Rebuild scrub pan responder when dependencies change
    useEffect(() => {
        scrubPanResponder.current = PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt) => {
                setIsScrubbing(true);
                if (player.playing) player.pause();
                handleScrub(evt.nativeEvent.locationX);
            },
            onPanResponderMove: (evt) => {
                handleScrub(evt.nativeEvent.locationX);
            },
            onPanResponderRelease: () => {
                setIsScrubbing(false);
            },
        });
    }, [handleScrub, player]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handlePickVideo = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please grant camera roll permissions to upload a video.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['videos'],
            allowsEditing: true, 
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setVideoUri(result.assets[0].uri);
        }
    };

    const handleUploadVideo = async () => {
        if (!videoUri) {
            Alert.alert('No Video', 'Please select a video from your camera roll first.');
            return;
        }

        let targetBox: number[] | undefined;
        if (circleStart && circleCurrent) {
            const x1 = circleStart.x;
            const y1 = circleStart.y;
            const x2 = circleCurrent.x;
            const y2 = circleCurrent.y;
            
            const minX = Math.min(x1, x2);
            const maxX = Math.max(x1, x2);
            const minY = Math.min(y1, y2);
            const maxY = Math.max(y1, y2);
            
            const size = Math.max(maxX - minX, maxY - minY);
            const centerX = (minX + maxX) / 2;
            const centerY = (minY + maxY) / 2;

            const minX_norm = (centerX - size/2) / SCREEN_W;
            const minY_norm = (centerY - size/2) / VIDEO_H;
            const maxX_norm = (centerX + size/2) / SCREEN_W;
            const maxY_norm = (centerY + size/2) / VIDEO_H;
            
            targetBox = [minX_norm, minY_norm, maxX_norm, maxY_norm];
        }

        setIsSaving(true);
        setUploadProgress(0);
        setUploadStage('Preparing...');
        try {
            // Send straight to the backend Render server and save to Supabase
            const videoRecord = await uploadVideo(videoUri, (progress, stage) => {
                setUploadProgress(progress);
                setUploadStage(stage);
            }, title, targetBox);
            
            // Map the new Record to the App's SparringSession type
            const newSession: SparringSession = {
                id: videoRecord.video_id,
                title: videoRecord.title || 'Sparring Session',
                date: videoRecord.created_at || new Date().toISOString(),
                videoUri: videoRecord.video_bucket_url,
                score: 85, // Adjust this later to extract from AI analysis natively
                analysisText: videoRecord.ai_analysis,
                bulletPoints: [
                    'Review AI analysis text for more detailed feedback.',
                    'Stance and defense metrics are saved to the database.'
                ]
            };

            addSession(newSession);
            navigation.replace('SessionDetail', { session: newSession });
            
        } catch (error: any) {
            console.error("Upload process error", error);
            Alert.alert('Upload Failed', error.message || 'An error occurred during upload.');
        } finally {
            setIsSaving(false);
            setUploadProgress(0);
            setUploadStage('');
        }
    };

    const renderCircle = () => {
        if (!circleStart || !circleCurrent) return null;
        const x1 = circleStart.x;
        const y1 = circleStart.y;
        const x2 = circleCurrent.x;
        const y2 = circleCurrent.y;
        
        const minX = Math.min(x1, x2);
        const maxX = Math.max(x1, x2);
        const minY = Math.min(y1, y2);
        const maxY = Math.max(y1, y2);
        
        const size = Math.max(maxX - minX, maxY - minY);
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        return (
            <View
                style={{
                    position: 'absolute',
                    left: centerX - size / 2,
                    top: centerY - size / 2,
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    borderWidth: 2,
                    borderColor: Colors.primary.default,
                    backgroundColor: 'rgba(255, 0, 0, 0.1)',
                }}
                pointerEvents="none"
            />
        );
    };

    return (
        <View style={[styles.root, { paddingTop: insets.top }]}>
            <StatusBar barStyle="light-content" />
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <ChevronLeft size={28} color={Colors.text.primary} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Upload Session</Text>
                    <View style={styles.backBtn} />
                </View>

            <View style={styles.content}>
                {!videoUri ? (
                    <View style={styles.emptyState}>
                        <View style={styles.iconCircle}>
                            <ImageIcon size={42} color={Colors.primary.default} />
                        </View>
                        <Text style={styles.emptyTitle}>Select a Video</Text>
                        <Text style={styles.emptySub}>Pick a sparring video from your camera roll to get an AI analysis.</Text>
                        <Button
                            label="Choose Video"
                            onPress={handlePickVideo}
                            style={styles.pickBtn}
                        />
                    </View>
                ) : (
                    <View style={styles.videoContainer}>
                        <View style={styles.titleInputContainer}>
                            <Text style={styles.inputLabel}>Video Title</Text>
                            <TextInput
                                style={styles.titleInput}
                                placeholder="Enter a title for this session..."
                                placeholderTextColor={Colors.text.muted}
                                value={title}
                                onChangeText={setTitle}
                                editable={!isSaving}
                            />
                        </View>

                        <Text style={styles.stepTitle}>Identify Yourself</Text>
                        <Text style={styles.stepSub}>Pause and scrub to the best frame, then draw a circle around yourself.</Text>

                        <View style={styles.videoWrapper}>
                            <View style={{ width: SCREEN_W, height: VIDEO_H }}>
                                <VideoView
                                    player={player}
                                    style={StyleSheet.absoluteFillObject}
                                    contentFit="cover"
                                    nativeControls={false}
                                />
                                <View 
                                    style={StyleSheet.absoluteFillObject}
                                    {...panResponder.panHandlers}
                                >
                                    {renderCircle()}
                                </View>
                            </View>

                            {/* Scrub Bar */}
                            <View style={styles.scrubContainer}>
                                <TouchableOpacity
                                    onPress={handlePlayPause}
                                    style={styles.playPauseBtn}
                                    activeOpacity={0.7}
                                >
                                    {isPlaying ? (
                                        <Pause size={18} color={Colors.text.primary} />
                                    ) : (
                                        <Play size={18} color={Colors.text.primary} />
                                    )}
                                </TouchableOpacity>

                                <View
                                    style={styles.scrubTrackOuter}
                                    onLayout={(e: LayoutChangeEvent) => setScrubBarWidth(e.nativeEvent.layout.width)}
                                    {...scrubPanResponder.current.panHandlers}
                                >
                                    <View style={styles.scrubTrack}>
                                        <View
                                            style={[
                                                styles.scrubFill,
                                                { width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' },
                                            ]}
                                        />
                                        {duration > 0 && (
                                            <View
                                                style={[
                                                    styles.scrubThumb,
                                                    { left: `${(currentTime / duration) * 100}%` },
                                                ]}
                                            />
                                        )}
                                    </View>
                                </View>

                                <Text style={styles.scrubTime}>
                                    {formatTime(currentTime)} / {formatTime(duration)}
                                </Text>
                            </View>

                            <View style={styles.toolbar}>
                                <TouchableOpacity style={styles.toolBtn} onPress={handlePickVideo} activeOpacity={0.8}>
                                    <ImageIcon size={16} color={Colors.text.secondary} />
                                    <Text style={styles.toolLabel}>Change Video</Text>
                                </TouchableOpacity>
                                {(circleStart || circleCurrent) && (
                                    <TouchableOpacity 
                                        style={styles.toolBtn} 
                                        onPress={() => { setCircleStart(null); setCircleCurrent(null); }} 
                                        activeOpacity={0.8}
                                    >
                                        <Text style={styles.toolLabel}>Clear Circle</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        {isSaving && (
                            <View style={styles.progressContainer}>
                                <View style={styles.progressBarBg}>
                                    <Animated.View
                                        style={[
                                            styles.progressBarFill,
                                            {
                                                width: animatedProgress.interpolate({
                                                    inputRange: [0, 100],
                                                    outputRange: ['0%', '100%'],
                                                }),
                                            },
                                        ]}
                                    />
                                </View>
                                <View style={styles.progressInfo}>
                                    <Text style={styles.progressStage}>{uploadStage}</Text>
                                    <Text style={styles.progressPercent}>{uploadProgress}%</Text>
                                </View>
                            </View>
                        )}

                        <View style={styles.saveContainer}>
                            <Button
                                label={isSaving ? "Analyzing..." : "Analyze with AI"}
                                onPress={handleUploadVideo}
                                loading={isSaving}
                                disabled={isSaving}
                                fullWidth
                            />
                        </View>
                    </View>
                )}
            </View>

        </View>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.dark.bg },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.dark.border,
    },
    backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    title: { color: Colors.text.primary, fontSize: 18, fontWeight: '700' },
    content: { flex: 1 },

    // Empty state
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,0,0,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        color: Colors.text.primary,
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 8,
    },
    emptySub: {
        color: Colors.text.secondary,
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
    },
    pickBtn: {
        minWidth: 200,
    },

    videoContainer: {
        flex: 1,
        paddingTop: 24,
    },
    titleInputContainer: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    inputLabel: {
        color: Colors.text.secondary,
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    titleInput: {
        backgroundColor: Colors.dark.card,
        borderWidth: 1,
        borderColor: Colors.dark.border,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        color: Colors.text.primary,
        fontSize: 16,
    },
    stepTitle: {
        color: Colors.text.primary,
        fontSize: 20,
        fontWeight: '700',
        paddingHorizontal: 20,
        marginBottom: 8,
    },
    stepSub: {
        color: Colors.text.secondary,
        fontSize: 14,
        paddingHorizontal: 20,
        marginBottom: 24,
        lineHeight: 20,
    },
    videoWrapper: {
        backgroundColor: Colors.dark.card,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: Colors.dark.border,
    },
    videoPreview: {
        width: SCREEN_W,
        height: VIDEO_H,
        backgroundColor: '#0D0D0D',
    },
    // Scrub controls
    scrubContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: Colors.dark.surface,
        gap: 10,
        borderBottomWidth: 1,
        borderBottomColor: Colors.dark.border,
    },
    playPauseBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrubTrackOuter: {
        flex: 1,
        height: 36,
        justifyContent: 'center',
    },
    scrubTrack: {
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(255,255,255,0.12)',
        position: 'relative',
    },
    scrubFill: {
        height: '100%',
        borderRadius: 2,
        backgroundColor: Colors.primary.default,
    },
    scrubThumb: {
        position: 'absolute',
        top: -5,
        marginLeft: -7,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: Colors.primary.default,
        borderWidth: 2,
        borderColor: Colors.white,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 3,
    },
    scrubTime: {
        color: Colors.text.muted,
        fontSize: 11,
        fontWeight: '600',
        fontVariant: ['tabular-nums'],
        minWidth: 70,
        textAlign: 'right',
    },

    toolbar: {
        flexDirection: 'row',
        padding: 12,
        gap: 10,
        backgroundColor: Colors.dark.surface,
    },
    toolBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: Colors.dark.card,
        borderWidth: 1,
        borderColor: Colors.dark.border,
    },
    toolLabel: {
        color: Colors.text.secondary,
        fontSize: 13,
        fontWeight: '500',
    },
    saveContainer: {
        padding: 24,
        marginTop: 'auto',
    },

    // Progress bar
    progressContainer: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    progressBarBg: {
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.08)',
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
        backgroundColor: Colors.primary.default,
    },
    progressInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    progressStage: {
        color: Colors.text.secondary,
        fontSize: 13,
        fontWeight: '500',
    },
    progressPercent: {
        color: Colors.text.primary,
        fontSize: 13,
        fontWeight: '700',
    },
});

export default UploadScreen;
