function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("sheet1");
  const data = sheet.getDataRange().getValues();
  
  // コールバック関数名を取得
  const callback = e.parameter.callback;
  
  // データをJSON文字列に変換
  const responseText = JSON.stringify(data);
  
  // JSONP形式でレスポンスを返す
  if (callback) {
    return ContentService.createTextOutput(callback + "(" + responseText + ")")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  
  // コールバックが指定されていない場合は通常のJSONを返す
  return ContentService.createTextOutput(responseText)
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("sheet1");
    sheet.appendRow([data.date, data.subject, data.content]);
    return ContentService.createTextOutput('success');
  } catch (error) {
    return ContentService.createTextOutput('error: ' + error.toString());
  }
}
