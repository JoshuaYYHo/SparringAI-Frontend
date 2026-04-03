import React, { useRef, useCallback } from 'react';
import { Animated, StyleSheet, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { HandMetal } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../theme/colors';

export function usePullToRefreshMascot(onRefresh?: () => void) {
    const scrollY = useRef(new Animated.Value(0)).current;
    const spinValue = useRef(new Animated.Value(0)).current;
    const spinAnim = useRef<Animated.CompositeAnimation | null>(null);
    const isSpinning = useRef(false);
    const hasTriggeredHaptic = useRef(false);

    const startSpin = useCallback(() => {
        if (isSpinning.current) return;
        isSpinning.current = true;
        spinValue.setValue(0);
        spinAnim.current = Animated.loop(
            Animated.timing(spinValue, {
                toValue: 1,
                duration: 700,
                useNativeDriver: false,
            })
        );
        spinAnim.current.start();
    }, [spinValue]);

    const stopSpin = useCallback(() => {
        if (!isSpinning.current) return;
        isSpinning.current = false;
        if (spinAnim.current) {
            spinAnim.current.stop();
        }
        spinValue.setValue(0);
    }, [spinValue]);

    const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const y = event.nativeEvent.contentOffset.y;
        scrollY.setValue(y);

        if (y < -30) {
            startSpin();
            if (!hasTriggeredHaptic.current) {
                hasTriggeredHaptic.current = true;
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                if (onRefresh) onRefresh();
            }
        } else {
            stopSpin();
            hasTriggeredHaptic.current = false;
        }
    }, [scrollY, startSpin, stopSpin, onRefresh]);

    return { scrollY, spinValue, handleScroll };
}

interface PullToRefreshMascotProps {
    scrollY: Animated.Value;
    spinValue: Animated.Value;
    topOffset?: number;
    color?: string;
}

export const PullToRefreshMascot: React.FC<PullToRefreshMascotProps> = ({ 
    scrollY, 
    spinValue, 
    topOffset = 100,
    color = Colors.primary.default
}) => {
    const mascotOpacity = scrollY.interpolate({
        inputRange: [-100, -30, 0],
        outputRange: [1, 0.4, 0],
        extrapolate: 'clamp',
    });

    const mascotScale = scrollY.interpolate({
        inputRange: [-100, -30, 0],
        outputRange: [1.3, 0.6, 0.3],
        extrapolate: 'clamp',
    });

    const mascotTranslateY = scrollY.interpolate({
        inputRange: [-100, 0],
        outputRange: [60, 0],
        extrapolate: 'clamp',
    });

    const mascotRotate = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <Animated.View style={[
            styles.mascotOverlay,
            {
                top: topOffset,
                opacity: mascotOpacity,
                transform: [
                    { translateY: mascotTranslateY },
                    { scale: mascotScale },
                    { rotate: mascotRotate },
                ],
            }
        ]}>
            <HandMetal size={48} color={color} />
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    mascotOverlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 10,
        pointerEvents: 'none',
    },
});
