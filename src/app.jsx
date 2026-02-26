const { useEffect, useState } = React;

const API_BASE = '/api';

const contactLinks = [
  { label: 'GitHub', short: '◎', href: 'https://github.com/yueRRyin87' },
  { label: 'LinkedIn', short: '▣', href: 'https://linkedin.com' },
];

const milestones = [
  {
    year: '2021.04',
    title: '第一次接触力量训练',
    detail: '需要42.5kg辅助的引体向上',
    media: '训练日志照片 / 视频'
  },
  {
    year: '2023.11',
    title: '第一次成功引体向上',
    detail: '从器械辅助到独立完成 1 次对握引体，背部训练进入新阶段',
    media: '引体向上图片'
  },
  {
    year: '2024.11',
    title: '第一次硬拉破 100kg/rep',
    detail: '硬拉做到 102.5kg，动作稳定性和核心控制都更加稳定。',
    media: '硬拉 100kg'
  },
  {
    year: '2025.112',
    title: '三大项总和持续增长',
    detail: '从 100kg 提升到 230kg，三大项缓慢提升',
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
    ['supplements', '补剂与工具'],
    ['recipes', '增肌食谱']
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

function App() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const load = async () => {
      const reviewsRes = await fetch(`${API_BASE}/reviews`).then((r) => r.json());
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
  }, [reviews]);

  const metricTrend = [
    { label: '体重', start: '58kg', now: '67kg' },
    { label: '体脂率', start: '24%', now: '17%' },
    { label: '骨骼肌', start: '22kg', now: '29kg' }
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
      name: 'ON摩卡巧克力蛋白奶昔',
      macro: '约 300 kcal · 蛋白质 28g · 碳水 8g · 脂肪 8g',
      detail: '双重巧克力乳清蛋白 1 勺 + 牛奶 + 冻干咖啡，比摩卡咖啡美味'
    }
  ];

  return (
    <div>
      <Navbar />
      <main className="container section-space">
        <section id="home" className="hero reveal hero-stack">
          <div className="text-column">
            <p className="kicker">Personal Fitness Archive</p>
            <h2>记录训练<br />追踪进步</h2>
            <span className="section-line" />
            <p>我和健身的三年</p>
          </div>
          <div className="visual-column">
           <div className="phone-hero">
              <img src="images/main_visual.jpg" alt="训练主视觉图" />
          </div>
          </div>
        </section>

        <section id="journey" className="reveal split-layout reverse">
          <div className="visual-column collage">
            <div className="photo-block tall">
                <img src="/images/progress1.jpg" alt="训练阶段 1" />
              </div>
              <div className="photo-block">
                <img src="/images/progress2.jpg" alt="训练阶段 2" />
                </div>
          </div>
          <div className="text-column">
            <p className="kicker">My Fitness Journey</p>
            <h3>4年健身历程</h3>
            <div className="timeline-list">
              <article className="timeline-item"><h4>2021</h4><p>正式开始训练，建立一周二练习惯</p></article>
              <article className="timeline-item"><h4>2022</h4><p>增加蛋白质摄入，增肌效果明显</p></article>
              <article className="timeline-item"><h4>2023</h4><p>学习恢复管理和运动康复，降低伤病风险</p></article>
              <article className="timeline-item"><h4>2024-现在</h4><p>四分化训练</p></article>
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
            <p className="muted">从第一次握起哑铃，到硬拉破百，再到三大项总和增长，用一条纵向数轴记录我的每个节点</p>
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
