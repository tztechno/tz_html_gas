
// [前のHTMLコンテンツ部分は変更なし]
function getHtml() {
  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <base target="_top">
    <title>出退勤状況レポート（管理者用）</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .form-group {
            margin-bottom: 20px;
        }
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        input[type="date"] {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        button {
            background-color: #4CAF50;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            margin-right: 10px;
        }
        button:hover {
            opacity: 0.8;
        }
        #sendStatus {
            margin-top: 15px;
            padding: 10px;
            border-radius: 4px;
            display: none;
        }
        .preview-area {
            margin-top: 20px;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 4px;
            white-space: pre-wrap;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>出退勤状況レポート 管理画面</h1>
        
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
        // 今日の日付をデフォルト値として設定
        document.getElementById('targetDate').valueAsDate = new Date();
        
        function previewReport() {
            const date = document.getElementById('targetDate').value;
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
                    statusDiv.style.display = 'block';
                    statusDiv.style.backgroundColor = '#f8d7da';
                    statusDiv.innerHTML = 'エラー: ' + error;
                    previewArea.style.display = 'none';
                })
                .generateReportPreview(date);
        }
        
        function sendReport() {
            const date = document.getElementById('targetDate').value;
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
                .sendManualAttendanceReport(date);
        }
    </script>
</body>
</html>`;
}

function doGet() {
  return HtmlService.createHtmlOutput(getHtml())
    .setTitle('出退勤状況レポート（管理者用）')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// データ取得用のスプレッドシートIDを定数として定義
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

// メールアドレス取得関数
function getEmailAddresses() {
  try {
    // 現在のスプレッドシートからアドレスを取得
    const currentSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const addressSheet = currentSpreadsheet.getSheetByName('address');
    
    if (!addressSheet) {
      throw new Error('アドレス帳シート(address)が見つかりません。');
    }
    
    const data = addressSheet.getDataRange().getValues();
    // ヘッダー行をスキップし、A列のメールアドレスを取得
    const emailAddresses = data.slice(1)
      .map(row => row[0])
      .filter(email => validateEmail(email));
    
    if (emailAddresses.length === 0) {
      throw new Error('有効なメールアドレスが見つかりません。addressシートのA列を確認してください。');
    }
    
    return emailAddresses;
  } catch (error) {
    throw new Error(`メールアドレスの取得に失敗しました: ${error.message}`);
  }
}

function generateReportPreview(dateStr) {
  const data = getAttendanceData();
  
  const { 
    presentEmployees, 
    absentEmployees, 
    unreportedEmployees 
  } = categorizeEmployees(data, dateStr);
  
  return createEmailBody(
    presentEmployees, 
    absentEmployees, 
    unreportedEmployees,
    dateStr,
    new Date()
  );
}

function sendManualAttendanceReport(dateStr) {
  try {
    // 出退勤データとメールアドレスを取得
    const data = getAttendanceData();
    const emailAddresses = getEmailAddresses();
    
    const { 
      presentEmployees, 
      absentEmployees, 
      unreportedEmployees 
    } = categorizeEmployees(data, dateStr);
    
    const currentTime = new Date();
    const emailBody = createEmailBody(
      presentEmployees, 
      absentEmployees, 
      unreportedEmployees,
      dateStr,
      currentTime
    );
    
    // メール送信
    MailApp.sendEmail({
      to: emailAddresses.join(','),
      subject: `出退勤状況レポート (${dateStr})`,
      body: emailBody
    });
    
    // 送信ログを記録
    logEmailSend(emailAddresses, dateStr);
    
    return `送信完了！\n送信先: ${emailAddresses.join(', ')}\n送信日時: ${currentTime.toLocaleString('ja-JP')}`;
  } catch (error) {
    throw new Error(`送信失敗: ${error.message}`);
  }
}

function createEmailBody(presentEmployees, absentEmployees, unreportedEmployees, dateStr, currentTime) {
  const timeStr = currentTime.toLocaleString('ja-JP');
  
  return `出退勤状況レポート
報告日時: ${timeStr}
対象日: ${dateStr}

【出勤中】 ${presentEmployees.length}名
${presentEmployees.join('\n')}

【欠勤】 ${absentEmployees.length}名
${absentEmployees.join('\n')}

【未報告】 ${unreportedEmployees.length}名
${unreportedEmployees.join('\n')}

※このメールは自動送信されています。`;
}

// メールアドレスのバリデーション
function validateEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

// 送信ログを記録
function logEmailSend(recipients, dateStr) {
  const logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('送信ログ');
  if (!logSheet) return;
  
  const timestamp = new Date();
  recipients.forEach(recipient => {
    logSheet.appendRow([
      timestamp,
      dateStr,
      recipient
    ]);
  });
}

/////////////////////

function categorizeEmployees(data, dateStr) {
  // Convert date string to Date object for comparison
  const targetDate = new Date(dateStr);
  targetDate.setHours(0, 0, 0, 0);
  
  // Initialize arrays for different categories
  const presentEmployees = [];
  const absentEmployees = [];
  const unreportedEmployees = [];
  
  // Skip header row
  const rows = data.slice(1);
  
  rows.forEach(row => {
    // Assuming the data structure is:
    // [Department, Name, Arrival Time, Departure Time, Absence Declaration Time, Comments]
    const department = row[0];  // 配属
    const employeeName = row[1]; // 名前
    const arrivalTime = row[2]; // 出勤時刻
    const absenceDeclarationTime = row[4]; // 欠勤申告時刻
    
    // Combine department and name
    const fullName = `${department} ${employeeName}`;
    
    // Only process rows where arrival time or absence declaration time is provided
    if (arrivalTime || absenceDeclarationTime) {
      if (arrivalTime) {
        // If arrival time is provided, the employee is present
        presentEmployees.push(fullName);
      } else if (absenceDeclarationTime) {
        // If absence declaration time is provided, the employee is absent
        absentEmployees.push(fullName);
      }
    } else {
      // If neither time is provided, the employee is unreported
      unreportedEmployees.push(fullName);
    }
  });
  
  // Remove duplicates and sort alphabetically
  return {
    presentEmployees: [...new Set(presentEmployees)].sort(),
    absentEmployees: [...new Set(absentEmployees)].sort(),
    unreportedEmployees: [...new Set(unreportedEmployees)].sort()
  };
}



