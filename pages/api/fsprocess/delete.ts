import { unlink } from 'fs/promises';
import { join } from 'path';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { audioUrl } = req.body;

  if (!audioUrl) {
    return res.status(400).json({ message: 'audioUrl is required' });
  }

  try {
    const filePath = audioUrl;
    await unlink(filePath);
    return res.status(200).json({ message: 'Audio file deleted successfully' });
  } catch (error) {
    console.error('Error deleting audio file:', error);
    return res.status(500).json({ message: 'Error deleting audio file' });
  }
}
