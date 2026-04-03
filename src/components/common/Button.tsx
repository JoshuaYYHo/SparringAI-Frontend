// src/components/common/Button.tsx
import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { Colors } from '../../theme/colors';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost';

interface Props {
    label: string;
    onPress: () => void;
    variant?: Variant;
    disabled?: boolean;
    loading?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    fullWidth?: boolean;
}

const Button: React.FC<Props> = ({
    label,
    onPress,
    variant = 'primary',
    disabled = false,
    loading = false,
    style,
    textStyle,
    fullWidth = false,
}) => {
    const containerStyle = [
        styles.base,
        styles[variant],
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        style,
    ];

    return (
        <TouchableOpacity
            style={containerStyle}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'outline' ? Colors.primary.default : Colors.white} />
            ) : (
                <Text style={[styles.label, styles[`${variant}Label`], textStyle]}>{label}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create<Record<string, any>>({
    base: {
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    fullWidth: { width: '100%' },
    disabled: { opacity: 0.45 },

    // Variants
    primary: { backgroundColor: Colors.primary.default },
    secondary: { backgroundColor: Colors.secondary.default },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: Colors.primary.default,
    },
    ghost: { backgroundColor: 'transparent' },

    // Labels
    label: { fontSize: 16, fontWeight: '700', letterSpacing: 0.4 },
    primaryLabel: { color: Colors.white },
    secondaryLabel: { color: Colors.white },
    outlineLabel: { color: Colors.primary.default },
    ghostLabel: { color: Colors.text.secondary },
});

export default Button;
