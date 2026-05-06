// JAL・ANA 特典航空券 予約開始日ウィジェット
// Author: ファンタMAX
// Updated: 2026-05-06
// 実行環境: Scriptable (iOS)
//
// 【概要】
//   JAL（360日前 0:00）とANA（355日前 9:30）の特典航空券予約開始日を
//   ロック画面・ホーム画面ウィジェットに並べて表示する。
//   日付には曜日を付与。ボタンタップで各社アプリへ直接ジャンプ。

// ── 設定定数 ──────────────────────────────────────────────

// JAL: 搭乗360日前 0:00（JST）から予約可能
const JAL_OFFSET_DAYS = 360;
const JAL_START_TIME  = "0:00";
const JAL_COLOR       = "#c8a951";  // JALゴールド
// JALアプリ（App Store経由で起動）
const JAL_URL = "https://apps.apple.com/jp/app/jal/id351785536";

// ANA: 搭乗355日前 9:30（国内線）/ 9:00（国際線）から予約可能
const ANA_OFFSET_DAYS = 355;
const ANA_START_TIME  = "9:30";     // 国内線。国際線は9:00
const ANA_COLOR       = "#1a6abf";  // ANAブルー
// ANAアプリの予約画面（Universal Link）
// ※ ANAアプリ未インストール時はブラウザでANAサイトが開きます
const ANA_URL = "https://www.ana.co.jp/anaapp/domestic/reservation/";

// 曜日ラベル（日曜=0 始まり）
const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

// ── 日付ユーティリティ ────────────────────────────────────

/**
 * JST（UTC+9）基準で「今日」の0時（UTC表現）を返す。
 * 端末のタイムゾーン設定に依存しない実装。
 */
function todayJST() {
  const now   = new Date();
  const jstMs = now.getTime() + 9 * 60 * 60 * 1000;
  const jst   = new Date(jstMs);
  return new Date(Date.UTC(
    jst.getUTCFullYear(),
    jst.getUTCMonth(),
    jst.getUTCDate()
  ));
}

/**
 * date に days 日加算した Date を返す。
 * setUTCDate を使うことでサマータイム（DST）による誤差を回避。
 */
function addDays(date, days) {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

/** YYYY/MM/DD（曜） 形式 */
function fmtFull(d) {
  const y   = d.getUTCFullYear();
  const m   = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const w   = WEEKDAYS[d.getUTCDay()];
  return `${y}/${m}/${day}（${w}）`;
}

/** MM/DD（曜） 形式（年なし・ロック画面向け短縮） */
function fmtMD(d) {
  const m   = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const w   = WEEKDAYS[d.getUTCDay()];
  return `${m}/${day}（${w}）`;
}

/** M/D（曜） 形式（ゼロ埋めなし・1行向け最短） */
function fmtShort(d) {
  const w = WEEKDAYS[d.getUTCDay()];
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()}（${w}）`;
}

// ── メイン処理 ────────────────────────────────────────────

const today   = todayJST();
const jalDate = addDays(today, JAL_OFFSET_DAYS);
const anaDate = addDays(today, ANA_OFFSET_DAYS);
const family  = config.widgetFamily;

const widget = new ListWidget();
// フォールバック: ウィジェット全体タップでJALアプリを開く
widget.url = JAL_URL;

// ── ウィジェットサイズ別レイアウト ───────────────────────

if (family === "accessoryInline") {
  // ロック画面・時計上の1行（最短形式・曜日なし）
  const j = `${jalDate.getUTCMonth() + 1}/${jalDate.getUTCDate()}`;
  const a = `${anaDate.getUTCMonth() + 1}/${anaDate.getUTCDate()}`;
  widget.addText(`JAL ${j} | ANA ${a}`);

} else if (family === "accessoryCircular") {
  // ロック画面・円形: スペース限られるためJALのみ
  widget.addSpacer();
  const lbl = widget.addText("JAL");
  lbl.font = Font.systemFont(9);
  lbl.centerAlignText();
  const dt = widget.addText(fmtShort(jalDate));
  dt.font = Font.boldSystemFont(10);
  dt.centerAlignText();
  widget.addSpacer();

} else if (family === "accessoryRectangular") {
  // ロック画面・四角枠（メイン推奨）
  // JAL  05/01（金）  0:00
  //      深夜0時ジャストに開始
  // ANA  04/26（月）  9:30
  //      9:30開始（国際線は9:00）
  const jalLine = widget.addText(`JAL  ${fmtMD(jalDate)}  ${JAL_START_TIME}`);
  jalLine.font = Font.boldSystemFont(11);

  const jalNote = widget.addText("     深夜0時ジャストに開始");
  jalNote.font = Font.systemFont(9);
  jalNote.textOpacity = 0.6;

  widget.addSpacer(2);

  const anaLine = widget.addText(`ANA  ${fmtMD(anaDate)}  ${ANA_START_TIME}`);
  anaLine.font = Font.boldSystemFont(11);

  const anaNote = widget.addText("     9:30開始（国際線は9:00）");
  anaNote.font = Font.systemFont(9);
  anaNote.textOpacity = 0.6;

} else {
  // ホーム画面 small / medium / large
  widget.backgroundColor = new Color("#0d1117");
  widget.setPadding(14, 14, 14, 14);

  const titleEl = widget.addText("特典航空券 予約開始日");
  titleEl.font = Font.boldSystemFont(11);
  titleEl.textColor = new Color("#888888");

  widget.addSpacer(10);

  // JAL セクション
  const jalLabelEl = widget.addText(`✈ JAL  360日前  ${JAL_START_TIME}スタート`);
  jalLabelEl.font = Font.systemFont(9);
  jalLabelEl.textColor = new Color(JAL_COLOR);

  const jalDateEl = widget.addText(fmtFull(jalDate));
  jalDateEl.font = Font.boldSystemFont(17);
  jalDateEl.textColor = Color.white();

  widget.addSpacer(8);

  // ANA セクション
  const anaLabelEl = widget.addText(`✈ ANA  355日前  ${ANA_START_TIME}スタート（国内）`);
  anaLabelEl.font = Font.systemFont(9);
  anaLabelEl.textColor = new Color(ANA_COLOR);

  const anaDateEl = widget.addText(fmtFull(anaDate));
  anaDateEl.font = Font.boldSystemFont(17);
  anaDateEl.textColor = Color.white();

  widget.addSpacer();

  // ボタン横並び（JAL・ANA）
  // ※ ScriptableがWidgetStack.urlに対応していれば個別タップが効く
  //   未対応の場合は widget.url（JAL）が開く（フォールバック）
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
  // Scriptable アプリ内での動作確認用プレビュー
  await widget.presentMedium();
}
Script.complete();
