var SS = SpreadsheetApp.getActiveSpreadsheet();

function doGet(e) {
  var action = e.parameter.action;
  
  if (action === "getSiswa") {
    var sheet = SS.getSheetByName("Siswa");
    var data = sheet.getDataRange().getValues();
    var result = [];
    
    // Mulai dari baris 2 (lewati header)
    for (var i = 1; i < data.length; i++) {
      if (data[i][2]) { // Cek jika kolom nama tidak kosong
        result.push({
          kelas: String(data[i][0]).trim(),
          absen: String(data[i][1]).trim(),
          nama: String(data[i][2]).trim()
        });
      }
    }
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === "getSoal") {
    var mapelParam = e.parameter.mapel;
    var kelasParam = e.parameter.kelas;
    var sheet = SS.getSheetByName("Soal");
    var data = sheet.getDataRange().getValues();
    var result = [];
    
    for (var i = 1; i < data.length; i++) {
      var kelasData = String(data[i][0]).trim();
      var mapelData = String(data[i][1]).trim();
      
      // Filter sesuai kelas dan mapel yang dipilih siswa
      if (kelasData === kelasParam && mapelData === mapelParam) {
        result.push({
          pertanyaan: data[i][2],
          opsiA: data[i][3],
          opsiB: data[i][4],
          opsiC: data[i][5],
          opsiD: data[i][6],
          kunci: data[i][7]
        });
      }
    }
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SS.getSheetByName("Nilai");
    
    var timestamp = new Date();
    var kelas = data.kelas;
    var nama = data.nama;
    var mapel = data.mapel;
    var nilai = data.nilai;
    var detail = JSON.stringify(data.jawaban);
    
    sheet.appendRow([timestamp, kelas, nama, mapel, nilai, detail]);
    
    return ContentService.createTextOutput(JSON.stringify({"status": "success"})).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": err.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}
