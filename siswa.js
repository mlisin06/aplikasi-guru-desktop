const URL_WEB_APP = "https://script.google.com/macros/s/AKfycbyI-MoR-4xGjrxrbgn-rKjqLiHzrrQQ0tJwlFGBSExRl9BBE9pVPTGzvobYMoMkrei0/exec";

// Variable Global
let dataSiswaList = [];
let dataSoalList = [];
let soalTersaring = [];

// Otomatis jalankan saat halaman terbuka
document.addEventListener("DOMContentLoaded", () => {
    muatDataSiswa();

    // Event listener jika kelas diubah (untuk memfilter nama siswa)
    const selectKelas = document.getElementById("select-kelas");
    if (selectKelas) {
        selectKelas.addEventListener("change", updateDropdownSiswa);
    }

    // Event listener jika jenis soal diubah
    const selectModul = document.getElementById("select-modul");
    if (selectModul) {
        selectModul.addEventListener("change", () => {
            muatDataSoal();
        });
    }
});

// 1. Memuat Data Siswa dari Sheet "Siswa" (Mendukung Kolom Kelas & Nama)
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

            // Ambil daftar kelas unik
            const daftarKelas = [...new Set(dataSiswaList.map(s => s.kelas))];
            selectKelas.innerHTML = '<option value="">-- Pilih Kelas --</option>';
            daftarKelas.forEach(k => {
                selectKelas.innerHTML += `<option value="${k}">${k}</option>`;
            });
        } else {
            selectKelas.innerHTML = '<option value="">-- Tidak ada data kelas --</option>';
        }
    } catch (err) {
        console.error("Gagal muat siswa:", err);
        selectKelas.innerHTML = '<option value="">-- Gagal Memuat Data --</option>';
    }
}

// Update pilihan nama siswa berdasarkan kelas yang dipilih
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

// 2. Memuat Soal berdasarkan Jenis Kuis yang Dipilih
async function muatDataSoal() {
    const wadah = document.getElementById("container-soal");
    const selectJenis = document.getElementById("select-modul");
    const jenisDipilih = selectJenis ? selectJenis.value.trim() : "";

    if (!wadah) return;

    // Jika jenis kuis belum dipilih, jangan tampilkan soal
    if (!jenisDipilih) {
        wadah.innerHTML = '<p class="text-center text-muted">Silakan pilih jenis kuis terlebih dahulu untuk memuat soal.</p>';
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
            if (jenisLower.includes("pilihan ganda")) {
                return j.includes("pilihan ganda") || j === "pg" || j === "";
            } else if (jenisLower.includes("essay")) {
                return j.includes("essay") || j.includes("uraian");
            } else if (jenisLower.includes("mencocokkan gambar")) {
                return j.includes("mencocokkan gambar") || j.includes("gambar");
            } else if (jenisLower.includes("puzzle kata")) {
                return j.includes("puzzle kata") || j.includes("puzzle");
            } else if (jenisLower.includes("ringkasan")) {
                return j.includes("ringkasan") || j.includes("rangkum") || j.includes("materi");
            }
            return j.includes(jenisLower);
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
        if (jenisLower.includes("pilihan ganda")) {
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
        } else if (jenisLower.includes("essay")) {
            soalTersaring.forEach((soal, index) => {
                html += `
                    <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
                        <p style="font-weight:bold; margin-top:0;">${index + 1}. ${soal.pertanyaan}</p>
                        <textarea name="soal_${index}" rows="4" style="width:100%; padding:10px; border-radius:6px; border:1px solid #ccc;" placeholder="Tuliskan jawaban essay/uraian Anda di sini..."></textarea>
                    </div>`;
            });
        } else if (jenisLower.includes("mencocokkan gambar")) {
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
        } else if (jenisLower.includes("puzzle kata")) {
            soalTersaring.forEach((soal, index) => {
                let kataAsli = String(soal.pertanyaan || "").trim();
                let hurufArray = kataAsli.split('');
                for (let i = hurufArray.length - 1; i > 0; i--) {
                    let j = Math.floor(Math.random() * (i + 1));
                    [hurufArray[i], hurufArray[j]] = [hurufArray[j], hurufArray[i]];
                }
                let kataAcak = hurufArray.join(' ');

                html += `
                    <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
                        <p style="font-weight:bold; margin-top:0;">${index + 1}. Susun / Ketik Kata yang Benar:</p>
                        <p style="font-size: 1.2em; color: #2563eb; font-weight: bold; margin-bottom: 8px;">Huruf Acak: ${kataAcak}</p>
                        <input type="text" name="soal_${index}" style="width:100%; padding:10px; border-radius:6px; border:1px solid #ccc;" placeholder="Ketik jawaban kata yang benar di sini...">
                    </div>`;
            });
        } else if (jenisLower.includes("ringkasan")) {
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
    const selectKelas = document.getElementById("select-kelas");
    const selectSiswa = document.getElementById("select-siswa");
    const kelasSiswa = selectKelas ? selectKelas.value : "";
    const namaSiswa = selectSiswa ? selectSiswa.value : "";

    if (!kelasSiswa) {
        alert("Silakan pilih Kelas terlebih dahulu!");
        return;
    }

    if (!namaSiswa) {
        alert("Silakan pilih Nama Siswa terlebih dahulu!");
        return;
    }

    if (soalTersaring.length === 0) {
        alert("Silakan pilih jenis kuis dan pastikan soal sudah tampil.");
        return;
    }

    // Menggabungkan Kelas dan Nama agar aman jika ada nama yang sama di kelas berbeda
    const identitasLengkap = `${kelasSiswa} - ${namaSiswa}`;

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
        nama: identitasLengkap,
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
