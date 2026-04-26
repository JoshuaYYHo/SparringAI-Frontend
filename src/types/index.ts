// src/types/index.ts
export type UserPlan = 'free' | 'premium';

export interface User {
    id: string;
    email: string;
    name: string;
    photoURL?: string;
    plan: UserPlan;
    emailOptIn: boolean;
}

export interface SparringSession {
    id: string;
    date: string;           // ISO string
    videoUri: string;
    thumbnailUri?: string;
    score: number;           // 0–100
    title: string;
    analysisText?: string;
    bulletPoints?: string[];
    userCircle?: {           // position/size of the drawn circle overlay
        x: number;
        y: number;
        radius: number;
    };
}

export type RootStackParamList = {
    Splash: undefined;
    Login: undefined;
    Main: undefined;
    SessionDetail: { session: SparringSession };
    SelectVideo: undefined;
    Upload: { videoUri: string };
    Settings: undefined;
    Profile: undefined;
};
