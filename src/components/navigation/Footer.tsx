// src/components/navigation/Footer.tsx
// Bottom tab-bar style footer with + upload button and settings

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Colors } from '../../theme/colors';
import { Plus, Settings, User } from 'lucide-react-native';

interface Props {
    onUpload: () => void;
    onSettings: () => void;
    onProfile: () => void;
}

const Footer: React.FC<Props> = ({ onUpload, onSettings, onProfile }) => (
    <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
            {/* Settings left side */}
            <TouchableOpacity style={styles.sideBtn} onPress={onSettings} activeOpacity={0.75}>
                <Settings size={22} color={Colors.text.secondary} />
                <Text style={styles.sideLabel}>Settings</Text>
            </TouchableOpacity>

            {/* Center + FAB */}
            <View style={styles.fabWrapper} pointerEvents="box-none">
                <TouchableOpacity style={styles.fab} onPress={onUpload} activeOpacity={0.85}>
                    <Plus size={22} color={Colors.white} strokeWidth={2.5} />
                </TouchableOpacity>
            </View>

            {/* Profile right side */}
            <TouchableOpacity style={styles.sideBtn} onPress={onProfile} activeOpacity={0.75}>
                <User size={22} color={Colors.text.secondary} />
                <Text style={styles.sideLabel}>Profile</Text>
            </TouchableOpacity>
        </View>
    </SafeAreaView>
);

const styles = StyleSheet.create({
    safe: {
        backgroundColor: Colors.dark.surface,
        borderTopWidth: 1,
        borderTopColor: Colors.dark.border,
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 32,
        paddingVertical: 12, // Restored nice padding for the side buttons
    },
    fabWrapper: {
        position: 'absolute',
        top: 3,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    sideBtn: {
        width: 64,
        alignItems: 'center',
        gap: 4,
    },
    sideLabel: {
        color: Colors.text.secondary,
        fontSize: 10,
        fontWeight: '500',
    },
    fab: {
        width: 50,
        height: 50,
        borderRadius: 30,
        backgroundColor: Colors.primary.default,
        alignItems: 'center',
        justifyContent: 'center',
        // Glow
        shadowColor: Colors.primary.default,
        shadowOpacity: 0.55,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 14,
        elevation: 12,
        marginBottom: 0,
    },
});

export default Footer;
