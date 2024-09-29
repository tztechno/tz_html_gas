
まず、問題を単純化し、一歩ずつ進めていきましょう。

```javascript
// Code.gs ファイル内

function doGet() {
  return ContentService.createTextOutput('Hello, World!');
}

function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1');
  
  sheet.appendRow([new Date(), data.name, data.content]);
  
  return ContentService.createTextOutput(JSON.stringify({status: 'success'}))
    .setMimeType(ContentService.MimeType.JSON);
}

```

このシンプルな GAS スクリプトを使って、以下の手順で進めましょう：

1. 新しい Google スプレッドシートを作成します。

2. ツール > スクリプトエディタ を選択して、スクリプトエディタを開きます。

3. 上記のコードをスクリプトエディタにコピー＆ペーストします。

4. ファイル > 保存 を選択し、プロジェクトに名前を付けて保存します。

5. デプロイ > 新しいデプロイ を選択します。
   - 種類：ウェブアプリ
   - 次のユーザーとして実行：自分（あなたのメールアドレス）
   - アクセスできるユーザー：全員
   
   「デプロイ」をクリックし、承認プロセスを完了します。

6. デプロイが完了したら、ウェブアプリの URL をコピーします。

7. ブラウザで新しいタブを開き、コピーした URL に "?test=true" を追加してアクセスします。"Hello, World!" が表示されれば、GAS スクリプトは正常に動作しています。

この時点で、GAS 側の設定は完了です。次に、ローカルの HTML ファイルを使ってデータを送信してみましょう。

```html
<!DOCTYPE html>
<html>
<body>
<h2>Simple Form</h2>
<form id="myForm">
  <input type="text" id="name" placeholder="Name"><br><br>
  <textarea id="content" placeholder="Content"></textarea><br><br>
  <button type="submit">Submit</button>
</form>

<script>
document.getElementById('myForm').addEventListener('submit', function(e) {
  e.preventDefault();
  var data = {
    name: document.getElementById('name').value,
    content: document.getElementById('content').value
  };

  fetch('あなたのGASウェブアプリのURL', {
    method: 'POST',
    body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(result => {
    alert('Success: ' + JSON.stringify(result));
  })
  .catch(error => {
    alert('Error: ' + error);
  });
});
</script>
</body>
</html>

```

8. 上記の HTML コードを新しいファイルにコピーし、`fetch` の URL を自分の GAS ウェブアプリの URL に置き換えます。

9. このファイルを `test.html` として保存し、ウェブブラウザで開きます。

10. フォームに名前とコンテンツを入力し、送信ボタンをクリックします。

11. Google スプレッドシートを確認し、データが追加されているかを確認します。

この単純化されたアプローチで問題が解決すれば、そこから徐々に機能を追加していくことができます。

