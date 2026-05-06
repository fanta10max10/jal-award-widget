# JAL特典航空券 予約開始日ウィジェット 仕様書

**Version:** 1.1
**Date:** 2026-05-06
**Target:** Claude Code
**Author:** ファンタMAX

---

## 1. プロジェクト概要

iPhoneのロック画面とホーム画面に、**「今日の日付」**と**「今日から360日後の日付」**を表示するウィジェットを Scriptable (iOS App) 上で動作する JavaScript として実装する。

### 1.1 目的・背景

- JAL国際線・国内線の特典航空券は、**搭乗日の360日前 午前0時（日本時間）から予約可能**（2024年3月26日にJALが330日前から360日前に変更済み）。
- 繁忙期（年末年始・GW・お盆など）の特典航空券は、予約開始日時の0時ジャストに即完売することが多く、予約開始日の正確な把握が必須。
- 毎日ロック画面に「今日予約できる最も先の搭乗日（=今日+360日）」が自動表示されることで、予約計画の立案・タップ忘れ防止に役立てる。

### 1.2 ゴール

- ロック画面を見るだけで「今日予約できる最遠の搭乗日」が一目でわかる。
- 360日後の日付は、毎日0時に自動で繰り上がる（ローリング表示）。
- 追加コストはScriptable（無料）のみ。

---

## 2. 技術スタック

| 項目 | 内容 |
|---|---|
| 実行環境 | Scriptable (iOS, App Store 無料) |
| 言語 | JavaScript (ES2020+, Scriptable API) |
| 対象OS | iOS 16以降（ロック画面ウィジェット対応） |
| 対象端末 | iPhone（ファンタMAX所有機） |
| 配布形態 | 単一の `.js` ファイル（Scriptableアプリ内でコピペ） |

### 2.1 Scriptable API の参照ドキュメント

- 公式: https://docs.scriptable.app/
- 主要API: `ListWidget`, `Color`, `Font`, `config.widgetFamily`, `Script.setWidget`, `Script.complete`

---

## 3. 機能要件

### 3.1 表示する情報

| 項目 | 内容 | 例 |
|---|---|---|
| 今日の日付 | システム日付 | 2026/05/06 |
| 360日後の日付 | 今日 + 360日 | 2027/05/01 |
| 残日数表示 | 補助情報（任意） | 「JAL予約開始日」というラベル |

### 3.6 予約ページへのクイックアクセス

- ウィジェット全体タップで JAL 特典航空券予約ページを開く（`widget.url` を全サイズ共通で設定）。
- ホーム画面ウィジェットには「✈ 今すぐ予約」と表示される金色のボタンを配置する（視覚的な誘導）。
- URLは `BOOKING_URL` 定数に集約し、セッショントークン期限切れ時に一箇所だけ更新できる設計にする。
- **注意**: URLに含まれるセッショントークン（`MESSAGE_AUTH` 等）は期限切れになることがある。その場合は JAL 公式サイトでログイン後のURLを差し替えること。

### 3.2 ウィジェットサイズ対応

以下の3サイズ全てに対応すること。`config.widgetFamily` で分岐。

| サイズ | 用途 | 表示内容 |
|---|---|---|
| `accessoryInline` | ロック画面・時計の上の細い1行 | `JAL: M/D` 形式（短縮表示） |
| `accessoryRectangular` | ロック画面・時計の下の四角枠 | ラベル + 360日後の日付（YYYY/MM/DD） + 今日の日付（小さく） |
| `accessoryCircular` | ロック画面・円形 | 月/日のみ（360日後） |
| ホーム画面（small/medium/large 共通） | ホーム画面 | 今日の日付 + 360日後の日付 + ラベル |

### 3.3 自動更新

- iOSのウィジェットは自動で1日数回更新される。
- 日付が変わったら自動的に「+360日後の日付」も更新されること。
- `Date()` をスクリプト実行時に取得することで実現する（時刻ハードコード禁止）。

### 3.4 タイムゾーン

- **JST（日本標準時）固定**で計算する（JALの予約開始は日本時間基準のため）。
- 端末のタイムゾーンが海外に設定されていても、計算は必ずJSTで行う。

### 3.5 日付計算の仕様

- 「今日の日付」: 現在のJST日付の `YYYY-MM-DD` 部分（時刻は無視）。
- 「360日後の日付」: 今日のJST日付 + 360日（うるう年・月跨ぎは標準的なDate演算で処理）。
- 計算式: `future = new Date(today.getTime() + 360 * 24 * 60 * 60 * 1000)`
  - ただし、**サマータイム等の問題を避けるため `setDate(getDate() + 360)` を採用する**こと。

---

## 4. 非機能要件

| 項目 | 要件 |
|---|---|
| パフォーマンス | スクリプト実行時間100ms以内 |
| ネットワーク | 不要（オフライン動作） |
| 外部API | 使用しない |
| バッテリー | 静的計算のみのため影響軽微 |
| 国際化 | 日本語のみ（JST固定） |

---

## 5. UI仕様

### 5.1 デザイン方針

- 視認性最優先。フォントは太字で大きめ。
- ダーク背景でも見えるように、テキストは白系統。
- ロック画面ウィジェットはOS側で自動的に半透明白テキストになるため、色指定は最小限。

### 5.2 accessoryRectangular（メイン）の構成

```
┌─────────────────────┐
│ JAL予約開始日       │ ← 10pt, system
│ 2027/05/01          │ ← 14pt, bold
│ 今日 5/6            │ ← 9pt, opacity 0.7
└─────────────────────┘
```

### 5.3 accessoryInline の構成

```
JAL: 5/1
```

（時計の上の1行に表示。月日のみ。「JAL: 」プレフィックスで何の日付かを明示）

### 5.4 ホーム画面サイズの構成

```
┌───────────────────────────┐
│ JAL予約開始日             │
│                           │
│ 今日                      │
│ 2026/05/06                │
│                           │
│ +360日後（予約可能最遠日）│
│ 2027/05/01                │
│                           │
│ [✈ 今すぐ予約]           │  ← 金色ボタン（タップで予約ページへ）
└───────────────────────────┘
```

---

## 6. ファイル構成

```
JAL予約開始日ウィジェット/
├── SPEC.md              ← この仕様書
├── jal_award_widget.js  ← 実装ファイル（Scriptable用）
└── README.md            ← セットアップ手順（ユーザー向け）
```

---

## 7. 実装内容（参考コード）

以下を**ベース**としつつ、Claude Codeはコードを精査・改善して実装すること。

```javascript
// JAL特典航空券 予約開始日ウィジェット
// Author: ファンタMAX
// Updated: 2026-05-06

const OFFSET_DAYS = 360;
const LABEL = "JAL予約開始日";

// JST基準で「今日」を取得
function todayJST() {
  const now = new Date();
  // UTC時刻にJSTオフセット（+9h）を加算
  const jstMs = now.getTime() + 9 * 60 * 60 * 1000;
  const jst = new Date(jstMs);
  // 時刻を0時にリセット（日付のみ）
  return new Date(Date.UTC(
    jst.getUTCFullYear(),
    jst.getUTCMonth(),
    jst.getUTCDate()
  ));
}

function addDays(date, days) {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function fmtFull(d) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}/${m}/${day}`;
}

function fmtShort(d) {
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
}

const today = todayJST();
const future = addDays(today, OFFSET_DAYS);
const family = config.widgetFamily;

const widget = new ListWidget();

if (family === "accessoryInline") {
  widget.addText(`JAL: ${fmtShort(future)}`);
} else if (family === "accessoryCircular") {
  const t = widget.addText(fmtShort(future));
  t.font = Font.boldSystemFont(14);
  t.centerAlignText();
} else if (family === "accessoryRectangular") {
  const l = widget.addText(LABEL);
  l.font = Font.systemFont(10);
  const f = widget.addText(fmtFull(future));
  f.font = Font.boldSystemFont(14);
  const t = widget.addText(`今日 ${fmtShort(today)}`);
  t.font = Font.systemFont(9);
  t.textOpacity = 0.7;
} else {
  // ホーム画面 small/medium/large
  widget.backgroundColor = new Color("#1a1a2e");
  const title = widget.addText(LABEL);
  title.font = Font.boldSystemFont(12);
  title.textColor = Color.white();
  widget.addSpacer(8);
  
  const todayLabel = widget.addText("今日");
  todayLabel.font = Font.systemFont(10);
  todayLabel.textColor = new Color("#aaaaaa");
  const todayText = widget.addText(fmtFull(today));
  todayText.font = Font.systemFont(13);
  todayText.textColor = Color.white();
  
  widget.addSpacer(6);
  
  const futureLabel = widget.addText(`+${OFFSET_DAYS}日後`);
  futureLabel.font = Font.systemFont(10);
  futureLabel.textColor = new Color("#aaaaaa");
  const futureText = widget.addText(fmtFull(future));
  futureText.font = Font.boldSystemFont(18);
  futureText.textColor = new Color("#ff6b6b");
}

if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  // テスト実行時はプレビュー
  widget.presentMedium();
}
Script.complete();
```

---

## 8. テスト項目（Claude Codeが確認すべきこと）

### 8.1 単体テスト相当

- [ ] `todayJST()` が JST の本日0時を返すこと（端末タイムゾーンに依存しない）
- [ ] `addDays(today, 360)` が正しく360日後を返すこと
- [ ] うるう年を跨ぐ計算が正しいこと（例: 2027/2/29 を含む期間）
- [ ] 月末・年末跨ぎの計算が正しいこと

### 8.2 表示テスト

- [ ] `accessoryInline` で「JAL: M/D」が表示されること
- [ ] `accessoryRectangular` でラベル・360日後・今日が3行表示されること
- [ ] `accessoryCircular` で月日が中央表示されること
- [ ] ホーム画面 small/medium/large で適切に表示されること
- [ ] Scriptable アプリ内のプレビュー（presentMedium）で見え方を確認できること

### 8.3 動作確認

- [ ] iPhone実機で日付が変わった翌日、360日後の日付も1日進んでいること
- [ ] 端末を機内モードでも動作すること（ネットワーク不要）

---

## 9. 受け入れ基準（Definition of Done）

1. `jal_award_widget.js` ファイルが完成し、Scriptableアプリにコピペすればそのまま動作する。
2. 上記7のコードを叩き台に、コードレビュー観点で改善（変数名・コメント・エラーハンドリング）が施されている。
3. `README.md` にユーザー（ファンタMAX）向けの**セットアップ手順**が記載されている（次節10の内容）。
4. 上記8のテスト項目が全てパスしている（または手動確認済み）。
5. JSTの計算が端末タイムゾーンに依存しない実装になっている。

---

## 10. セットアップ手順（README.mdに記載すべき内容）

### 10.1 事前準備

1. App Storeから「Scriptable」（無料）をインストール
2. ロック画面ウィジェットを使うため、iOS 16以降であることを確認

### 10.2 インストール手順

1. Scriptableアプリを開く
2. 右上の「+」をタップして新規スクリプト作成
3. `jal_award_widget.js` の内容を全てコピペ
4. 左上のスクリプト名を「**JAL予約開始日**」に変更して保存
5. 再生ボタン（▶）でプレビュー表示が出ることを確認

### 10.3 ロック画面への配置

1. ロック画面を長押し → 「カスタマイズ」 → 「ロック画面」
2. 時計下のウィジェット枠をタップ
3. 「Scriptable」を選択
4. **accessoryRectangular** サイズを選んで配置
5. 配置後、ウィジェットをタップして `Script: JAL予約開始日` を選択
6. 「完了」 → 「設定」で確定

### 10.4 ホーム画面への配置（任意）

1. ホーム画面を長押し → 左上の「+」
2. 「Scriptable」を選択 → サイズを選んで「ウィジェットを追加」
3. ウィジェットを長押し → 「ウィジェットを編集」
4. Script に `JAL予約開始日` を選択

### 10.5 トラブルシューティング

| 症状 | 対処 |
|---|---|
| ウィジェットが「Run Script」のままになる | ウィジェット長押し→編集→Scriptで該当スクリプトを選択 |
| 日付が更新されない | iOSが内部的に更新タイミングを制御。手動で更新したい場合はScriptableを開いて再生 |
| ロック画面に表示されない | iOSバージョンが16未満の可能性。設定→一般→ソフトウェアアップデート確認 |

---

## 11. 既知の制約・注意事項

1. **iOSウィジェットは厳密にリアルタイム更新されない**。OSが管理するタイミング（数十分〜数時間に1回）で更新されるため、深夜0時ジャストの切り替わりは数分〜数十分のラグが発生する可能性がある。実際の予約タイミングはJALサイトの時計を基準とすること。
2. **360日**は2026年5月時点のJALルール。将来変更される可能性があるため、`OFFSET_DAYS` 定数を冒頭に置いて簡単に変更できる設計にしてある。
3. JGCプレミア・JMBダイヤモンド会員は国内線で **361日前 22:00** から先行予約が可能。将来該当ステータスになった場合は別途仕様変更が必要。

---

## 12. 参考リンク

- JAL公式 国際線特典航空券: https://www.jal.co.jp/jp/ja/jalmile/use/jal/inter/application.html
- JAL公式 予約開始日検索: https://www.jal.co.jp/jp/ja/inter/reservation/calculation/
- JAL プレスリリース（360日前変更）: https://press.jal.co.jp/ja/release/202312/007828.html
- Scriptable 公式ドキュメント: https://docs.scriptable.app/
- Scriptable widgetFamily: https://docs.scriptable.app/widgetfamily/

---

## 13. 改訂履歴

| Version | Date | 内容 |
|---|---|---|
| 1.0 | 2026-05-06 | 初版作成 |
| 1.1 | 2026-05-06 | 予約ページクイックアクセス機能追加（3.6節・5.4節）、jal_award_widget.js / README.md 実装完了 |

---

**END OF SPEC**
