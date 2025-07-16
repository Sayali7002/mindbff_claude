import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const API_KEY = process.env.GOOGLE_AI_API_KEY || 'mock-key-for-development';
const genAI = new GoogleGenerativeAI(API_KEY);

const cbtContext = `You are an expert in Cognitive Behavioral Therapy (CBT). Your job is to help users identify cognitive distortions, challenge negative thoughts, and reframe them into balanced thoughts. Be concise, clear, and supportive.`;

export async function POST(req: Request) {
  try {
    const { type, ants, distortions, evidenceAgainst, field, context, prompt } = await req.json();
    let aiPrompt = '';

    if (type === 'field_suggestion') {
      aiPrompt = `${cbtContext}
Given the following information from the user:
${context}

Suggest 2-3 possible ${field === 'distortions' ? 'cognitive distortions' : prompt.toLowerCase()} for the next step. Output as a list.`;
    } else if (type === 'distortion_suggestion') {
      aiPrompt = `Analyze the following negative thought: '${ants}'. Based on common cognitive distortions, identify which ones are most likely present. Output only the names of the distortions as a comma-separated list.`;
    } else if (type === 'challenge_prompt') {
      aiPrompt = `Given the negative thought '${ants}' and the identified distortion(s) '${distortions}', what specific evidence could you look for to challenge this? Output 2-3 open-ended questions.`;
    } else if (type === 'balanced_thought') {
      aiPrompt = `Based on the negative thought '${ants}', the identified distortions '${distortions}', and the evidence against '${evidenceAgainst}', suggest 2-3 alternative, more balanced thoughts. Ensure they are realistic and not overly positive. Output as a numbered list.`;
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    // Check if API key is properly configured
    if (!process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_AI_API_KEY === 'your_api_key_here') {
      return NextResponse.json({ response: 'AI service is not configured.' });
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 512,
      },
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ],
    });

    const result = await model.generateContent(aiPrompt);
    if (!result.response) throw new Error('No response from model');
    const response = result.response.text();
    return NextResponse.json({ response });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}