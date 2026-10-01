
const URL_WEB_APP = "https://script.google.com/macros/s/AKfycbx5nkmrvSUusyiJ0qIYQYnXxroIWMQdHYWbKbTpM6X6VbQ1eyxZ-9EDNANANKeT6a2_YQ/exec";
const URL_WEB_APP = "https://script.google.com/macros/s/AKfycbx5nkmrvSUusyiJ0qIYQYnXxroIWMQdHYWbKbTpM6X6VbQ1eyxZ-9EDNANANKeT6a2_YQ/exec";

document.addEventListener("DOMContentLoaded", function () {
    muatDataSiswa();
    muatDataSoal();
});

// Fungsi Memuat Data Siswa
function muatDataSiswa() {
    const selectSiswa = document.getElementById("namaSiswa");
    if (!selectSiswa) return;

    fetch(URL_WEB_APP + "?action=getSiswa")
        .then(response => response.json())
        .then(data => {
            selectSiswa.innerHTML = '<option value="">-- Pilih Nama Siswa --</option>';
            
            // Pastikan data berupa array sebelum diloop
            let listSiswa = Array.isArray(data) ? data : (data.siswa || []);
            
            if (listSiswa.length > 0) {
                listSiswa.forEach(nama => {
                    let opt = document.createElement("option");
                    opt.value = nama;
                    opt.textContent = nama;
                    selectSiswa.appendChild(opt);
                });
            } else {
                selectSiswa.innerHTML = '<option value="">-- Tidak ada data siswa --</option>';
            }
        })
        .catch(err => {
            console.error("Gagal muat siswa:", err);
            selectSiswa.innerHTML = '<option value="">-- Gagal memuat data siswa --</option>';
        });
}

// Fungsi Memuat Data Soal
function muatDataSoal() {
    const containerSoal = document.getElementById("containerSoal") || document.getElementById("soalContainer");
    
    fetch(URL_WEB_APP + "?action=getSoal")
        .then(response => response.json())
        .then(data => {
            // Pengaman utama: pastikan dataSoalList selalu berupa array agar tidak error filter
            let dataSoalList = Array.isArray(data) ? data : (data.soal || data.data || []);
            
            if (dataSoalList.length === 0) {
                if (containerSoal) containerSoal.innerHTML = "<p>Tidak ada soal tersedia.</p>";
                return;
            }

            // Jalankan fungsi filter dengan aman karena dipastikan sudah berupa array
            renderSoal(dataSoalList);
        })
        .catch(err => {
            console.error("Gagal muat soal:", err);
            if (containerSoal) containerSoal.innerHTML = "<p>Gagal memuat format soal.</p>";
        });
}

function renderSoal(dataSoalList) {
    const containerSoal = document.getElementById("containerSoal") || document.getElementById("soalContainer");
    if (!containerSoal) return;

    let html = "";
    dataSoalList.forEach((soal, index) => {
        html += `
            <div class="soal-item" style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 8px;">
                <p><b>${index + 1}. ${soal.pertanyaan || soal.soal}</b></p>
                <label><input type="radio" name="jawaban_${index}" value="A"> ${soal.opsiA || soal.a}</label><br>
                <label><input type="radio" name="jawaban_${index}" value="B"> ${soal.opsiB || soal.b}</label><br>
                <label><input type="radio" name="jawaban_${index}" value="C"> ${soal.opsiC || soal.c}</label><br>
                <label><input type="radio" name="jawaban_${index}" value="D"> ${soal.opsiD || soal.d}</label>
            </div>
        `;
    });
    containerSoal.innerHTML = html;
}
