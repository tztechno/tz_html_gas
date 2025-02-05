function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const formData = e.parameter;
  const name = formData.name;
  const comment = formData.comment;
  const type = formData.type;
  
  // データを検索して更新する行を見つける
  const data = sheet.getDataRange().getValues();
  let rowToUpdate = -1;
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === name) { // nameは2列目（インデックス1）
      rowToUpdate = i + 1; // スプレッドシートの行番号は1から始まる
      break;
    }
  }
  
  if (rowToUpdate === -1) {
    return ContentService.createTextOutput('指定された名前が見つかりません');
  }
  
  const now = new Date();
  const timestamp = Utilities.formatDate(now, 'Asia/Tokyo', 'yyyy/MM/dd HH:mm:ss');
  
  // タイプに応じて更新する列を決定
  switch (type) {
    case '出勤':
      sheet.getRange(rowToUpdate, 3).setValue(timestamp); // 出勤時刻（3列目）
      break;
    case '退勤':
      sheet.getRange(rowToUpdate, 4).setValue(timestamp); // 退勤時刻（4列目）
      break;
    case '欠勤':
      sheet.getRange(rowToUpdate, 5).setValue(timestamp); // 欠勤申告時刻（5列目）
      break;
    default:
      return ContentService.createTextOutput('不正な操作です');
  }
  
  // コメントを更新（6列目）
  if (comment) {
    sheet.getRange(rowToUpdate, 6).setValue(comment);
  }
  
  return ContentService.createTextOutput(`${type}を記録しました`);
}

// Web アプリケーションとして公開する際の設定
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('出退勤管理システム');
}