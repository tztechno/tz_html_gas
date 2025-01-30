// スプレッドシートのデータを取得するための関数
function doGet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  const data = sheet.getDataRange().getValues();
  
  return ContentService.createTextOutput(JSON.stringify({
    'data': data
  })).setMimeType(ContentService.MimeType.JSON);
}

// スプレッドシートのデータを取得するための関数
function doGet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  const data = sheet.getDataRange().getValues();
  
  return ContentService.createTextOutput(JSON.stringify({
    'data': data
  })).setMimeType(ContentService.MimeType.JSON);
}

// データを更新するための関数
function doPost(e) {
  const params = JSON.parse(e.postData.contents);
  const row = params.row + 1;  // 行番号を1増やして正しい位置に記入
  const value = params.value;
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  
  // B列の更新処理（項目名の行を除く）
  if (row > 1) {
    sheet.getRange(row, 2).setValue(value); // B列（2列目）に値を設定
  } else {
    throw new Error('項目名の行は更新できません');
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    'success': true,
    'message': `${row}行目を更新しました`
  })).setMimeType(ContentService.MimeType.JSON);
}
