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

        // Validasi Keamanan Token [cite: 3, 6]
        if (requestData.token !== API_TOKEN) {
        return createResponse(output, "error", "Invalid token");
        }

        // Pastikan action adalah "tap" [cite: 3]
        if (requestData.action === "tap" && requestData.uid) {
        return processTap(output, requestData.uid, requestData.tipe_tap);
        } else {
        return createResponse(output, "error", "Action tidak dikenali atau UID kosong");
        }

    } catch (error) {
        return createResponse(output, "error", "Internal Server Error: " + error.toString());
    }
}

// Logika pemrosesan tap berdasarkan State [cite: 3, 10]
function processTap(output, uid, tipeTap) {
    const configSheet = getSheetByName("Config");
    // Mengambil status dari sel A2 [cite: 5]
    const modeAktif = configSheet.getRange("A2").getValue(); 

    if (modeAktif === "REG_MEMBER" || modeAktif === "REG_BOOK") {
        // Mode Pendaftaran: Simpan UID ke temp_uid di sel B2 
        configSheet.getRange("B2").setValue(uid);
        configSheet.getRange("C2").setValue(new Date()); // Update waktu [cite: 5]
        
        return createResponse(output, "success", "saved_to_temp");
    } 
    else if (modeAktif === "IDLE") {
        // Mode Transaksi Normal (Akan kita buat fiturnya di tahap selanjutnya) [cite: 3]
        return createResponse(output, "success", "transaksi_diproses");
    }
    
    return createResponse(output, "error", "Mode tidak valid");
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