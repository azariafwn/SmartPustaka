// Konfigurasi Database dan API
const SPREADSHEET_ID = '1B7Ua4FjjfHjVBbVCQ_Sogbv-Lrbxv_KrsQ741hCMOcE';
const API_TOKEN = 'TOKEN_STATIS_DISEPAKATI';

// Fungsi bantuan untuk mendapatkan sheet berdasarkan nama
function getSheetByName(sheetName) {
    return SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(sheetName);
}

// Fungsi utama menerima data (POST)
function doPost(e) {
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);

    try {
        const requestData = JSON.parse(e.postData.contents);

        // Validasi Keamanan Token
        if (requestData.token !== API_TOKEN) {
        return createResponse(output, "error", "Invalid token");
        }

        // Pastikan action adalah "tap"
        if (requestData.action === "tap") {
        return processTap(output, requestData); // Passing seluruh requestData
        } else {
        return createResponse(output, "error", "Action tidak dikenali");
        }

    } catch (error) {
        return createResponse(output, "error", "Internal Server Error: " + error.toString());
    }
}

// Logika pemrosesan tap berdasarkan State
function processTap(output, requestData) {
    const configSheet = getSheetByName("Config");
    const modeAktif = configSheet.getRange("A2").getValue(); 

    if (modeAktif === "REG_MEMBER" || modeAktif === "REG_BOOK") {
        // Mode Pendaftaran: Butuh parameter 'uid' tunggal
        if (!requestData.uid) return createResponse(output, "error", "UID kosong untuk pendaftaran");
        
        configSheet.getRange("B2").setValue(requestData.uid);
        configSheet.getRange("C2").setValue(new Date()); 
        return createResponse(output, "success", "saved_to_temp");
    } 
    else if (modeAktif === "IDLE") {
        // Mode Transaksi Normal: Butuh uid_anggota, uid_buku, dan status
        if (!requestData.uid_anggota || !requestData.uid_buku || !requestData.status) {
        return createResponse(output, "error", "Data transaksi tidak lengkap");
        }
        return catatTransaksi(output, requestData.uid_anggota, requestData.uid_buku, requestData.status);
    }
    
    return createResponse(output, "error", "Mode tidak valid");
}

// Fungsi khusus mencatat riwayat peminjaman/pengembalian
function catatTransaksi(output, uidAnggota, uidBuku, statusTransaksi) {
    const sheetTransaksi = getSheetByName("Transaksi");
    
    // Membuat ID Transaksi unik berbasis waktu
    const idTransaksi = "TRX-" + new Date().getTime(); 
    const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");

    // Menyimpan sesuai struktur kolom ERD Sheet Transaksi
    sheetTransaksi.appendRow([idTransaksi, timestamp, uidAnggota, uidBuku, statusTransaksi]);

    return createResponse(output, "success", "transaksi_berhasil");
}

// Fungsi bantuan untuk memformat JSON Output
function createResponse(outputObj, status, messageOrAction) {
    const responseBody = { "status": status };
    
    if (status === "success") {
        responseBody["action_taken"] = messageOrAction; // Respons sukses memuat action_taken [cite: 3]
    } else {
        responseBody["message"] = messageOrAction; // Respons error memuat message [cite: 3]
    }
    
    outputObj.setContent(JSON.stringify(responseBody));
    return outputObj;
}

// --- FUNGSI FRONTEND (UI) ---

// Fungsi khusus GAS untuk merender halaman HTML saat URL Web App dibuka
function doGet(e) {
    // Memanggil file Index.html untuk ditampilkan
    return HtmlService.createHtmlOutputFromFile('Index')
        .setTitle('SmartPustaka Admin') // Mengubah judul tab browser
        .addMetaTag('viewport', 'width=device-width, initial-scale=1'); // Mendukung responsivitas di HP
}

// --- FUNGSI JEMBATAN DATA KE FRONTEND ---

// Fungsi untuk mengambil data dari Sheet tertentu (dipanggil oleh HTML)
function getTableData(sheetName) {
    const sheet = getSheetByName(sheetName);
    if (!sheet) return [];
    
    const data = sheet.getDataRange().getDisplayValues();
    // Hapus baris pertama (header) agar tidak ikut ter-render sebagai data
    if (data.length > 1) {
        data.shift();
        return data;
    }
    return []; // Kembalikan array kosong jika sheet hanya berisi header
}


// --- FUNGSI MANAJEMEN PENDAFTARAN (DIPANGGIL OLEH WEB) ---

// Mengubah mode alat dari web (misal: ke REG_BOOK atau REG_MEMBER)
function setSystemMode(mode) {
    const configSheet = getSheetByName("Config");
    configSheet.getRange("A2").setValue(mode);
    configSheet.getRange("B2").clearContent(); // Bersihkan memori UID lama agar bersih
    return "Mode diubah ke " + mode;
    }

    // Mengecek apakah alat sudah menembakkan UID ke Sheet Config (Polling)
    function checkTempUid() {
    const uid = getSheetByName("Config").getRange("B2").getValue();
    return uid ? uid : "";
}

// Menyimpan data buku baru ke Sheet Buku
function saveBukuBaru(judul, penulis) {
    const configSheet = getSheetByName("Config");
    const uid = configSheet.getRange("B2").getValue();
    
    if (!uid) throw new Error("UID belum didapatkan dari alat!");

    const sheetBuku = getSheetByName("Buku");
    // Menyimpan sesuai urutan kolom ERD: uid_buku, judul, penulis, status_tersedia [cite: 5]
    sheetBuku.appendRow([uid, judul, penulis, true]); 

    // Reset alat ke mode normal (IDLE) [cite: 10]
    configSheet.getRange("A2").setValue("IDLE");
    configSheet.getRange("B2").clearContent();
    return "Buku berhasil ditambahkan!";
}

// Menyimpan data anggota baru ke Sheet Anggota
function saveAnggotaBaru(nama, kelas) {
    const configSheet = getSheetByName("Config");
    const uid = configSheet.getRange("B2").getValue();
    
    if (!uid) throw new Error("UID belum didapatkan dari alat!");

    const sheetAnggota = getSheetByName("Anggota");
    // Menyimpan sesuai urutan kolom ERD: uid_anggota, nama, kelas, tanggal_daftar [cite: 5]
    const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
    sheetAnggota.appendRow([uid, nama, kelas, timestamp]); 

    // Reset alat ke mode normal (IDLE) [cite: 10]
    configSheet.getRange("A2").setValue("IDLE");
    configSheet.getRange("B2").clearContent();
    return "Anggota berhasil ditambahkan!";
}


// --- FUNGSI MANAJEMEN DATA (DELETE) ---

// Menghapus baris transaksi berdasarkan id_transaksi [cite: 9, 11]
function hapusDataTransaksi(idTransaksi) {
    const sheet = getSheetByName("Transaksi");
    const data = sheet.getDataRange().getValues();
    
    // Looping untuk mencari ID yang cocok
    for (let i = 1; i < data.length; i++) {
        if (data[i][0] === idTransaksi) {
        sheet.deleteRow(i + 1); // +1 karena array mulai dari 0, baris Sheet mulai dari 1
        return "Data transaksi berhasil dihapus.";
        }
    }
    throw new Error("ID Transaksi tidak ditemukan di database.");
}