import { supabase } from '../../lib/supabase';

export interface VideoSession {
    video_id: number;
    user_id: string | null;
    title: string | null;
    created_at: string;
    json_dump: Record<string, unknown> | null;
    video_bucket_url: string | null;
    ai_analysis: string | null;
}

/**
 * Fetches all video sessions for the currently logged-in user.
 * Results are ordered by most recently created first.
 */
export async function getAllSessions(): Promise<VideoSession[]> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        throw new Error(authError?.message ?? 'No authenticated user found');
    }

    const { data, error } = await supabase
        .from('Video')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        throw new Error(`Failed to fetch sessions: ${error.message}`);
    }

    return (data as VideoSession[]) ?? [];
}

/**
 * Fetches a single video by ID for the current user.
 */
export async function getVideo(videoID: number): Promise<VideoSession | null> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        throw new Error(authError?.message ?? 'No authenticated user found');
    }

    const { data, error } = await supabase
        .from('Video')
        .select('*')
        .eq('video_id', videoID)
        .eq('user_id', user.id)
        .single();

    if (error) {
        throw new Error(`Failed to fetch video: ${error.message}`);
    }

    return data as VideoSession;
}

/**
 * Deletes a video by ID for the current user.
 * Returns true if the delete was successful.
 */
export async function deleteVideo(videoID: number): Promise<boolean> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        throw new Error(authError?.message ?? 'No authenticated user found');
    }

    const { error } = await supabase
        .from('Video')
        .delete()
        .eq('video_id', videoID)
        .eq('user_id', user.id);

    if (error) {
        throw new Error(`Failed to delete video: ${error.message}`);
    }

    return true;
}
