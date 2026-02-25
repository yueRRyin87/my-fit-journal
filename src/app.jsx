const { useEffect, useMemo, useState } = React;

const API_BASE = '/api';

const contactLinks = [
  { label: 'GitHub', short: '◎', href: 'https://github.com/yueRRyin87' },
  { label: 'LinkedIn', short: '▣', href: 'https://linkedin.com' },
  { label: '下载简历', short: '⬇', href: '#contact' }
];

function ContactIcons({ compact = false }) {
  return (
    <div className={`contact-icons ${compact ? 'compact' : ''}`}>
      {contactLinks.map((item) => (
        <a key={item.label} href={item.href} target="_blank" rel="noreferrer" title={item.label} className="icon-btn">
          {item.short}
        </a>
      ))}
    </div>
  );
}

function Navbar() {
  const items = [
    ['home', '主页'],
    ['journey', '我的历程'],
    ['progress', '健身数据'],
    ['supplements', '补剂与工具'],
    ['contact', '联系我']
  ];

  const jumpTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <header className="site-header">
      <div className="nav-shell">
        <div className="nav-wrap">
          <h1 className="logo">My Fit Journal</h1>
          <nav>
            {items.map(([key, label]) => (
              <button key={key} className="nav-btn" onClick={() => jumpTo(key)}>{label}</button>
            ))}
          </nav>
          <ContactIcons compact />
        </div>
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
  const h = 280;
  const pad = 34;

  const x = (i, total) => pad + (i * (w - pad * 2)) / Math.max(1, total - 1);
  const y = (weight) => h - pad - ((weight - min) / Math.max(1, max - min)) * (h - pad * 2);

  return (
    <div className="chart-card">
      <h3>重量更迭图（Progression Chart）</h3>
      <svg viewBox={`0 0 ${w} ${h}`} className="trend-chart" role="img" aria-label="PR trend">
        {Array.from({ length: 4 }).map((_, idx) => {
          const yy = pad + (idx * (h - pad * 2)) / 3;
          return <line key={idx} x1={pad} y1={yy} x2={w - pad} y2={yy} stroke="#d8cbb8" />;
        })}

        {pointsByLift.map((rows, idx) => {
          const poly = rows.map((r, i) => `${x(i, rows.length)},${y(r.weight)}`).join(' ');
          return (
            <g key={lifts[idx]}>
              <polyline className="animated-line" points={poly} fill="none" stroke={colors[idx]} strokeWidth="3" />
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
      <h4>{lift}</h4>
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

function App() {
  const [prs, setPrs] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const load = async () => {
      const [prsRes, reviewsRes] = await Promise.all([
        fetch(`${API_BASE}/prs`).then((r) => r.json()),
        fetch(`${API_BASE}/reviews`).then((r) => r.json())
      ]);
      setPrs(prsRes);
      setReviews(reviewsRes);
    };
    load();
  }, []);

  useEffect(() => {
    const items = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('shown');
        });
      },
      { threshold: 0.18 }
    );

    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [prs, reviews]);


  const metricTrend = [
    { label: '体重', start: '58kg', now: '67kg' },
    { label: '体脂率', start: '24%', now: '17%' },
    { label: '骨骼肌', start: '22kg', now: '29kg' }
  ];

  const dietPlans = [
    { title: '增肌餐', detail: '高蛋白 + 中高碳水：鸡胸肉、米饭、鸡蛋、酸奶' },
    { title: '减脂餐', detail: '高蛋白 + 蔬菜优先：鱼类、蔬菜、燕麦、低脂乳制品' },
    { title: '恢复餐', detail: '训练后补充：蛋白粉 + 水果 + 电解质' }
  ];

  const workoutTips = [
    '深蹲先稳住核心，再下蹲到你能控制的深度。',
    '卧推时保持上背稳定，避免肩部代偿。',
    '硬拉更看重起始姿势，不要急着拉离地面。'
  ];

  return (
    <div>
      <Navbar />
      <main className="container section-space">
        <section id="home" className="overview-bar reveal">
          <p>这个网站用于：记录训练日志、展示 PR 变化、分享补剂与工具体验，并持续沉淀自己的训练与营养经验。</p>
        </section>

        <section className="intro-section panel top-gap reveal">
          <div>
            <p className="kicker">Brief Intro</p>
            <h2>我是一个持续记录健身旅程的人</h2>
            <p>我从“想变健康”开始，到现在把健身当成长期生活方式。这个网站记录我的训练、饮食和恢复，也分享给同样想坚持的人。</p>
            <p className="muted">当前目标：增肌 + 维持低体脂 + 长期健康生活</p>
          </div>
          <div className="photo-placeholder">个人/训练照片位</div>
        </section>

        <section id="journey" className="panel top-gap reveal">
          <h3>My Fitness Journey</h3>
          <div className="timeline-list">
            <article className="timeline-item"><h4>2021</h4><p>正式开始训练，建立一周三练习惯。</p></article>
            <article className="timeline-item"><h4>2022</h4><p>第一次增肌成功，训练和饮食开始系统化。</p></article>
            <article className="timeline-item"><h4>2023</h4><p>学习恢复管理，降低伤病风险。</p></article>
            <article className="timeline-item"><h4>2024-现在</h4><p>用数据长期追踪身体变化和主项进步。</p></article>
          </div>

          <h4 className="sub-title">体成分进度（示意）</h4>
          <div className="stack-list">
            {metricTrend.map((m) => (
              <article className="stack-card" key={m.label}>
                <strong>{m.label}</strong>
                <p>{m.start} → {m.now}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="progress" className="panel top-gap reveal">
          <h3>PR & Progression</h3>
          <p className="muted">动态折线展示重量变化，同时支持输入今日重量和历史PR自动对比。</p>
          <HomeTrend prs={prs} />
          <div className="cards-3 top-gap">
            <LiftCompare lift="卧推" prs={prs} />
            <LiftCompare lift="深蹲" prs={prs} />
            <LiftCompare lift="硬拉" prs={prs} />
          </div>
        </section>

        <section id="supplements" className="panel top-gap reveal">
          <h3>Supplements & Tools</h3>
          <div className="cards-3">
            {reviews.map((item) => (
              <article className="card" key={item.id}>
                <p className="muted">{item.type}</p>
                <h4>{item.name}</h4>
                <p>{'★'.repeat(Math.round(item.score))} {item.score}/5</p>
                <p>{item.note}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="panel top-gap reveal">
          <h3>Diet & Nutrition</h3>
          <p>每日记录：热量、蛋白质、脂肪、碳水；按目标切换饮食策略。</p>
          <div className="stack-list">
            {dietPlans.map((p) => (
              <article key={p.title} className="stack-card">
                <h4>{p.title}</h4>
                <p>{p.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="panel top-gap reveal">
          <h3>Workout Plans & Tips</h3>
          <p>示例训练计划：增肌 / 减脂 / 核心稳定；配合动作要点与常见错误提醒。</p>
          <ul className="tips-list">
            {workoutTips.map((tip) => <li key={tip}>{tip}</li>)}
          </ul>
          <div className="video-placeholder">动作示范视频/动图区域（可嵌入 YouTube 或 Bilibili）</div>
        </section>

        <section id="contact" className="panel top-gap reveal">
          <h3>Contact</h3>
          <p>如果你也在做长期健身记录，欢迎交流训练计划、饮食实践和恢复经验。</p>
          <p><strong>Email：</strong>yourname@example.com</p>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-shell">
          <p>Thanks for scrolling my journey · Let&apos;s connect</p>
          <ContactIcons />
        </div>
      </footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
