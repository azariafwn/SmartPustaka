# SmartPustaka 📚

**SmartPustaka** is a 100% serverless, zero-cost wireless library management system. It bridges the gap between physical hardware (ESP32/RFID scanners) and a web-based dashboard using Google Apps Script (GAS) as the backend API and Google Sheets as the database.

## ✨ Features

- **Zero Server Cost:** Utilizes Google Apps Script and Google Sheets for backend and database operations.
- **Hardware Integration:** Exposes a secure POST API endpoint for ESP32/microcontrollers to send RFID tap data.
- **Real-time Registration Mode:** Dynamic state management allows the web UI to catch hardware UID scans in real-time when adding new members or books.
- **Responsive Web Dashboard:** A clean, single-page application (SPA) built with Bootstrap 5 and served via GAS HTML Service.
- **Relational Data Mapping:** Automatically joins Transaction UIDs with Member Names and Book Titles for human-readable logs.
- **Full CRUD Operations:** Manage Books, Members, and Library Transactions directly from the web interface.

## 🛠️ Tech Stack

- **Backend:** Google Apps Script (GAS)
- **Database:** Google Sheets
- **Frontend:** HTML, JavaScript, Bootstrap 5
- **Version Control & Deployment:** Git, GitHub, [Google Clasp](https://github.com/google/clasp)
- **Hardware (Out of Repo Scope):** ESP32, RFID Reader (MFRC522)

## 🗄️ Database Structure (Google Sheets)

The system requires a Google Spreadsheet with 4 specific sheets (tabs):
1. **Config:** `mode_aktif` | `temp_uid` | `last_update` (Row 2 acts as the active state memory)
2. **Anggota:** `uid_anggota` | `nama` | `kelas` | `tanggal_daftar`
3. **Buku:** `uid_buku` | `judul` | `penulis` | `status_tersedia`
4. **Transaksi:** `id_transaksi` | `waktu` | `uid_anggota` | `uid_buku` | `status`

## 🚀 Getting Started

Follow these instructions to set up the project locally and deploy it to your own Google Workspace.

### Prerequisites

- [Node.js](https://nodejs.org/) installed on your machine.
- A Google Account.

### Installation & Deployment

1. **Install Clasp Globally:**
```bash
npm install -g @google/clasp

```

2. **Login to Google Clasp:**
```bash
clasp login

```


3. **Clone this Repository:**
```bash
git clone [https://github.com/YOUR_USERNAME/SmartPustaka.git](https://github.com/YOUR_USERNAME/SmartPustaka.git)
cd SmartPustaka

```


4. **Prepare the Database:**
* Create a new Google Spreadsheet and create the 4 sheets as described in the Database Structure section.
* Set cell `A2` in the **Config** sheet to `IDLE`.
* Copy the Spreadsheet ID from the URL (the long random string between `/d/` and `/edit`).


5. **Link Project to Google Apps Script:**
Create a new GAS project linked to your working directory:
```bash
clasp create --type webapp --title "SmartPustaka Backend"

```


*(This will generate a `.clasp.json` file).*
6. **Configure Environment Variables:**
Open `Code.gs` and update the constants at the top of the file:
```javascript
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
const API_TOKEN = 'YOUR_SECRET_TOKEN';

```


7. **Push Code to Google Cloud:**
```bash
clasp push

```


8. **Deploy as a Web App:**
* Open the GAS Editor in your browser (`script.google.com`).
* Click **Deploy > New deployment**.
* Select **Web app**.
* Set **Execute as** to `Me` and **Who has access** to `Anyone`.
* Click **Deploy**.
* Copy the Web App URL (`/exec`). This URL will be used to access your dashboard and as the endpoint for your ESP32 hardware.



## 📡 API Usage (For Hardware Developers)

The system listens for HTTP POST requests at the deployed Web App URL.

**Headers:** `Content-Type: application/json`

**Payload for Transaction (IDLE Mode):**

```json
{
  "token": "YOUR_SECRET_TOKEN",
  "action": "tap",
  "uid_anggota": "USER-X999",
  "uid_buku": "BUKU-A111",
  "status": "Pinjam" // or "Kembali"
}

```

**Payload for Registration (REG_BOOK / REG_MEMBER Mode):**

```json
{
  "token": "YOUR_SECRET_TOKEN",
  "action": "tap",
  "uid": "NEW-UID-123",
  "tipe_tap": "tunggal"
}

```

```
