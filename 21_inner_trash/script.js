// Code.gs
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
      .setTitle('今日のゴミ出し')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getGarbageTypes() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const typeSheet = ss.getSheetByName('分類');
  const types = typeSheet.getRange('A2:B8').getValues();
  
  // Convert to object for easier access
  const garbageTypes = {};
  types.forEach(([key, value]) => {
    if (key && value) {
      garbageTypes[key] = value;
    }
  });
  return garbageTypes;
}

function getSchedule() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const scheduleSheet = ss.getSheetByName('予定');
  const schedule = scheduleSheet.getRange('A2:E8').getValues();
  
  // Convert to object with day numbers as keys
  const scheduleObj = {};
  schedule.forEach((row, index) => {
    scheduleObj[index] = row;
  });
  return scheduleObj;
}
