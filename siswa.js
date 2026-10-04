<<<<<<< HEAD
const URL_WEB_APP = "https://script.google.com/macros/s/AKfycbwLzzRoJFX8elRVayVTLMa08CebMMB4S5-7L0M6NC9Yp71KiRSjT4YwlS4IFq0ty/Ex2g/exec";

// Variable Global
let dataSoalList = [];
let soalTersaring = [];

// Otomatis jalankan saat halaman terbuka
document.addEventListener("DOMContentLoaded", () => {
  muatDataSiswa();
  muatDataSoal();
});

// 1. Memuat Data Siswa dari Sheet "Siswa"
async function muatDataSiswa() {
  const selectSiswa = document.getElementById("select-siswa");
  if (!selectSiswa) return;

  try {
    const res = await fetch(URL_WEB_APP + "?action=getSiswa");
    const daftarSiswa = await res.json();

    if (Array.isArray(daftarSiswa) && daftarSiswa.length > 0) {
      selectSiswa.innerHTML = '<option value="">-- Pilih Nama Anda --</option>';
      daftarSiswa.forEach(nama => {
        selectSiswa.innerHTML += `<option value="${nama}">${nama}</option>`;
      });
    } else {
      selectSiswa.innerHTML = '<option value="">-- Tidak ada data siswa --</option>';
    }
  } catch (err) {
    console.error("Gagal muat siswa:", err);
    selectSiswa.innerHTML = '<option value="">-- Gagal Memuat Data Siswa --</option>';
  }
}

// 2. Memuat Soal berdasarkan Modul/Jenis
async function muatDataSoal() {
  const wadah = document.getElementById("wadah-soal");
  if (!wadah) return;

  wadah.innerHTML = '<p style="text-align:center; color:#64748b;">Memuat kuis...</p>';

  try {
    if (dataSoalList.length === 0) {
      const res = await fetch(URL_WEB_APP + "?action=getSoal");
      dataSoalList = await res.json();
    }

    const selectJenis = document.getElementById("select-jenis");
    const jenisDipilih = selectJenis ? selectJenis.value.trim().toLowerCase() : "pg";

    soalTersaring = dataSoalList.filter(s => {
      const j = String(s.jenis || "").trim().toLowerCase();
      if (jenisDipilih === "pg" || jenisDipilih === "1" || jenisDipilih.includes("pg")) {
        return j === "pg" || j === "pilihan ganda" || j.includes("essay") || j === "";
      } else if (jenisDipilih === "gambar" || jenisDipilih === "2" || jenisDipilih.includes("gambar")) {
        return j.includes("gambar");
      } else if (jenisDipilih === "kata" || jenisDipilih === "3" || jenisDipilih.includes("kata")) {
        return j.includes("kata") || j.includes("jodoh") || j.includes("cocok");
      } else if (jenisDipilih === "rangkum" || jenisDipilih === "4" || jenisDipilih.includes("rangkum")) {
        return j.includes("rangkum") || j.includes("materi");
      }
      return false;
    });

    if (soalTersaring.length === 0) {
      wadah.innerHTML = `
        <div style="text-align:center; padding: 20px; background: #fff1f2; border: 1px solid #fecdd3; border-radius: 8px; color: #be123c;">
          <p style="font-weight:bold; margin:0 0 5px 0;">Belum ada soal untuk kategori ini di Google Sheets.</p>
          <small>Pastikan kolom Jenis di Google Sheets terisi dengan benar (pg, gambar, kata, atau rangkum).</small>
        </div>`;
      return;
    }

    let html = "";

    if (jenisDipilih === "pg" || jenisDipilih === "1" || jenisDipilih.includes("pg")) {
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
    } else if (jenisDipilih === "gambar" || jenisDipilih === "2" || jenisDipilih.includes("gambar")) {
      soalTersaring.forEach((soal, index) => {
        html += `
          <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; margin-bottom: 15px; display: flex; gap: 15px; align-items: center; flex-wrap: wrap;">
            <div style="flex:1; min-width:200px;">
              <p style="font-weight:bold; margin: 0 0 8px 0;">Soal ${index + 1}</p>
              <img src="${soal.pertanyaan}" alt="Gambar Soal" style="max-width:100%; height:auto; border-radius:8px;" onerror="this.src='https://via.placeholder.com/200?text=Gambar+Tidak+Ditemukan'">
            </div>
            <div style="flex:1; min-width:200px;">
              <label style="display:block; margin-bottom: 5px; font-weight:bold;">Pilih Pasangan Gambar:</label>
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
    } else if (jenisDipilih === "kata" || jenisDipilih === "3" || jenisDipilih.includes("kata")) {
      soalTersaring.forEach((soal, index) => {
        html += `
          <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; margin-bottom: 15px; display: flex; gap: 15px; align-items: center; flex-wrap: wrap;">
            <div style="flex:1; min-width:200px;">
              <strong>${index + 1}. Kata / Pernyataan:</strong>
              <p style="margin: 5px 0; color: #1e293b; font-size: 1.1em;">${soal.pertanyaan}</p>
            </div>
            <div style="flex:1; min-width:200px;">
              <label style="display:block; margin-bottom: 5px; font-weight:bold;">Jodohkan Dengan:</label>
              <select name="soal_${index}" style="width:100%; padding:8px; border-radius:6px; border:1px solid #ccc;">
                <option value="">-- Pilih Pasangan Kata --</option>
                <option value="A">A. ${soal.opsiA || '-'}</option>
                <option value="B">B. ${soal.opsiB || '-'}</option>
                <option value="C">C. ${soal.opsiC || '-'}</option>
                <option value="D">D. ${soal.opsiD || '-'}</option>
              </select>
            </div>
          </div>`;
      });
    } else if (jenisDipilih === "rangkum" || jenisDipilih === "4" || jenisDipilih.includes("rangkum")) {
      soalTersaring.forEach((soal, index) => {
        html += `
          <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
            <p style="font-weight:bold; margin-top:0;">${index + 1}. ${soal.pertanyaan}</p>
            <textarea name="soal_${index}" rows="5" style="width:100%; padding:10px; border-radius:6px; border:1px solid #ccc;" placeholder="Tuliskan rangkuman materi Anda di sini..."></textarea>
          </div>`;
      });
    }

    wadah.innerHTML = html;
  } catch (err) {
    console.error("Gagal muat soal:", err);
    wadah.innerHTML = '<p style="text-align:center; color:#e11d48;">Gagal memuat format soal.</p>';
  }
}

// 3. FUNGSI UTAMA: Mengirim Jawaban saat Tombol Klik
async function kirimJawaban() {
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

  // Mengumpulkan jawaban dari form
  let hasilJawaban = {};
  soalTersaring.forEach((soal, index) => {
    const inputRadio = document.querySelector(`input[name="soal_${index}"]:checked`);
    const inputSelect = document.querySelector(`select[name="soal_${index}"]`);
    const inputTextarea = document.querySelector(`textarea[name="soal_${index}"]`);

    let val = "";
    if (inputRadio) val = inputRadio.value;
    else if (inputSelect) val = inputSelect.value;
    else if (inputTextarea) val = inputTextarea.value;

    hasilJawaban[`Soal_${index + 1}`] = val || "Tidak Diisi";
  });

  const payload = {
    nama: namaSiswa,
    jawaban: hasilJawaban
  };

  try {
    // Mengubah tampilan tombol sementara
    const btnKirim = document.querySelector('button[onclick="kirimJawaban()"]') || document.querySelector('.btn-kirim');
    if (btnKirim) {
      btnKirim.disabled = true;
      btnKirim.innerText = "Sedang Mengirim Jawaban...";
    }

    // Mengirim ke Google Apps Script via POST
    await fetch(URL_WEB_APP, {
      method: "POST",
      mode: "no-cors", // Penting agar bebas CORS
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    alert("Jawaban berhasil dikirim ke Google Sheets!");
    location.reload(); // Refresh halaman setelah sukses

  } catch (err) {
    console.error("Gagal mengirim jawaban:", err);
    alert("Gagal mengirim jawaban. Silakan coba lagi.");
  }
}
=======
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
>>>>>>> 785fba3411abc6279efdde8d2d922d3d9fc554ba
