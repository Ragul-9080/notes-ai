import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const ELEVEN_LABS_API_KEY = process.env.ELEVEN_LABS_API_KEY;
const VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel voice (multilingual-compatible)

export const generateVoice = async (text, language_code = 'en') => {
    if (!ELEVEN_LABS_API_KEY) {
        throw new Error('ELEVEN_LABS_API_KEY is not configured');
    }

    try {
        const response = await axios.post(
            `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
            {
                text,
                model_id: 'eleven_multilingual_v2',
                language_code,
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                },
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'xi-api-key': ELEVEN_LABS_API_KEY,
                },
                responseType: 'arraybuffer',
            }
        );

        return response.data;
    } catch (error) {
        console.error('ElevenLabs API Error:', error.response?.data?.toString() || error.message);
        throw new Error('Voice generation failed');
    }
};

