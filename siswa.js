function filterNamaSiswa() {
    let kelasDipilih = document.getElementById("select-kelas").value.trim().toLowerCase();
    let selectSiswa = document.getElementById("select-siswa");
    
    selectSiswa.innerHTML = '<option value="">-- Pilih Nama Anda --</option>';
    
    if (!kelasDipilih) return;

    // Filter yang fleksibel (mengambil angka dari kelas, misal "Kelas 5" jadi "5")
    let angkaFilter = kelasDipilih.replace(/[^0-9]/g, '');

    let filtered = dataSiswaGlobal.filter(s => {
        let kelasSiswa = String(s.kelas || "").trim().toLowerCase();
        let angkaSiswa = kelasSiswa.replace(/[^0-9]/g, '');
        
        // Cocokkan secara fleksibel (persis sama, atau sama angkanya)
        return kelasSiswa === kelasDipilih || (angkaFilter && angkaSiswa === angkaFilter);
    });
    
    console.log(`Siswa untuk ${kelasDipilih}:`, filtered);

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
        // Menampilkan NIS jika ada, jika tidak langsung Nama
        opt.textContent = `${s.nis ? s.nis + ' - ' : ''}${s.nama}`;
        selectSiswa.appendChild(opt);
    });
}
