// src/context/AppContext.tsx
// Global state context – plan, user, sessions

import React, { createContext, useContext, useState, useCallback } from 'react';
import { User, UserPlan, SparringSession } from '../types';
import { FREE_DAILY_UPLOAD_LIMIT } from '../constants';

interface AppContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    sessions: SparringSession[];
    setSessions: (sessions: SparringSession[]) => void;
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
    const [sessions, setSessions] = useState<SparringSession[]>([]);
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
                setSessions,
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

