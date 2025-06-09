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

    // --- INI BAGIAN PENTING YANG DITAMBAHKAN ---
    // Menambahkan requestOptions untuk menyamarkan permintaan kita
    // agar terlihat seperti datang dari browser biasa.
    const requestOptions = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
      },
    };
    // ---------------------------------------------

    // Gunakan requestOptions saat memanggil getInfo
    const info = await ytdl.getInfo(url, requestOptions);
    const title = info.videoDetails.title.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '_');

    let downloadFormat;
    if (fileFormat === 'mp4') {
      downloadFormat = ytdl.chooseFormat(info.formats, { quality: 'highestvideo', filter: 'videoandaudio' });
    } else {
      downloadFormat = ytdl.chooseFormat(info.formats, { quality: 'highestaudio', filter: 'audioonly' });
    }

    if (!downloadFormat) {
      return response.status(404).json({ error: 'Tidak ada format unduhan yang valid ditemukan untuk video ini (mungkin ini adalah live stream).' });
    }
    
    // Kirim kembali URL download dan judul ke frontend
    response.status(200).json({ 
      downloadUrl: downloadFormat.url,
      title: `${title}.${fileFormat}`
    });

  } catch (error) {
    console.error("Error di backend:", error); // Log error lengkap untuk debugging
    response.status(500).json({ error: 'Gagal mendapatkan info video. Mungkin video ini privat, dibatasi umur, atau YouTube memblokir server kami.' });
  }
}
