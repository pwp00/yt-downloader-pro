// Import library @distube/ytdl-core yang lebih tangguh
const ytdl = require('@distube/ytdl-core');

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { url, format } = request.body;

    if (!url || !ytdl.validateURL(url)) {
      return response.status(400).json({ error: 'URL YouTube tidak valid.' });
    }

    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title;
    
    const sanitizedTitle = title.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '_');
    const filename = `${sanitizedTitle}.${format}`;

    response.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    let options = {};
    if (format === 'mp3') {
      options = { quality: 'highestaudio', filter: 'audioonly' };
      response.setHeader('Content-Type', 'audio/mpeg');
    } else {
      // Opsi untuk MP4, memilih format yang memiliki video dan audio
      options = { quality: 'highestvideo', filter: (format) => format.hasVideo && format.hasAudio };
      response.setHeader('Content-Type', 'video/mp4');
    }

    ytdl(url, options).pipe(response);

  } catch (error) {
    // Log error yang sebenarnya di server Vercel untuk debugging
    console.error("Error di backend:", error.message); 
    response.status(500).json({ error: 'Gagal memproses permintaan. Mungkin video ini dilindungi atau tidak tersedia.' });
  }
}
