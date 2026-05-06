// JAL・ANA 特典航空券予約開始日ウィジェット for Übersicht

export const refreshFrequency = 3600000; // 1時間ごとに再計算

export const command = "";

const WEEKDAYS  = ['日','月','火','水','木','金','土'];
const JAL_OFFSET = 360;
const ANA_OFFSET = 355;
const JAL_TIME   = "0:00";
const ANA_TIME_D = "9:30";
const ANA_TIME_I = "9:00";
const PEAK_COLOR = "#f5a623";
const JAL_COLOR  = "#e60012";
const ANA_COLOR  = "#1a6abf";

function getJSTTarget(offsetDays) {
  const now    = new Date();
  const jstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  jstNow.setUTCDate(jstNow.getUTCDate() + offsetDays);
  return jstNow;
}

function fmt(d) {
  const yyyy = d.getUTCFullYear();
  const mm   = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd   = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}/${mm}/${dd}（${WEEKDAYS[d.getUTCDay()]}）`;
}

function peakSeason(d) {
  const m   = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  if ((m === 12 && day >= 28) || (m === 1 && day <= 4)) return '年末年始';
  if ((m === 4 && day >= 29) || (m === 5 && day <= 6))  return 'GW';
  if (m === 8 && day >= 10 && day <= 18)                 return 'お盆';
  if (m === 9 && day >= 19 && day <= 23)                 return 'シルバーウィーク';
  return null;
}

export const render = () => {
  const jalDate = getJSTTarget(JAL_OFFSET);
  const anaDate = getJSTTarget(ANA_OFFSET);
  const jalPeak = peakSeason(jalDate);
  const anaPeak = peakSeason(anaDate);

  return (
    <div className="container">
      <div className="card jal-card">
        <div className="airline" style={{color: JAL_COLOR}}>JAL</div>
        <div className="subtitle">{JAL_OFFSET}日先　{JAL_TIME}</div>
        <div className="date" style={{color: jalPeak ? PEAK_COLOR : '#ffffff'}}>
          {fmt(jalDate)}
        </div>
        {jalPeak && <div className="peak" style={{color: PEAK_COLOR}}>🔥 {jalPeak}期間</div>}
      </div>

      <div className="card ana-card">
        <div className="airline" style={{color: ANA_COLOR}}>ANA</div>
        <div className="subtitle">{ANA_OFFSET}日先　{ANA_TIME_D}(国内)/{ANA_TIME_I}(国際)</div>
        <div className="date" style={{color: anaPeak ? PEAK_COLOR : '#ffffff'}}>
          {fmt(anaDate)}
        </div>
        {anaPeak && <div className="peak" style={{color: PEAK_COLOR}}>🔥 {anaPeak}期間</div>}
      </div>
    </div>
  );
};

export const style = `
  .container {
    display: flex;
    gap: 8px;
    font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
  }
  .card {
    flex: 1;
    border-radius: 12px;
    padding: 12px 14px;
    background: rgba(10, 10, 20, 0.75);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }
  .jal-card { background: rgba(30, 0, 5, 0.80); }
  .ana-card  { background: rgba(0, 17, 42, 0.80); }
  .airline {
    font-size: 15px;
    font-weight: bold;
    margin-bottom: 2px;
  }
  .subtitle {
    font-size: 10px;
    color: #888;
    margin-bottom: 6px;
  }
  .date {
    font-size: 16px;
    font-weight: bold;
    line-height: 1.3;
  }
  .peak {
    font-size: 11px;
    font-weight: bold;
    margin-top: 4px;
  }
`;
