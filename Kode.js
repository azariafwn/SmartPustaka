// Konfigurasi Database dan API
const SPREADSHEET_ID = '1B7Ua4FjjfHjVBbVCQ_Sogbv-Lrbxv_KrsQ741hCMOcE';
const API_TOKEN = 'TOKEN_STATIS_DISEPAKATI'; // Anda bisa mengubah token ini nanti

// Fungsi utama untuk menerima HTTP POST dari perangkat keras
function doPost(e) {
  // Menyiapkan format output respons ke JSON
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);

    try {
        // Parsing data JSON yang dikirim oleh ESP32 atau Postman
        const requestData = JSON.parse(e.postData.contents);

        // Validasi Keamanan: Tolak jika token salah atau kosong
        if (requestData.token !== API_TOKEN) {
        output.setContent(JSON.stringify({
            "status": "error",
            "message": "Invalid token"
        }));
        return output; // Menghentikan proses
        }

        // Jika token benar, kirim respons sukses (untuk sementara)
        output.setContent(JSON.stringify({
        "status": "success",
        "action_taken": "api_connected"
        }));
        return output;

    } catch (error) {
        // Tangani error (misal: format JSON rusak)
        output.setContent(JSON.stringify({
        "status": "error",
        "message": "Terjadi kesalahan internal"
        }));
        return output;
    }
}