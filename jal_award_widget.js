// JAL 特典航空券 予約開始日ウィジェット
// Author: ファンタMAX
// Updated: 2026-05-06
// 実行環境: Scriptable (iOS)

// ── 設定定数 ──────────────────────────────────────────────

const OFFSET_DAYS  = 360;
const START_TIME   = "0:00";
const LABEL        = "JAL 360日先の搭乗日";
const ACCENT_COLOR = "#e60012";   // JALレッド
const BG_COLOR     = "#1a0005";   // ダーク赤系背景（ホーム画面用）

// JALアプリ（App Store経由。アプリ導入済みならアプリが開く）
const APP_URL = "https://apps.apple.com/jp/app/jal/id351785536";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

// ── 日付ユーティリティ ────────────────────────────────────

function todayJST() {
  const now   = new Date();
  const jstMs = now.getTime() + 9 * 60 * 60 * 1000;
  const jst   = new Date(jstMs);
  return new Date(Date.UTC(jst.getUTCFullYear(), jst.getUTCMonth(), jst.getUTCDate()));
}

function addDays(date, days) {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

/** YY/M/D（曜） */
function fmtFull(d) {
  const yy  = String(d.getUTCFullYear()).slice(-2);
  const m   = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  return `${yy}/${m}/${day}（${WEEKDAYS[d.getUTCDay()]}）`;
}

/** YY/M/D（曜）―ロック画面向け（fmtFullと同形式） */
function fmtMD(d) {
  return fmtFull(d);
}

/** M/D（曜）―最短 */
function fmtShort(d) {
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()}（${WEEKDAYS[d.getUTCDay()]}）`;
}

// ── メイン処理 ────────────────────────────────────────────

const target = addDays(todayJST(), OFFSET_DAYS);
const family = config.widgetFamily;

const widget = new ListWidget();
widget.url   = APP_URL;

// ── サイズ別レイアウト ────────────────────────────────────

if (family === "accessoryInline") {
  widget.addText(`JAL ${fmtShort(target)}  ${START_TIME}予約開始`);

} else if (family === "accessoryCircular") {
  widget.addSpacer();
  const lbl = widget.addText("JAL");
  lbl.font = Font.boldSystemFont(9);
  lbl.centerAlignText();
  const dt = widget.addText(fmtMD(target));
  dt.font = Font.boldSystemFont(11);
  dt.centerAlignText();
  widget.addSpacer();

} else if (family === "accessoryRectangular") {
  // ラベルと日付を同一行に
  const row = widget.addStack();
  row.layoutHorizontally();
  row.centerAlignContent();
  const lblEl = row.addText(LABEL + "  ");
  lblEl.font = Font.systemFont(10);
  const dtEl = row.addText(fmtMD(target));
  dtEl.font = Font.boldSystemFont(13);

  const timeEl = widget.addText(`${START_TIME} 予約開始`);
  timeEl.font = Font.systemFont(10);
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

  const timeEl = widget.addText(`${START_TIME} 予約開始`);
  timeEl.font = Font.systemFont(10);
  timeEl.textColor = new Color("#aaaaaa");

  widget.addSpacer();

  const btn = widget.addStack();
  btn.url = APP_URL;
  btn.backgroundColor = new Color(ACCENT_COLOR);
  btn.cornerRadius = 6;
  btn.setPadding(5, 12, 5, 12);
  btn.centerAlignContent();
  const btnText = btn.addText("✈ JAL予約");
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
