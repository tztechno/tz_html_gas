// スプレッドシートの操作
const SPREADSHEET_ID = '12XD2gFzDTQe39jlZkAB7BJ-zc3ZmowihiahfSeQLsRU'; // スプレッドシートIDを入力
function doGet(e) {
  console.log('doGet params:', e.parameter);  // デバッグ用

  if (e.parameter.action === "update") {
    try {
      const index = parseInt(e.parameter.index);
      const progress = parseInt(e.parameter.progress);
      const email = e.parameter.email;
      const date = e.parameter.date;
      const time = e.parameter.time;
      
      updateRow(index, progress, email, date, time);
      const updatedData = getSheetData();  // 更新後のデータを取得
      
      const callback = e.parameter.callback;
      const response = JSON.stringify({
        success: true,
        message: "更新完了",
        data: updatedData
      });
      
      return ContentService.createTextOutput(callback + "(" + response + ")")
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    } catch (error) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }

  // 通常のデータ取得
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("sheet1");
  const data = sheet.getDataRange().getValues();
  const callback = e.parameter.callback;
  const responseText = JSON.stringify(data);
  
  if (callback) {
    return ContentService.createTextOutput(callback + "(" + responseText + ")")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(responseText).setMimeType(ContentService.MimeType.JSON);
}

function getSheetData() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("sheet1");
  return sheet.getDataRange().getValues();
}


function updateRow(index, progress, email, date, time) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("sheet1");
  const progressValues = ['散布前', '散布中', '散布済み', '散布中止'];
  
  // indexは0ベースで来るので、シートの行番号（2行目以降）に変換
  const row = index + 2;  // 2行目から開始
  
  // Pulldown列には数値を設定（col=3）
  sheet.getRange(row, 2).setValue(parseInt(progress));
  
  // Progress列には選択された名称を設定（col=2）
  sheet.getRange(row, 3).setValue(progressValues[parseInt(progress)]);

  // Name列にメールアドレスを設定（col=4）
  sheet.getRange(row, 4).setValue(email);
  
  // Date列に日付を設定（col=5）
  const formattedDate = new Date(date).toISOString().split('T')[0];
  sheet.getRange(row, 5).setValue(formattedDate);
  
  // Time列に時刻を設定（col=6）
  const formattedTime = new Date().toTimeString().split(' ')[0];
  sheet.getRange(row, 6).setValue(formattedTime);

  // デバッグ用にログ出力
  console.log('Updated row:', {
    row: row,
    progress: progress,
    progressText: progressValues[parseInt(progress)],
    email: email,
    date: formattedDate,
    time: formattedTime
  });
}


function doPost(e) {
    // POSTリクエスト用のCORS設定
    if (e.postData.type === "application/json") {
        const data = JSON.parse(e.postData.contents);

        return ContentService.createTextOutput(JSON.stringify({ success: true }))
            .setMimeType(ContentService.MimeType.JSON)
            .setHeader('Access-Control-Allow-Origin', '*');  // この行を追加
    }
}

function getSheetData() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('sheet1');
  const data = sheet.getDataRange().getValues();
  return data;
}


function createRow(progress, name, date, time) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('sheet1');
  const progressValues = ['散布前', '散布中', '散布済み', '散布中止'];
  sheet.appendRow([null, progressValues[progress], progress, name, date, time]);
}
