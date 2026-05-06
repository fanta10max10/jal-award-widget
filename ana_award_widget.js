// ANA 特典航空券 予約開始日ウィジェット
// Author: ファンタMAX
// Updated: 2026-05-06
// 実行環境: Scriptable (iOS)

// ── 設定定数 ──────────────────────────────────────────────

const OFFSET_DAYS         = 355;
const START_TIME_DOMESTIC = "9:30";   // 国内線
const START_TIME_INTL     = "9:00";   // 国際線
const LABEL               = "ANA 355日先の搭乗日";
const ACCENT_COLOR        = "#1a6abf";  // ANAブルー
const BG_COLOR            = "#00101f";  // ダーク青系背景（ホーム画面用）

// ANAアプリ予約画面（Universal Link。未インストール時はブラウザ）
const APP_URL = "https://www.ana.co.jp/anaapp/domestic/reservation/";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

// 繁忙期定義（月/日ベース・毎年共通）
const PEAK_COLOR = "#ff8c00";  // 繁忙期オレンジ

/**
 * 日付が繁忙期に該当する場合にその名称を返す。該当なしは null。
 * - 年末年始: 12/28 〜 1/4
 * - GW:       4/29 〜 5/6
 * - お盆:     8/10 〜 8/18
 */
function peakSeasonName(d) {
  const m   = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  if ((m === 12 && day >= 28) || (m === 1 && day <= 4)) return "年末年始";
  if ((m === 4 && day >= 29)  || (m === 5 && day <= 6)) return "GW";
  if (m === 8 && day >= 10 && day <= 18)                return "お盆";
  return null;
}

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
const peak   = peakSeasonName(target);  // 繁忙期名（なければ null）
const family = config.widgetFamily;

const widget = new ListWidget();
widget.url   = APP_URL;

// ── サイズ別レイアウト ────────────────────────────────────

if (family === "accessoryInline") {
  widget.addText(`ANA ${fmtShort(target)}  国内${START_TIME_DOMESTIC}/国際${START_TIME_INTL}`);

} else if (family === "accessoryCircular") {
  widget.addSpacer();
  const lbl = widget.addText("ANA");
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

  // 繁忙期なら🔥を追記
  const timeStr = peak
    ? `国内 ${START_TIME_DOMESTIC} / 国際 ${START_TIME_INTL} 予約開始  🔥 ${peak}`
    : `国内 ${START_TIME_DOMESTIC} / 国際 ${START_TIME_INTL} 予約開始`;
  const timeEl = widget.addText(timeStr);
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

  // 繁忙期なら日付をオレンジ・通常は白
  const dtEl = widget.addText(fmtFull(target));
  dtEl.font = Font.boldSystemFont(18);
  dtEl.textColor = peak ? new Color(PEAK_COLOR) : Color.white();

  widget.addSpacer(4);

  // 繁忙期バッジ
  if (peak) {
    const peakEl = widget.addText(`🔥 ${peak}期間 ― 即完売注意`);
    peakEl.font = Font.boldSystemFont(10);
    peakEl.textColor = new Color(PEAK_COLOR);
    widget.addSpacer(2);
  }

  const domesticEl = widget.addText(`国内線  ${START_TIME_DOMESTIC} 予約開始`);
  domesticEl.font = Font.systemFont(10);
  domesticEl.textColor = new Color("#aaaaaa");

  const intlEl = widget.addText(`国際線  ${START_TIME_INTL} 予約開始`);
  intlEl.font = Font.systemFont(10);
  intlEl.textColor = new Color("#aaaaaa");

  widget.addSpacer();

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
