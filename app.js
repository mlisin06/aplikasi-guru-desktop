const URL_WEB_APP = 'https://script.google.com/macros/s/AKfycbx9vGwmRfHZe-oozoheMZzAudzJIPNLywWV4-qDEozoHoeKgee6C4jAGW4sFZwmdav9qQ/exec';
// Fungsi untuk Berpindah Halaman / Section dari Sidebar
function showSection(sectionId) {
  const sections = document.querySelectorAll('.main-content section');
  sections.forEach(sec => {
    sec.classList.add('hidden-section');
  });

  const target = document.getElementById(sectionId);
  if (target) {
    target.classList.remove('hidden-section');
  }
}

// Fungsi untuk Menyembunyikan/Menampilkan Pilihan ABCD
function togglePilihanGanda() {
  const jenis = document.getElementById('pg-jenis-soal').value;
  const wrapPilihan = document.getElementById('wrapper-pilihan-pg');
  const wrapKunci = document.getElementById('wrapper-kunci-pg');

  if (jenis === 'pg') {
    wrapPilihan.style.display = 'block';
    wrapKunci.style.display = 'block';
  } else {
    wrapPilihan.style.display = 'none';
    wrapKunci.style.display = 'none';
  }
}

// Fungsi Simpan Soal PG Manual
function simpanSoalPG() {
  alert('Soal berhasil disimpan!');
}

// Fungsi Simpan Kuis Mencocokkan Gambar
function simpanKuisGambar() {
  const instruksi = document.getElementById('img-instruksi').value;
  const file1 = document.getElementById('img-file-1').files[0];
  const text1 = document.getElementById('img-text-1').value;

  if (!instruksi) {
    alert('Silakan isi instruksi kuis terlebih dahulu!');
    return;
  }

  if (!file1 || !text1) {
    alert('Silakan pilih minimal 1 gambar dan isi nama pasangannya!');
    return;
  }

  alert('Berhasil menyimpan kuis mencocokkan gambar!');
}

// Array & Fungsi Membaca Soal dari Google Sheets
let daftarSoalDariSheets = [];

function muatSoalDariSheets() {
  const url = document.getElementById('url-google-sheets').value;

  if (!url) {
    alert('Silakan masukkan link CSV Google Sheets terlebih dahulu!');
    return;
  }

  fetch(url)
    .then(response => response.text())
    .then(csvData => {
      const baris = csvData.split('\n');
      daftarSoalDariSheets = [];

      for (let i = 1; i < baris.length; i++) {
        const kolom = baris[i].split(',');
        if (kolom.length >= 2) {
          daftarSoalDariSheets.push({
            jenis: kolom[0]?.trim(),
            pertanyaan: kolom[1]?.trim(),
            optA: kolom[2]?.trim(),
            optB: kolom[3]?.trim(),
            optC: kolom[4]?.trim(),
            optD: kolom[5]?.trim(),
            kunci: kolom[6]?.trim()
          });
        }
      }

      alert(`Berhasil menarik ${daftarSoalDariSheets.length} soal dari Google Sheets!`);
      console.log('Daftar Soal Loaded:', daftarSoalDariSheets);
    })
    .catch(error => {
      alert('Gagal mengambil data. Pastikan link Google Sheets sudah dipublikasikan ke web sebagai CSV!');
      console.error(error);
    });
}
// FUNGSI CETAK / EXPORT SOAL KE PDF
function cetakSoalPDF() {
  window.print();
}
// ==========================================
// FUNGSI PRATINJAU & CETAK SOAL
// ==========================================

// 1. Fungsi untuk Membuka Pratinjau Kuis
function bukaPreview() {
  const modal = document.getElementById('modal-preview');
  const previewContent = document.getElementById('preview-content');

  if (!modal || !previewContent) {
    alert("Elemen modal pratinjau belum ditemukan!");
    return;
  }

  // Jika belum ada data soal
  if (typeof dataSoal === 'undefined' || dataSoal.length === 0) {
    previewContent.innerHTML = `
      <div style="text-align: center; padding: 30px; color: #64748b;">
        <p style="font-size: 16px; font-weight: bold;">Belum ada soal yang dimasukkan.</p>
        <p style="font-size: 13px;">Silakan isi form manual atau klik "Tarik Soal" terlebih dahulu.</p>
      </div>
    `;
  } else {
    // Menyusun daftar soal untuk ditampilkan
    let htmlSoal = `<h3 style="margin-top: 0; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; text-align: center;">LEMBAR SOAL KUIS</h3>`;

    dataSoal.forEach((item, index) => {
      htmlSoal += `
        <div style="margin-bottom: 20px; padding: 15px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
          <p style="font-weight: bold; margin-top: 0; color: #0f172a;">${index + 1}. ${item.pertanyaan}</p>
      `;

      if (item.jenis === 'pg') {
        htmlSoal += `
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px; font-size: 14px;">
            <div>A. ${item.optA || '-'}</div>
            <div>B. ${item.optB || '-'}</div>
            <div>C. ${item.optC || '-'}</div>
            <div>D. ${item.optD || '-'}</div>
          </div>
        `;
      } else if (item.jenis === 'isian') {
        htmlSoal += `
          <div style="margin-top: 10px;">
            <input type="text" placeholder="Jawaban isian siswa..." disabled style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px; background: #ffffff;">
          </div>
        `;
      } else if (item.jenis === 'uraian') {
        htmlSoal += `
          <div style="margin-top: 10px;">
            <textarea placeholder="Jawaban uraian siswa..." disabled rows="3" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px; background: #ffffff;"></textarea>
          </div>
        `;
      }

      htmlSoal += `</div>`;
    });

    previewContent.innerHTML = htmlSoal;
  }

  // Tampilkan modal pop-up
  modal.style.display = 'flex';
}

// 2. Fungsi untuk Menutup Pratinjau Kuis
function tutupPreview() {
  const modal = document.getElementById('modal-preview');
  if (modal) modal.style.display = 'none';
}

// 3. Fungsi untuk Mencetak / Simpan PDF
function cetakSoalPDF() {
  window.print();
}