// src/constants/index.ts
export const APP_NAME = 'Sp[a]rr[i]ng';
export const APP_CAPTION = 'Be the best warrior you can be.';

// Payment tiers
export const FREE_DAILY_UPLOAD_LIMIT = 1;

// Async Storage keys
export const STORAGE_KEYS = {
    USER_PLAN: '@sparring/user_plan',
    DAILY_UPLOAD_COUNT: '@sparring/daily_upload_count',
    UPLOAD_DATE: '@sparring/upload_date',
    ONBOARDING_COMPLETE: '@sparring/onboarding_complete',
} as const;
