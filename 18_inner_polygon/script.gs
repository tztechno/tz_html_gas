function doGet() {
  return HtmlService.createTemplateFromFile('Index')
      .evaluate()
      .setTitle('Region Map')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getPolygonData() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  
  // Skip header row and process data
  const polygons = data.slice(1).map((row, index) => {
    if (row[0] && row[1]) {
      return {
        wkt: row[0].trim(),
        region: row[1].toString(),
        description: row[2] || ''
      };
    }
    return null;
  }).filter(item => item !== null);
  
  return polygons;
}

function showMap() {
  var html = HtmlService.createTemplateFromFile('Index')
      .evaluate()
      .setWidth(800)
      .setHeight(600);
  SpreadsheetApp.getUi().showModalDialog(html, 'Region Map');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
      .getContent();
}
