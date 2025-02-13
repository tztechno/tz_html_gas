// Code.gs

function doGet(e) {
  const page = e.parameter.page || 'map';
  
  if (page === 'progress') {
    return HtmlService.createTemplateFromFile('Progress')
      .evaluate()
      .setTitle('Progress Input')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } else {
    return HtmlService.createTemplateFromFile('Index')
      .evaluate()
      .setTitle('Region Map')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
}

function getPolygonData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const polygonSheet = ss.getSheetByName('polygon');
  const polygonData = polygonSheet.getDataRange().getValues();
  
  // progressデータの取得
  const progressSS = SpreadsheetApp.openById("1KwImGrPS-6lYCQ-qoPeU5Rz7E8YajLVTuTweVOiOzmA");
  const progressSheet = progressSS.getSheetByName('progress');
  const progressData = progressSheet.getDataRange().getValues();
  
  // progressデータのマッピングを改善
  const progressMap = {};
  progressData.slice(1).forEach(row => {
    // region列をキーとして、progress値を数値として保存
    if (row[0] && row[1]) {
      progressMap[row[0].toString()] = parseFloat(row[1]) || 0;
    }
  });
  
  // polygonデータにprogressを紐付け、色情報を追加
  const polygons = polygonData.slice(1).map((row) => {
    if (row[0] && row[1]) {
      const region = row[1].toString();
      const progress = progressMap[region] || 0;
      
      // progressに基づいて色を計算
      const color = calculateColor(progress);
      
      return {
        wkt: row[0].trim(),
        region: region,
        description: row[2] || '',
        progress: progress,
        color: color
      };
    }
    return null;
  }).filter(item => item !== null);
  
  return polygons;
}

function calculateColor(progress) {
  // progress値（0-100）に基づいて色を計算
  const hue = (progress * 1.2); // 0-120の範囲（赤から緑）
  return `hsl(${hue}, 70%, 50%)`; // HSL形式で返す
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
    .getContent();
}
