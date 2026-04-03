// src/context/AppContext.tsx
// Global state context – plan, user, sessions

import React, { createContext, useContext, useState, useCallback } from 'react';
import { User, UserPlan, SparringSession } from '../types';
import { FREE_DAILY_UPLOAD_LIMIT } from '../constants';

interface AppContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    sessions: SparringSession[];
    addSession: (session: SparringSession) => void;
    canUploadToday: () => boolean;
    upgradePromptVisible: boolean;
    setUpgradePromptVisible: (v: boolean) => void;
    dailyUploadCount: number;
    incrementDailyUpload: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [sessions, setSessions] = useState<SparringSession[]>(MOCK_SESSIONS);
    const [upgradePromptVisible, setUpgradePromptVisible] = useState(false);
    const [dailyUploadCount, setDailyUploadCount] = useState(0);

    const canUploadToday = useCallback((): boolean => {
        if (!user || user.plan === 'premium') return true;
        return dailyUploadCount < FREE_DAILY_UPLOAD_LIMIT;
    }, [user, dailyUploadCount]);

    const addSession = useCallback((session: SparringSession) => {
        setSessions(prev => [session, ...prev]);
    }, []);

    const incrementDailyUpload = useCallback(() => {
        setDailyUploadCount(prev => prev + 1);
    }, []);

    return (
        <AppContext.Provider
            value={{
                user,
                setUser,
                sessions,
                addSession,
                canUploadToday,
                upgradePromptVisible,
                setUpgradePromptVisible,
                dailyUploadCount,
                incrementDailyUpload,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export const useApp = (): AppContextType => {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error('useApp must be used inside AppProvider');
    return ctx;
};

// ── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_SESSIONS: SparringSession[] = [
    {
        id: '1',
        date: new Date(Date.now() - 1 * 86400000).toISOString(),
        videoUri: '',
        score: 87,
        title: 'Session vs. Marcus',
        analysisText:
            'Fighter A displayed strong jab combinations and maintained effective distance control throughout the round. The right cross showed significant power but left the chin exposed on the return. Overall footwork was disciplined with good lateral movement.',
        bulletPoints: [
            'Tighten guard after the right cross',
            'Develop the body jab to open up head shots',
            'Work on head movement after combination',
            'Improve pivot to avoid getting cornered',
        ],
    },
    {
        id: '2',
        date: new Date(Date.now() - 3 * 86400000).toISOString(),
        videoUri: '',
        score: 72,
        title: 'Open Gym — Friday',
        analysisText:
            'Round showed stamina drops in the second half. Defense relied too heavily on the pull-back and lacked active head movement. Combinations lacked variety.',
        bulletPoints: [
            'Improve cardio conditioning',
            'Add slips and rolls to defense toolkit',
            'Mix in more 3-4 punch combinations',
        ],
    },
    {
        id: '3',
        date: new Date(Date.now() - 5 * 86400000).toISOString(),
        videoUri: '',
        score: 91,
        title: 'Sparring — Wed AM',
        analysisText:
            'Excellent performance. High output with clean technique. Demonstrated effective use of angles and strong counter-punching rhythm.',
        bulletPoints: [
            'Maintain this level of output',
            'Polish the lead hook after the right hand',
        ],
    },
    {
        id: '4',
        date: new Date(Date.now() - 8 * 86400000).toISOString(),
        videoUri: '',
        score: 65,
        title: 'Heavy Sparring — Sat',
        analysisText:
            'Fighter struggled against pressure opponents. Getting forced onto the back foot and losing the center of the ring consistently.',
        bulletPoints: [
            'Practice cutting off the ring',
            'Work the clinch game when under pressure',
            'Improve footwork against aggressive fighters',
            'Strengthen the check hook for countering rushes',
        ],
    },
    {
        id: '5',
        date: new Date(Date.now() - 10 * 86400000).toISOString(),
        videoUri: '',
        score: 79,
        title: 'Technical Round',
        analysisText:
            'A focused technical session. Jab volume was high and effective. Some timing issues when attempting counter punches.',
        bulletPoints: [
            'Refine counter-punch timing off the slip',
            'Add more feinting to jab setups',
        ],
    },
];
