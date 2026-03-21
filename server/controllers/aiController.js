import { generateNote, processPDFText, translateText } from '../lib/claudeClient.js';
import { generateVoice as tts } from '../lib/elevenLabs.js';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse/lib/pdf-parse.js');

const checkAndIncrementUsage = async (userId, usageType) => {
    // 1. Fetch/Initialize profile
    let { data: profile, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error && error.code === 'PGRST116') {
        const { data: newProfile, error: createError } = await supabaseAdmin
            .from('profiles')
            .insert([{ id: userId, plan: 'free', ai_usage_count: 0, mindmap_usage_count: 0 }])
            .select()
            .single();
        if (createError) throw createError;
        profile = newProfile;
    } else if (error) {
        throw error;
    }

    if (profile.plan === 'pro') return true;

    const limit = 10;
    const currentUsage = usageType === 'mindmap' ? profile.mindmap_usage_count : profile.ai_usage_count;

    if (currentUsage >= limit) {
        const error = new Error(`You've reached your free limit of ${limit} ${usageType === 'mindmap' ? 'mindmaps' : 'AI notes'}. Upgrade to Pro for unlimited access!`);
        error.status = 403;
        throw error;
    }

    // 2. Increment usage
    const updateData = usageType === 'mindmap' 
        ? { mindmap_usage_count: profile.mindmap_usage_count + 1 }
        : { ai_usage_count: profile.ai_usage_count + 1 };

    const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update(updateData)
        .eq('id', userId);

    if (updateError) throw updateError;
    return true;
};

export const generateAINote = async (req, res) => {
    const { mode, input, style } = req.body;
    const userId = req.user.id;

    if (!mode || !input) {
        return res.status(400).json({ error: 'Missing required parameters (mode, input)' });
    }

    try {
        const usageType = style === 'Mindmap' ? 'mindmap' : 'note';
        await checkAndIncrementUsage(userId, usageType);

        const noteData = await generateNote({ mode, input, style: style || 'Structured' });
        res.json(noteData);
    } catch (error) {
        console.error('AI Controller Error:', error);
        res.status(error.status || 500).json({ 
            error: error.message || 'AI generation failed',
            code: error.status === 403 ? 'LIMIT_REACHED' : 'GENERIC_ERROR'
        });
    }
};

export const processPDF = async (req, res) => {
    const { style } = req.body;
    const userId = req.user.id;
    
    if (!req.file) {
        return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    try {
        await checkAndIncrementUsage(userId, 'note');

        const dataBuffer = req.file.buffer;
        
        console.log('PDF Upload Diagnostics:');
        console.log('- Size:', dataBuffer.length, 'bytes');
        console.log('- Header (Hex):', dataBuffer.toString('hex', 0, 10));
        console.log('- Header (UTF-8):', dataBuffer.toString('utf-8', 0, 5));

        if (!dataBuffer.toString('utf-8', 0, 5).startsWith('%PDF-')) {
            return res.status(400).json({ 
                error: 'Invalid PDF structure: Missing %PDF- header. File might be corrupted or not a PDF.' 
            });
        }

        // Use classic pdf-parse v1.1.1 (standard function call)
        const data = await pdf(dataBuffer);
        const extractedText = data.text;

        if (!extractedText || extractedText.trim().length === 0) {
            throw new Error('Could not extract text from PDF');
        }

        const processedData = await processPDFText(extractedText, style);
        res.json(processedData);
    } catch (error) {
        console.error('PDF Processing Error Details:', error);
        res.status(error.status || 500).json({ 
            error: error.message || 'PDF processing failed',
            code: error.status === 403 ? 'LIMIT_REACHED' : 'GENERIC_ERROR'
        });
    }
};

export const generateVoice = async (req, res) => {
    const { text, language } = req.body;

    if (!text) {
        return res.status(400).json({ error: 'Missing text for voice generation' });
    }

    try {
        const audioBuffer = await tts(text, language || 'en');
        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Length': audioBuffer.length,
        });
        res.send(audioBuffer);
    } catch (error) {
        console.error('Voice Generation Error:', error);
        res.status(500).json({ error: error.message || 'Voice generation failed' });
    }
};

export const translateNote = async (req, res) => {
    const { text, targetLanguage } = req.body;

    if (!text || !targetLanguage) {
        return res.status(400).json({ error: 'Missing text or target language' });
    }

    try {
        const translatedText = await translateText(text, targetLanguage);
        res.json({ translatedText });
    } catch (error) {
        console.error('Translation Controller Error:', error);
        res.status(500).json({ error: error.message || 'Translation failed' });
    }
};

