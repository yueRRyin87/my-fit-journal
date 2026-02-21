const { useEffect, useMemo, useState } = React;

const API_BASE = 'http://localhost:4000/api';

function Navbar({ page, setPage }) {
  const items = [
    ['home', '首页'],
    ['pr', 'PR记录'],
    ['reviews', '补剂&工具'],
    ['blog', '博客']
  ];

  return (
    <header className="site-header">
      <div className="container nav-wrap">
        <h1 className="logo">My Fit Journal</h1>
        <nav>
          {items.map(([key, label]) => (
            <a key={key} className={page === key ? 'active' : ''} onClick={() => setPage(key)}>{label}</a>
          ))}
        </nav>
      </div>
    </header>
  );
}

function HomeTrend({ prs }) {
  const lifts = ['卧推', '深蹲', '硬拉'];
  const colors = ['#bf6f3d', '#728c69', '#8f5f4f'];
  const pointsByLift = lifts.map((lift) => prs
    .filter((item) => item.lift === lift)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
  );

  const allWeights = prs.map((p) => p.weight);
  const min = Math.min(...allWeights, 60);
  const max = Math.max(...allWeights, 200);
  const w = 700;
  const h = 270;
  const pad = 34;

  const x = (i, total) => pad + (i * (w - pad * 2)) / Math.max(1, total - 1);
  const y = (weight) => h - pad - ((weight - min) / Math.max(1, max - min)) * (h - pad * 2);

  return (
    <div className="chart-card">
      <h3>动作 PR 与重量更迭</h3>
      <svg viewBox={`0 0 ${w} ${h}`} className="trend-chart" role="img" aria-label="PR trend">
        {Array.from({ length: 4 }).map((_, idx) => {
          const yy = pad + (idx * (h - pad * 2)) / 3;
          return <line key={idx} x1={pad} y1={yy} x2={w - pad} y2={yy} stroke="#d8cbb8" />;
        })}

        {pointsByLift.map((rows, idx) => {
          const poly = rows.map((r, i) => `${x(i, rows.length)},${y(r.weight)}`).join(' ');
          return (
            <g key={lifts[idx]}>
              <polyline points={poly} fill="none" stroke={colors[idx]} strokeWidth="3" />
              {rows.map((r, i) => (
                <circle key={r.id} cx={x(i, rows.length)} cy={y(r.weight)} r="4" fill={colors[idx]}>
                  <title>{`${r.lift} ${r.weight}kg`}</title>
                </circle>
              ))}
              <text x={w - pad + 6} y={y(rows[rows.length - 1]?.weight ?? min)} fill={colors[idx]} fontSize="12">{lifts[idx]}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function HomePage({ challenge, prs, joinChallenge }) {
  const timeline = [
    { year: '2021', note: '开始系统训练，重建动作模式与训练习惯。' },
    { year: '2022', note: '建立基础力量，卧推和深蹲进入稳定增重阶段。' },
    { year: '2023', note: '优化恢复与饮食，训练周期更可持续。' },
    { year: '2024-Now', note: '聚焦动作质量与长期进步，挑战更高 PR。' }
  ];

  const weeklyMoments = [
    { title: '周一：重训练', text: '专注主项，记录动作主观难度（RPE）和每组质量。' },
    { title: '周三：技术日', text: '降低负重，打磨动作节奏与控制感。' },
    { title: '周五：冲刺日', text: '测试当周状态，决定是否刷新当周最佳。' }
  ];

  useEffect(() => {
    const items = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('shown');
        });
      },
      { threshold: 0.2 }
    );

    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <section className="overview-bar reveal">
        <p>
          这个网站用于：记录训练日志、展示 PR 变化、分享补剂与工具体验，并通过每月挑战持续激励自己与他人。
        </p>
      </section>

      <section className="intro-section panel top-gap reveal">
        <div>
          <p className="kicker">Brief Intro</p>
          <h2>你好，我是一个长期健身记录者</h2>
          <p>
            我把这几年训练中的关键数据、经验和反思都放在这里。
            希望这个空间不仅记录我的变化，也能给正在训练的你一些真实参考。
          </p>
        </div>
        <aside className="challenge-box">
          <h3>本月挑战</h3>
          <p>{challenge.goalText}</p>
          <p className="muted">参与人数：{challenge.participants}</p>
          <button className="btn" onClick={joinChallenge}>加入挑战</button>
        </aside>
      </section>

      <section className="panel top-gap reveal">
        <h3>我的几年健身历程</h3>
        <div className="journey-grid">
          <div className="photo-placeholder">训练照片区（可替换为你的真实照片）</div>
          <div className="timeline-list">
            {timeline.map((item) => (
              <article key={item.year} className="timeline-item">
                <h4>{item.year}</h4>
                <p>{item.note}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="panel top-gap reveal">
        <h3>这一周我怎么训练</h3>
        <div className="stack-list">
          {weeklyMoments.map((item) => (
            <article className="stack-card" key={item.title}>
              <h4>{item.title}</h4>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel top-gap reveal">
        <blockquote>
          “真正让我进步的不是某一次神奇训练，而是每周持续出现的那一点点进步。”
        </blockquote>
      </section>

      <section className="panel top-gap reveal">
        <HomeTrend prs={prs} />
      </section>
    </>
  );
}

function LiftCompare({ lift, prs }) {
  const [today, setToday] = useState('');

  const best = useMemo(() => {
    const rows = prs.filter((r) => r.lift === lift);
    if (!rows.length) return 0;
    return Math.max(...rows.map((r) => Number(r.weight)));
  }, [lift, prs]);

  const todayNum = Number(today);
  const hasInput = today.trim() !== '' && !Number.isNaN(todayNum);

  let status = '请输入今日重量后自动对比';
  if (hasInput) {
    if (todayNum > best) status = `🎉 新PR！比历史最大重量高 ${(todayNum - best).toFixed(1)} kg`;
    else if (todayNum === best) status = `💪 持平历史PR（${best} kg）`;
    else status = `继续冲！距离PR还差 ${(best - todayNum).toFixed(1)} kg`;
  }

  return (
    <article className="card">
      <h3>{lift}</h3>
      <p className="muted">历史PR：{best} kg</p>
      <label className="field-label">今日重量（kg）</label>
      <input
        type="number"
        min="0"
        step="0.5"
        value={today}
        onChange={(e) => setToday(e.target.value)}
        placeholder="例如 102.5"
      />
      <p className="compare-result">{status}</p>
    </article>
  );
}

function PrPage({ prs }) {
  return (
    <>
      <h2>PR 历程记录</h2>
      <p className="muted">录入今日重量后会自动和历史最大重量（PR）比较。</p>

      <section className="cards-3 top-gap">
        <LiftCompare lift="卧推" prs={prs} />
        <LiftCompare lift="深蹲" prs={prs} />
        <LiftCompare lift="硬拉" prs={prs} />
      </section>

      <div className="card top-gap">
        <table>
          <thead><tr><th>日期</th><th>动作</th><th>重量</th><th>次数</th><th>频率</th><th>恢复</th></tr></thead>
          <tbody>
            {prs.map((r) => <tr key={r.id}><td>{r.date}</td><td>{r.lift}</td><td>{r.weight}</td><td>{r.reps}</td><td>{r.freq}</td><td>{r.recovery}</td></tr>)}
          </tbody>
        </table>
      </div>
    </>
  );
}

function ReviewsPage({ reviews }) {
  return (
    <>
      <h2>补剂与工具评价</h2>
      <section className="cards-3 top-gap">
        {reviews.map((it) => (
          <article className="card" key={it.id}>
            <p className="muted">{it.type}</p><h3>{it.name}</h3><p>{'★'.repeat(Math.round(it.score))} {it.score}/5</p><p>{it.note}</p>
          </article>
        ))}
      </section>
    </>
  );
}

function BlogPage() {
  return <div className="card"><h2>博客/文章</h2><p>可持续更新训练技巧、挑战记录、恢复与饮食经验。</p></div>;
}

function App() {
  const [page, setPage] = useState('home');
  const [prs, setPrs] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [challenge, setChallenge] = useState({ goalText: '加载中...', participants: 0 });

  const load = async () => {
    const [prsRes, reviewsRes, challengeRes] = await Promise.all([
      fetch(`${API_BASE}/prs`).then((r) => r.json()),
      fetch(`${API_BASE}/reviews`).then((r) => r.json()),
      fetch(`${API_BASE}/challenge`).then((r) => r.json())
    ]);
    setPrs(prsRes);
    setReviews(reviewsRes);
    setChallenge(challengeRes);
  };

  useEffect(() => { load(); }, []);

  const joinChallenge = async () => {
    await fetch(`${API_BASE}/challenge/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '访客' })
    });
    load();
  };

  return (
    <div>
      <Navbar page={page} setPage={setPage} />
      <main className="container section-space">
        {page === 'home' && <HomePage challenge={challenge} prs={prs} joinChallenge={joinChallenge} />}
        {page === 'pr' && <PrPage prs={prs} />}
        {page === 'reviews' && <ReviewsPage reviews={reviews} />}
        {page === 'blog' && <BlogPage />}
      </main>
      <footer className="site-footer"><div className="container">© 2026 My Fit Journal</div></footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
