import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import axios from 'axios';
import * as cheerio from 'cheerio';

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const generateNote = async ({ mode, input, style }) => {
    let sourceText = input;

    if (mode === 'url') {
        try {
            const response = await axios.get(input);
            const $ = cheerio.load(response.data);
            // Basic text extraction: remove scripts, styles, and extract main content
            $('script, style, nav, footer, header').remove();
            sourceText = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 10000); // Limit context
        } catch (error) {
            console.error('Error fetching URL:', error);
            throw new Error('Failed to fetch content from URL');
        }
    }

    const prompt = `
    You are an expert student note-taker. 
    Task: Convert the source input into clean, exam-ready, structured notes.
    
    Mode: ${mode}
    Style Preference: ${style}
    Source Content: ${sourceText}

    Return a JSON object with the following structure:
    {
      "title": "A concise, descriptive title for the note",
      "content": "The generated content.",
      "tags": ["at", "least", "three", "relevant", "tags", "including", "the", "style"]
    }
    
    CRITICAL INSTRUCTION FOR CONTENT:
    If Style Preference is 'Mindmap', do NOT write markdown in the 'content' field. Instead, you MUST include a new top-level key "reactflow" containing a valid JSON object representing a diagram.
    The "reactflow" object must contain two arrays: "nodes" and "edges".
    - "nodes" objects: {"id": "string", "data": {"label": "string"}, "type": "string"}. Use type "hub" for the central core concept, and type "branch" for sub-concepts.
    - "edges" objects: {"id": "string", "source": "string", "target": "string"}.
    Again, only include the "reactflow" key if Style Preference is 'Mindmap'.
    If Style Preference is 'Structured', 'Bullets', or 'Summary', use the standard "content" field with comprehensive markdown.
    If Style Preference is 'Structured', 'Bullets', or 'Summary', the 'content' field must be in standard markdown (headers, bold text, lists).

    Ensure the content is accurate and highly organized. Respond ONLY with the JSON object.
  `;

    try {
        const chatCompletion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            response_format: { type: 'json_object' },
        });

        const text = chatCompletion.choices[0]?.message?.content || '';
        const parsed = JSON.parse(text);
        
        // --- Robust Mindmap handling with fallbacks ---
        if (style === 'Mindmap') {
            console.log('[claudeClient] Mindmap mode. Keys in response:', Object.keys(parsed));
            
            let flowData = null;
            
            // Strategy 1: AI returned a top-level "reactflow" key
            if (parsed.reactflow && parsed.reactflow.nodes) {
                console.log('[claudeClient] Found reactflow key with', parsed.reactflow.nodes.length, 'nodes');
                flowData = parsed.reactflow;
            }
            // Strategy 2: AI put nodes/edges at the top level
            else if (parsed.nodes && Array.isArray(parsed.nodes)) {
                console.log('[claudeClient] Found nodes at top level:', parsed.nodes.length);
                flowData = { nodes: parsed.nodes, edges: parsed.edges || [] };
            }
            // Strategy 3: AI put the data inside the content field as JSON
            else if (parsed.content && typeof parsed.content === 'object' && parsed.content.nodes) {
                console.log('[claudeClient] Found nodes inside content object');
                flowData = parsed.content;
            }
            // Strategy 4: AI put JSON string in the content field
            else if (parsed.content && typeof parsed.content === 'string') {
                try {
                    const innerParsed = JSON.parse(parsed.content);
                    if (innerParsed.nodes) {
                        console.log('[claudeClient] Parsed nodes from content string');
                        flowData = innerParsed;
                    }
                } catch(e) { /* not JSON, ignore */ }
            }

            if (flowData && flowData.nodes && flowData.nodes.length > 0) {
                parsed.content = '```reactflow\n' + JSON.stringify(flowData, null, 2) + '\n```';
                delete parsed.reactflow;
                delete parsed.nodes;
                delete parsed.edges;
                console.log('[claudeClient] Successfully formatted reactflow block');
            } else {
                console.warn('[claudeClient] WARNING: Could not extract mindmap data from AI response. Raw keys:', Object.keys(parsed));
                console.warn('[claudeClient] Content value type:', typeof parsed.content, 'first 200 chars:', String(parsed.content).substring(0, 200));
            }
        }
        return parsed;
    } catch (error) {
        console.error('Groq API Error:', error);
        throw new Error('AI generation failed');
    }
};

export const processPDFText = async (extractedText, style = 'Structured') => {
    const prompt = `
    You are an AI learning assistant. I have extracted text from a PDF document.
    Task: Analyze the text and generate output in a single JSON object.
    
    Style Preference: ${style}
    Source Text: ${extractedText.slice(0, 15000)}

    Output Requirements (JSON):
    1. "title": A concise title for the note.
    2. "summary": A 3-4 sentence high-level overview of the document.
    3. "content": The generated content.
    4. "voiceScript": A conversational script explaining the main points.
    5. "tags": Relevant tags including the style.

    CRITICAL INSTRUCTION FOR CONTENT:
    If Style Preference is 'Mindmap', do NOT write markdown in the 'content' field. Instead, you MUST include a new top-level key "reactflow" containing a valid JSON object representing a diagram.
    The "reactflow" object must contain two arrays: "nodes" and "edges".
    - "nodes" objects: {"id": "string", "data": {"label": "string"}, "type": "string"}. Use type "hub" for the central core concept, and type "branch" for sub-concepts.
    - "edges" objects: {"id": "string", "source": "string", "target": "string"}.
    Again, only include the "reactflow" key if Style Preference is 'Mindmap'.
    If Style Preference is 'Structured', 'Bullets', or 'Summary', use the standard "content" field with comprehensive markdown.
    If Style Preference is 'Structured', 'Bullets', or 'Summary', the 'content' field must be comprehensive, structured student notes in Markdown format.

    Return ONLY a JSON object with keys: "title", "summary", "content", "voiceScript", "tags".
  `;

    try {
        const chatCompletion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.6,
            response_format: { type: 'json_object' },
        });

        const text = chatCompletion.choices[0]?.message?.content || '';
        const parsed = JSON.parse(text);
        
        // --- Robust Mindmap handling with fallbacks (same as generateNote) ---
        if (style === 'Mindmap') {
            let flowData = null;
            if (parsed.reactflow && parsed.reactflow.nodes) flowData = parsed.reactflow;
            else if (parsed.nodes && Array.isArray(parsed.nodes)) flowData = { nodes: parsed.nodes, edges: parsed.edges || [] };
            else if (parsed.content && typeof parsed.content === 'object' && parsed.content.nodes) flowData = parsed.content;
            else if (parsed.content && typeof parsed.content === 'string') {
                try { const ip = JSON.parse(parsed.content); if (ip.nodes) flowData = ip; } catch(e) {}
            }
            if (flowData && flowData.nodes && flowData.nodes.length > 0) {
                parsed.content = '```reactflow\n' + JSON.stringify(flowData, null, 2) + '\n```';
                delete parsed.reactflow; delete parsed.nodes; delete parsed.edges;
            }
        }
        return parsed;
    } catch (error) {
        console.error('PDF Processing AI Error:', error);
        throw new Error('AI failed to process PDF content');
    }
};

export const translateText = async (text, targetLanguage) => {
    const prompt = `
    You are a professional translator.
    Task: Translate the following markdown content to ${targetLanguage}.
    
    CRITICAL INSTRUCTIONS:
    1. Maintain all markdown formatting (headers, bold, lists, tables).
    2. DO NOT translate technical code blocks, especially anything inside \`\`\`reactflow ... \`\`\`. Keep them exactly as they are.
    3. Ensure the translation is natural and accurate for a student's notes.
    4. Return ONLY the translated markdown text. No explanations.
    
    Content to translate:
    ${text}
    `;

    try {
        const chatCompletion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.3,
        });

        return chatCompletion.choices[0]?.message?.content || '';
    } catch (error) {
        console.error('Translation Error:', error);
        throw new Error('Translation failed');
    }
};

