import { ElevenLabsClient } from 'elevenlabs';
import { promisify } from 'util';
import { pipeline } from 'stream';
import { Readable } from 'stream';

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

    // Convert the audio stream to a buffer
    const audioBuffer = await streamToBuffer(audio);

    // Send the buffer as response
    res.setHeader('Content-Type', 'audio/mpeg');
    res.status(200).send(audioBuffer);
  } catch (error) {
    console.error('Error generating audio:', error);
    return res.status(500).json({ message: 'Error generating audio' });
  }
}

// Function to convert a readable stream to buffer
async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}
