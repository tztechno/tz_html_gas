

```

2025-02-03

ボタンに直接urlを記載しないテクニック
index2.html（仮採用）

    <script>
        const originalUrl = "https://script.google.com/macros/s/xxxxx/exec";
        function redirectToGAS() {
            window.location.href = originalUrl;
        }
    </script>

<body>
    <div class="container">
        <button onclick="redirectToGAS()">登録する</button>
    </div>
</body>


外部ファイルに記載する手もある
index5.html＋config.jsのように


```

```

2025-02-02

174EjfHmFczZulhspkQ81pIAZiBjUXqbX_4hD1ks52lM

https://script.google.com/macros/s/AKfycbyYuJ-v9DEgCa86YyQEg6yPKFKVdD_DR0ZKqiM-qckiCQEMgdTaZzKbkNAkgQGCnDv4hQ/exec

CompleteページはGASのスクリプトエディタ内に作成する必要があります。

```
