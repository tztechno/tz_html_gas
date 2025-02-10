
function getHtml() {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <base target="_top">
    <title>出退勤状況レポート（管理者用）</title>
    <style>
        .company-filter {
            margin-bottom: 15px;
        }
        .company-filter select {
            width: 25%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>出退勤状況レポート 管理画面</h1>
        
        <div class="company-filter">
            <label for="companySelect">会社名：</label>
            <select id="companySelect">
                <option value="all">全社</option>
            </select>
        </div>

        <button onclick="previewReport()">プレビュー表示</button>
        <button onclick="sendReport()">レポート送信</button>
        
        <div id="sendStatus"></div>
        <div id="previewArea" class="preview-area" style="display: none;"></div>
    </div>
    <script>
        // Load companies when page loads
        window.onload = function() {
            google.script.run
                .withSuccessHandler(function(companies) {
                    const select = document.getElementById('companySelect');
                    companies.forEach(company => {
                        const option = document.createElement('option');
                        option.value = company;
                        option.text = company;
                        select.appendChild(option);
                    });
                })
                .getCompanies();
        };
        
        function previewReport() {
            const today = new Date().toISOString().split('T')[0];
            const company = document.getElementById('companySelect').value;
            const statusDiv = document.getElementById('sendStatus');
            const previewArea = document.getElementById('previewArea');
            
            statusDiv.style.display = 'block';
            statusDiv.style.backgroundColor = '#fff3cd';
            statusDiv.innerHTML = 'プレビューを生成中...';
            
            google.script.run
                .withSuccessHandler(function(result) {
                    statusDiv.style.display = 'none';
                    previewArea.style.display = 'block';
                    previewArea.innerHTML = result.replace(/\\n/g, '<br>');
                })
                .withFailureHandler(function(error) {
                    statusDiv.style.backgroundColor = '#f8d7da';
                    statusDiv.innerHTML = 'エラー: ' + error;
                    previewArea.style.display = 'none';
                })
                .generateReportPreview(today, company);
        }
        
        function sendReport() {
            const today = new Date().toISOString().split('T')[0];
            const company = document.getElementById('companySelect').value;
            const statusDiv = document.getElementById('sendStatus');
            
            if (!confirm('レポートを送信しますか？')) {
                return;
            }
            
            statusDiv.style.display = 'block';
            statusDiv.style.backgroundColor = '#fff3cd';
            statusDiv.innerHTML = '送信中...';
            
            google.script.run
                .withSuccessHandler(function(result) {
                    statusDiv.style.backgroundColor = '#d4edda';
                    statusDiv.innerHTML = result;
                })
                .withFailureHandler(function(error) {
                    statusDiv.style.backgroundColor = '#f8d7da';
                    statusDiv.innerHTML = 'エラー: ' + error;
                })
                .sendManualAttendanceReport(today, company);
        }
    </script>

<div class="container">
  <div class="status-panel">
    <h3>自動メール配信状態</h3>
    <div id="statusDisplay">現在の状態: <span id="currentStatus">確認中...</span></div>
    <button onclick="google.script.run.withSuccessHandler(updateStatus).setupAutomaticEmails()">
      配信開始
    </button>
    <button onclick="google.script.run.withSuccessHandler(updateStatus).stopAutomaticEmails()">
      配信停止
    </button>
  </div>
</div>

<script>
function updateStatus() {
  google.script.run.withSuccessHandler(function(status) {
    document.getElementById('currentStatus').textContent = status;
  }).getTriggerStatus();
}

// Initial status check
updateStatus();
</script>

<style>
.container {
  padding: 20px;
}

.status-panel {
  border: 1px solid #ccc;
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 4px;
}

button {
  margin: 10px;
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}

#statusDisplay {
  margin: 10px 0;
}
</style>

</body>
</html>`;
}


// Get list of companies from company sheet
function getCompanies() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const companySheet = ss.getSheetByName('company');
    if (!companySheet) {
        throw new Error('会社シート(company)が見つかりません。');
    }

    const data = companySheet.getDataRange().getValues();
    // Skip header row and get unique company names from first column
    return [...new Set(data.slice(1).map(row => row[0]))].filter(Boolean).sort();
}


// Modified to include company parameter
function generateReportPreview(dateStr, company) {
    const data = getAttendanceData();
    const { presentEmployees, absentEmployees, unreportedEmployees } =
        categorizeEmployees(data, dateStr, company);

    return createEmailBody(
        presentEmployees,
        absentEmployees,
        unreportedEmployees,
        dateStr,
        new Date(),
        company
    );
}

function getEmailAddresses(company) {
    try {
        const ss = SpreadsheetApp.getActiveSpreadsheet();
        const addressSheet = ss.getSheetByName('address');

        if (!addressSheet) {
            throw new Error('アドレス帳シート(address)が見つかりません。');
        }

        const data = addressSheet.getDataRange().getValues();

        // 会社名に関係なく、すべての有効なメールアドレスを取得
        const emailAddresses = data.slice(1)
            .map(row => row[0])
            .filter(email => email && validateEmail(email));

        if (emailAddresses.length === 0) {
            throw new Error('有効なメールアドレスが見つかりません。address シートの A列にメールアドレスが正しく設定されているか確認してください。');
        }

        return emailAddresses;
    } catch (error) {
        console.error('Error in getEmailAddresses:', error.message);
        throw error;
    }
}

// メール送信時の件名と本文は会社名を維持
function sendManualAttendanceReport(dateStr, company) {
    try {
        const data = getAttendanceData();
        const emailAddresses = getEmailAddresses();

        const { presentEmployees, absentEmployees, unreportedEmployees } =
            categorizeEmployees(data, dateStr, company);

        const currentTime = new Date();
        const emailBody = createEmailBody(
            presentEmployees,
            absentEmployees,
            unreportedEmployees,
            dateStr,
            currentTime,
            company
        );

        const companyName = company === 'all' ? '全社' : company;
        MailApp.sendEmail({
            to: emailAddresses.join(','),
            subject: `出退勤状況レポート - ${companyName} (${dateStr})`,
            body: emailBody
        });

        logEmailSend(emailAddresses, dateStr, company);

        return `送信完了！\n送信先: ${emailAddresses.join(', ')}\n送信日時: ${currentTime.toLocaleString('ja-JP')}`;
    } catch (error) {
        console.error('Error in sendManualAttendanceReport:', error);
        throw new Error(`送信失敗: ${error.message}`);
    }
}


function categorizeEmployees(data, dateStr, company) {
    const presentEmployees = [];
    const absentEmployees = [];
    const unreportedEmployees = [];

    const rows = data.slice(1);

    rows.forEach(row => {
        // 正しい列構成に基づくインデックス
        const employeeCompany = row[0];  // A列: 会社
        const employeeName = row[1];     // B列: 名前
        const arrivalTime = row[2];      // C列: 出勤時刻
        const absenceDeclarationTime = row[3];  // E列: 欠勤申告時刻

        // 会社フィルタリング
        if (company && company !== 'all' && employeeCompany !== company) {
            return;
        }

        const fullName = `${employeeCompany} ${employeeName}`;

        if (arrivalTime || absenceDeclarationTime) {
            if (arrivalTime) {
                presentEmployees.push(fullName);
            } else if (absenceDeclarationTime) {
                absentEmployees.push(fullName);
            }
        } else {
            unreportedEmployees.push(fullName);
        }
    });

    return {
        presentEmployees: [...new Set(presentEmployees)].sort(),
        absentEmployees: [...new Set(absentEmployees)].sort(),
        unreportedEmployees: [...new Set(unreportedEmployees)].sort()
    };
}


function createEmailBody(presentEmployees, absentEmployees, unreportedEmployees, dateStr, currentTime, company) {
    const timeStr = currentTime.toLocaleString('ja-JP');
    const companyStr = company && company !== 'all' ? ` - ${company}` : '';

    return `出勤状況レポート${companyStr}
報告日時: ${timeStr}
対象日: ${dateStr}

【出勤】 ${presentEmployees.length}名
${presentEmployees.join('\n')}

【欠勤】 ${absentEmployees.length}名
${absentEmployees.join('\n')}

【未報告】 ${unreportedEmployees.length}名
${unreportedEmployees.join('\n')}

        `;
}


// Modified to include company in log
function logEmailSend(recipients, dateStr, company) {
    const logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('送信ログ');
    if (!logSheet) return;

    const timestamp = new Date();
    recipients.forEach(recipient => {
        logSheet.appendRow([
            timestamp,
            dateStr,
            company,
            recipient
        ]);
    });
}


// メールアドレスのバリデーション
function validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}


function doGet() {
    return HtmlService.createHtmlOutput(getHtml())
        .setTitle('出勤状況レポート（管理者用）')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}


/////////////////////////////////////////////////////////////////

function getSheetId() {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('source');
    const sheetId = sheet.getRange('A1').getValue();
    //Logger.log(sheetId);
    return sheetId;
}

////////////////////////////////////////////////////////////////////

// Constants for spreadsheet IDs and sheet names
const DATA_SPREADSHEET_ID = getSheetId();
//const DATA_SPREADSHEET_ID = '1CYsREp5ehKjnRrTzY6FgL8Te0euAKKlnqMxrITeKdJI';
const DATA_SHEET_NAME = 'today';

// 出退勤データを取得する関数
function getAttendanceData() {
    try {
        const dataSpreadsheet = SpreadsheetApp.openById(DATA_SPREADSHEET_ID);
        const dataSheet = dataSpreadsheet.getSheetByName(DATA_SHEET_NAME);

        if (!dataSheet) {
            throw new Error(`データシート(${DATA_SHEET_NAME})が見つかりません。`);
        }

        return dataSheet.getDataRange().getValues();
    } catch (error) {
        throw new Error(`出勤データの取得に失敗しました: ${error.message}`);
    }
}

//////////////////////////////////////////////////////

// Global constants
const TRIGGER_FUNCTION_NAME = 'sendAutomaticAttendanceReport';

// Stop all automatic emails
function stopAutomaticEmails() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const companySheet = ss.getSheetByName(CONFIG.COMPANY_SHEET_NAME);

    if (!companySheet) {
        throw new Error('会社シート(company)が見つかりません。');
    }

    // Delete all triggers
    ScriptApp.getProjectTriggers().forEach(trigger => ScriptApp.deleteTrigger(trigger));

    // Update all statuses to inactive
    const data = companySheet.getDataRange().getValues();
    const statusRange = companySheet.getRange(2, 3, data.length - 1, 1);
    statusRange.setValue(CONFIG.STATUS_INACTIVE);
}

// Get current trigger status
function getTriggerStatus() {
    const triggers = ScriptApp.getProjectTriggers();
    return triggers.length > 0 ? CONFIG.STATUS_ACTIVE : CONFIG.STATUS_INACTIVE;
}

// 会社別の送信関数を動的に作成
function createCompanySpecificFunction(functionName, company) {
    const functionCode = `
        function ${functionName}() {
            sendAutomaticAttendanceReport("${company}");
        }
    `;
    eval(functionCode);
}

// Global constants
const CONFIG = {
    COMPANY_SHEET_NAME: 'company',
    STATUS_ACTIVE: '配信中',
    STATUS_INACTIVE: '停止中'
};

// トリガー設定
function setupAutomaticEmails() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const companySheet = ss.getSheetByName(CONFIG.COMPANY_SHEET_NAME);

    if (!companySheet) {
        logDebug('Error: Company sheet not found');
        throw new Error('会社シート(company)が見つかりません。');
    }

    // 既存のトリガーを削除
    const existingTriggers = ScriptApp.getProjectTriggers();
    logDebug(`既存のトリガー数: ${existingTriggers.length}`);
    existingTriggers.forEach(trigger => {
        try {
            ScriptApp.deleteTrigger(trigger);
        } catch (error) {
            logDebug(`トリガー削除エラー: ${error.message}`);
        }
    });

    // スクリプトプロパティをクリア
    PropertiesService.getScriptProperties().deleteAllProperties();

    const data = companySheet.getDataRange().getValues();

    // 全ての会社のステータスを一旦リセット
    const statusRange = companySheet.getRange(2, 3, data.length - 1, 1);
    statusRange.setValue(CONFIG.STATUS_INACTIVE);

    // 各会社のトリガー設定
    data.slice(1).forEach((row, index) => {
        const company = row[0];
        const sendTime = row[1];
        const rowNum = index + 2;

        if (!company) {
            logDebug(`行${rowNum}: 会社名が空のためスキップ`);
            return;
        }

        // 時刻の検証を改善
        let hours, minutes;
        if (sendTime instanceof Date && !isNaN(sendTime.getTime())) {
            hours = sendTime.getHours();
            minutes = sendTime.getMinutes();
        } else {
            logDebug(`行${rowNum}: ${company}の配信時刻が無効です`);
            companySheet.getRange(rowNum, 3).setValue('時刻未設定');
            return;
        }

        try {
            logDebug(`トリガー設定試行: ${company}, ${hours}:${minutes}`);

            // トリガーを作成し、会社名をプロパティに保存
            const trigger = ScriptApp.newTrigger('sendAutomaticAttendanceReport')
                .timeBased()
                .atHour(hours)
                .nearMinute(minutes)
                .everyDays(1)
                .create();

            // トリガーIDと会社名の紐付けを保存
            PropertiesService.getScriptProperties().setProperty(
                trigger.getUniqueId(),
                company
            );

            logDebug(`トリガー設定成功: ${company}, ID: ${trigger.getUniqueId()}`);
            companySheet.getRange(rowNum, 3).setValue(CONFIG.STATUS_ACTIVE);
        } catch (error) {
            logDebug(`トリガー設定エラー: ${company}, ${error.message}`);
            companySheet.getRange(rowNum, 3).setValue('設定エラー');
        }
    });

    // 最終確認
    checkCurrentTriggers();
}

// トリガーで実行される関数
function sendAutomaticAttendanceReport(e) {
    const executionTime = new Date();
    logDebug(`送信処理開始: ${executionTime.toLocaleString()}`);

    // トリガーIDから会社名を取得
    let targetCompany;
    if (e && e.triggerUid) {
        targetCompany = PropertiesService.getScriptProperties().getProperty(e.triggerUid);
    }

    if (!targetCompany) {
        logDebug('Error: 対象会社が特定できません');
        return;
    }

    logDebug(`送信対象会社: ${targetCompany}`);
    const today = executionTime.toISOString().split('T')[0];

    try {
        sendManualAttendanceReport(today, targetCompany);
        logDebug(`${targetCompany}の送信成功`);
    } catch (error) {
        logDebug(`${targetCompany}の送信失敗: ${error.message}`);
    }
}

// トリガー設定確認用
function checkCurrentTriggers() {
    const triggers = ScriptApp.getProjectTriggers();
    const properties = PropertiesService.getScriptProperties().getProperties();

    logDebug('現在のトリガー設定:');
    triggers.forEach(trigger => {
        const triggerId = trigger.getUniqueId();
        const company = properties[triggerId];
        logDebug(`- ID: ${triggerId}, 会社: ${company}, 関数: ${trigger.getHandlerFunction()}`);
    });
}

// デバッグ用の即時実行関数
function debugTriggerExecution(company) {
    logDebug(`デバッグ用即時実行開始: ${company}`);
    const today = new Date().toISOString().split('T')[0];
    sendManualAttendanceReport(today, company);
    logDebug('デバッグ用即時実行完了');
}

// デバッグログを記録する関数
function logDebug(message) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let logSheet = ss.getSheetByName('Debug_Log');

    if (!logSheet) {
        // Debug_Logシートが存在しない場合のみ新規作成
        logSheet = ss.insertSheet('Debug_Log');
        logSheet.getRange('A1:C1').setValues([['Timestamp', 'Event', 'Details']]);
    }

    // 最終行の次の行に追記
    const lastRow = Math.max(logSheet.getLastRow(), 1);
    const timestamp = new Date().toLocaleString();
    logSheet.getRange(lastRow + 1, 1, 1, 3).setValues([[timestamp, 'Debug', message]]);
}

////////////////////////////////////////////////////////////

