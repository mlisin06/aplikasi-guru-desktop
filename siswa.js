const URL_WEB_APP = "https://script.google.com/macros/s/AKfycbyI-MoR-4xGjrxrbgn-rKjqLiHzrrQQ0tJwlFGBSExRl9BBE9pVPTGzvobYMoMkrei0/exec";

// Variable Global
let dataSoalList = [];
let soalTersaring = [];

// Otomatis jalankan saat halaman terbuka
document.addEventListener("DOMContentLoaded", () => {
    muatDataSiswa();
    muatDataSoal();

    // Event listener jika jenis soal diubah
    const selectModul = document.getElementById("select-modul");
    if (selectModul) {
        selectModul.addEventListener("change", () => {
            muatDataSoal();
        });
    }
});

// 1. Memuat Data Siswa dari Sheet "Siswa" (Mencegah [object Object])
async function muatDataSiswa() {
    const selectSiswa = document.getElementById("select-siswa");
    if (!selectSiswa) return;

    try {
        const res = await fetch(URL_WEB_APP + "?action=getSiswa");
        const daftarSiswa = await res.json();

        if (Array.isArray(daftarSiswa) && daftarSiswa.length > 0) {
            selectSiswa.innerHTML = '<option value="">-- Pilih Nama Anda --</option>';
            daftarSiswa.forEach(item => {
                let namaSiswa = "";
                if (typeof item === "object" && item !== null) {
                    namaSiswa = item.nama || item.Nama || item.SISWA || item.Siswa || Object.values(item)[0] || "";
                } else {
                    namaSiswa = String(item);
                }

                if (namaSiswa.trim() !== "") {
                    selectSiswa.innerHTML += `<option value="${namaSiswa}">${namaSiswa}</option>`;
                }
            });
        } else {
            selectSiswa.innerHTML = '<option value="">-- Tidak ada data siswa --</option>';
        }
    } catch (err) {
        console.error("Gagal muat siswa:", err);
        selectSiswa.innerHTML = '<option value="">-- Gagal Memuat Data Siswa --</option>';
    }
}

// 2. Memuat Soal berdasarkan 5 Jenis Kuis dari Panel Guru
async function muatDataSoal() {
    const wadah = document.getElementById("container-soal");
    if (!wadah) return;

    wadah.innerHTML = '<p style="text-align:center; color:#64748b;">Memuat kuis...</p>';

    try {
        if (dataSoalList.length === 0) {
            const res = await fetch(URL_WEB_APP + "?action=getSoal");
            dataSoalList = await res.json();
        }

        const selectJenis = document.getElementById("select-modul");
        const jenisDipilih = selectJenis ? selectJenis.value.trim().toLowerCase() : "pilihan ganda";

        soalTersaring = dataSoalList.filter(s => {
            const j = String(s.jenis || "").trim().toLowerCase();
            if (jenisDipilih.includes("pilihan ganda")) {
                return j.includes("pilihan ganda") || j === "pg" || j === "";
            } else if (jenisDipilih.includes("essay")) {
                return j.includes("essay") || j.includes("uraian");
            } else if (jenisDipilih.includes("mencocokkan gambar")) {
                return j.includes("mencocokkan gambar") || j.includes("gambar");
            } else if (jenisDipilih.includes("puzzle kata")) {
                return j.includes("puzzle kata") || j.includes("puzzle");
            } else if (jenisDipilih.includes("ringkasan")) {
                return j.includes("ringkasan") || j.includes("rangkum") || j.includes("materi");
            }
            return j.includes(jenisDipilih);
        });

        if (soalTersaring.length === 0) {
            wadah.innerHTML = `
                <div style="text-align:center; padding: 20px; background: #fff1f2; border: 1px solid #fecdd3; border-radius: 8px; color: #be123c;">
                    <p style="font-weight:bold; margin:0 0 5px 0;">Belum ada soal untuk kategori ini di Google Sheets.</p>
                    <small>Pastikan Anda sudah menginput soal dengan kategori yang sesuai melalui Panel Guru.</small>
                </div>`;
            return;
        }

        let html = "";

        // Render Berdasarkan Jenis Kuis yang Dipilih
        if (jenisDipilih.includes("pilihan ganda")) {
            soalTersaring.forEach((soal, index) => {
                html += `
                    <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
                        <p style="font-weight:bold; margin-top:0;">${index + 1}. ${soal.pertanyaan}</p>
                        <div><label><input type="radio" name="soal_${index}" value="A"> A. ${soal.opsiA || '-'}</label></div>
                        <div><label><input type="radio" name="soal_${index}" value="B"> B. ${soal.opsiB || '-'}</label></div>
                        <div><label><input type="radio" name="soal_${index}" value="C"> C. ${soal.opsiC || '-'}</label></div>
                        <div><label><input type="radio" name="soal_${index}" value="D"> D. ${soal.opsiD || '-'}</label></div>
                    </div>`;
            });
        } else if (jenisDipilih.includes("essay")) {
            soalTersaring.forEach((soal, index) => {
                html += `
                    <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
                        <p style="font-weight:bold; margin-top:0;">${index + 1}. ${soal.pertanyaan}</p>
                        <textarea name="soal_${index}" rows="4" style="width:100%; padding:10px; border-radius:6px; border:1px solid #ccc;" placeholder="Tuliskan jawaban essay/uraian Anda di sini..."></textarea>
                    </div>`;
            });
        } else if (jenisDipilih.includes("mencocokkan gambar")) {
            soalTersaring.forEach((soal, index) => {
                html += `
                    <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; margin-bottom: 15px; display: flex; gap: 15px; align-items: center; flex-wrap: wrap;">
                        <div style="flex:1; min-width:200px;">
                            <p style="font-weight:bold; margin: 0 0 8px 0;">Soal ${index + 1}</p>
                            <img src="${soal.gambar || soal.pertanyaan}" alt="Gambar Soal" style="max-width:100%; height:auto; border-radius:8px;" onerror="this.src='https://via.placeholder.com/200?text=Gambar+Tidak+Ditemukan'">
                        </div>
                        <div style="flex:1; min-width:200px;">
                            <p style="margin: 0 0 5px 0; font-size:0.9em; color:#475569;">${soal.pertanyaan}</p>
                            <label style="display:block; margin-bottom: 5px; font-weight:bold;">Pilih Pasangan / Jawaban:</label>
                            <select name="soal_${index}" style="width:100%; padding:8px; border-radius:6px; border:1px solid #ccc;">
                                <option value="">-- Pilih Jawaban --</option>
                                <option value="A">A. ${soal.opsiA || '-'}</option>
                                <option value="B">B. ${soal.opsiB || '-'}</option>
                                <option value="C">C. ${soal.opsiC || '-'}</option>
                                <option value="D">D. ${soal.opsiD || '-'}</option>
                            </select>
                        </div>
                    </div>`;
            });
        } else if (jenisDipilih.includes("puzzle kata")) {
            soalTersaring.forEach((soal, index) => {
                html += `
                    <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
                        <p style="font-weight:bold; margin-top:0;">${index + 1}. Susun / Ketik Kata yang Benar:</p>
                        <p style="font-size: 1.2em; color: #2563eb; font-weight: bold; margin-bottom: 8px;">Huruf Acak: ${soal.pertanyaan}</p>
                        <input type="text" name="soal_${index}" style="width:100%; padding:10px; border-radius:6px; border:1px solid #ccc;" placeholder="Ketik jawaban kata yang benar di sini...">
                    </div>`;
            });
        } else if (jenisDipilih.includes("ringkasan")) {
            soalTersaring.forEach((soal, index) => {
                html += `
                    <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
                        <p style="font-weight:bold; margin-top:0;">${index + 1}. ${soal.pertanyaan}</p>
                        <textarea name="soal_${index}" rows="6" style="width:100%; padding:10px; border-radius:6px; border:1px solid #ccc;" placeholder="Tuliskan rangkuman materi Anda di sini..."></textarea>
                    </div>`;
            });
        }

        wadah.innerHTML = html;
    } catch (err) {
        console.error("Gagal muat soal:", err);
        wadah.innerHTML = '<p style="text-align:center; color:#e11d48;">Gagal memuat format soal dari Google Sheets.</p>';
    }
}

// 3. Mengirim Jawaban Siswa ke Google Sheets
async function kirimJawabanSiswa() {
    const selectSiswa = document.getElementById("select-siswa");
    const namaSiswa = selectSiswa ? selectSiswa.value : "";

    if (!namaSiswa) {
        alert("Silakan pilih Nama Siswa terlebih dahulu!");
        return;
    }

    if (soalTersaring.length === 0) {
        alert("Tidak ada soal yang bisa dikirim.");
        return;
    }

    // Mengumpulkan jawaban dari berbagai jenis input form
    let hasilJawaban = {};
    soalTersaring.forEach((soal, index) => {
        const inputRadio = document.querySelector(`input[name="soal_${index}"]:checked`);
        const inputSelect = document.querySelector(`select[name="soal_${index}"]`);
        const inputText = document.querySelector(`input[type="text"][name="soal_${index}"]`);
        const inputTextarea = document.querySelector(`textarea[name="soal_${index}"]`);

        let val = "";
        if (inputRadio) val = inputRadio.value;
        else if (inputSelect) val = inputSelect.value;
        else if (inputText) val = inputText.value;
        else if (inputTextarea) val = inputTextarea.value;

        hasilJawaban[`Soal_${index + 1}`] = val || "Tidak Diisi";
    });

    const payload = {
        nama: namaSiswa,
        jawaban: hasilJawaban
    };

    try {
        const btnKirim = document.querySelector('button[onclick="kirimJawabanSiswa()"]');
        if (btnKirim) {
            btnKirim.disabled = true;
            btnKirim.innerText = "Sedang Mengirim Jawaban...";
        }

        await fetch(URL_WEB_APP, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        alert("Jawaban berhasil dikirim ke Google Sheets!");
        location.reload();

    } catch (err) {
        console.error("Gagal mengirim jawaban:", err);
        alert("Gagal mengirim jawaban. Silakan coba lagi.");
    }
}
