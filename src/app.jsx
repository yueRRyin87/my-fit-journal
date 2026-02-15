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

function HomePage({ challenge, prs, joinChallenge }) {
  const latest = ['卧推', '深蹲', '硬拉']
    .map((lift) => prs.filter((r) => r.lift === lift).sort((a, b) => new Date(b.date) - new Date(a.date))[0])
    .filter(Boolean);

  return (
    <>
      <section className="hero">
        <div>
          <p className="tag">React + TypeScript Backend</p>
          <h2>记录每一次突破，展示你的健身旅程进步</h2>
          <p>个人健身网站基础框架：PR历程、补剂评价、挑战互动、真实数据展示。</p>
        </div>
        <div className="card">
          <h3>今日 PR 挑战</h3>
          <p>{challenge.goalText}</p>
          <p className="muted">参与人数：{challenge.participants}</p>
          <button className="btn" onClick={joinChallenge}>加入挑战</button>
        </div>
      </section>

      <section className="cards-3 top-gap">
        {latest.map((row) => (
          <article className="card" key={row.id}>
            <h3>{row.lift}</h3>
            <p><strong>{row.weight}kg × {row.reps}</strong></p>
            <p className="muted">{row.date}</p>
          </article>
        ))}
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
  const diff = hasInput ? (todayNum - best).toFixed(1) : null;

  let status = '请输入今日重量后自动对比';
  if (hasInput) {
    if (todayNum > best) status = `🎉 新PR！比历史最大重量高 ${diff} kg`;
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
