

function doGet(e) {
  var sheet = SpreadsheetApp.openById("zzzzz").getSheetByName("sheet1");
  var data = sheet.getDataRange().getValues();

  // 取得データをログに表示
  Logger.log(data);

  var jsonData = [];
  for (var i = 0; i < data.length; i++) {
    jsonData.push({
      'Column1': data[i][0],
      'Column2': data[i][1],
      'Column3': data[i][2],
    });
  }
  
  var output = ContentService.createTextOutput(JSON.stringify(jsonData))
                             .setMimeType(ContentService.MimeType.JSON);


  return output;
}
