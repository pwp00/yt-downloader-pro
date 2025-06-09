// Menggunakan library yang tangguh
const ytdl = require('@distube/ytdl-core');

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { url, format: fileFormat } = request.body;

    if (!url || !ytdl.validateURL(url)) {
      return response.status(400).json({ error: 'URL YouTube tidak valid.' });
    }

    // 1. Dapatkan info lengkap video dari YouTube
    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '_');

    // 2. Pilih format unduhan yang paling sesuai
    let downloadFormat;
    if (fileFormat === 'mp4') {
      downloadFormat = ytdl.chooseFormat(info.formats, { quality: 'highestvideo', filter: 'videoandaudio' });
    } else {
      downloadFormat = ytdl.chooseFormat(info.formats, { quality: 'highestaudio', filter: 'audioonly' });
    }

    if (!downloadFormat) {
      return response.status(404).json({ error: 'Tidak ada format yang sesuai ditemukan untuk video ini.' });
    }
    
    // 3. Kirim kembali URL download dan judul ke frontend
    response.status(200).json({ 
      downloadUrl: downloadFormat.url,
      title: `${title}.${fileFormat}`
    });

  } catch (error) {
    console.error("Error di backend:", error.message);
    response.status(500).json({ error: 'Gagal mendapatkan info video. Mungkin video ini privat atau dibatasi umur.' });
  }
}
