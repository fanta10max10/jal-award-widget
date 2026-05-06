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
const JAL_URL    = "https://www.jal.co.jp/appli/121/link/ios/index.html";

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
  // JAL・ANA を色付きカードに分けて横並び
  widget.backgroundColor = new Color("#080810");
  widget.setPadding(10, 10, 10, 10);

  const cards = widget.addStack();
  cards.layoutHorizontally();

  // ── ヘルパー: カード内のボタンを作る ──────────────────
  function addBtn(parent, label, color, url) {
    const btn = parent.addStack();
    btn.url = url;
    btn.backgroundColor = color;
    btn.cornerRadius = 6;
    btn.setPadding(5, 0, 5, 0);
    btn.centerAlignContent();
    const t = btn.addText(label);
    t.font = Font.boldSystemFont(11);
    t.textColor = Color.white();
    t.centerAlignText();
  }

  // ── JAL カード（ダーク赤） ──────────────────────────
  const jalCard = cards.addStack();
  jalCard.layoutVertically();
  jalCard.backgroundColor = new Color("#1e0005");
  jalCard.cornerRadius = 10;
  jalCard.setPadding(10, 10, 10, 10);
  jalCard.url = JAL_URL;

  const jalAirline = jalCard.addText("JAL");
  jalAirline.font = Font.boldSystemFont(13);
  jalAirline.textColor = new Color(JAL_COLOR);

  const jalSub = jalCard.addText(`360日先  ${JAL_TIME}`);
  jalSub.font = Font.systemFont(9);
  jalSub.textColor = new Color("#888888");

  jalCard.addSpacer(6);

  const jalDtEl = jalCard.addText(fmt(jalDate));
  jalDtEl.font = Font.boldSystemFont(20);
  jalDtEl.textColor = jalPeak ? new Color(PEAK_COLOR) : Color.white();
  jalDtEl.minimumScaleFactor = 0.7;

  if (jalPeak) {
    jalCard.addSpacer(3);
    const p = jalCard.addText(`🔥 ${jalPeak}期間`);
    p.font = Font.boldSystemFont(10);
    p.textColor = new Color(PEAK_COLOR);
  }

  jalCard.addSpacer();

  addBtn(jalCard, "✈ 予約", new Color(JAL_COLOR), JAL_URL);

  // カード間スペース
  cards.addSpacer(8);

  // ── ANA カード（ダーク紺） ──────────────────────────
  const anaCard = cards.addStack();
  anaCard.layoutVertically();
  anaCard.backgroundColor = new Color("#00112a");
  anaCard.cornerRadius = 10;
  anaCard.setPadding(10, 10, 10, 10);
  anaCard.url = ANA_URL;

  const anaAirline = anaCard.addText("ANA");
  anaAirline.font = Font.boldSystemFont(13);
  anaAirline.textColor = new Color(ANA_COLOR);

  const anaSub = anaCard.addText(`355日先  ${ANA_TIME_DOMESTIC}`);
  anaSub.font = Font.systemFont(9);
  anaSub.textColor = new Color("#888888");

  anaCard.addSpacer(6);

  const anaDtEl = anaCard.addText(fmt(anaDate));
  anaDtEl.font = Font.boldSystemFont(20);
  anaDtEl.textColor = anaPeak ? new Color(PEAK_COLOR) : Color.white();
  anaDtEl.minimumScaleFactor = 0.7;

  if (anaPeak) {
    anaCard.addSpacer(3);
    const p = anaCard.addText(`🔥 ${anaPeak}期間`);
    p.font = Font.boldSystemFont(10);
    p.textColor = new Color(PEAK_COLOR);
  }

  anaCard.addSpacer();

  addBtn(anaCard, "✈ 予約", new Color(ANA_COLOR), ANA_URL);
}

// ── 実行モード分岐 ────────────────────────────────────────

if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  await widget.presentMedium();
}
Script.complete();
