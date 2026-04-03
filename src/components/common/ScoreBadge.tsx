// src/components/common/ScoreBadge.tsx
// Displays a colour-coded score badge

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import tinygradient from 'tinygradient';

// 4-stop gradient: deep red → orange → yellow → green
// 0-25 = reddish, 26-50 = orange, 51-75 = yellow, 76-100 = green
const gradient = tinygradient([
    { color: '#FF0000', pos: 0 },    // pure red at 0
    { color: '#F76707', pos: 0.25 },  // orange at 25
    { color: '#FAB005', pos: 0.5 },   // yellow at 50
    { color: '#2B8A3E', pos: 1 },     // green at 100
]);
const colors = gradient.rgb(100);

const scoreColor = (score: number): string => {
    const clamped = Math.max(1, Math.min(100, score));
    return colors[clamped - 1].toHexString();
};

interface Props {
    score: number;
    size?: 'sm' | 'md' | 'lg';
}

const ScoreBadge: React.FC<Props> = ({ score, size = 'md' }) => {
    const color = scoreColor(score);
    const dim = size === 'sm' ? 36 : size === 'md' ? 48 : 64;
    const fontSize = size === 'sm' ? 12 : size === 'md' ? 16 : 22;

    return (
        <View
            style={[
                styles.badge,
                { width: dim, height: dim, borderRadius: dim / 2, borderColor: color },
            ]}
        >
            <Text style={[styles.text, { color, fontSize }]}>{score}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.dark.card,
    },
    text: {
        fontWeight: '700',
    },
});

export default ScoreBadge;
