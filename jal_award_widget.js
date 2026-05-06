// JAL特典航空券 予約開始日ウィジェット
// Author: ファンタMAX
// Updated: 2026-05-06
// 実行環境: Scriptable (iOS)
//
// 【概要】
//   今日のJST日付と、今日から360日後の日付（JAL特典航空券の予約可能最遠日）を
//   ロック画面・ホーム画面ウィジェットに表示する。
//   ウィジェットタップで特典航空券予約ページに直接ジャンプ。

// ── 設定定数 ──────────────────────────────────────────────

const OFFSET_DAYS = 360;   // JAL特典航空券の予約開始日数（変更時はここだけ修正）
const LABEL = "JAL予約開始日";

// 特典航空券予約ページURL（ウィジェットタップで開く）
// ※ URLに含まれるセッショントークン（MESSAGE_AUTH等）は期限切れになることがあります。
//    その場合は JAL公式サイトからログイン後のURLをコピーして差し替えてください。
const BOOKING_URL =
  "https://jallogin.jal.co.jp/contents/login?AUTH_TYPE=AUTH_THREEKEY_LOW&SITE_ID=co" +
  "&AUTHENTICATED=http%3A%2F%2Fjallogin.jal.co.jp%2Fsso%2FInternalAuthoriEndpoint%2F" +
  "%3Facr_values%3D4%26design%3DJL001N%26redirect_uri%3Dhttps%253A%252F%252Fwww121.jal.co.jp" +
  "%252FJmbWeb%252FJR%252FDispatcher_ja.do%26state%3DVEVGT1J6MWhiVVU5JmJXVnRZbVZ5UW1GamEx" +
  "VnliRDFhU0ZJd1kwaE5Oa3g1T1ROa00yTjFZVzFHYzB4dFRuWk1iWEIzVERKd2Qwd3ljR2hNTW5CMFdXaz" +
  "VhR1F5Um5sYVF6RnJZakl3ZGxsdE9YWmhNbXgxV25rNFBRPT0mYldWdFltVnlVR0YwZEdWeWJqMU9VM2N5" +
  "VEVSRmVreEVTVFU5JmJXVnRZbVZ5VUdGMGRHVnliakZPVTNjeVRFUkZlbHhFU1RVOT0mcGxhdGZvcm09c3" +
  "BhJnNpZ25pbmdfYWxnb3JpdGhtPVJTMjU2JnNpZ25hdHVyZT1kZHFxcjNCSUNYTFJKWU1JTEdTMkhCOTdP" +
  "MkQmcGFzc3dvcmRfYWdpbmdfY2hhaW5lZD1mYWxzZSZsb2dpbl9jaGFsbGVuZ2U9Rk0yVlhUZW9EcFMtQj" +
  "ktWVdWbWE1aFF4TUNhYURQR3lVMVhVbnZ2SGhxdA&MESSAGE_AUTH=2kzZds50qrYovlX4vIgAsw%3D%3D";

// ── 日付ユーティリティ ────────────────────────────────────

/**
 * JST（UTC+9）基準で「今日」の0時（UTC表現）を返す。
 * 端末のタイムゾーン設定に依存しない実装。
 */
function todayJST() {
  const now = new Date();
  const jstMs = now.getTime() + 9 * 60 * 60 * 1000;
  const jst = new Date(jstMs);
  // 時刻を0時にリセットしてUTC Dateとして保持
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

/** YYYY/MM/DD 形式（ゼロ埋めあり） */
function fmtFull(d) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}/${m}/${day}`;
}

/** M/D 形式（ゼロ埋めなし） */
function fmtShort(d) {
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
}

// ── メイン処理 ────────────────────────────────────────────

const today = todayJST();
const future = addDays(today, OFFSET_DAYS);
const family = config.widgetFamily;

const widget = new ListWidget();
// ウィジェット全体タップで予約ページを開く（全サイズ共通）
widget.url = BOOKING_URL;

// ── ウィジェットサイズ別レイアウト ───────────────────────

if (family === "accessoryInline") {
  // ロック画面・時計上の1行（テキストのみ、色指定はOS側）
  widget.addText(`JAL: ${fmtShort(future)}`);

} else if (family === "accessoryCircular") {
  // ロック画面・円形（月/日を中央表示）
  widget.addSpacer();
  const circularText = widget.addText(fmtShort(future));
  circularText.font = Font.boldSystemFont(14);
  circularText.centerAlignText();
  widget.addSpacer();

} else if (family === "accessoryRectangular") {
  // ロック画面・四角枠【メイン推奨サイズ】
  //   JAL予約開始日     ← 10pt
  //   2027/05/01        ← 14pt bold
  //   今日 5/6          ← 9pt, opacity 0.7
  const labelEl = widget.addText(LABEL);
  labelEl.font = Font.systemFont(10);

  const futureDateEl = widget.addText(fmtFull(future));
  futureDateEl.font = Font.boldSystemFont(14);

  const todayEl = widget.addText(`今日 ${fmtShort(today)}`);
  todayEl.font = Font.systemFont(9);
  todayEl.textOpacity = 0.7;

} else {
  // ホーム画面 small / medium / large
  widget.backgroundColor = new Color("#1a1a2e");
  widget.setPadding(14, 14, 14, 14);

  // タイトル
  const titleEl = widget.addText(LABEL);
  titleEl.font = Font.boldSystemFont(12);
  titleEl.textColor = Color.white();

  widget.addSpacer(6);

  // 今日の日付
  const todayLabelEl = widget.addText("今日");
  todayLabelEl.font = Font.systemFont(9);
  todayLabelEl.textColor = new Color("#aaaaaa");

  const todayDateEl = widget.addText(fmtFull(today));
  todayDateEl.font = Font.systemFont(13);
  todayDateEl.textColor = Color.white();

  widget.addSpacer(6);

  // 360日後の日付（予約可能最遠日）
  const futureLabelEl = widget.addText(`+${OFFSET_DAYS}日後（予約可能最遠日）`);
  futureLabelEl.font = Font.systemFont(9);
  futureLabelEl.textColor = new Color("#aaaaaa");

  const futureDateEl = widget.addText(fmtFull(future));
  futureDateEl.font = Font.boldSystemFont(20);
  futureDateEl.textColor = new Color("#ff6b6b");

  widget.addSpacer();

  // 予約ボタン（ウィジェット全体タップと同じURLが開く）
  const btnStack = widget.addStack();
  btnStack.backgroundColor = new Color("#c8a951");
  btnStack.cornerRadius = 6;
  btnStack.setPadding(5, 10, 5, 10);
  btnStack.centerAlignContent();

  const btnText = btnStack.addText("✈ 今すぐ予約");
  btnText.font = Font.boldSystemFont(11);
  btnText.textColor = Color.white();
}

// ── 実行モード分岐 ────────────────────────────────────────

if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  // Scriptable アプリ内での動作確認用プレビュー
  await widget.presentMedium();
}
Script.complete();
