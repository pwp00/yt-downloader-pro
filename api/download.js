export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Ambil data dari frontend kita
    const { url: youtubeUrl, format: fileFormat } = request.body;

    if (!youtubeUrl) {
      return response.status(400).json({ error: 'URL YouTube tidak diberikan.' });
    }

    // Alamat API publik yang akan kita gunakan sebagai 'pekerja'
    const workerApiUrl = 'https://co.lbal.me/api/json';

    // Kirim permintaan dari backend kita ke API pekerja tersebut
    const workerResponse = await fetch(workerApiUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: youtubeUrl,
        aFormat: 'mp3', // Format audio (bisa mp3, ogg, dll)
        vQuality: '1080', // Kualitas video
        isAudioOnly: fileFormat === 'mp3',
      }),
    });

    const workerData = await workerResponse.json();

    // Periksa respons dari API pekerja
    if (workerData.status !== 'stream') {
      // Jika pekerja gagal, teruskan pesannya
      throw new Error(workerData.text || 'API pekerja gagal memproses permintaan.');
    }

    // Jika pekerja berhasil, kirim link download dan judul ke frontend kita
    response.status(200).json({
      downloadUrl: workerData.url,
      // Kita coba dapatkan judul dari respons, jika tidak ada, buat judul generik
      title: `download.${fileFormat}`,
    });

  } catch (error) {
    console.error("Error di backend proxy:", error.message);
    response.status(500).json({ error: error.message });
  }
}
