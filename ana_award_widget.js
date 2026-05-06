// ANA 特典航空券 予約開始日ウィジェット
// Author: ファンタMAX
// Updated: 2026-05-06
// 実行環境: Scriptable (iOS)
//
// 【概要】
//   ANA特典航空券の予約開始日（今日 +355日・曜日付き）を表示する。
//   国内線 9:30 / 国際線 9:00 の開始時刻を両方明示。
//   ウィジェットタップでANAアプリ予約画面（Universal Link）を起動。

// ── 設定定数 ──────────────────────────────────────────────

const OFFSET_DAYS         = 355;
const START_TIME_DOMESTIC = "9:30";   // 国内線
const START_TIME_INTL     = "9:00";   // 国際線
const LABEL               = "ANA予約開始日";
const ACCENT_COLOR        = "#1a6abf";  // ANAブルー
const BG_COLOR            = "#00101f";  // ダーク青系背景（ホーム画面用）

// ANAアプリの予約画面（Universal Link）
// アプリ未インストール時はブラウザでANAサイトが開く
const APP_URL = "https://www.ana.co.jp/anaapp/domestic/reservation/";

// 曜日ラベル（日曜=0）
const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

// ── 日付ユーティリティ ────────────────────────────────────

/** JST（UTC+9）基準で「今日」の0時を返す。端末タイムゾーン非依存。 */
function todayJST() {
  const now   = new Date();
  const jstMs = now.getTime() + 9 * 60 * 60 * 1000;
  const jst   = new Date(jstMs);
  return new Date(Date.UTC(jst.getUTCFullYear(), jst.getUTCMonth(), jst.getUTCDate()));
}

/** DST誤差を避けるため setUTCDate で加算。 */
function addDays(date, days) {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

/** YYYY/MM/DD（曜） */
function fmtFull(d) {
  const y   = d.getUTCFullYear();
  const m   = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}/${m}/${day}（${WEEKDAYS[d.getUTCDay()]}）`;
}

/** MM/DD（曜）―年なし・ロック画面向け */
function fmtMD(d) {
  const m   = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${m}/${day}（${WEEKDAYS[d.getUTCDay()]}）`;
}

/** M/D（曜）―ゼロ埋めなし・1行最短 */
function fmtShort(d) {
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()}（${WEEKDAYS[d.getUTCDay()]}）`;
}

// ── メイン処理 ────────────────────────────────────────────

const target = addDays(todayJST(), OFFSET_DAYS);
const family = config.widgetFamily;

const widget  = new ListWidget();
widget.url    = APP_URL;  // ウィジェット全体タップでANAアプリを開く

// ── サイズ別レイアウト ────────────────────────────────────

if (family === "accessoryInline") {
  // 時計上の1行
  widget.addText(`ANA ${fmtShort(target)}  国内${START_TIME_DOMESTIC}/国際${START_TIME_INTL}`);

} else if (family === "accessoryCircular") {
  // 円形
  widget.addSpacer();
  const lbl = widget.addText("ANA");
  lbl.font = Font.boldSystemFont(9);
  lbl.centerAlignText();
  const dt = widget.addText(fmtMD(target));
  dt.font = Font.boldSystemFont(11);
  dt.centerAlignText();
  widget.addSpacer();

} else if (family === "accessoryRectangular") {
  // ロック画面・四角枠（推奨）
  const lblEl = widget.addText(LABEL);
  lblEl.font = Font.systemFont(10);

  const dtEl = widget.addText(fmtMD(target));
  dtEl.font = Font.boldSystemFont(16);

  const timeEl = widget.addText(`国内 ${START_TIME_DOMESTIC} / 国際 ${START_TIME_INTL} スタート`);
  timeEl.font = Font.systemFont(9);
  timeEl.textOpacity = 0.65;

} else {
  // ホーム画面 small / medium / large
  widget.backgroundColor = new Color(BG_COLOR);
  widget.setPadding(14, 14, 14, 14);

  const titleEl = widget.addText(LABEL);
  titleEl.font = Font.boldSystemFont(12);
  titleEl.textColor = new Color(ACCENT_COLOR);

  widget.addSpacer(8);

  const dtEl = widget.addText(fmtFull(target));
  dtEl.font = Font.boldSystemFont(18);
  dtEl.textColor = Color.white();

  widget.addSpacer(4);

  // 国内・国際の開始時刻を両方表示
  const domesticEl = widget.addText(`国内線  ${START_TIME_DOMESTIC} スタート`);
  domesticEl.font = Font.systemFont(10);
  domesticEl.textColor = new Color("#aaaaaa");

  const intlEl = widget.addText(`国際線  ${START_TIME_INTL} スタート`);
  intlEl.font = Font.systemFont(10);
  intlEl.textColor = new Color("#aaaaaa");

  widget.addSpacer();

  // 予約ボタン
  const btn = widget.addStack();
  btn.url = APP_URL;
  btn.backgroundColor = new Color(ACCENT_COLOR);
  btn.cornerRadius = 6;
  btn.setPadding(5, 12, 5, 12);
  btn.centerAlignContent();
  const btnText = btn.addText("✈ ANA予約");
  btnText.font = Font.boldSystemFont(11);
  btnText.textColor = Color.white();
}

// ── 実行モード分岐 ────────────────────────────────────────

if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  await widget.presentSmall();
}
Script.complete();
