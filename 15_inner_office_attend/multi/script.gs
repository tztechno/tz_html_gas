// Webアプリケーションとしてデプロイした際のGET要求に対するハンドラ
function doGet() {
  return HtmlService.createTemplateFromFile('index')
      .evaluate()
      .setTitle('出退勤管理システム')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// CSS取得用の関数
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// フォームデータを処理する関数
function processForm(formData) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const name = formData.name;
  const comment = formData.comment;
  const type = formData.type;
  
  // データを検索して更新する行を見つける
  const data = sheet.getDataRange().getValues();
  let rowToUpdate = -1;
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === name) { // nameは2列目（インデックス1）
      rowToUpdate = i + 1;
      break;
    }
  }
  
  if (rowToUpdate === -1) {
    throw new Error('指定された名前が見つかりません');
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
      throw new Error('不正な操作です');
  }
  
  // コメントを更新（6列目）
  if (comment) {
    sheet.getRange(rowToUpdate, 6).setValue(comment);
  }
  
  return `${type}を記録しました`;
}
