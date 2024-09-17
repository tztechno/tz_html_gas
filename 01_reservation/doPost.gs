// https://script.google.com/macros/s/AKfycbyboHbJECjEhQcuxylUIFMg9JcmaVq2DqZZckn8HvyPDV7wI7kGWE0VsVpszD7576cn/exec

function doPost(e) {
  // POSTデータの内容をログで確認
  Logger.log('Received POST data: ' + e.postData.contents);
  
  // 受け取ったデータを直接代入して確認
let data = {};
if (e.postData.type == "application/x-www-form-urlencoded") {
  data = e.parameter;
} else {
  try {
    data = JSON.parse(e.postData.contents);
  } catch (error) {
    Logger.log('Error parsing data: ' + error);
    return ContentService.createTextOutput(JSON.stringify({ status: 'Data parsing error' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

  // 確認用: 受け取ったデータを出力
  Logger.log('Parsed data: ' + JSON.stringify(data));

  const sheet = SpreadsheetApp.openById('1AYGfxPBK6wOBtwoJW3A499JmLQdCzccav_9rnPXaJXU').getSheetByName('sheet1'); // 予約情報のシート名

  // 固定の時間とデスクのリストを定義
  const desks = ["AAA", "BBB", "CCC", "DDD", "EEE"];
  const times = [
    "9 : 00", "9 : 30", "10 : 00", "10 : 30", "11 : 00", "11 : 30",
    "12 : 00", "12 : 30", "13 : 00", "13 : 30", "14 : 00", "14 : 30",
    "15 : 00", "15 : 30", "16 : 00", "16 : 30", "17 : 00"
  ];

  const { reservationCode, reservations } = data;

  reservations.forEach(reservation => {
    const time = reservation.time.trim();
    const desk = reservation.desk.trim();

    // 時間とデスクのインデックスを取得
    const timeRow = times.indexOf(time) + 2; // 1列目が時間で、データは2行目から始まるので +2
    const deskColumn = desks.indexOf(desk) + 2; // デスクは2列目から始まるので +2

    Logger.log(`Time: ${time}, Desk: ${desk}, Row: ${timeRow}, Column: ${deskColumn}`); // デバッグ用

    if (timeRow > 1 && deskColumn > 1) {
      // 該当セルに予約コードを書き込む
      sheet.getRange(timeRow, deskColumn).setValue(reservationCode);
    }
  });

  return ContentService.createTextOutput(JSON.stringify({ status: '予約が正常に完了しました' }))
    .setMimeType(ContentService.MimeType.JSON);
}
