# JAL・ANA 特典航空券 予約開始日ウィジェット 仕様書

**Version:** 1.3
**Date:** 2026-05-06
**Target:** Claude Code
**Author:** ファンタMAX

---

## 1. プロジェクト概要

iPhoneのロック画面とホーム画面に、**JAL と ANA 両社の特典航空券予約開始日**（各社 +N 日後の日付・曜日付き）を表示するウィジェットを Scriptable (iOS App) 上で動作する JavaScript として実装する。

### 1.1 目的・背景

- JAL国際線・国内線の特典航空券は、**搭乗日の360日前 午前0時（JST）から予約可能**（2024年3月26日に330日前から変更）。
- ANA国内線の特典航空券は、**搭乗日の355日前 9:30（JST）から予約可能**（2025年2月3日に一斉販売方式から変更）。ANA国際線は9:00スタート。
- 繁忙期（年末年始・GW・お盆など）の特典航空券は予約開始と同時に即完売することが多く、**正確な予約開始日・曜日・時刻の把握が必須**。
- 毎日ロック画面に両社の予約可能最遠日が自動表示されることで、予約計画の立案・乗り遅れ防止に役立てる。

### 1.2 ゴール

- ロック画面を見るだけで「今日予約できる最遠の搭乗日（JAL・ANA）」と曜日が一目でわかる。
- 日付は毎日0時に自動で繰り上がる（ローリング表示）。
- ウィジェットタップで各社アプリ/予約ページへ直接ジャンプ。
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
- 主要API: `ListWidget`, `WidgetStack`, `Color`, `Font`, `config.widgetFamily`, `Script.setWidget`, `Script.complete`

---

## 3. 機能要件

### 3.1 表示する情報

| 項目 | 内容 | 例 |
|---|---|---|
| JAL予約開始日 | 今日 + 360日（曜日付き） | 2027/05/01（金） |
| ANA予約開始日 | 今日 + 355日（曜日付き） | 2027/04/26（月） |
| 各社開始時刻 | JAL=0:00、ANA=9:30（国内）/ 9:00（国際） | 補助テキストで表示 |

**今日の日付はカレンダーウィジェットで確認できるため非表示。**

### 3.2 ウィジェットサイズ対応

`config.widgetFamily` で分岐し、4サイズに対応する。

| サイズ | 用途 | 表示内容 |
|---|---|---|
| `accessoryInline` | ロック画面・時計上1行 | `JAL M/D \| ANA M/D`（曜日なし最短形式） |
| `accessoryRectangular` | ロック画面・四角枠（推奨） | JAL・ANA 日付（MM/DD・曜日）+ 開始時刻注釈 |
| `accessoryCircular` | ロック画面・円形 | JAL日付のみ（スペース制限） |
| ホーム画面（small/medium/large） | ホーム画面 | JAL・ANA 両社 + 予約ボタン横並び |

### 3.3 自動更新

- iOSのウィジェットは自動で1日数回更新される。
- `Date()` をスクリプト実行時に取得することで実現する（時刻ハードコード禁止）。

### 3.4 タイムゾーン

- **JST（日本標準時・UTC+9）固定**で計算する。
- 端末のタイムゾーンが海外に設定されていても、計算は必ずJSTで行う。

### 3.5 日付計算の仕様

- JST今日 + N日は `setUTCDate(getUTCDate() + N)` で計算（DST誤差回避）。
- 曜日は `WEEKDAYS[d.getUTCDay()]` で取得（日・月・火・水・木・金・土）。

### 3.6 予約ページへのクイックアクセス

- ウィジェット全体に `widget.url = JAL_URL` を設定（フォールバック）。
- ホーム画面ウィジェット内に JAL・ANA ボタンを横並びで配置。
  - JALボタン: `jalBtn.url = JAL_URL`（WidgetStack.url）
  - ANAボタン: `anaBtn.url = ANA_URL`（WidgetStack.url）
- URL仕様:

| 社 | URL | 備考 |
|---|---|---|
| JAL | `https://www.jal.co.jp/appli/121/link/ios/index.html` | Universal Link（インストール済みならJALアプリ起動） |
| ANA | `https://www.ana.co.jp/anaapp/domestic/reservation/` | Universal Linkでアプリ予約画面へ |

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

- 視認性最優先。日付は太字・大きめ。
- ダーク背景（`#0d1117`）にJALゴールド（`#c8a951`）とANAブルー（`#1a6abf`）でカラーコーディング。
- ロック画面ウィジェットはOS側でテキスト色を制御するため色指定は最小限。

### 5.2 accessoryRectangular（メイン推奨）の構成

```
┌─────────────────────────────────┐
│ JAL  05/01（金）  0:00          │ ← 11pt bold
│      深夜0時ジャストに開始      │ ← 9pt, opacity 0.6
│                                 │
│ ANA  04/26（月）  9:30          │ ← 11pt bold
│      9:30開始（国際線は9:00）   │ ← 9pt, opacity 0.6
└─────────────────────────────────┘
```

### 5.3 accessoryInline の構成

```
JAL 5/1 | ANA 4/26
```

（曜日なし最短形式で1行に両社収める）

### 5.4 ホーム画面サイズの構成

```
┌───────────────────────────────┐
│ 特典航空券 予約開始日         │  ← 11pt, グレー
│                               │
│ ✈ JAL  360日前  0:00スタート  │  ← 9pt, JALゴールド
│ 2027/05/01（金）              │  ← 17pt bold, 白
│                               │
│ ✈ ANA  355日前  9:30スタート  │  ← 9pt, ANAブルー
│ 2027/04/26（月）              │  ← 17pt bold, 白
│                               │
│ [✈ JAL予約]  [✈ ANA予約]     │  ← 横並びボタン
└───────────────────────────────┘
```

---

## 6. ファイル構成

```
JAL予約開始日ウィジェット/
├── SPEC.md                  ← この仕様書
├── jal_award_widget.js      ← JAL専用ウィジェット（赤テーマ）
├── ana_award_widget.js      ← ANA専用ウィジェット（青テーマ）
├── combined_award_widget.js ← JAL・ANA合体ウィジェット（ロック画面1枠節約用）
└── README.md                ← セットアップ手順（ユーザー向け）
```

JAL・ANA を別スクリプトとして分割することで、小サイズのウィジェットを2つ並べてロック画面・ホーム画面をコンパクトに使えるようにしている。合体版はロック画面の枠を1つ節約したい場合に使用。

---

## 7. 主要定数一覧

```javascript
const JAL_OFFSET_DAYS = 360;          // JAL予約開始日数
const JAL_START_TIME  = "0:00";       // JAL開始時刻
const JAL_COLOR       = "#c8a951";    // JALゴールド
const JAL_URL = "https://apps.apple.com/jp/app/jal/id351785536";

const ANA_OFFSET_DAYS = 355;          // ANA予約開始日数（国内・国際共通）
const ANA_START_TIME  = "9:30";       // ANA国内線開始時刻（国際は9:00）
const ANA_COLOR       = "#1a6abf";    // ANAブルー
const ANA_URL = "https://www.ana.co.jp/anaapp/domestic/reservation/";

const WEEKDAYS = ["日","月","火","水","木","金","土"];
```

ルール変更時は上記定数のみ修正すればよい設計にする。

---

## 8. テスト項目

### 8.1 日付計算

- [ ] `todayJST()` が端末タイムゾーン非依存でJST本日0時を返すこと
- [ ] `addDays(today, 360)` が正しく360日後を返すこと
- [ ] `addDays(today, 355)` が正しく355日後を返すこと
- [ ] うるう年・月末・年末跨ぎの計算が正しいこと
- [ ] 曜日が正しく計算されること

### 8.2 表示テスト

- [ ] `accessoryInline` で `JAL M/D | ANA M/D` が1行表示されること
- [ ] `accessoryRectangular` でJAL・ANA各2行（日付+注釈）が表示されること
- [ ] `accessoryCircular` でJAL日付が中央表示されること
- [ ] ホーム画面でJAL・ANA両社 + 横並びボタンが表示されること
- [ ] `presentMedium` プレビューで全要素が確認できること

### 8.3 動作確認

- [ ] 翌日に日付が自動で1日進むこと
- [ ] 機内モード（オフライン）で動作すること
- [ ] JALボタンでJALアプリ（またはApp Store）が開くこと
- [ ] ANAボタンでANAアプリ予約画面（またはブラウザ）が開くこと

---

## 9. 受け入れ基準（Definition of Done）

1. `jal_award_widget.js` がScriptableにコピペするだけで動作すること。
2. JAL（360日後）・ANA（355日後）両社の日付が曜日付きで表示されること。
3. 各社の予約開始時刻（JAL=0:00、ANA=9:30）が補助テキストで表示されること。
4. 今日の日付は非表示であること。
5. ホーム画面でJAL・ANAボタンが横並びで表示され、タップで各社アプリが開くこと。
6. JST計算が端末タイムゾーンに依存しないこと。

---

## 10. セットアップ手順概要

詳細は `README.md` を参照。

1. App Storeから「Scriptable」（無料）をインストール
2. Scriptableで新規スクリプトを作成し `jal_award_widget.js` の内容をコピペ
3. スクリプト名を「JAL・ANA予約開始日」に変更
4. ロック画面に `accessoryRectangular` サイズで配置
5. ホーム画面にも任意でsmall/medium/largeで配置

---

## 11. 既知の制約・注意事項

1. **iOSウィジェットは厳密にリアルタイム更新されない**。深夜0時の切り替わりに数分〜数十分のラグが発生する可能性がある。実際の予約はJAL・ANA各社アプリ/サイトの時計を基準とすること。
2. **ANA予約開始日数（355日）** は2026年5月時点のルール（2025年2月3日改定）。変更時は `ANA_OFFSET_DAYS` を更新すること。
3. **JAL予約開始日数（360日）** は2024年3月26日改定後のルール。変更時は `JAL_OFFSET_DAYS` を更新すること。
4. ANA Universal Link（`/anaapp/domestic/reservation/`）は特典航空券専用ではなく予約全般画面。特典航空券専用ディープリンクは両社とも非公開。
5. `WidgetStack.url` は Scriptable の比較的新しい機能。旧バージョンでは動作しない場合がある（フォールバックでJAL URLが開く）。
6. JGCプレミア・JMBダイヤモンド会員は国内線で **361日前 22:00** から先行予約可能。該当ステータス取得後は別途定数追加が必要。

---

## 12. 参考リンク

- JAL公式 国際線特典航空券: https://www.jal.co.jp/jp/ja/jalmile/use/jal/inter/application.html
- JAL プレスリリース（360日前変更）: https://press.jal.co.jp/ja/release/202312/007828.html
- ANA公式 国内線特典航空券予約期間変更: https://www.ana.co.jp/ja/jp/guide/amc/award/domestic/terms/info/2410/
- Scriptable 公式ドキュメント: https://docs.scriptable.app/
- Scriptable widgetFamily: https://docs.scriptable.app/widgetfamily/

---

## 13. 改訂履歴

| Version | Date | 内容 |
|---|---|---|
| 1.0 | 2026-05-06 | 初版作成（JALのみ） |
| 1.1 | 2026-05-06 | 予約ページクイックアクセス機能追加（3.6節・5.4節）、実装完了 |
| 1.2 | 2026-05-06 | ANA追加（355日前・9:30）、曜日表示追加、今日の日付を削除、アプリボタン2社横並び対応 |
| 1.3 | 2026-05-06 | JAL・ANA を別ファイルに分割（jal_award_widget.js / ana_award_widget.js）、JALカラーをゴールド→レッド（#e60012）に変更、ANA国際線開始時刻（9:00）を明示 |
| 1.4 | 2026-05-06 | combined_award_widget.js 追加（合体版）、ホーム画面をカードデザインに刷新 |
| 1.5 | 2026-05-06 | JAL URLをUniversal Linkに変更（https://www.jal.co.jp/appli/121/link/ios/index.html） |
| 1.6 | 2026-05-06 | 合体版: 日付フォーマットをYYYY/MM/DD（曜）に変更、ANAサブタイトルに国際線時刻追加、ANA非繁忙期ロック画面から「予約開始」削除 |

---

**END OF SPEC**
