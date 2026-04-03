// src/screens/upload/UploadScreen.tsx
import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    Dimensions,
    PanResponder,
    GestureResponderEvent,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Circle } from 'react-native-svg';
import { RootStackParamList, SparringSession } from '../../types';
import { Colors } from '../../theme/colors';
import Button from '../../components/common/Button';
import { useApp } from '../../context/AppContext';
import { ChevronLeft, Image as ImageIcon, Crosshair, RotateCcw } from 'lucide-react-native';

type Props = NativeStackScreenProps<RootStackParamList, 'Upload'>;

const { width: SCREEN_W } = Dimensions.get('window');
const VIDEO_H = (SCREEN_W * 9) / 16; // 16:9 aspect ratio

interface DrawnCircle {
    x: number;
    y: number;
    radius: number;
}

const UploadScreen: React.FC<Props> = ({ navigation }) => {
    const { addSession } = useApp();
    const [videoUri, setVideoUri] = useState<string | null>(null);
    const [circle, setCircle] = useState<DrawnCircle | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Pan responder for drawing
    const startPoint = useRef<{ x: number; y: number } | null>(null);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => !!videoUri, // only draw if video is picked
            onPanResponderGrant: (evt: GestureResponderEvent) => {
                const { locationX, locationY } = evt.nativeEvent;
                startPoint.current = { x: locationX, y: locationY };
            },
            onPanResponderMove: (evt: GestureResponderEvent) => {
                if (!startPoint.current) return;
                const { locationX, locationY } = evt.nativeEvent;
                const dx = locationX - startPoint.current.x;
                const dy = locationY - startPoint.current.y;
                const radius = Math.sqrt(dx * dx + dy * dy) / 2;
                const cx = startPoint.current.x + dx / 2;
                const cy = startPoint.current.y + dy / 2;
                setCircle({ x: cx, y: cy, radius: Math.max(radius, 10) });
            },
            onPanResponderRelease: () => {
                startPoint.current = null;
            },
        })
    ).current;

    const handlePickVideo = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please grant camera roll permissions to upload a video.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['videos'],
            allowsEditing: true, // often helps to trim the video natively
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setVideoUri(result.assets[0].uri);
            setCircle(null); // Reset circle for new video
        }
    };

    const handleSaveSession = () => {
        if (!videoUri) {
            Alert.alert('No Video', 'Please select a video from your camera roll first.');
            return;
        }

        if (!circle) {
            Alert.alert('Identify Yourself', 'Please drag on the video to draw a circle around yourself before continuing.');
            return;
        }

        setIsSaving(true);

        // Simulate upload & AI analysis delay
        setTimeout(() => {
            const newSession: SparringSession = {
                id: Date.now().toString(),
                title: 'New Session',
                date: new Date().toISOString(),
                videoUri,
                score: Math.floor(Math.random() * 30) + 70, // random score 70-100
                userCircle: circle,
                analysisText: 'AI Analysis complete: Fighter demonstrated excellent footwork early on but dropped the lead hand when throwing the cross. Recommended to maintain a tighter guard and practice lateral movement.',
                bulletPoints: [
                    'Keep hands up during combinations',
                    'Work on lateral defensive movements',
                    'Snap the jab faster to disrupt rhythm'
                ]
            };

            addSession(newSession);
            setIsSaving(false);

            // Navigate directly to the new session's detail screen, replacing the current modal
            navigation.replace('SessionDetail', { session: newSession });
        }, 1500);
    };

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" />
            <SafeAreaView style={styles.safe}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <ChevronLeft size={28} color={Colors.text.primary} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Upload Session</Text>
                    <View style={styles.backBtn} />
                </View>
            </SafeAreaView>

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
                        <Text style={styles.stepTitle}>Identify Yourself</Text>
                        <Text style={styles.stepSub}>Drag a circle around yourself in the frame below so our AI knows who to analyze.</Text>

                        <View style={styles.videoWrapper}>
                            <View style={styles.videoPlaceholder} {...panResponder.panHandlers}>
                                <Text style={styles.placeholderText}>Video Preview</Text>

                                {!circle && (
                                    <Text style={styles.drawHint}>Drag here to circle yourself</Text>
                                )}

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

                            <View style={styles.toolbar}>
                                <TouchableOpacity style={styles.toolBtn} onPress={handlePickVideo} activeOpacity={0.8}>
                                    <ImageIcon size={16} color={Colors.text.secondary} />
                                    <Text style={styles.toolLabel}>Change Video</Text>
                                </TouchableOpacity>

                                {circle && (
                                    <TouchableOpacity style={styles.toolBtn} onPress={() => setCircle(null)} activeOpacity={0.8}>
                                        <RotateCcw size={14} color={Colors.text.secondary} />
                                        <Text style={styles.toolLabel}>Clear Circle</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        <View style={styles.saveContainer}>
                            <Button
                                label={isSaving ? "Processing..." : "Continue to Analysis"}
                                onPress={handleSaveSession}
                                loading={isSaving}
                                disabled={!circle || isSaving}
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
    safe: { backgroundColor: Colors.dark.bg },
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
    videoPlaceholder: {
        width: SCREEN_W,
        height: VIDEO_H,
        backgroundColor: '#0D0D0D',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    placeholderText: {
        color: Colors.text.muted,
        fontSize: 14,
    },
    drawHint: {
        color: Colors.primary.light,
        fontSize: 14,
        fontWeight: '600',
        position: 'absolute',
        bottom: 14,
        alignSelf: 'center',
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
});

export default UploadScreen;
