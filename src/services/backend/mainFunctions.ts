import { supabase } from '../../lib/supabase';
import { Platform } from 'react-native';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "https://sparringai-backend.onrender.com";
const SPARRING_API_KEY = process.env.EXPO_PUBLIC_SPARRING_API_KEY;

export async function uploadVideo(videoUri: string) {
    try {
        // 1. Ensure the user is authenticated
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
            throw new Error("User must be authenticated to upload videos.");
        }

        const userId = session.user.id;
        const filename = videoUri.split('/').pop() || `video_${Date.now()}.mp4`;
        const ext = filename.split('.').pop() || 'mp4';

        // Use standard RN fetch File object syntax
        const fileObj = {
            uri: Platform.OS === 'android' ? videoUri : videoUri.replace('file://', ''),
            type: `video/${ext === 'mov' ? 'quicktime' : 'mp4'}`,
            name: filename,
        } as any;

        // 2. Prepare FormData for Render Backend Analysis
        const formData = new FormData();
        formData.append('video', fileObj);

        console.log(`Sending video to backend for AI analysis: ${BACKEND_URL}/video_upload`);

        // 3. Send video to Render backend
        const response = await fetch(`${BACKEND_URL}/video_upload?confidence_threshold=0.7`, {
            method: 'POST',
            headers: {
                // The backend requires the API key for access
                'x-api-key': SPARRING_API_KEY || '',
                'Accept': 'application/json',
                // Note: Content-Type is intentionally omitted so fetch sets the boundary for FormData
            },
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Backend analysis failed: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const raw_analysis = data.raw_analysis || {};
        const ai_commentary = data.ai_commentary || "No commentary returned";

        console.log("Analysis complete. Uploading to Supabase Storage...");

        // 4. Upload video to Supabase Storage
        const storagePath = `${userId}/${Date.now()}_${filename}`;

        // Using FormData for Supabase Storage React Native upload trick
        const storageFormData = new FormData() as any;
        storageFormData.append('file', fileObj);

        // Upload using native JS fetch to avoid common supabase-js polyfill issues in Expo
        const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
        const storageResponse = await fetch(`${supabaseUrl}/storage/v1/object/Videos/${storagePath}`, {
            method: 'POST',
            headers: {
                'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
                'Authorization': `Bearer ${session.access_token}`,
            },
            body: storageFormData
        });

        if (!storageResponse.ok) {
            const storageErrorData = await storageResponse.text();
            throw new Error(`Storage upload failed: ${storageErrorData}`);
        }

        const publicUrl = `${supabaseUrl}/storage/v1/object/public/Videos/${storagePath}`;

        console.log(`Video uploaded to: ${publicUrl}`);

        // 5. Insert record into Video table
        const postgrestUrl = `${supabaseUrl}/rest/v1/Video`;
        
        const dbResponse = await fetch(postgrestUrl, {
            method: 'POST',
            headers: {
                'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                user_id: userId,
                title: filename,
                json_dump: raw_analysis,
                video_bucket_url: publicUrl,
                ai_analysis: ai_commentary
            })
        });

        if (!dbResponse.ok) {
            const dbErrorText = await dbResponse.text();
            throw new Error(`Failed to create database record: ${dbResponse.status} ${dbErrorText}`);
        }

        const videoRecordArray = await dbResponse.json();
        const videoRecord = videoRecordArray[0];

        if (!videoRecord) {
            throw new Error("Failed to return the inserted database record.");
        }

        console.log("Upload pipeline completely finished!");
        return videoRecord;

    } catch (error) {
        console.error("Upload Error:", error);
        throw error;
    }
}
