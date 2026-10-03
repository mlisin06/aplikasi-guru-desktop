// Ganti URL di bawah ini dengan URL Web App Google Apps Script Anda yang berakhiran /exec
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx5nkmrvSUusyiJ0qIYQYnXxroIWMQdHYWbKbTpM6X6VbQ1eyxZ-9EDNANANKeT6a2_YQ/exec";

let dataSiswaGlobal = [];
let dataSoalGlobal = [];

document.addEventListener("DOMContentLoaded", function () {
    muatDataSiswa();

    // Event listener saat kelas dipilih
    let selectKelas = document.getElementById("select-kelas");
    if (selectKelas) {
        selectKelas.addEventListener("change", filterNamaSiswa);
    }
    
    // Event listener tombol muat soal
    let btnMuatSoal = document.getElementById("btn-muat-soal");
    if (btnMuatSoal) {
        btnMuatSoal.addEventListener("click", muatSoalUjian);
    }
});

// 1. Mengambil data siswa dari Google Sheets (Aman & Otomatis Filter)
async function muatDataSiswa() {
    try {
        let response = await fetch(`${SCRIPT_URL}?action=getSiswa`);
        let result = await response.json();
        
        console.log("Respon server dari Google Sheets:", result);
        
        if (Array.isArray(result)) {
            dataSiswaGlobal = result;
            console.log("Data siswa berhasil dimuat:", dataSiswaGlobal);
            
            // Jika dropdown kelas sudah terlanjur dipilih sebelum data selesai ditarik, jalankan filter otomatis
            let selectKelas = document.getElementById("select-kelas");
            if (selectKelas && selectKelas.value) {
                filterNamaSiswa();
            }
        } else {
            console.error("Format data dari server bukan array:", result);
        }
    } catch (error) {
        console.error("Terjadi kesalahan saat mengambil data siswa:", error);
    }
}

// 2. Filter nama siswa berdasarkan kelas yang dipilih (Fleksibel & Aman dari error)
function filterNamaSiswa() {
    let selectKelas = document.getElementById("select-kelas");
    let selectSiswa = document.getElementById("select-siswa");
    
    if (!selectKelas || !selectSiswa) return;

    let kelasDipilih = selectKelas.value.trim().toLowerCase();
    
    selectSiswa.innerHTML = '<option value="">-- Pilih Nama Anda --</option>';
    
    if (!kelasDipilih) return;

    let angkaFilter = kelasDipilih.replace(/[^0-9]/g, '');

    let filtered = dataSiswaGlobal.filter(s => {
        let kelasSiswa = String(s.kelas || "").trim().toLowerCase();
        let angkaSiswa = kelasSiswa.replace(/[^0-9]/g, '');
        
        return kelasSiswa === kelasDipilih || 
               kelasSiswa.includes(kelasDipilih) || 
               kelasDipilih.includes(kelasSiswa) ||
               (angkaFilter && angkaSiswa === angkaFilter);
    });

    if (filtered.length === 0) {
        let opt = document.createElement("option");
        opt.value = "";
        opt.textContent = "-- Belum ada siswa di kelas ini --";
        selectSiswa.appendChild(opt);
        return;
    }

    filtered.forEach(s => {
        let opt = document.createElement("option");
        opt.value = s.nama;
        // Menampilkan NIS di depan nama secara rapi (contoh: "0126 - shane")
        opt.textContent = `${s.nis ? s.nis + ' - ' : ''}${s.nama}`;
        selectSiswa.appendChild(opt);
    });
}

// 3. Memuat soal ujian berdasarkan Mapel dan Jenis Kuis
async function muatSoalUjian() {
    let kelas = document.getElementById("select-kelas")?.value;
    let namaSiswa = document.getElementById("select-siswa")?.value;
    let mapel = document.getElementById("select-mapel")?.value;
    let jenis = document.getElementById("select-jenis")?.value;

    if (!kelas || !namaSiswa || !mapel || !jenis) {
        alert("Mohon lengkapi pilihan Kelas, Nama Siswa, Mata Pelajaran, dan Jenis Kuis terlebih dahulu!");
        return;
    }

    try {
        let url = `${SCRIPT_URL}?action=getSoal&mapel=${encodeURIComponent(mapel)}&jenis=${encodeURIComponent(jenis)}`;
        let response = await fetch(url);
        let result = await response.json();

        if (Array.isArray(result)) {
            dataSoalGlobal = result;
            tampilkanSoal(dataSoalGlobal);
        } else {
            alert("Soal tidak ditemukan untuk kriteria tersebut.");
        }
    } catch (error) {
        console.error("Gagal memuat soal:", error);
        alert("Terjadi kesalahan saat memuat soal dari server.");
    }
}

// 4. Menampilkan soal ke halaman web
function tampilkanSoal(soalList) {
    let container = document.getElementById("soal-container");
    if (!container) return;

    container.innerHTML = "";

    if (soalList.length === 0) {
        container.innerHTML = "<p>Tidak ada soal tersedia.</p>";
        return;
    }

    soalList.forEach((soal, index) => {
        let soalDiv = document.createElement("div");
        soalDiv.className = "soal-item mb-4 p-3 border rounded";
        soalDiv.innerHTML = `
            <p><strong>Soal ${index + 1}.</strong> ${soal.pertanyaan}</p>
            <div class="form-check"><input type="radio" name="jawaban_${index}" value="A" class="form-check-input"> A. ${soal.opsiA}</div>
            <div class="form-check"><input type="radio" name="jawaban_${index}" value="B" class="form-check-input"> B. ${soal.opsiB}</div>
            <div class="form-check"><input type="radio" name="jawaban_${index}" value="C" class="form-check-input"> C. ${soal.opsiC}</div>
            <div class="form-check"><input type="radio" name="jawaban_${index}" value="D" class="form-check-input"> D. ${soal.opsiD}</div>
        `;
        container.appendChild(soalDiv);
    });
}
