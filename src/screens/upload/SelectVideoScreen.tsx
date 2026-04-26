// src/screens/upload/SelectVideoScreen.tsx
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { RootStackParamList } from '../../types';
import { Colors } from '../../theme/colors';
import Button from '../../components/common/Button';
import { ChevronLeft, Image as ImageIcon } from 'lucide-react-native';

type Props = NativeStackScreenProps<RootStackParamList, 'SelectVideo'>;

const SelectVideoScreen: React.FC<Props> = ({ navigation }) => {
    const insets = useSafeAreaInsets();

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
            navigation.replace('Upload', { videoUri: result.assets[0].uri });
        }
    };

    return (
        <View style={[styles.root, { paddingTop: insets.top }]}>
            <StatusBar barStyle="light-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={28} color={Colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.title}>Select Video</Text>
                <View style={styles.backBtn} />
            </View>

            <View style={styles.content}>
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
});

export default SelectVideoScreen;
