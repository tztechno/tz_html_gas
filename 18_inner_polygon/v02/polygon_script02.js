// Script.gs

function doGet() {
    return HtmlService.createTemplateFromFile('Index')
        .evaluate()
        .setTitle('Region Map')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getPolygonData() {
    // Get data from the polygon sheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const polygonData = sheet.getDataRange().getValues();

    // Get data from the progress sheet
    const progressSheet = SpreadsheetApp.openById('1emVrPJOCYLl9HN67F1b8urs1lpdAN6s04ka8JmEGRw4').getSheetByName('Sheet1');
    const progressData = progressSheet.getDataRange().getValues();

    // Create a map of region to progress
    const progressMap = {};
    progressData.slice(1).forEach(row => {
        progressMap[row[0]] = row[3]; // region -> progress
    });

    // Skip header row and process polygon data
    const polygons = polygonData.slice(1).map((row, index) => {
        if (row[0] && row[1]) {
            return {
                wkt: row[0].trim(),
                region: row[1].toString(),
                description: row[2] || '',
                progress: progressMap[row[1]] || 0 // Get progress value or default to 0
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