// src/components/common/GradientText.tsx
// Simulates gradient text using react-native-svg

import React from 'react';
import Svg, { Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import { Colors } from '../../theme/colors';

interface Props {
    text: string;
    fontSize?: number;
    fontWeight?: string;
}

const GradientText: React.FC<Props> = ({ text, fontSize = 48, fontWeight = 'bold' }) => {
    const estimatedWidth = text.length * (fontSize * 0.6);
    const height = fontSize * 1.4;

    return (
        <Svg width={estimatedWidth} height={height}>
            <Defs>
                <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <Stop offset="0%" stopColor={Colors.primary.default} />
                    <Stop offset="50%" stopColor={Colors.white} />
                    <Stop offset="100%" stopColor={Colors.secondary.default} />
                </LinearGradient>
            </Defs>
            <SvgText
                fill="url(#grad)"
                fontSize={fontSize}
                fontWeight={fontWeight}
                x={estimatedWidth / 2}
                y={fontSize * 1.1}
                textAnchor="middle"
            >
                {text}
            </SvgText>
        </Svg>
    );
};

export default GradientText;
