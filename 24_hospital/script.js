function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('動物病院予約システム');
}

function reserveAppointment(name) {
  try {
    // スプレッドシートのIDを指定して開く (実際のスプレッドシートIDに置き換えてください)
    var spreadsheetId = 'あなたのスプレッドシートID';
    var ss = SpreadsheetApp.openById(spreadsheetId);
    var sheet = ss.getSheetByName('受付');
    
    // 情報を準備
    var reservationTime = new Date();
    var formattedTime = Utilities.formatDate(reservationTime, Session.getScriptTimeZone(), 'yyyy/MM/dd HH:mm:ss');
    var reservationNumber = sheet.getLastRow() + 1;
    
    // データを追加
    sheet.appendRow([reservationNumber, name, formattedTime]);
    
    // 文字列として返す
    return {
      reservationNumber: reservationNumber,
      name: name,
      reservationTime: formattedTime
    };
  } catch (e) {
    Logger.log('エラー: ' + e.toString());
    return { error: e.toString() };
  }
}
