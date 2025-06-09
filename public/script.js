// File: public/script.js

document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('youtube-url');
    const downloadMp4Btn = document.getElementById('download-mp4');
    const downloadMp3Btn = document.getElementById('download-mp3');
    const resultDiv = document.getElementById('result');

    downloadMp4Btn.addEventListener('click', () => {
        processRequest('mp4');
    });

    downloadMp3Btn.addEventListener('click', () => {
        processRequest('mp3');
    });

    async function processRequest(format) {
        const youtubeUrl = urlInput.value.trim();
        if (!youtubeUrl) {
            showResult('Harap masukkan link YouTube terlebih dahulu.', 'alert-warning');
            return;
        }

        showResult(`
            <div class="spinner-border text-light" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">✅ Menghubungi backend... Memulai unduhan. Mohon tunggu, proses ini bisa memakan waktu.</p>
        `, 'alert-info');

        try {
            // Panggil backend kita sendiri di /api/download
            const response = await fetch('/api/download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: youtubeUrl,
                    format: format,
                }),
            });

            // Jika server merespons dengan error, tampilkan pesannya
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Terjadi kesalahan di server.');
            }

            // Karena backend mengirim file langsung, kita proses sebagai blob
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = downloadUrl;

            // Dapatkan nama file dari header
            const contentDisposition = response.headers.get('content-disposition');
            let filename = `download.${format}`;
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="(.+?)"/);
                if (filenameMatch.length > 1) {
                    filename = filenameMatch[1];
                }
            }
            a.download = filename;
            
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(downloadUrl);
            a.remove();
            
            showResult(`Unduhan telah dimulai! Periksa folder download Anda.`, 'alert-success');

        } catch (error) {
            console.error('Fetch Error:', error);
            showResult(`Gagal: ${error.message}`, 'alert-danger');
        }
    }

    function showResult(message, type) {
        resultDiv.innerHTML = `<div class="alert ${type} p-3">${message}</div>`;
    }
});
