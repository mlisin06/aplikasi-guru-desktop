const URL_WEB_APP = "https://script.google.com/macros/s/AKfycbwYecpmtzM0zXVe8CxXQDON3BL0bVCgupAYVj8Zhd69O27TQqvmZjh2M-DpR077Xbw/exec";

let dataSiswaGlobal = [];
let dataSoalGlobal = [];

document.addEventListener("DOMContentLoaded", function () {
    ambilDataSiswaDariServer();
});

// Ambil daftar siswa dari Google Sheets
async function ambilDataSiswaDariServer() {
    try {
        let res = await fetch(`${URL_WEB_APP}?action=getSiswa`);
        dataSiswaGlobal = await res.json();
    } catch (e) {
        console.error("Gagal mengambil data siswa:", e);
    }
}

// Filter nama siswa berdasarkan kelas yang dipilih
function filterNamaSiswa() {
    let kelasDipilih = document.getElementById("select-kelas").value;
    let selectSiswa = document.getElementById("select-siswa");
    
    selectSiswa.innerHTML = '<option value="">-- Pilih Nama Anda --</option>';
    
    let filtered = dataSiswaGlobal.filter(s => s.kelas === kelasDipilih);
    filtered.forEach(s => {
        let opt = document.createElement("option");
        opt.value = s.nama;
        opt.textContent = `${s.absen} - ${s.nama}`;
        selectSiswa.appendChild(opt);
    });
}

// Muat soal berdasarkan mapel
async function muatSoalUjian() {
    let kelas = document.getElementById("select-kelas").value;
    let nama = document.getElementById("select-siswa").value;
    let mapel = document.getElementById("select-mapel").value;

    if (!kelas || !nama || !mapel) {
        alert("Harap pilih Kelas, Nama Siswa, dan Mata Pelajaran terlebih dahulu!");
        return;
    }

    let container = document.getElementById("soal-container");
    container.innerHTML = `<div class="text-center p-5"><h5>Sedang memuat soal ${mapel}...</h5></div>`;

    try {
        let res = await fetch(`${URL_WEB_APP}?action=getSoal&mapel=${encodeURIComponent(mapel)}&kelas=${encodeURIComponent(kelas)}`);
        dataSoalGlobal = await res.json();

        if (dataSoalGlobal.length === 0) {
            container.innerHTML = `<div class="alert alert-warning text-center">Belum ada soal untuk mata pelajaran ${mapel} di ${kelas}.</div>`;
            document.getElementById("submit-container").style.display = "none";
            return;
        }

        container.innerHTML = "";
        dataSoalGlobal.forEach((s, i) => {
            container.innerHTML += `
                <div class="card card-soal p-4">
                    <p><b>Soal ${i + 1}.</b> ${s.pertanyaan}</p>
                    <div class="custom-control custom-radio mb-2"><input type="radio" id="s${i}a" name="jawaban_${i}" value="A" class="custom-control-input"><label class="custom-control-label" for="s${i}a">A. ${s.opsiA}</label></div>
                    <div class="custom-control custom-radio mb-2"><input type="radio" id="s${i}b" name="jawaban_${i}" value="B" class="custom-control-input"><label class="custom-control-label" for="s${i}b">B. ${s.opsiB}</label></div>
                    <div class="custom-control custom-radio mb-2"><input type="radio" id="s${i}c" name="jawaban_${i}" value="C" class="custom-control-input"><label class="custom-control-label" for="s${i}c">C. ${s.opsiC}</label></div>
                    <div class="custom-control custom-radio mb-2"><input type="radio" id="s${i}d" name="jawaban_${i}" value="D" class="custom-control-input"><label class="custom-control-label" for="s${i}d">D. ${s.opsiD}</label></div>
                </div>
            `;
        });

        document.getElementById("submit-container").style.display = "block";
    } catch (e) {
        console.error("Gagal memuat soal:", e);
        container.innerHTML = `<div class="alert alert-danger text-center">Gagal memuat soal dari server.</div>`;
    }
}

// Kirim jawaban ke Google Sheets
async function kirimJawabanSiswa() {
    let kelas = document.getElementById("select-kelas").value;
    let nama = document.getElementById("select-siswa").value;
    let mapel = document.getElementById("select-mapel").value;

    let benar = 0;
    let total = dataSoalGlobal.length;
    let detail = {};

    dataSoalGlobal.forEach((s, i) => {
        let pilihan = document.querySelector(`input[name="jawaban_${i}"]:checked`);
        let val = pilihan ? pilihan.value.trim() : "Tidak Diisi";
        detail[`Soal_${i + 1}`] = val;

        let kunci = String(s.kunci || "").trim();
        if (kunci && val.toUpperCase() === kunci.toUpperCase()) {
            benar++;
        }
    });

    let nilaiAkhir = Math.round((benar / total) * 100);

    let payload = {
        kelas: kelas,
        nama: nama,
        mapel: mapel,
        nilai: nilaiAkhir,
        jawaban: detail
    };

    try {
        await fetch(URL_WEB_APP, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        alert(`Horee! Ujian selesai.\nNama: ${nama}\nKelas: ${kelas}\nMapel: ${mapel}\nNilai Anda: ${nilaiAkhir}`);
        location.reload();
    } catch (e) {
        console.error("Gagal mengirim:", e);
        alert("Terjadi kesalahan saat mengirim jawaban.");
    }
}
