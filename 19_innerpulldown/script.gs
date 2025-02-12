
function doGet() {
  // スプレッドシートを取得
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  
  // Sheet1を取得
  const sheet = spreadsheet.getSheetByName('Sheet1');
  
  // データ範囲を取得
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  
  // HTMLを構築
  let html = '<table style="border-collapse: collapse;">';
  
  // データを表形式で表示
  for (let i = 0; i < values.length; i++) {
    html += '<tr>';
    for (let j = 0; j < values[i].length; j++) {
      html += '<td style="border: 1px solid #ccc; padding: 8px;">' + values[i][j] + '</td>';
    }
    html += '</tr>';
  }
  
  html += '</table>';
  
  // HTMLテンプレートを作成して返す
  return HtmlService.createHtmlOutput(html)
    .setTitle('スプレッドシート表示')
    .setFaviconUrl('https://www.google.com/images/icons/product/sheets-32.png');
}
