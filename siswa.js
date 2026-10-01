const CONFIG_URL_BACKEND = "https://script.google.com/macros/s/AKfycbx5nkmrvSUusyiJ0qIYQYnXxroIWMQdHYWbKbTpM6X6VbQ1eyxZ-9EDNANANKeT6a2_YQ/exec";

document.addEventListener("DOMContentLoaded", function () {
    muatDataSiswaBaru();
    muatDataSoalBaru();
});

async function muatDataSiswaBaru() {
    try {
        let res = await fetch(`${CONFIG_URL_BACKEND}?action=getSiswa`);
        let data = await res.json();
        let sel = document.getElementById("select-siswa") || document.getElementById("namaSiswa");
        if (sel) {
            sel.innerHTML = '<option value="">-- Pilih Nama Anda --</option>';
            data.forEach(nama => {
                let opt = document.createElement("option");
                opt.value = nama;
                opt.textContent = nama;
                sel.appendChild(opt);
            });
        }
    } catch (e) { console.error(e); }
}

async function muatDataSoalBaru() {
    try {
        let res = await fetch(`${CONFIG_URL_BACKEND}?action=getSoal`);
        let dataSoal = await res.json();
        let cont = document.getElementById("soal-container") || document.getElementById("containerSoal");
        if (cont) {
            cont.innerHTML = "";
            dataSoal.forEach((s, i) => {
                cont.innerHTML += `
                    <div style="margin-bottom:15px; padding:10px; border:1px solid #ddd;">
                        <p><b>${i + 1}. ${s.pertanyaan}</b></p>
                        <label><input type="radio" name="jawaban_${i}" value="A"> A. ${s.opsiA}</label><br>
                        <label><input type="radio" name="jawaban_${i}" value="B"> B. ${s.opsiB}</label><br>
                        <label><input type="radio" name="jawaban_${i}" value="C"> C. ${s.opsiC}</label><br>
                        <label><input type="radio" name="jawaban_${i}" value="D"> D. ${s.opsiD}</label>
                    </div>
                `;
            });
        }
    } catch (e) { console.error(e); }
}
