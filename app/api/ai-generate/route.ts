import { NextResponse } from 'next/server';
import OpenAI from 'openai';
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'user-BQRTDI4AAUJeJucXMheuuVME', // Fallback to existing project key
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const metadataStr = formData.get('metadata') as string;
    const type = formData.get('type') as string;
    const customPrompt = formData.get('customPrompt') as string | null;

    if (!files || files.length === 0 || !metadataStr || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const metadata = JSON.parse(metadataStr);
    const { level, stream, subject, month, maxScore } = metadata;
    
    let systemPrompt = '';
    
    if (type === 'daily_exercise') {
      systemPrompt = `You are an expert educator. Analyze the uploaded educational content for Level: ${level}, Stream: ${stream || 'N/A'}, Subject: ${subject}, Month: ${month}.
      Extract/Generate questions and output strictly as a JSON object with a 'questions' array.
      Each question object MUST have:
      - 'question': string (the question text)
      - 'options': array of 4 strings (possible answers)
      - 'correctAnswerIndex': number (0-3 indicating the correct option)
      Ensure strict LaTeX formatting for math ($...$). Double-escape backslashes.`;
    } else if (type === 'exam') {
       systemPrompt = `You are an expert educator. Analyze the uploaded educational content for Level: ${level}, Stream: ${stream || 'N/A'}, Subject: ${subject}, Month: ${month}.
      Extract the questions and allocate a total of ${maxScore || 20} marks. Output strictly as a JSON object with a 'questions' array.
      Each question object MUST have:
      - 'question': string (the extracted question text)
      - 'modelAnswer': string (the suggested model answer)
      - 'allocatedMarks': number (points assigned, summing to ${maxScore || 20})
      Ensure strict LaTeX formatting for math ($...$). Double-escape backslashes.`;
    }

    if (customPrompt) {
      systemPrompt += `\n\nUSER'S ADDITIONAL INSTRUCTIONS:\n${customPrompt}`;
    }

    // Process all files
    let userContent: any[] = [{ type: 'text', text: 'Generate structured data from this educational content.' }];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const mimeType = file.type;

      if (mimeType.startsWith('image/')) {
        const base64Image = fileBuffer.toString('base64');
        userContent.push({ type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64Image}` } });
      } else if (mimeType === 'application/pdf') {
        const pdfData = await pdfParse(fileBuffer);
        userContent.push({ type: 'text', text: `Here is the extracted text from PDF document ${i + 1} (${file.name}):\n\n${pdfData.text}` });
      } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || mimeType === 'application/msword') {
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        userContent.push({ type: 'text', text: `Here is the extracted text from Word document ${i + 1} (${file.name}):\n\n${result.value}` });
      } else {
        return NextResponse.json({ error: `Unsupported file type for file ${file.name}. Please upload Image, PDF, or Word documents.` }, { status: 400 });
      }
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Kept fast model similar to generate-quiz
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: userContent,
        },
      ],
      temperature: 0.2,
      max_tokens: 2000,
    });

    const result = response.choices[0]?.message?.content;
    if (!result) throw new Error('No response from AI');

    return NextResponse.json(JSON.parse(result));
  } catch (error: any) {
    console.error('AI Generation Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate questions, please try a clearer file' }, { status: 500 });
  }
}
