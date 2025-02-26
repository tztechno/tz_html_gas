/**
 * HTMLサービスを使ってWebアプリケーションを作成
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('勤務可能時間入力フォーム')
    .setWidth(800)
    .setHeight(600);
}

/**
 * フォームから送信されたデータをスプレッドシートに保存
 * @param {string} name - ユーザー名
 * @param {Object} selectedTimes - 選択された時間枠（キー: 時間, 値: ○または×）
 */
function saveAvailability(name, selectedTimes) {
  try {
    // スプレッドシートとシートを取得
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('data');
    
    if (!sheet) {
      throw new Error('dataシートが見つかりません');
    }
    
    // データを準備
    const hours = [];
    for (let hour = 8; hour <= 16; hour++) {
      hours.push(`${hour}:00`);
    }
    
    // 既存のユーザーを検索
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    let rowIndex = -1;
    
    for (let i = 0; i < values.length; i++) {
      if (values[i][0] === name) {
        rowIndex = i + 1; // スプレッドシートの行は1から始まる
        break;
      }
    }
    
    // ユーザーデータを準備
    const rowData = [name];
    hours.forEach(hour => {
      rowData.push(selectedTimes[hour]);
    });
    
    if (rowIndex > 0) {
      // 既存ユーザーの場合は更新
      sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
    } else {
      // 新規ユーザーの場合は追加
      sheet.appendRow(rowData);
    }
    
    return true;
  } catch (error) {
    Logger.log(error);
    throw error;
  }
}

/**
 * スプレッドシートが開かれたときにメニューを追加
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('勤務可能時間管理')
    .addItem('入力フォームを開く', 'openForm')
    .addToUi();
}

/**
 * 入力フォームを開く
 */
function openForm() {
  const html = HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('勤務可能時間入力フォーム')
    .setWidth(800)
    .setHeight(600);
  
  SpreadsheetApp.getUi().showModalDialog(html, '勤務可能時間入力フォーム');
}

/**
 * データシートを初期化する（必要に応じて実行）
 */
function initializeDataSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('data');
  
  // シートが存在しない場合は作成
  if (!sheet) {
    sheet = ss.insertSheet('data');
  }
  
  // ヘッダー行を作成
  const headers = ['名前'];
  for (let hour = 8; hour <= 16; hour++) {
    headers.push(`${hour}:00`);
  }
  
  // ヘッダー行を設定
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.setFrozenRows(1);
}
