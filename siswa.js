const URL_WEB_APP = "https://script.google.com/macros/s/AKfycbyI-MoR-4xGjrxrbgn-rKjqLiHzrrQQ0tJwlFGBSExRl9BBE9pVPTGzvobYMoMkrei0/exec";

// Variable Global
let dataSiswaList = [];
let dataSoalList = [];
let soalTersaring = [];

// Otomatis jalankan saat halaman terbuka
document.addEventListener("DOMContentLoaded", () => {
    muatDataSiswa();

    const selectKelas = document.getElementById("select-kelas");
    if (selectKelas) {
        selectKelas.addEventListener("change", () => {
            updateDropdownSiswa();
            muatDataSoal();
        });
    }

    const selectModul = document.getElementById("select-modul");
    if (selectModul) {
        selectModul.addEventListener("change", () => {
            muatDataSoal();
        });
    }

    const selectSiswa = document.getElementById("select-siswa");
    if (selectSiswa) {
        selectSiswa.addEventListener("change", () => {
            muatHistoriSiswa();
        });
    }
});

// 1. Memuat Data Siswa
async function muatDataSiswa() {
    const selectKelas = document.getElementById("select-kelas");
    const selectSiswa = document.getElementById("select-siswa");
    if (!selectKelas || !selectSiswa) return;

    try {
        const res = await fetch(URL_WEB_APP + "?action=getSiswa");
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
            dataSiswaList = data.map(item => {
                let nama = "";
                let kelas = "";
                if (typeof item === "object" && item !== null) {
                    nama = item.nama || item.Nama || item.SISWA || item.Siswa || Object.values(item)[0] || "";
                    kelas = item.kelas || item.Kelas || item.KELAS || Object.values(item)[1] || "Umum";
                } else {
                    nama = String(item);
                    kelas = "Umum";
                }
                return { nama: nama.trim(), kelas: kelas.trim() };
            }).filter(s => s.nama !== "");

            const daftarKelas = [...new Set(dataSiswaList.map(s => s.kelas))];
            selectKelas.innerHTML = '<option value="">-- Pilih Kelas --</option>';
            daftarKelas.forEach(k => {
                selectKelas.innerHTML += `<option value="${k}">${k}</option>`;
            });
        }
    } catch (err) {
        console.error("Gagal muat siswa:", err);
    }
}

function updateDropdownSiswa() {
    const selectKelas = document.getElementById("select-kelas");
    const selectSiswa = document.getElementById("select-siswa");
    const kelasPilihan = selectKelas.value;

    selectSiswa.innerHTML = '<option value="">-- Pilih Nama Anda --</option>';
    if (!kelasPilihan) {
        selectSiswa.disabled = true;
        return;
    }

    const siswaFiltered = dataSiswaList.filter(s => s.kelas === kelasPilihan);
    siswaFiltered.forEach(s => {
        selectSiswa.innerHTML += `<option value="${s.nama}">${s.nama}</option>`;
    });
    selectSiswa.disabled = false;
}

// 2. Memuat Soal
async function muatDataSoal() {
    const wadah = document.getElementById("container-soal");
    const selectJenis = document.getElementById("select-modul");
    const selectKelas = document.getElementById("select-kelas");
    
    const jenisDipilih = selectJenis ? selectJenis.value.trim() : "";
    const kelasDipilih = selectKelas ? selectKelas.value.trim().toLowerCase() : "";

    if (!wadah) return;
    if (!jenisDipilih) {
        wadah.innerHTML = '<p class="text-center text-muted">Silakan pilih jenis kuis terlebih dahulu.</p>';
        soalTersaring = [];
        return;
    }

    wadah.innerHTML = '<p style="text-align:center; color:#64748b;">Memuat kuis...</p>';

    try {
        if (dataSoalList.length === 0) {
            const res = await fetch(URL_WEB_APP + "?action=getSoal");
            dataSoalList = await res.json();
        }

        const jenisLower = jenisDipilih.toLowerCase();

        soalTersaring = dataSoalList.filter(s => {
            const j = String(s.jenis || "").trim().toLowerCase();
            const kelasSoal = String(s.kelas || s.KELAS || "").trim().toLowerCase();

            let cocokKelas = true;
            if (kelasDipilih && kelasSoal) {
                cocokKelas = kelasSoal.includes(kelasDipilih);
            }

            let cocokJenis = false;
            if (jenisLower.includes("pilihan ganda")) cocokJenis = j.includes("pilihan ganda") || j === "pg" || j === "";
            else if (jenisLower.includes("essay")) cocokJenis = j.includes("essay") || j.includes("uraian");
            else if (jenisLower.includes("mencocokkan gambar")) cocokJenis = j.includes("mencocokkan gambar") || j.includes("gambar");
            else if (jenisLower.includes("puzzle kata")) cocokJenis = j.includes("puzzle kata") || j.includes("puzzle");
            else if (jenisLower.includes("ringkasan")) cocokJenis = j.includes("ringkasan") || j.includes("rangkum");
            else cocokJenis = j.includes(jenisLower);

            return cocokJenis && cocokKelas;
        });

        if (soalTersaring.length === 0) {
            wadah.innerHTML = `<div style="text-align:center; padding: 20px; background: #fff1f2; border: 1px solid #fecdd3; border-radius: 8px; color: #be123c;"><p style="font-weight:bold; margin:0;">Belum ada soal untuk Kelas ini.</p></div>`;
            return;
        }

        let html = "";
        soalTersaring.forEach((soal, index) => {
            if (jenisLower.includes("pilihan ganda")) {
                html += `
                    <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
                        <p style="font-weight:bold; margin-top:0;">${index + 1}. ${soal.pertanyaan}</p>
                        <div><label><input type="radio" name="soal_${index}" value="A"> A. ${soal.opsiA || '-'}</label></div>
                        <div><label><input type="radio" name="soal_${index}" value="B"> B. ${soal.opsiB || '-'}</label></div>
                        <div><label><input type="radio" name="soal_${index}" value="C"> C. ${soal.opsiC || '-'}</label></div>
                        <div><label><input type="radio" name="soal_${index}" value="D"> D. ${soal.opsiD || '-'}</label></div>
                    </div>`;
            } else if (jenisLower.includes("essay") || jenisLower.includes("ringkasan")) {
                html += `
                    <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
                        <p style="font-weight:bold; margin-top:0;">${index + 1}. ${soal.pertanyaan}</p>
                        <textarea name="soal_${index}" rows="4" style="width:100%; padding:10px; border-radius:6px; border:1px solid #ccc;" placeholder="Tulis jawaban..."></textarea>
                    </div>`;
            } else if (jenisLower.includes("mencocokkan gambar")) {
                html += `
                    <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
                        <p style="font-weight:bold;">${index + 1}. ${soal.pertanyaan}</p>
                        <img src="${soal.gambar || ''}" style="max-width:150px; display:block; margin-bottom:8px;" onerror="this.style.display='none'">
                        <select name="soal_${index}" style="width:100%; padding:8px; border-radius:6px; border:1px solid #ccc;">
                            <option value="">-- Pilih Jawaban --</option>
                            <option value="A">A. ${soal.opsiA || '-'}</option>
                            <option value="B">B. ${soal.opsiB || '-'}</option>
                            <option value="C">C. ${soal.opsiC || '-'}</option>
                            <option value="D">D. ${soal.opsiD || '-'}</option>
                        </select>
                    </div>`;
            } else if (jenisLower.includes("puzzle kata")) {
                let kataAsli = String(soal.pertanyaan || "").trim();
                let hurufArray = kataAsli.split('');
                for (let i = hurufArray.length - 1; i > 0; i--) {
                    let j = Math.floor(Math.random() * (i + 1));
                    [hurufArray[i], hurufArray[j]] = [hurufArray[j], hurufArray[i]];
                }
                html += `
                    <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
                        <p style="font-weight:bold; margin-top:0;">${index + 1}. Susun Kata:</p>
                        <p style="font-size: 1.2em; color: #2563eb; font-weight: bold;">${hurufArray.join(' ')}</p>
                        <input type="text" name="soal_${index}" style="width:100%; padding:10px; border-radius:6px; border:1px solid #ccc;" placeholder="Ketik jawaban...">
                    </div>`;
            }
        });

        wadah.innerHTML = html;
    } catch (err) {
        console.error("Gagal muat soal:", err);
        wadah.innerHTML = '<p style="color:red; text-align:center;">Gagal memuat soal.</p>';
    }
}

// 3. Mengirim Jawaban Siswa dengan Rekaman Detail Rinci Jawaban
function kirimJawabanSiswa() {
    const selectKelas = document.getElementById("select-kelas");
    const selectSiswa = document.getElementById("select-siswa");
    const selectModul = document.getElementById("select-modul");
    
    const kelasSiswa = selectKelas ? selectKelas.value : "";
    const namaSiswa = selectSiswa ? selectSiswa.value : "";
    const jenisKuis = selectModul ? selectModul.value : "";

    if (!kelasSiswa || !namaSiswa) {
        alert("Silakan pilih Kelas dan Nama Siswa terlebih dahulu!");
        return;
    }

    if (soalTersaring.length === 0) {
        alert("Belum ada soal yang dimuat.");
        return;
    }

    const d = new Date();
    const tglFormat = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;

    let jumlahBenar = 0;
    let totalSoal = soalTersaring.length;
    let hasilJawabanText = [];

    soalTersaring.forEach((soal, index) => {
        const inputRadio = document.querySelector(`input[name="soal_${index}"]:checked`);
        const inputSelect = document.querySelector(`select[name="soal_${index}"]`);
        const inputText = document.querySelector(`input[type="text"][name="soal_${index}"]`);
        const inputTextarea = document.querySelector(`textarea[name="soal_${index}"]`);

        let val = "";
        if (inputRadio) val = inputRadio.value;
        else if (inputSelect) val = inputSelect.value;
        else if (inputText) val = inputText.value.trim().toUpperCase();
        else if (inputTextarea) val = inputTextarea.value;

        if (soal.kunci && val === String(soal.kunci).trim().toUpperCase()) {
            jumlahBenar++;
        }

        // Simpan rincian jawaban per nomor soal
        hasilJawabanText.push(`S${index + 1}:${val || '-'}`);
    });

    let nilaiAkhir = totalSoal > 0 ? Math.round((jumlahBenar / totalSoal) * 100) : 0;
    
    // Gabungkan ringkasan skor dan detail jawaban anak ke dalam kolom keterangan
    let ket = `${jumlahBenar}/${totalSoal} benar | Detail: [${hasilJawabanText.join(", ")}]`;

    const params = new URLSearchParams({
        action: "simpanNilaiGET",
        tanggal: tglFormat,
        nama: namaSiswa,
        kelas: kelasSiswa,
        mapel: "PAIBP",
        jenis: jenisKuis,
        nilai: nilaiAkhir,
        keterangan: ket
    });

    const btnKirim = document.querySelector('button[onclick="kirimJawabanSiswa()"]');
    if (btnKirim) {
        btnKirim.disabled = true;
        btnKirim.innerText = "Mengirim...";
    }

    fetch(URL_WEB_APP + "?" + params.toString(), { mode: 'no-cors' })
        .then(() => {
            alert(`Jawaban berhasil dikirim!\nNilai Anda: ${nilaiAkhir}`);
            location.reload();
        })
        .catch(err => {
            console.error(err);
            alert(`Jawaban terkirim / Selesai!\nNilai Anda: ${nilaiAkhir}`);
            location.reload();
        });
}

// 4. Memuat Histori Nilai Siswa (Opsional jika ingin ditampilkan di halaman siswa)
async function muatHistoriSiswa() {
    const selectSiswa = document.getElementById("select-siswa");
    const wadahHistori = document.getElementById("container-histori");
    if (!selectSiswa || !wadahHistori) return;

    const namaSiswa = selectSiswa.value.trim();
    if (!namaSiswa) {
        wadahHistori.innerHTML = '<p class="text-muted">Pilih nama Anda untuk melihat histori.</p>';
        return;
    }

    try {
        const res = await fetch(URL_WEB_APP + "?action=getNilai");
        const dataNilai = await res.json();

        const historiMilikSiswa = dataNilai.filter(item => {
            return String(item.nama || "").trim().toLowerCase() === namaSiswa.toLowerCase();
        });

        if (historiMilikSiswa.length === 0) {
            wadahHistori.innerHTML = '<p style="color: #64748b; font-style: italic;">Belum ada riwayat kuis.</p>';
            return;
        }

        let html = `
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; font-size: 0.9em;">
                    <thead>
                        <tr style="background: #f1f5f9; text-align: left; border-bottom: 2px solid #cbd5e1;">
                            <th style="padding: 8px; border: 1px solid #e2e8f0;">Tanggal</th>
                            <th style="padding: 8px; border: 1px solid #e2e8f0;">Jenis Kuis</th>
                            <th style="padding: 8px; border: 1px solid #e2e8f0;">Nilai</th>
                            <th style="padding: 8px; border: 1px solid #e2e8f0;">Keterangan / Detail</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        historiMilikSiswa.forEach(item => {
            html += `
                <tr>
                    <td style="padding: 8px; border: 1px solid #e2e8f0;">${item.tanggal || '-'}</td>
                    <td style="padding: 8px; border: 1px solid #e2e8f0;">${item.jenis || '-'}</td>
                    <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold; color: #2563eb;">${item.nilai || '0'}</td>
                    <td style="padding: 8px; border: 1px solid #e2e8f0; font-size: 0.85em;">${item.keterangan || '-'}</td>
                </tr>
            `;
        });

        html += `</tbody></table></div>`;
        wadahHistori.innerHTML = html;
    } catch (err) {
        console.error("Gagal memuat histori:", err);
    }
}
