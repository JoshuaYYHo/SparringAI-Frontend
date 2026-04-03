// src/components/home/UploadSection.tsx
// Top card on Main screen — upload or record a session

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { Upload, Video } from 'lucide-react-native';

interface Props {
    onUpload: () => void;
}

const UploadSection: React.FC<Props> = ({ onUpload }) => (
    <View style={styles.container}>
        {/* Header */}
        <Text style={styles.sectionTitle}>New Session</Text>
        <Text style={styles.sectionSub}>Upload footage or record directly</Text>

        {/* Action row */}
        <View style={styles.actions}>
            {/* Upload */}
            <TouchableOpacity style={styles.actionCard} onPress={onUpload} activeOpacity={0.8}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(255,0,0,0.15)' }]}>
                    <Upload size={28} color={Colors.primary.default} />
                </View>
                <Text style={styles.actionLabel}>Upload Video</Text>
                <Text style={styles.actionSub}>From Camera Roll</Text>
            </TouchableOpacity>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.dark.card,
        borderRadius: 20,
        padding: 20,
        marginHorizontal: 16,
        marginTop: 16,
        borderWidth: 1,
        borderColor: Colors.dark.border,
    },
    sectionTitle: {
        color: Colors.text.primary,
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    sectionSub: {
        color: Colors.text.muted,
        fontSize: 13,
        marginBottom: 20,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionCard: {
        flex: 1,
        alignItems: 'center',
        gap: 8,
    },
    iconBox: {
        width: 64,
        height: 64,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    actionLabel: {
        color: Colors.text.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    actionSub: {
        color: Colors.text.muted,
        fontSize: 11,
    },

});

export default UploadSection;
