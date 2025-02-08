function doGet() {
    return HtmlService.createHtmlOutput(getHtml())
        .setTitle('出退勤状況レポート（管理者用）')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Constants for spreadsheet IDs and sheet names
const DATA_SPREADSHEET_ID = '1CYsREp5ehKjnRrTzY6FgL8Te0euAKKlnqMxrITeKdJI';
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
        throw new Error(`出退勤データの取得に失敗しました: ${error.message}`);
    }
}

function getHtml() {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <base target="_top">
    <title>出退勤状況レポート（管理者用）</title>
    <style>
        /* Previous styles remain the same */
        .company-filter {
            margin-bottom: 15px;
        }
        .company-filter select {
            width: 100%;
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
                <option value="all">全て</option>
            </select>
        </div>

        <div class="form-group">
            <label for="targetDate">対象日付：</label>
            <input type="date" id="targetDate" name="targetDate">
        </div>

        <button onclick="previewReport()">プレビュー表示</button>
        <button onclick="sendReport()">レポート送信</button>
        
        <div id="sendStatus"></div>
        <div id="previewArea" class="preview-area" style="display: none;"></div>
    </div>

    <script>
        // Set today's date as default
        document.getElementById('targetDate').valueAsDate = new Date();
        
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
            const date = document.getElementById('targetDate').value;
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
                .generateReportPreview(date, company);
        }
        
        function sendReport() {
            const date = document.getElementById('targetDate').value;
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
                .sendManualAttendanceReport(date, company);
        }
    </script>
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



// Set up automatic email trigger
function setupAutomaticEmails() {
    // Delete existing triggers
    ScriptApp.getProjectTriggers().forEach(trigger => ScriptApp.deleteTrigger(trigger));
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const companySheet = ss.getSheetByName('company');
    if (!companySheet) {
        throw new Error('会社シート(company)が見つかりません。');
    }
    
    const data = companySheet.getDataRange().getValues();
    // Skip header row
    data.slice(1).forEach(row => {
        const company = row[0];
        const sendTime = row[1]; // Assuming time is in second column
        
        if (company && sendTime) {
            // Parse time (assuming format like "09:00")
            const [hours, minutes] = sendTime.split(':').map(Number);
            
            // Create time-based trigger
            ScriptApp.newTrigger('sendAutomaticAttendanceReport')
                .timeBased()
                .atHour(hours)
                .nearMinute(minutes)
                .everyDays(1)
                .create()
                .setHandler('sendAutomaticAttendanceReport');
        }
    });
}

// Automatic email sending function
function sendAutomaticAttendanceReport() {
    const today = new Date().toISOString().split('T')[0];
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const companySheet = ss.getSheetByName('company');
    
    if (!companySheet) {
        throw new Error('会社シート(company)が見つかりません。');
    }
    
    const data = companySheet.getDataRange().getValues();
    // Skip header row
    data.slice(1).forEach(row => {
        const company = row[0];
        if (company) {
            try {
                sendManualAttendanceReport(today, company);
            } catch (error) {
                console.error(`Failed to send report for ${company}: ${error.message}`);
            }
        }
    });
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
        const absenceDeclarationTime = row[4];  // E列: 欠勤申告時刻
        
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
    
    return `出退勤状況レポート${companyStr}
報告日時: ${timeStr}
対象日: ${dateStr}

【出勤】 ${presentEmployees.length}名
${presentEmployees.join('\n')}

【欠勤】 ${absentEmployees.length}名
${absentEmployees.join('\n')}

【未報告】 ${unreportedEmployees.length}名
${unreportedEmployees.join('\n')}

※このメールは自動送信されています。`;
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