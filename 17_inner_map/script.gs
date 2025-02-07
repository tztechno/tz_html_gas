function doGet() {
  return HtmlService.createHtmlOutputFromFile('index');
}

function getLocations() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();

  var locations = [];
  for (var i = 1; i < data.length; i++) {  // ヘッダーをスキップ
    locations.push({
      name: data[i][0],
      lat: data[i][1],
      lng: data[i][2]
    });
  }

  return locations;
}
