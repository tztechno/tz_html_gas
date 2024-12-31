function doGet(e) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('plan');
    const name = e.parameter.name;

    if (!name) return ContentService.createTextOutput('Missing name parameter').setMimeType(ContentService.MimeType.TEXT);

    const data = sheet.getDataRange().getValues();
    const columns = data[0]; // 1行目を列名として取得
    const matchingRows = data.filter((row, index) => index === 0 || row[0] === name || row.every(cell => !cell)); // 名前が一致または空行

    return ContentService.createTextOutput(JSON.stringify({ columns, rows: matchingRows })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('reserve');
    const payload = JSON.parse(e.postData.contents);

    const { name, checkedIndexes } = payload;
    const data = sheet.getDataRange().getValues();
    const targetRow = data.findIndex(row => row[0] === name);

    if (targetRow === -1) return ContentService.createTextOutput('Name not found').setMimeType(ContentService.MimeType.TEXT);

    checkedIndexes.forEach(index => {
        sheet.getRange(targetRow + 1, index + 2).setValue('Checked'); // 例：2列目以降を更新
    });

    return ContentService.createTextOutput('Success').setMimeType(ContentService.MimeType.JSON);
}
