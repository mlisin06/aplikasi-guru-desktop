// Ganti URL di bawah ini dengan URL Web App Google Apps Script Anda yang berakhiran /exec
const URL_WEB_APP = "https://script.google.com/macros/s/AKfycbx5nkmrvSUusyiJ0qIYQYnXxroIWMQdHYWbKbTpM6X6VbQ1eyxZ-9EDNANANKeT6a2_YQ/exec";

document.addEventListener("DOMContentLoaded", function () {
    loadSiswa();
    loadSoal();
    
    // Mendukung berbagai macam ID form ujian
    const formUjian = document.getElementById("form-ujian") || document.getElementById("formUjian") || document.querySelector("form");
    if (formUjian) {
        formUjian.addEventListener("submit", function (e) {
            e.preventDefault();
            kirimJawaban();
        });
    }
});

let dataSoalList = [];

// Fungsi untuk memuat daftar nama siswa dari Google Sheets
async function loadSiswa() {
    try {
        let response = await fetch(`${URL_WEB_APP}?action=getSiswa`);
        let data = await response.json();
        
        let selectSiswa = document.getElementById("select-siswa") || document.getElementById("namaSiswa");
        if (selectSiswa) {
            selectSiswa.innerHTML = '<option value="">-- Pilih Nama Anda --</option>';
            data.forEach(nama => {
                let opt = document.createElement("option");
                opt.value = nama;
                opt.textContent = nama;
                selectSiswa.appendChild(opt);
            });
        }
    } catch (err) {
        console.error("Gagal memuat data siswa:", err);
    }
}

// Fungsi untuk memuat daftar soal dan pilihan ganda dari Google Sheets
async function loadSoal() {
    try {
        let response = await fetch(`${URL_WEB_APP}?action=getSoal`);
        dataSoalList = await response.json();
        
        let container = document.getElementById("soal-container") || document.getElementById("containerSoal");
        if (container) {
            container.innerHTML = "";
            dataSoalList.forEach((soal, index) => {
                let div = document.createElement("div");
                div.className = "soal-item mb-4 p-3 border rounded shadow-sm bg-white";
                div.innerHTML = `
                    <p class="font-weight-bold"><b>${index + 1}. ${soal.pertanyaan}</b></p>
                    <div class="form-check"><input class="form-check-input" type="radio" name="jawaban_${index}" value="A" id="s${index}_a"><label class="form-check-label" for="s${index}_a">A. ${soal.opsiA}</label></div>
                    <div class="form-check"><input class="form-check-input" type="radio" name="jawaban_${index}" value="B" id="s${index}_b"><label class="form-check-label" for="s${index}_b">B. ${soal.opsiB}</label></div>
                    <div class="form-check"><input class="form-check-input" type="radio" name="jawaban_${index}" value="C" id="s${index}_c"><label class="form-check-label" for="s${index}_c">C. ${soal.opsiC}</label></div>
                    <div class="form-check"><input class="form-check-input" type="radio" name="jawaban_${index}" value="D" id="s${index}_d"><label class="form-check-label" for="s${index}_d">D. ${soal.opsiD}</label></div>
                `;
                container.appendChild(div);
            });
        }
    } catch (err) {
        console.error("Gagal memuat soal:", err);
    }
}

// Fungsi untuk menghitung nilai otomatis dan mengirim jawaban ke Google Sheets
async function kirimJawaban() {
    const selectSiswa = document.getElementById("select-siswa") || document.getElementById("namaSiswa");
    const namaSiswa = selectSiswa ? selectSiswa.value : "";

    if (!namaSiswa) {
        alert("Silakan pilih Nama Siswa terlebih dahulu!");
        return;
    }

    if (dataSoalList.length === 0) {
        alert("Tidak ada soal yang tersedia untuk dikirim.");
        return;
    }

    let totalSoal = dataSoalList.length;
    let jawabanBenar = 0;
    let hasilJawaban = {};

    // Proses pencocokan jawaban siswa dengan kunci jawaban dari server
    dataSoalList.forEach((soal, index) => {
        const inputRadio = document.querySelector(`input[name="jawaban_${index}"]:checked`);
        let val = inputRadio ? inputRadio.value.trim() : "Tidak Diisi";

        hasilJawaban[`Soal_${index + 1}`] = val;

        let kunciJawaban = String(soal.kunci || "").trim();
        if (kunciJawaban && val.toUpperCase() === kunciJawaban.toUpperCase()) {
            jawabanBenar++;
        }
    });

    // Hitung nilai akhir berskala 0 sampai 100
    let nilaiAkhir = Math.round((jawabanBenar / totalSoal) * 100);

    const payload = {
        nama: namaSiswa,
        nilai: nilaiAkhir,
        jawaban: hasilJawaban
    };

    try {
        await fetch(URL_WEB_APP, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        alert("Ujian berhasil dikirim! Nilai Anda: " + nilaiAkhir);
        location.reload();
    } catch (err) {
        console.error("Gagal mengirim jawaban:", err);
        alert("Gagal mengirim jawaban. Periksa koneksi internet Anda.");
    }
}
