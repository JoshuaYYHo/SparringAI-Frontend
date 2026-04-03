// src/screens/main/SettingsScreen.tsx
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Alert,
    Switch,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { Colors } from '../../theme/colors';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import { ChevronLeft, Crown, LogOut, Bell, Shield } from 'lucide-react-native';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const Row: React.FC<{ label: string; sub?: string; right?: React.ReactNode; onPress?: () => void }> = ({
    label, sub, right, onPress,
}) => (
    <TouchableOpacity style={rowStyles.container} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
        <View style={rowStyles.textBox}>
            <Text style={rowStyles.label}>{label}</Text>
            {sub && <Text style={rowStyles.sub}>{sub}</Text>}
        </View>
        {right}
    </TouchableOpacity>
);

const rowStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: Colors.dark.border,
    },
    textBox: { flex: 1, gap: 2 },
    label: { color: Colors.text.primary, fontSize: 15, fontWeight: '500' },
    sub: { color: Colors.text.muted, fontSize: 12 },
});

const SettingsScreen: React.FC<Props> = ({ navigation }) => {
    const { user, setUser } = useApp();
    const isPremium = user?.plan === 'premium';
    const [notifications, setNotifications] = React.useState(false);

    const handleUpgrade = () => {
        Alert.alert('Upgrade to Premium', 'Connect RevenueCat or your payment provider here.');
    };

    const handleSignOut = () => {
        Alert.alert('Sign Out', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Sign Out',
                style: 'destructive',
                onPress: async () => {
                    const { error } = await supabase.auth.signOut();
                    if (error) {
                        Alert.alert('Error signing out', error.message);
                        return;
                    }
                    setUser(null);
                    navigation.replace('Login');
                },
            },
        ]);
    };

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" />
            <SafeAreaView style={styles.safe}>
                {/* Navbar */}
                <View style={styles.navbar}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <ChevronLeft size={24} color={Colors.text.primary} />
                    </TouchableOpacity>
                    <Text style={styles.navTitle}>Settings</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Plan Card */}
                <View style={[styles.planCard, isPremium ? styles.planCardPremium : styles.planCardFree]}>
                    <View style={styles.planRow}>
                        {isPremium && <Crown size={20} color={Colors.warning} style={{ marginRight: 8 }} />}
                        <Text style={[styles.planName, isPremium ? { color: Colors.warning } : { color: Colors.text.primary }]}>
                            {isPremium ? 'Premium Plan' : 'Free Plan'}
                        </Text>
                    </View>
                    <Text style={styles.planDesc}>
                        {isPremium
                            ? 'You have unlimited daily uploads and full AI analysis.'
                            : 'Limited to 1 upload per day. Upgrade for unlimited access.'}
                    </Text>
                    {!isPremium && (
                        <TouchableOpacity style={styles.upgradeBtn} onPress={handleUpgrade} activeOpacity={0.85}>
                            <Crown size={14} color={Colors.dark.bg} style={{ marginRight: 6 }} />
                            <Text style={styles.upgradeBtnLabel}>Upgrade to Premium</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Settings Rows */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Preferences</Text>
                    <Row
                        label="Push Notifications"
                        sub="Session analysis ready alerts"
                        right={
                            <Switch
                                value={notifications}
                                onValueChange={setNotifications}
                                trackColor={{ true: Colors.primary.default, false: Colors.dark.muted }}
                                thumbColor={Colors.white}
                            />
                        }
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Account</Text>
                    <Row
                        label="Privacy Policy"
                        onPress={() => Alert.alert('Opens in browser')}
                        right={<Shield size={16} color={Colors.text.muted} />}
                    />
                    <Row
                        label="Sign Out"
                        onPress={handleSignOut}
                        right={<LogOut size={16} color={Colors.primary.default} />}
                    />
                </View>

                <Text style={styles.version}>Sp[a]rr[i]ng v1.0.0</Text>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.dark.bg },
    safe: { flex: 1 },
    navbar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backBtn: { width: 40, alignItems: 'center' },
    navTitle: { color: Colors.text.primary, fontSize: 17, fontWeight: '700' },
    planCard: {
        margin: 16,
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        gap: 8,
    },
    planCardFree: {
        backgroundColor: Colors.dark.card,
        borderColor: Colors.dark.border,
    },
    planCardPremium: {
        backgroundColor: 'rgba(250,204,21,0.08)',
        borderColor: Colors.warning,
    },
    planRow: { flexDirection: 'row', alignItems: 'center' },
    planName: { fontSize: 18, fontWeight: '700' },
    planDesc: { color: Colors.text.secondary, fontSize: 14, lineHeight: 20 },
    upgradeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.warning,
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 16,
        alignSelf: 'flex-start',
        marginTop: 8,
    },
    upgradeBtnLabel: { color: Colors.dark.bg, fontWeight: '700', fontSize: 14 },
    section: {
        marginTop: 24,
        borderTopWidth: 1,
        borderTopColor: Colors.dark.border,
    },
    sectionLabel: {
        color: Colors.text.muted,
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
        paddingHorizontal: 20,
        paddingTop: 14,
        paddingBottom: 4,
    },
    version: {
        color: Colors.text.muted,
        fontSize: 12,
        textAlign: 'center',
        marginTop: 'auto',
        paddingBottom: 20,
    },
});

export default SettingsScreen;
