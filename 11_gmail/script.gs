// GASのコード

function doGet(e) {
  // アクセスしているユーザーのメールアドレスを取得
  var email = Session.getActiveUser().getEmail();
  
  // スプレッドシートのIDを指定
  var spreadsheetId = 'あなたのスプレッドシートのID';
  var sheet = SpreadsheetApp.openById(spreadsheetId).getActiveSheet();
  
  // 最終行を取得
  var lastRow = sheet.getLastRow();
  
  // メールアドレスを記録（A列）
  sheet.getRange(lastRow + 1, 1).setValue(email);
  
  // 日時を記録（B列）- Utilities.formatDateを使用して日時フォーマットを指定
  var now = new Date();
  var formattedDate = Utilities.formatDate(now, 'Asia/Tokyo', 'yyyy/MM/dd HH:mm:ss');
  sheet.getRange(lastRow + 1, 2).setValue(formattedDate);
  
  // 完了ページを表示
  var template = HtmlService.createTemplateFromFile('Complete');
  return template.evaluate()
      .setTitle('登録完了')
      .setFaviconUrl('https://www.google.com/favicon.ico');
}
