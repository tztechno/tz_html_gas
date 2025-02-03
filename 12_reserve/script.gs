
function doPost(e) {
  try {
    // デバッグログ
    console.log('Raw postData:', e.postData.contents);
    
    // スプレッドシートIDを直接指定
    const SHEET_ID = '1B-ZwiCisFGn22fYV3V6j2VtFU8U3Q-Frj35DPY3d1vs';
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheets()[0];

    let data;
    // POSTデータをパースする前にログ出力
    console.log('Content Type:', e.postData.type);
    
    // データの取得方法を場合分け /////重要//////
    if (e.postData.type === 'application/x-www-form-urlencoded') {
      // フォームデータとして送信された場合
      data = e.parameter;
    } else {
      // JSONとして送信された場合
      data = JSON.parse(e.postData.contents);
    }
    
    console.log('Parsed data:', data);
    
    // 現在の日時を取得
    const timestamp = new Date();
    
    // スプレッドシートに行を追加
    sheet.appendRow([
      timestamp,
      data.name || '',
      data.comment || '',
      Session.getEffectiveUser().getEmail()
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: '予約が完了しました'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    console.error('Error:', error);
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

