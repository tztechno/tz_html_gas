function getPlanDataWithCheckbox(name) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("plan");
    
    if (!sheet) {
        throw new Error("plan シートが見つかりません。");
    }

    const allData = sheet.getDataRange().getValues(); // シート全体のデータ
    const headerRow = allData[0]; // シートの1行目 (date)
    const holidayRow = allData[1]; // シートの2行目 (holiday)
    const matchingRow = allData.find(row => row[0] === name) || []; // name に一致する行

    // 4行目: 初期データは全て "checkbox"
    const checkboxRow = new Array(32).fill("checkbox");

    // 4行目の1列目を名前に上書き
    checkboxRow[0] = name;

    const result = [];
    result.push(headerRow);       // 1行目: date 情報
    result.push(holidayRow);      // 2行目: holiday 情報
    result.push(matchingRow);     // 3行目: name が一致する行
    result.push(checkboxRow);     // 4行目: 名前 + チェックボックスセル

    return result;
}


function doGet(e) {
    const name = e.parameter.name || ""; // パラメータから name を取得
    const data = getPlanDataWithCheckbox(name); // 表データを作成

    return ContentService.createTextOutput(JSON.stringify({ rows: data }))
        .setMimeType(ContentService.MimeType.JSON);
}


function doPost(e) {
  try {
    // フォームデータのパース
    const data = JSON.parse(e.parameter.data);
    const name = data.name;
    const checkedCols = data.checkedCols;

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("reserve");
    if (!sheet) {
      throw new Error('Reserve sheet not found');
    }

    const names = sheet.getRange("A:A").getValues().flat();
    const targetRow = names.findIndex(rowName => rowName === name) + 1;

    if (targetRow <= 0) {
      throw new Error(`Name "${name}" not found`);
    }

    checkedCols.forEach(colIndex => {
      sheet.getRange(targetRow, colIndex).setValue("✔");
    });

    return HtmlService.createHtmlOutput("更新が完了しました。ブラウザの戻るボタンで戻ってください。");

  } catch (error) {
    return HtmlService.createHtmlOutput("エラーが発生しました: " + error.message);
  }
}