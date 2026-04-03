// src/theme/colors.ts
// Global theme colors for Sp[a]rr[i]ng — import from here everywhere

export const Colors = {
    // Primary brand color: Fiery Red
    primary: {
        default: '#FF0000',
        dark: '#CC0000',
        light: '#FF4D4D',
    },
    // Secondary brand color: Steel Blue
    secondary: {
        default: '#1971C2',
        dark: '#1864AB',
        light: '#4DABF7',
    },
    // White / neutral
    white: '#FFFFFF',
    // Dark mode backgrounds
    dark: {
        bg: '#0A0A0A',        // root background
        surface: '#141414',   // slightly lifted surfaces
        card: '#1C1C1E',      // cards / list items
        border: '#2C2C2E',    // dividers / borders
        muted: '#3A3A3C',     // disabled / muted elements
    },
    // Text hierarchy
    text: {
        primary: '#FFFFFF',
        secondary: '#AEAEB2',
        muted: '#636366',
    },
    // Semantic
    success: '#2DD4BF',
    warning: '#FACC15',
    error: '#FF0000',
} as const;

export type ColorKeys = keyof typeof Colors;
