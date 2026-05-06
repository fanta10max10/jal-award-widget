// JAL・ANA 特典航空券 予約開始日ウィジェット（合体版）
// Author: ファンタMAX
// Updated: 2026-05-06
// 実行環境: Scriptable (iOS)
//
// 【概要】
//   JAL（360日先）とANA（355日先）を1つのウィジェットにまとめる。
//   accessoryRectangular 1枠フル幅で両社を左右に並べて表示。
//   ウィジェット枠を節約したいロック画面向け。

// ── 設定定数 ──────────────────────────────────────────────

const JAL_OFFSET = 360;
const JAL_TIME   = "0:00";
const JAL_COLOR  = "#e60012";   // JALレッド
const JAL_URL    = "https://apps.apple.com/jp/app/jal/id351785536";

const ANA_OFFSET          = 355;
const ANA_TIME_DOMESTIC   = "9:30";
const ANA_TIME_INTL       = "9:00";
const ANA_COLOR           = "#1a6abf";  // ANAブルー
const ANA_URL             = "https://www.ana.co.jp/anaapp/domestic/reservation/";

const PEAK_COLOR = "#ff8c00";
const WEEKDAYS   = ["日", "月", "火", "水", "木", "金", "土"];

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
function fmt(d) {
  const yy  = String(d.getUTCFullYear()).slice(-2);
  const m   = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  return `${yy}/${m}/${day}（${WEEKDAYS[d.getUTCDay()]}）`;
}

/** M/D（曜）―最短 */
function fmtShort(d) {
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()}（${WEEKDAYS[d.getUTCDay()]}）`;
}

/**
 * 繁忙期判定。該当すれば名称を返す。
 * 年末年始: 12/28〜1/4 / GW: 4/29〜5/6 / お盆: 8/10〜8/18 / SW: 9/19〜9/23
 */
function peakSeasonName(d) {
  const m   = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  if ((m === 12 && day >= 28) || (m === 1 && day <= 4)) return "年末年始";
  if ((m === 4 && day >= 29)  || (m === 5 && day <= 6)) return "GW";
  if (m === 8 && day >= 10 && day <= 18)                return "お盆";
  if (m === 9 && day >= 19 && day <= 23)                return "SW";  // シルバーウィーク短縮
  return null;
}

// ── メイン処理 ────────────────────────────────────────────

const today   = todayJST();
const jalDate = addDays(today, JAL_OFFSET);
const anaDate = addDays(today, ANA_OFFSET);
const jalPeak = peakSeasonName(jalDate);
const anaPeak = peakSeasonName(anaDate);
const family  = config.widgetFamily;

const widget = new ListWidget();
widget.url   = JAL_URL;  // フォールバック: タップでJALアプリ

// ── サイズ別レイアウト ────────────────────────────────────

if (family === "accessoryInline") {
  // 1行: 両社を区切り線で並べる
  const j = fmtShort(jalDate);
  const a = fmtShort(anaDate);
  widget.addText(`JAL ${j}${jalPeak ? "🔥" : ""}  |  ANA ${a}${anaPeak ? "🔥" : ""}`);

} else if (family === "accessoryCircular") {
  // 円形: スペース限られるためJAL優先
  widget.addSpacer();
  const lbl = widget.addText("JAL");
  lbl.font = Font.boldSystemFont(9);
  lbl.centerAlignText();
  const dt = widget.addText(fmtShort(jalDate));
  dt.font = Font.boldSystemFont(10);
  dt.centerAlignText();
  widget.addSpacer();

} else if (family === "accessoryRectangular") {
  // フル幅: JAL左・ANA右の2カラム構成
  const cols = widget.addStack();
  cols.layoutHorizontally();

  // ── JAL カラム ──────────────────────────
  const jalCol = cols.addStack();
  jalCol.layoutVertically();
  jalCol.url = JAL_URL;

  const jalLbl = jalCol.addText("JAL 360日先");
  jalLbl.font = Font.systemFont(9);

  const jalDt = jalCol.addText(fmt(jalDate));
  jalDt.font = Font.boldSystemFont(13);

  const jalTimeStr = jalPeak
    ? `${JAL_TIME}  🔥 ${jalPeak}`
    : `${JAL_TIME} 予約開始`;
  const jalTimeEl = jalCol.addText(jalTimeStr);
  jalTimeEl.font = Font.systemFont(9);
  jalTimeEl.textOpacity = 0.65;

  // ── 区切り ──────────────────────────────
  cols.addSpacer();
  const divider = cols.addText("│");
  divider.font = Font.systemFont(10);
  divider.textOpacity = 0.3;
  cols.addSpacer();

  // ── ANA カラム ──────────────────────────
  const anaCol = cols.addStack();
  anaCol.layoutVertically();
  anaCol.url = ANA_URL;

  const anaLbl = anaCol.addText("ANA 355日先");
  anaLbl.font = Font.systemFont(9);

  const anaDt = anaCol.addText(fmt(anaDate));
  anaDt.font = Font.boldSystemFont(13);

  const anaTimeStr = anaPeak
    ? `国内${ANA_TIME_DOMESTIC}/国際${ANA_TIME_INTL}  🔥 ${anaPeak}`
    : `国内${ANA_TIME_DOMESTIC}/国際${ANA_TIME_INTL}`;
  const anaTimeEl = anaCol.addText(anaTimeStr);
  anaTimeEl.font = Font.systemFont(9);
  anaTimeEl.textOpacity = 0.65;

} else {
  // ホーム画面 small / medium / large
  widget.backgroundColor = new Color("#0d1117");
  widget.setPadding(14, 14, 14, 14);

  const titleEl = widget.addText("特典航空券 予約開始日");
  titleEl.font = Font.boldSystemFont(11);
  titleEl.textColor = new Color("#888888");

  widget.addSpacer(10);

  // JAL
  const jalLabelEl = widget.addText(`✈ JAL  360日先  ${JAL_TIME}スタート`);
  jalLabelEl.font = Font.systemFont(9);
  jalLabelEl.textColor = new Color(JAL_COLOR);

  const jalDateEl = widget.addText(fmt(jalDate));
  jalDateEl.font = Font.boldSystemFont(17);
  jalDateEl.textColor = jalPeak ? new Color(PEAK_COLOR) : Color.white();

  if (jalPeak) {
    const p = widget.addText(`🔥 ${jalPeak}期間 ― 即完売注意`);
    p.font = Font.boldSystemFont(9);
    p.textColor = new Color(PEAK_COLOR);
  }

  widget.addSpacer(8);

  // ANA
  const anaLabelEl = widget.addText(`✈ ANA  355日先  ${ANA_TIME_DOMESTIC}スタート（国内）`);
  anaLabelEl.font = Font.systemFont(9);
  anaLabelEl.textColor = new Color(ANA_COLOR);

  const anaDateEl = widget.addText(fmt(anaDate));
  anaDateEl.font = Font.boldSystemFont(17);
  anaDateEl.textColor = anaPeak ? new Color(PEAK_COLOR) : Color.white();

  if (anaPeak) {
    const p = widget.addText(`🔥 ${anaPeak}期間 ― 即完売注意`);
    p.font = Font.boldSystemFont(9);
    p.textColor = new Color(PEAK_COLOR);
  }

  widget.addSpacer();

  // ボタン横並び
  const btnRow = widget.addStack();
  btnRow.layoutHorizontally();

  const jalBtn = btnRow.addStack();
  jalBtn.url = JAL_URL;
  jalBtn.backgroundColor = new Color(JAL_COLOR);
  jalBtn.cornerRadius = 6;
  jalBtn.setPadding(5, 10, 5, 10);
  jalBtn.centerAlignContent();
  const jalBtnText = jalBtn.addText("✈ JAL予約");
  jalBtnText.font = Font.boldSystemFont(10);
  jalBtnText.textColor = Color.white();

  btnRow.addSpacer(8);

  const anaBtn = btnRow.addStack();
  anaBtn.url = ANA_URL;
  anaBtn.backgroundColor = new Color(ANA_COLOR);
  anaBtn.cornerRadius = 6;
  anaBtn.setPadding(5, 10, 5, 10);
  anaBtn.centerAlignContent();
  const anaBtnText = anaBtn.addText("✈ ANA予約");
  anaBtnText.font = Font.boldSystemFont(10);
  anaBtnText.textColor = Color.white();
}

// ── 実行モード分岐 ────────────────────────────────────────

if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  await widget.presentMedium();
}
Script.complete();
