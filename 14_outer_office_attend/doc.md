
```

スプレッドシートを用いる出勤退勤管理システム
スプレッドシートのスクリプトとしてGASと入力用HTMLをつける

入力は、name box, コメントbox,出勤ボタン、退勤ボタン、欠勤ボタンがある
ボタンはGASのwebappurlと連動している
いずれからのボタンを押すことで、内容がシートに登録される
データの送信方式：FormDataで送って、データ形式に応じて処理を分岐させ、FormDataを受け取る

スプレッドシートの列名は、配属、name、出勤時刻、退勤時刻、欠勤申告時刻、コメント、であり１行目に記入されている
配属、nameについては、あらかじめ記入されている

ボタンが押されると登録内容のnameが一致した行に、登録内容が記入される


://script.google.com/macros/s/
AKfycbzEReenr7g4gtSWN69u1Dx0yk2T-1qWca-yzbT9ZPsBdVN75rCg7BPOLE7BTi-VcyHu
/exec


```
