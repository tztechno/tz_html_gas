// LocationViewer.gs
function doGet() {
  return HtmlService.createHtmlOutputFromFile('ViewerIndex')
    .setTitle('位置情報ビューアー')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ソースシートIDのリストを取得
function getSourceSheetIds() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('source');
  if (!sheet) return [];
  
  const data = sheet.getRange('A2:A' + sheet.getLastRow()).getValues();
  return data.flat().filter(id => id !== ''); // 空の値を除外
}

// 指定されたスプレッドシートから位置情報を取得
function getLocations(sourceId) {
  try {
    const sourceSheet = SpreadsheetApp.openById(sourceId).getSheetByName('記録');
    const data = sourceSheet.getDataRange().getValues();
    // ヘッダー行を除去
    data.shift();
    return {
      success: true,
      data: data.map(row => ({
        timestamp: row[0],
        latitude: row[1],
        longitude: row[2]
      }))
    };
  } catch (error) {
    return {
      success: false,
      error: 'データの取得に失敗しました: ' + error.toString()
    };
  }
}

// 最終更新時刻の取得
function getLastUpdateTime(sourceId) {
  try {
    const sourceSheet = SpreadsheetApp.openById(sourceId).getSheetByName('記録');
    const lastRow = sourceSheet.getLastRow();
    if (lastRow > 1) {
      return {
        success: true,
        timestamp: sourceSheet.getRange(lastRow, 1).getValue()
      };
    }
    return {
      success: true,
      timestamp: null
    };
  } catch (error) {
    return {
      success: false,
      error: '更新時刻の取得に失敗しました: ' + error.toString()
    };
  }
}
