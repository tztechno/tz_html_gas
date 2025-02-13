function doGet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName('progress');
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  
  // B列（インデックス1）をプルダウンに
  const pulldownColumns = [1];
  
  // プルダウンの選択肢と対応する数値
  const progressOptions = [
    { text: '作業前', value: '0' },
    { text: '作業中', value: '1' },
    { text: '作業済', value: '2' }
  ];

  let html = `
    <!DOCTYPE html>
    <html>
      <head>
        <base target="_top">
        <style>
          table {
            border-collapse: collapse;
            width: 100%;
            margin: 20px 0;
          }
          td, th {
            border: 1px solid #ccc;
            padding: 8px;
            text-align: left;
          }
          select {
            width: 100%;
            padding: 4px;
            border: none;
            background: transparent;
          }
          .timestamp {
            color: #666;
            font-family: monospace;
          }
        </style>
        <script>
          function updateProgress(row, col, value) {
            // プルダウン変更時に進捗値とタイムスタンプを更新
            google.script.run
              .withSuccessHandler(function(result) {
                if (result.success) {
                  // タイムスタンプ列を更新
                  const timestampCell = document.querySelector(\`#timestamp-\${row}\`);
                  if (timestampCell) {
                    timestampCell.textContent = result.timestamp;
                  }
                }
              })
              .withFailureHandler(function(error) {
                console.error('Failed to update:', error);
              })
              .updateProgressAndTimestamp(row, col, value);
          }
        </script>
      </head>
      <body>
        <table>
  `;

  // ヘッダー行
  html += '<tr>';
  for (let j = 0; j < values[0].length; j++) {
    html += `<th>${values[0][j]}</th>`;
  }
  html += '</tr>';

  // データ行
  for (let i = 1; i < values.length; i++) {
    html += '<tr>';
    for (let j = 0; j < values[i].length; j++) {
      if (pulldownColumns.includes(j)) {
        // プルダウンメニューを作成
        html += '<td>';
        html += `<select onchange="updateProgress(${i}, ${j}, this.value)">`;
        progressOptions.forEach(option => {
          const selected = option.value === values[i][j].toString() ? 'selected' : '';
          html += `<option value="${option.value}" ${selected}>${option.text}</option>`;
        });
        html += '</select>';
        html += '</td>';
      } else if (j === 2) { // C列（タイムスタンプ）
        html += `<td class="timestamp" id="timestamp-${i}">${values[i][j] || ''}</td>`;
      } else {
        // 通常のセル
        html += `<td>${values[i][j]}</td>`;
      }
    }
    html += '</tr>';
  }

  html += `
        </table>
      </body>
    </html>
  `;

  return HtmlService.createHtmlOutput(html)
    .setTitle('作業進捗管理')
    .setFaviconUrl('https://www.google.com/images/icons/product/sheets-32.png');
}

// 進捗とタイムスタンプを更新する関数
function updateProgressAndTimestamp(row, col, value) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('progress');
  
  // 進捗値を更新（B列）
  sheet.getRange(row + 1, col + 1).setValue(value);
  
  // 現在のタイムスタンプを取得（日本時間）
  const timestamp = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd HH:mm:ss');
  
  // タイムスタンプを更新（C列）
  sheet.getRange(row + 1, 3).setValue(timestamp);
  
  return {
    success: true,
    timestamp: timestamp
  };
}
