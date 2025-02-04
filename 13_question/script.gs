function doPost(e) {
    // 固定のスプレッドシートIDを指定
    const SPREADSHEET_ID = '1p1ycVWazMSVYHgQcfbUVjAZTW9rN-f22NDVrhEWYw3o';
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName('アンケート結果');
    
    // パラメータの取得
    const params = e.parameter;
    const answer = params.answer;
    
    // 現在の日時を取得
    const timestamp = new Date();
    
    // ユーザーのGmailアドレスを取得（ログインユーザーのみ）
    let email = 'なし';
    try {
        email = Session.getEffectiveUser().getEmail() || 'なし';
    } catch (error) {
        // ログインしていない場合は'なし'のまま
    }
    
    // シートに結果を追加
    sheet.appendRow([
        timestamp,     // 回答日時
        answer,        // 回答内容
        email          // メールアドレス
    ]);
    
    // CORS対応と成功メッセージ
    return ContentService.createTextOutput('アンケートを送信しました!')
        .setMimeType(ContentService.MimeType.TEXT);
}

function doGet(e) {
    // WebアプリのUI表示（オプション）
    return HtmlService.createHtmlOutputFromFile('Index')
        .setTitle('アンケート')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
