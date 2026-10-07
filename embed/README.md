# GALAXY REBELLION 埋め込みキット

サイトのフロントページなどに「ウェルカムゲーム」として埋め込むためのキットです。

## ファイル構成

```
gametest/
├─ index.html                 ゲーム本体（単体でも遊べる／埋め込みモード対応）
└─ embed/
   ├─ galaxy-rebellion.js     埋め込みローダー（サイト側で読み込む）
   ├─ demo.html               フロントページへの埋め込みサンプル
   └─ README.md               このファイル
```

フォルダごとサーバーにアップロードしてください。ローダーは自分の1つ上の階層にある `index.html` を自動でゲーム本体として使います。

## いちばん簡単な使い方

埋め込みたい場所に、次の2行を貼るだけです。

```html
<div data-galaxy-rebellion></div>
<script src="/gametest/embed/galaxy-rebellion.js" defer></script>
```

- 最初は CSS だけで描いたポスター（ロゴと ▶ PLAY）が表示されます。
- クリックされてから初めてゲーム本体（three.js など）を読み込むので、ページの表示速度には影響しません。
- 横幅いっぱいに広がり、高さは比率（PC は 16:9、スマホは 4:5）で自動的に決まります。

## オプション（data 属性）

| 属性 | 既定値 | 内容 |
|---|---|---|
| `data-src` | `../index.html`（ローダーから見た位置） | ゲーム本体の URL。別の場所に置いた場合に指定 |
| `data-ratio` | `16/9` | 縦横比（PC） |
| `data-ratio-sp` | `4/5` | 縦横比（幅 600px 以下） |
| `data-max-width` | なし | 最大幅（例: `960` または `60rem`） |
| `data-radius` | `12` | 角丸（px） |
| `data-load` | `click` | `click`＝クリックで読み込み／`visible`＝画面に入ったら読み込み／`eager`＝すぐ読み込み |
| `data-intro` | `off` | オープニングクロール（約40秒）を流すか |
| `data-sound` | `on` | `off` で最初からミュート（ゲーム内の M キーで切替可） |
| `data-share` | `on` | `off` でリザルト画面の「𝕏 にポスト」を隠す |
| `data-quality` | `high` | `low` で描画を軽くする（解像度・発光処理を抑える） |
| `data-pause-offscreen` | `on` | 画面外にスクロールしたら自動でポーズ・描画停止 |
| `data-label` | `クリックしてプレイ` | ポスターの案内文 |

例：

```html
<div data-galaxy-rebellion
     data-ratio="21/9" data-max-width="1100"
     data-sound="off" data-quality="low"></div>
```

## イベント（サイト側との連携）

埋め込んだ要素から、次のイベントが発生します（親要素・`document` にも伝わります）。

| イベント名 | `e.detail` | タイミング |
|---|---|---|
| `galaxyrebellion:ready` | なし | ゲームの読み込み完了 |
| `galaxyrebellion:start` | なし | ゲーム開始 |
| `galaxyrebellion:stageclear` | `{ stage, score }` | ステージクリア |
| `galaxyrebellion:result` | `{ score, stage, win, kills }` | ゲームオーバー／全クリア |

```html
<script>
  document.addEventListener('galaxyrebellion:result', (e) => {
    const { score, stage, win } = e.detail;
    // 例：計測ツールに送る、クーポンを表示する など
    if (win) document.querySelector('#coupon').hidden = false;
  });
</script>
```

## JavaScript から操作する

```html
<div id="game"></div>
<script src="/gametest/embed/galaxy-rebellion.js"></script>
<script>
  const game = GalaxyRebellion.mount(document.getElementById('game'), {
    ratio: '16/10',
    load: 'visible',
    sound: false,
    onEvent: (type, detail) => console.log(type, detail),
  });

  game.load();      // ポスターを飛ばして読み込む
  game.pause();     // ポーズ
  game.mute(true);  // ミュート
  game.destroy();   // 取り外す
</script>
```

`data-galaxy-rebellion` 属性の付いた要素は自動で初期化されます。あとから DOM に追加した場合は `GalaxyRebellion.autoInit()` を呼んでください。

## 埋め込み時の動作

- **キー操作**：ゲームをクリックしている間だけ有効です。ページのスクロールなどを邪魔しません。
- **自動ポーズ**：ページの別の場所をクリックしたり、画面外へスクロールしたりすると自動でポーズします。
- **スマホ**：タイトル画面では縦スクロールでページを流せます。プレイ中だけゲームがタッチ操作を受け取ります。
- **フルスクリーン**：右下の ⛶ ボタンで全画面表示にできます。
- **ランキング**：ゲームを置いたドメインのブラウザ内（localStorage）に保存されます。単体で遊んだときと同じランキングです。
- **𝕏 にポスト**：スコア画像をクリップボードにコピーしてから投稿画面を開きます。コピーできるのは HTTPS のサイト（または localhost）だけです。

## 注意

- 動作確認するときは `file://` ではなく、Web サーバー経由（MAMP なら `http://localhost:8888/gametest/embed/demo.html`）で開いてください。
- three.js は CDN（cdn.jsdelivr.net）から、フォントは Google Fonts から読み込みます。CSP を設定しているサイトでは、これらのドメインを許可してください。
- 別ドメインに置いたゲームを埋め込む場合、ゲーム側のサーバーで `X-Frame-Options` や `frame-ancestors` が iframe 表示を禁止していないか確認してください。
