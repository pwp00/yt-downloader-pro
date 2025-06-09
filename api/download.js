// Import library ytdl-core untuk berinteraksi dengan YouTube
const ytdl = require('ytdl-core');

// Ini adalah handler utama untuk Serverless Function kita
export default async function handler(request, response) {
  // Hanya izinkan metode POST
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Ambil URL YouTube dan format (mp3/mp4) dari body request
    const { url, format } = request.body;

    if (!url || !ytdl.validateURL(url)) {
      return response.status(400).json({ error: 'URL YouTube tidak valid.' });
    }

    // Dapatkan info video untuk mendapatkan judulnya
    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title;
    
    // Bersihkan judul agar aman digunakan sebagai nama file
    const sanitizedTitle = title.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '_');
    const filename = `${sanitizedTitle}.${format}`;

    // Atur header agar browser mengunduh file, bukan menampilkannya
    response.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    let options = {};
    if (format === 'mp3') {
      // Untuk MP3, kita ambil stream audio dengan kualitas tertinggi
      options = { quality: 'highestaudio', filter: 'audioonly' };
      response.setHeader('Content-Type', 'audio/mpeg');
    } else {
      // Untuk MP4, kita ambil stream video dengan kualitas tertinggi yang memiliki audio
      options = { quality: 'highest', filter: 'videoandaudio' };
      response.setHeader('Content-Type', 'video/mp4');
    }

    // Salurkan (pipe) stream dari YouTube langsung ke respons pengguna
    // Ini sangat efisien karena video tidak disimpan di server kita
    ytdl(url, options).pipe(response);

  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Gagal memproses permintaan. Mungkin video ini dilindungi atau tidak tersedia.' });
  }
}
