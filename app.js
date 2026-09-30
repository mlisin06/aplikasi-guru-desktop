// --- NAVIGASI HALAMAN ---
function showSection(sectionId) {
  const sections = document.querySelectorAll('section');
  sections.forEach(sec => sec.classList.add('hidden-section'));
  document.getElementById(sectionId).classList.remove('hidden-section');
  document.getElementById(sectionId).classList.add('active-section');
}

// --- LOGIKA KUIS INTERAKTIF ---
const quizData = [
  {
    question: "Manakah yang merupakan komponen utama dalam rancangan modul ajar?",
    options: ["Tujuan Pembelajaran", "Slogan Sekolah", "Warna Cat Kelas", "Merk Laptop"],
    correct: 0
  },
  {
    question: "Metode penilaian yang dilakukan di awal proses pembelajaran dinamakan?",
    options: ["Asesmen Sumatif", "Asesmen Diagnostik", "Asesmen Formatif", "Evaluasi Akhir"],
    correct: 1
  }
];

let currentQuestionIndex = 0;
let score = 0;

function loadQuiz() {
  const currentQuiz = quizData[currentQuestionIndex];
  document.getElementById("question").innerText = currentQuiz.question;
  const optionsContainer = document.getElementById("options-container");
  optionsContainer.innerHTML = "";
  document.getElementById("feedback").innerText = "";
  document.getElementById("next-btn").style.display = "none";

  currentQuiz.options.forEach((option, index) => {
    const btn = document.createElement("button");
    btn.classList.add("option-btn");
    btn.innerText = option;
    btn.onclick = () => selectOption(index, currentQuiz.correct);
    optionsContainer.appendChild(btn);
  });
}

function selectOption(selectedIndex, correctIndex) {
  const feedbackEl = document.getElementById("feedback");
  if (selectedIndex === correctIndex) {
    feedbackEl.innerText = "✅ Benar!";
    feedbackEl.style.color = "green";
    score += 50; // Tiap soal bernilai 50
  } else {
    feedbackEl.innerText = "❌ Salah! Jawaban benar adalah opsi ke-" + (correctIndex + 1);
    feedbackEl.style.color = "red";
  }

  // Matikan semua tombol opsi setelah menjawab
  const buttons = document.querySelectorAll(".option-btn");
  buttons.forEach(btn => btn.disabled = true);

  document.getElementById("next-btn").style.display = "block";
}

function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < quizData.length) {
    loadQuiz();
  } else {
    // Kuis Selesai
    document.getElementById("quiz-container").innerHTML = `
      <h2>🎉 Kuis Selesai!</h2>
      <p style="font-size: 18px; margin-top: 10px;">Nilai Akhir Anda: <strong>${score}</strong></p>
      <button onclick="location.reload()" style="margin-top: 15px;">Ulangi Kuis</button>
    `;
    tambahNilaiKeTabel("Siswa Contoh", "IPAS / Administrasi", score);
  }
}

// --- LOGIKA SIMPAN NILAI KE TABEL REKAP ---
function tambahNilaiKeTabel(nama, mapel, nilai) {
  const tbody = document.getElementById("tabel-nilai");
  const rowCount = tbody.rows.length + 1;
  const row = `<tr>
    <td>${rowCount}</td>
    <td>${nama}</td>
    <td>${mapel}</td>
    <td><strong>${nilai}</strong></td>
  </tr>`;
  tbody.innerHTML += row;
}

// --- LOGIKA MODUL ADMINISTRASI ---
document.getElementById("form-modul").addEventListener("submit", function(e) {
  e.preventDefault();
  const judul = document.getElementById("judul-modul").value;
  const link = document.getElementById("link-media").value;

  const list = document.getElementById("daftar-modul");
  const item = document.createElement("li");
  item.innerHTML = `<strong>${judul}</strong> — <a href="${link}" target="_blank">Buka Media</a>`;
  list.appendChild(item);

  document.getElementById("judul-modul").value = "";
  document.getElementById("link-media").value = "";
});

// Jalankan Kuis saat Pertama Kali Dimuat
loadQuiz();