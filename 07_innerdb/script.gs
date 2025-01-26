const SHEET_NAME = "sheet1"; // スプレッドシート名

// データを取得する関数
function getData() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  return data;
}

// データを追加する関数
function addData(date, subject, content) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  sheet.appendRow([date, subject, content]);
  return "データを追加しました!";
}

// Webアプリのエントリポイント
function doGet() {
  return HtmlService.createHtmlOutputFromFile("index.html");
}

// HTMLからデータ取得用に呼び出される関数
function fetchSpreadsheetData() {
  return JSON.stringify(getData());
}

// HTMLからデータ追加用に呼び出される関数
function insertData(data) {
  const { date, subject, content } = JSON.parse(data);
  return addData(date, subject, content);
}
