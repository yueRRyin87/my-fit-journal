const { useEffect, useMemo, useState } = React;

const API_BASE = '/api';

const contactLinks = [
  { label: 'GitHub', short: '◎', href: 'https://github.com/yueRRyin87' },
  { label: 'LinkedIn', short: '▣', href: 'https://linkedin.com' },
  { label: '下载简历', short: '⬇', href: '#contact' }
];

const milestones = [
  {
    year: '2021.04',
    title: '第一次接触力量训练',
    detail: '哑铃卧推从 7.5kg × 8 次开始，记录了第一条训练日志。',
    media: '训练日志照片 / 视频'
  },
  {
    year: '2022.01',
    title: '第一次成功正手引体向上',
    detail: '从弹力带辅助到独立完成 1 次正手引体，背部训练进入新阶段。',
    media: '引体向上视频'
  },
  {
    year: '2023.09',
    title: '第一次硬拉破 100kg',
    detail: '硬拉做到 102.5kg，动作稳定性和核心控制都有明显提升。',
    media: '硬拉 100kg 视频'
  },
  {
    year: '2024.11',
    title: '三大项总和持续增长',
    detail: '从 230kg 提升到 315kg，训练计划与恢复策略逐步成型。',
    media: '三大项总和趋势图'
  }
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
    ['milestones', '里程碑'],
    ['progress', '健身数据'],
    ['supplements', '补剂与工具'],
    ['recipes', '增肌食谱'],
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
    <div className="chart-block">
      <p className="kicker">PR Progression</p>
      <h3>重量更迭图</h3>
      <svg viewBox={`0 0 ${w} ${h}`} className="trend-chart" role="img" aria-label="PR trend">
        {Array.from({ length: 4 }).map((_, idx) => {
          const yy = pad + (idx * (h - pad * 2)) / 3;
          return <line key={idx} x1={pad} y1={yy} x2={w - pad} y2={yy} stroke="#dbd0bf" />;
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
    <article className="lift-item">
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
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('shown');
      });
    }, { threshold: 0.15 });

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


  const bulkRecipes = [
    {
      name: '高蛋白牛肉能量饭',
      macro: '约 720 kcal · 蛋白质 52g · 碳水 78g · 脂肪 20g',
      detail: '瘦牛肉 180g + 米饭 220g + 彩椒洋葱 + 橄榄油少量，训练后 1 小时内吃。'
    },
    {
      name: '鸡腿藜麦恢复碗',
      macro: '约 680 kcal · 蛋白质 48g · 碳水 64g · 脂肪 24g',
      detail: '去皮鸡腿肉 200g + 藜麦 120g + 牛油果半个，适合晚间补充恢复。'
    },
    {
      name: '早餐增肌奶昔',
      macro: '约 560 kcal · 蛋白质 42g · 碳水 63g · 脂肪 14g',
      detail: '乳清蛋白 1 勺 + 燕麦 60g + 香蕉 1 根 + 花生酱 10g + 低脂奶。'
    }
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
        <section id="home" className="hero reveal hero-stack">
          <div className="text-column">
            <p className="kicker">Personal Fitness Archive</p>
            <h2>记录训练<br />追踪进步<br />分享经验</h2>
            <span className="section-line" />
            <p>我把健身拆成可记录、可复盘的长期系统。这里展示历年训练节点、主项 PR 变化，以及补剂和工具的真实体验。</p>
          </div>
          <div className="visual-column">
            <div className="phone-hero">训练主视觉图</div>
          </div>
        </section>

        <section id="journey" className="reveal split-layout reverse">
          <div className="visual-column collage">
            <div className="photo-block tall">阶段照片 01</div>
            <div className="photo-block">阶段照片 02</div>
          </div>
          <div className="text-column">
            <p className="kicker">My Fitness Journey</p>
            <h3>几年健身历程</h3>
            <div className="timeline-list">
              <article className="timeline-item"><h4>2021</h4><p>正式开始训练，建立一周三练习惯。</p></article>
              <article className="timeline-item"><h4>2022</h4><p>第一次增肌成功，训练和饮食开始系统化。</p></article>
              <article className="timeline-item"><h4>2023</h4><p>学习恢复管理，降低伤病风险。</p></article>
              <article className="timeline-item"><h4>2024-现在</h4><p>用数据长期追踪身体变化和主项进步。</p></article>
            </div>
            <div className="metric-row">
              {metricTrend.map((m) => (
                <article className="metric-chip" key={m.label}>
                  <strong>{m.label}</strong>
                  <span>{m.start} → {m.now}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="milestones" className="reveal milestone-section">
          <div className="milestone-head">
            <p className="kicker">Milestones</p>
            <h3>关键里程碑时间轴</h3>
            <p className="muted">从第一天握起哑铃，到硬拉破百，再到三大项总和增长，用一条纵向数轴记录每个节点。</p>
          </div>
          <div className="milestone-axis">
            {milestones.map((item, idx) => (
              <article className={`milestone-item ${idx % 2 === 0 ? 'left' : 'right'}`} key={item.title}>
                <div className="milestone-card">
                  <div className="milestone-content">
                    <p className="milestone-year">{item.year}</p>
                    <h4>{item.title}</h4>
                    <p>{item.detail}</p>
                  </div>
                  <div className="milestone-media">{item.media}</div>
                </div>
                <span className="milestone-dot" aria-hidden="true" />
              </article>
            ))}
          </div>
        </section>

        <section id="progress" className="reveal split-layout">
          <div className="text-column">
            <p className="kicker">PR & Progression</p>
            <h3>动作 PR 和重量更迭</h3>
            <p className="muted">输入当天训练重量，系统会自动和历史 PR 对比，快速判断当前状态。</p>
            <div className="lift-list">
              <LiftCompare lift="卧推" prs={prs} />
              <LiftCompare lift="深蹲" prs={prs} />
              <LiftCompare lift="硬拉" prs={prs} />
            </div>
          </div>
          <HomeTrend prs={prs} />
        </section>

        <section id="supplements" className="reveal split-layout">
          <div className="visual-column">
            <div className="phone-hero soft">补剂 / 工具图片位</div>
          </div>
          <div className="text-column">
            <p className="kicker">Supplements & Tools</p>
            <h3>补剂与工具评价</h3>
            <div className="review-list">
              {reviews.map((item) => (
                <article className="review-row" key={item.id}>
                  <p className="muted">{item.type}</p>
                  <h4>{item.name}</h4>
                  <p>{'★'.repeat(Math.round(item.score))} {item.score}/5 · {item.note}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="reveal split-layout">
          <div className="text-column">
            <p className="kicker">Diet & Workout Notes</p>
            <h3>饮食与训练技巧</h3>
            <div className="plain-list">
              {dietPlans.map((p) => (
                <article key={p.title}>
                  <h4>{p.title}</h4>
                  <p>{p.detail}</p>
                </article>
              ))}
            </div>
            <ul className="tips-list">
              {workoutTips.map((tip) => <li key={tip}>{tip}</li>)}
            </ul>
          </div>
          <div className="visual-column">
            <div className="phone-hero soft">动作示范视频 / 动图位</div>
          </div>
        </section>


        <section id="recipes" className="reveal split-layout recipe-section">
          <div className="visual-column">
            <div className="phone-hero soft">我的增肌食谱实拍 / 备餐视频位</div>
          </div>
          <div className="text-column">
            <p className="kicker">My Bulking Recipes</p>
            <h3>自创增肌食谱</h3>
            <div className="recipe-list">
              {bulkRecipes.map((recipe) => (
                <article key={recipe.name} className="recipe-card">
                  <h4>{recipe.name}</h4>
                  <p className="macro">{recipe.macro}</p>
                  <p>{recipe.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="contact-line reveal">
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
