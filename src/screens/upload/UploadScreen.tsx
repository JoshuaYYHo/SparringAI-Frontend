// src/screens/upload/UploadScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    Dimensions,
    Alert,
    Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { RootStackParamList, SparringSession } from '../../types';
import { Colors } from '../../theme/colors';
import Button from '../../components/common/Button';
import { useApp } from '../../context/AppContext';
import { ChevronLeft, Image as ImageIcon } from 'lucide-react-native';
import { uploadVideo } from '../../services/backend/mainFunctions';
import { useVideoPlayer, VideoView } from 'expo-video';

type Props = NativeStackScreenProps<RootStackParamList, 'Upload'>;

const { width: SCREEN_W } = Dimensions.get('window');
const VIDEO_H = (SCREEN_W * 9) / 16; // 16:9 aspect ratio

const UploadScreen: React.FC<Props> = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { addSession } = useApp();
    const [videoUri, setVideoUri] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStage, setUploadStage] = useState('');
    const animatedProgress = useRef(new Animated.Value(0)).current;

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
        p.play();
    });

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

        setIsSaving(true);
        setUploadProgress(0);
        setUploadStage('Preparing...');
        try {
            // Send straight to the backend Render server and save to Supabase
            const videoRecord = await uploadVideo(videoUri, (progress, stage) => {
                setUploadProgress(progress);
                setUploadStage(stage);
            });
            
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
                        <Text style={styles.stepTitle}>Ready for Analysis</Text>
                        <Text style={styles.stepSub}>Your video is selected. It will be sent to the Sparring AI engine for detailed processing.</Text>

                        <View style={styles.videoWrapper}>
                            <VideoView
                                player={player}
                                style={styles.videoPreview}
                                contentFit="cover"
                                nativeControls={false}
                            />

                            <View style={styles.toolbar}>
                                <TouchableOpacity style={styles.toolBtn} onPress={handlePickVideo} activeOpacity={0.8}>
                                    <ImageIcon size={16} color={Colors.text.secondary} />
                                    <Text style={styles.toolLabel}>Change Video</Text>
                                </TouchableOpacity>
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

    // Video container
    videoContainer: {
        flex: 1,
        paddingTop: 24,
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
