let dataSiswaGlobal = [];
let dataSoalGlobal = [];

document.addEventListener("DOMContentLoaded", function () {
    muatDataSiswaLocal();

    let selectKelas = document.getElementById("select-kelas");
    if (selectKelas) {
        selectKelas.addEventListener("change", filterNamaSiswa);
    }
    
    let btnMuatSoal = document.getElementById("btn-muat-soal");
    if (btnMuatSoal) {
        btnMuatSoal.addEventListener("click", muatSoalUjianLocal);
    }
});

// 1. Mengambil data siswa dari penyimpanan lokal (localStorage / Data Input Guru)
function muatDataSiswaLocal() {
    // Mengambil data yang diinput dari panel guru (disimpan dengan key 'dataSiswa')
    let storedSiswa = localStorage.getItem("dataSiswa");
    
    if (storedSiswa) {
        dataSiswaGlobal = JSON.parse(storedSiswa);
    } else {
        // Data contoh (bisa diisi atau dihapus nanti saat guru sudah input data sendiri)
        dataSiswaGlobal = [
            { nama: "shane", nis: "0126", kelas: "Kelas 5" },
            { nama: "Feela", nis: "0127", kelas: "Kelas 5" }
        ];
    }
    console.log("Data siswa lokal dimuat:", dataSiswaGlobal);
}

// 2. Filter nama siswa berdasarkan kelas yang dipilih
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
        opt.textContent = `${s.nis ? s.nis + ' - ' : ''}${s.nama}`;
        selectSiswa.appendChild(opt);
    });
}

// 3. Memuat soal ujian secara lokal
function muatSoalUjianLocal() {
    let kelas = document.getElementById("select-kelas")?.value;
    let namaSiswa = document.getElementById("select-siswa")?.value;
    let mapel = document.getElementById("select-mapel")?.value;
    let jenis = document.getElementById("select-jenis")?.value;

    if (!kelas || !namaSiswa || !mapel || !jenis) {
        alert("Mohon lengkapi pilihan Kelas, Nama Siswa, Mata Pelajaran, dan Jenis Kuis terlebih dahulu!");
        return;
    }

    // Mengambil soal yang diinput dari panel guru (disimpan dengan key 'dataSoal')
    let storedSoal = localStorage.getItem("dataSoal");
    let semuaSoal = storedSoal ? JSON.parse(storedSoal) : [];

    // Filter soal berdasarkan Mapel dan Jenis Kuis yang dipilih
    let soalFiltered = semuaSoal.filter(soal => 
        soal.mapel.toLowerCase() === mapel.toLowerCase() && 
        soal.jenis.toLowerCase() === jenis.toLowerCase()
    );

    if (soalFiltered.length === 0) {
        alert("Soal tidak ditemukan untuk Mapel dan Jenis Kuis tersebut.");
        return;
    }

    tampilkanSoal(soalFiltered);
}

// 4. Menampilkan soal ke halaman web
function tampilkanSoal(soalList) {
    let container = document.getElementById("soal-container");
    if (!container) return;

    container.innerHTML = "";

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
