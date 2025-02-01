
function doGet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  const data = sheet.getDataRange().getValues();
  
  return ContentService.createTextOutput(JSON.stringify({
    'data': data
  })).setMimeType(ContentService.MimeType.JSON);
}

function getCurrentJSTString() {
  const now = new Date();
  const formatter = Utilities.formatDate(now, "Asia/Tokyo", "yyyy/M/d HH:mm");
  return formatter;
}

function doPost(e) {
  const params = JSON.parse(e.postData.contents);
  const row = params.row + 1;  // 行番号を1増やして正しい位置に記入
  const value = params.value;
  const timestamp = getCurrentJSTString(); // GASで現在時刻を生成
  const progress = params.progress;
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  
  if (row > 1) {
    sheet.getRange(row, 2).setValue(value); // pulldown列
    sheet.getRange(row, 3).setValue(timestamp); // time列
    sheet.getRange(row, 4).setValue(progress); // progress列
  } else {
    throw new Error('項目名の行は更新できません');
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    'success': true,
    'message': `${row}行目を更新しました`,
    'timestamp': timestamp // タイムスタンプを返す
  })).setMimeType(ContentService.MimeType.JSON);
}

