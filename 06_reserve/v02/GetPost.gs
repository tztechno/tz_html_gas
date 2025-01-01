function getPlanDataWithCheckbox(name) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("plan");
    
    if (!sheet) {
        throw new Error("plan シートが見つかりません。");
    }

    const allData = sheet.getDataRange().getValues(); // シート全体のデータ
    const dateRow = allData[0];      // 1行目: 日付
    const weekdayRow = allData[1];   // 2行目: 曜日
    const holidayRow = allData[2];   // 3行目: 休日

    // nameに一致する行を2行（定期利用日とキャンセル待ち）探す
    const matchingRows = allData.filter(row => row[0] === name);
    
    if (matchingRows.length === 0) {
        // 該当する名前が見つからない場合は空の行を返す
        const emptyRow = new Array(dateRow.length).fill("");
        emptyRow[0] = name;
        emptyRow[1] = "定期利用日";
        const emptyRow2 = new Array(dateRow.length).fill("");
        emptyRow2[0] = name;
        emptyRow2[1] = "利用/キャンセル待ち";
        matchingRows.push(emptyRow, emptyRow2);
    }

    const result = [
        dateRow,         // 1行目: 日付
        weekdayRow,      // 2行目: 曜日
        holidayRow,      // 3行目: 休日
        matchingRows[0], // 4行目: 定期利用日
        matchingRows[1]  // 5行目: 利用/キャンセル待ち
    ];

    return result;
}

function doGet(e) {
    const name = e.parameter.name || "";
    
    if (!name) {
        return ContentService.createTextOutput(JSON.stringify({ 
            error: "名前が指定されていません。" 
        })).setMimeType(ContentService.MimeType.JSON);
    }

    try {
        const data = getPlanDataWithCheckbox(name);
        return ContentService.createTextOutput(JSON.stringify({ rows: data }))
            .setMimeType(ContentService.MimeType.JSON);
    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({ 
            error: error.message 
        })).setMimeType(ContentService.MimeType.JSON);
    }
}

function doPost(e) {
    try {
        // フォームデータのパース
        const data = JSON.parse(e.parameter.data);
        const name = data.name;
        const checkedData = data.checkedData;

        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("plan");
        if (!sheet) {
            throw new Error('Plan sheet not found');
        }

        // 名前に一致する行を探す
        const allData = sheet.getDataRange().getValues();
        const nameCol = 0;  // 名前は1列目 (A列)
        const typeCol = 1;  // 種別は2列目 (B列)

        let targetRow = -1;
        for (let i = 0; i < allData.length; i++) {
            if (allData[i][nameCol] === name && allData[i][typeCol] === "利用/キャンセル待ち") {
                targetRow = i + 1;  // シートの行番号は1から始まる
                break;
            }
        }

        if (targetRow <= 0) {
            throw new Error(`Name "${name}" not found`);
        }

        // チェックデータの更新
        Object.entries(checkedData).forEach(([colIndex, value]) => {
            sheet.getRange(targetRow, parseInt(colIndex)).setValue(value);
        });

        return ContentService.createTextOutput(JSON.stringify({
            status: "success",
            message: "更新が完了しました"
        })).setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({
            status: "error",
            message: error.message
        })).setMimeType(ContentService.MimeType.JSON);
    }
}