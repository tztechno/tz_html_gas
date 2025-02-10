// HTMLコンテンツを文字列として定義
function getHtml() {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <base target="_top">
    <title>出勤管理システム/Sistema de Gestão de Ponto</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .form-group {
            margin-bottom: 15px;
        }
        .form-group label {
            display: block;
            margin-bottom: 5px;
        }
        .form-group input,
        .form-group textarea {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        .button-group {
            margin-top: 20px;
        }
        button {
            margin-right: 10px;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
        }
        button:hover {
            opacity: 0.8;
        }
        #clockIn {
            background-color: #4CAF50;
            color: white;
        }
        #clockOut {
            background-color: #2196F3;
            color: white;
        }
        #absence {
            background-color: #f44336;
            color: white;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>出勤管理システム / Sistema de Gestão de Ponto</h2>
        <div class="form-group">
            <label for="name">名前/Nome：</label>
            <input type="text" id="name" name="name" required>
        </div>
        <div class="form-group">
            <label for="comment">コメント/Comentário：</label>
            <textarea id="comment" name="comment" rows="3"></textarea>
        </div>
        <div class="button-group">
            <button id="clockIn" onclick="submitForm('出勤')">出勤/Comparecimento</button>
            <button id="absence" onclick="submitForm('欠勤')">欠勤/Absentismo</button>
        </div>
    </div>

    <script>
    function submitForm(type) {
        const name = document.getElementById('name').value;
        if (!name) {
            alert('名前を入力してください/Digite seu nome');
            return;
        }

        const comment = document.getElementById('comment').value;

        google.script.run
            .withSuccessHandler(function(result) {
                showPopup(result); // カスタムポップアップを表示
                document.getElementById('comment').value = '';
            })
            .withFailureHandler(function(error) {
                alert('エラーが発生しました/Ocorreu um erro: ' + error);
            })
            .processForm({
                name: name,
                comment: comment,
                type: type
            });
    }

    function showPopup(message) {
        const popup = document.createElement('div');
        popup.textContent = message;
        popup.style.position = 'fixed';
        popup.style.top = '20px';
        popup.style.left = '50%';
        popup.style.transform = 'translateX(-50%)';
        popup.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        popup.style.color = 'white';
        popup.style.padding = '10px 20px';
        popup.style.borderRadius = '5px';
        popup.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        popup.style.zIndex = '1000';

        document.body.appendChild(popup);

        // 3秒後にポップアップを自動で消す
        setTimeout(() => {
            popup.remove();
        }, 3000);
    }
    </script>
</body>
</html>`;
}

// ★★★ 修正したdoGet関数 ★★★
function doGet() {
    return HtmlService.createHtmlOutput(getHtml())
        .setTitle('出勤管理システム/Sistema de gestão de ponto e presença')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function processForm(formData) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const name = formData.name;
    const comment = formData.comment;
    const type = formData.type;

    // データを検索して更新する行を見つける
    const data = sheet.getDataRange().getValues();
    let rowToUpdate = -1;

    for (let i = 1; i < data.length; i++) {
        if (data[i][1] === name) { // nameは2列目（インデックス1）
            rowToUpdate = i + 1;
            break;
        }
    }

    if (rowToUpdate === -1) {
        throw new Error('指定された名前が見つかりません/O nome especificado não foi encontrado');
    }

    const now = new Date();
    const timestamp = Utilities.formatDate(now, 'Asia/Tokyo', 'yyyy/MM/dd HH:mm:ss');

    // タイプに応じて更新する列を決定
    switch (type) {
        case '出勤':
            sheet.getRange(rowToUpdate, 3).setValue(timestamp); // 出勤時刻（3列目）
            break;
        case '欠勤':
            sheet.getRange(rowToUpdate, 4).setValue(timestamp); // 欠勤申告時刻（4列目）
            break;
        default:
            throw new Error('不正な操作です/Operação inválida');
    }

    // コメントを更新（5列目）
    if (comment) {
        sheet.getRange(rowToUpdate, 5).setValue(comment);
    }

    return `記録しました/Gravado`;
}

/////////////////
