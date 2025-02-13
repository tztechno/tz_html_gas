// Config
const SHEET_NAMES = {
  PROFILE: 'Profile',
  MESSAGE: 'Message'
};

const PROFILE_HEADERS = ['番号', '名前', 'プロフィール'];
const MESSAGE_HEADERS = ['From', 'To', 'Message'];

function doGet() {
  return HtmlService.createTemplateFromFile('Index')
      .evaluate()
      .setTitle('メッセージ管理システム')
      .setFaviconUrl('https://www.google.com/images/spreadsheet_2020q4_48dp.png');
}

// プロフィール関連の関数
function getAllProfiles() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAMES.PROFILE);
  const data = sheet.getDataRange().getValues();
  return data.slice(1); // ヘッダーを除外
}

function submitProfile(formData) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAMES.PROFILE);
  const lastRow = sheet.getLastRow();
  sheet.getRange(lastRow + 1, 1, 1, 3).setValues([[
    formData.number,
    formData.name,
    formData.profile
  ]]);
  return getAllProfiles();
}

// メッセージ関連の関数
function getAllMessages() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAMES.MESSAGE);
  const data = sheet.getDataRange().getValues();
  return data.slice(1); // ヘッダーを除外
}

function submitMessage(formData) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAMES.MESSAGE);
  const lastRow = sheet.getLastRow();
  sheet.getRange(lastRow + 1, 1, 1, 3).setValues([[
    formData.from,
    formData.to,
    formData.message
  ]]);
  return getAllMessages();
}

function searchMessages(fromId, toId) {
  const messages = getAllMessages();
  return messages.filter(msg => {
    const fromMatch = fromId === 'all' || msg[0].toString() === fromId;
    const toMatch = toId === 'all' || msg[1].toString() === toId;
    return fromMatch && toMatch;
  });
}

// 初期化
function initialize() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Profileシート
  let profileSheet = ss.getSheetByName(SHEET_NAMES.PROFILE);
  if (!profileSheet) {
    profileSheet = ss.insertSheet(SHEET_NAMES.PROFILE);
    profileSheet.getRange(1, 1, 1, PROFILE_HEADERS.length).setValues([PROFILE_HEADERS]);
  }
  
  // Messageシート
  let messageSheet = ss.getSheetByName(SHEET_NAMES.MESSAGE);
  if (!messageSheet) {
    messageSheet = ss.insertSheet(SHEET_NAMES.MESSAGE);
    messageSheet.getRange(1, 1, 1, MESSAGE_HEADERS.length).setValues([MESSAGE_HEADERS]);
  }
}

// 初期シート作成を実行
function createInitialSheets() {
  initialize();
}
