import { METHODS } from '@/constants';
import { NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface RequestParam {
  method: METHODS;
  body: string;
}
let key: any = process.env.REACT_APP_GEMINI;
const genAI = new GoogleGenerativeAI(key);

export default async function handler(req: RequestParam, res: NextApiResponse) {
  if (req.method !== METHODS.POST) {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  let messages = JSON.parse(req.body);

  // Ensure the first message has the role 'user'
  if (!messages.length || messages[0].role !== 'user') {
    messages = [
      { role: 'user', parts: [{ text: 'Initial message to start the conversation' }] },
      ...messages,
    ];
  }

  let response;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const chat = model.startChat({
      history: messages,
      generationConfig: {
        maxOutputTokens: 100,
      },
    });

    const userMessage = messages[messages.length - 1]?.parts?.[0]?.text || '';

    const result = await chat.sendMessage(userMessage);
    response = await result.response;
    const text = await response.text();

    return res.status(200).json({ response: text });
  } catch (error) {
    console.error('Error:', error);
    return res.json({ error: 'An error occurred' });
  }
}
