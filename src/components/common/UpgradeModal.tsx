// src/components/common/UpgradeModal.tsx
// Modal that bugs free-plan users to upgrade

import React from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { Colors } from '../../theme/colors';
import Button from './Button';
import { Zap, X } from 'lucide-react-native';

interface Props {
    visible: boolean;
    onClose: () => void;
    onUpgrade: () => void;
}

const UpgradeModal: React.FC<Props> = ({ visible, onClose, onUpgrade }) => (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
        <View style={styles.overlay}>
            <View style={styles.card}>
                {/* Dismiss */}
                <TouchableOpacity style={styles.closeBtn} onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <X color={Colors.text.secondary} size={20} />
                </TouchableOpacity>

                {/* Icon */}
                <View style={styles.iconWrapper}>
                    <Zap size={36} color={Colors.warning} fill={Colors.warning} />
                </View>

                <Text style={styles.headline}>You're on the Free Plan</Text>
                <Text style={styles.sub}>
                    You've already uploaded today. Upgrade to{' '}
                    <Text style={styles.highlight}>Sp[a]rr[i]ng Premium</Text> for{' '}
                    <Text style={styles.highlight}>unlimited uploads</Text> every day.
                </Text>

                <View style={styles.features}>
                    {['Unlimited daily uploads', 'In-depth AI analysis', 'Priority processing', 'Export & share sessions'].map(f => (
                        <View key={f} style={styles.featureRow}>
                            <View style={styles.dot} />
                            <Text style={styles.featureText}>{f}</Text>
                        </View>
                    ))}
                </View>

                <Button label="Upgrade to Premium" onPress={onUpgrade} fullWidth style={styles.upgradeBtn} />
                <TouchableOpacity onPress={onClose} style={styles.laterBtn}>
                    <Text style={styles.laterText}>Maybe later</Text>
                </TouchableOpacity>
            </View>
        </View>
    </Modal>
);

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    card: {
        backgroundColor: Colors.dark.card,
        borderRadius: 24,
        padding: 28,
        width: '100%',
        maxWidth: 400,
        borderWidth: 1,
        borderColor: Colors.dark.border,
    },
    closeBtn: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 10,
    },
    iconWrapper: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: 'rgba(250,204,21,0.12)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        alignSelf: 'center',
    },
    headline: {
        color: Colors.text.primary,
        fontSize: 22,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 12,
    },
    sub: {
        color: Colors.text.secondary,
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    highlight: {
        color: Colors.primary.light,
        fontWeight: '600',
    },
    features: {
        marginBottom: 28,
        gap: 10,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.primary.default,
    },
    featureText: {
        color: Colors.text.secondary,
        fontSize: 14,
    },
    upgradeBtn: {
        marginBottom: 12,
    },
    laterBtn: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    laterText: {
        color: Colors.text.muted,
        fontSize: 14,
    },
});

export default UpgradeModal;
