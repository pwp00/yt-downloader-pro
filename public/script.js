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

        // Tampilkan loading, dan nonaktifkan tombol untuk mencegah klik ganda
        showResult(`
            <div class="spinner-border text-light" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Meminta link unduhan dari server... Mohon tunggu.</p>
        `, 'alert-info');
        downloadMp4Btn.disabled = true;
        downloadMp3Btn.disabled = true;

        try {
            const response = await fetch('/api/download', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: youtubeUrl, format: format }),
            });

            // Logika error handling yang lebih kuat
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Terjadi kesalahan tidak diketahui di server.');
            }

            const data = await response.json();

            // Tampilkan pesan sukses dan tombol download palsu yang akan memicu redirec
            showResult(`✅ Link berhasil didapatkan! Mengunduh **${data.title}**...`, 'alert-success');
            
            // Cara yang lebih baik untuk memicu download tanpa redirect langsung
            const a = document.createElement('a');
            a.href = data.downloadUrl;
            a.download = data.title; // Browser akan menggunakan nama file ini
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

        } catch (error) {
            console.error('Fetch Error:', error);
            showResult(`Gagal: ${error.message}`, 'alert-danger');
        } finally {
            // Aktifkan kembali tombol setelah proses selesai (baik sukses maupun gagal)
            downloadMp4Btn.disabled = false;
            downloadMp3Btn.disabled = false;
        }
    }

    function showResult(message, type) {
        resultDiv.innerHTML = `<div class="alert ${type} p-3" role="alert">${message}</div>`;
    }
});
