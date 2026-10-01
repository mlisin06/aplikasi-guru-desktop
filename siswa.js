const URL_WEB_APP = "https://script.google.com/macros/s/AKfycbx5nkmrvsJusyiJ0qIYNxXroiWMQDHyWbKbTpM6X6VbQ1eyxZ-9EDNANAN.../exec";

document.addEventListener("DOMContentLoaded", function () {
    loadSiswa();
    loadSoal();
});

let dataSoalList = [];

async function loadSiswa() {
    try {
        let res = await fetch(`${URL_WEB_APP}?action=getSiswa`);
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

async function loadSoal() {
    try {
        let res = await fetch(`${URL_WEB_APP}?action=getSoal`);
        dataSoalList = await res.json();
        let cont = document.getElementById("soal-container") || document.getElementById("containerSoal");
        if (cont) {
            cont.innerHTML = "";
            dataSoalList.forEach((s, i) => {
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
