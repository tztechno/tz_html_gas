
// Code.gs
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('位置情報記録アプリ')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getSettings() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('設定');
  return {
    // 間隔のみを取得（秒）
    interval: sheet.getRange('A2').getValue()
  };
}

function recordLocation(latitude, longitude, timestamp) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('記録');
  sheet.appendRow([timestamp, latitude, longitude]);
  return true;
}

function getAllLocations() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('記録');
  const data = sheet.getDataRange().getValues();
  // Remove header row
  data.shift();
  return data.map(row => ({
    timestamp: row[0],
    latitude: row[1],
    longitude: row[2]
  }));
}
