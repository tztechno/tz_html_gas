function doGet() {
  return HtmlService.createHtmlOutputFromFile('index'); // 'index.html' を返す
}

function getSheetData() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('sheet1'); // 'シート名' を指定
  var data = sheet.getDataRange().getValues();
  return data;
}
