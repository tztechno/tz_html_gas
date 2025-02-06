function doGet() {
  return HtmlService.createHtmlOutputFromFile('index');
}

function getIDs() {
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("シート1"); // シート名を変更
  let ids = sheet.getRange("A2:A" + sheet.getLastRow()).getValues().flat();
  return ids;
}

function saveData(id, progress, person) {
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("シート1");
  let data = sheet.getRange("A2:A" + sheet.getLastRow()).getValues();
  
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] == id) {
      let row = i + 2;
      sheet.getRange(row, 2).setValue(progress);
      sheet.getRange(row, 3).setValue(person);
      sheet.getRange(row, 4).setValue(new Date()); // 現在時刻
      break;
    }
  }
}
