import { ElevenLabsClient } from 'elevenlabs';
import { createWriteStream } from 'fs';
import { v4 as uuid } from 'uuid';
import { promisify } from 'util';
import { pipeline } from 'stream';
import path from 'path';

const pipelineAsync = promisify(pipeline);
let key: any = process.env.REACT_APP_ELEVENLABS;
const client = new ElevenLabsClient({
  apiKey: key,
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb', // Adjust if needed
    },
  },
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ message: 'Text is required' });
  }

  try {
    const audio = await client.generate({
      voice: 'Rachel',
      model_id: 'eleven_turbo_v2',
      text,
    });

    const fileName = `${uuid()}.mp3`;
    const filePath = path.resolve('./public', fileName);
    const fileStream = createWriteStream(filePath);

    await pipelineAsync(audio, fileStream);

    return res.status(200).json({ fileName });
  } catch (error) {
    console.error('Error generating audio:', error);
    return res.status(500).json({ message: 'Error generating audio' });
  }
}
