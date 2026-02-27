const { useEffect, useRef, useState } = React;

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
    media: '/assets/images/first_lift.jpg',
    mediaAlt: '第一次接触力量训练'
  },
  {
    year: '2023.11',
    title: '第一次成功引体向上',
    detail: '从器械辅助到独立完成 1 次对握引体，背部训练进入新阶段',
    media: '/assets/images/pullup.jpg',
    mediaAlt: '第一次成功引体向上'
  },
  {
    year: '2024.11',
    title: '第一次硬拉破 100kg/rep',
    detail: '硬拉做到 102.5kg，动作稳定性和核心控制都更加稳定。',
    media: '/assets/images/deadlift-100.jpg',
    mediaAlt: '硬拉突破 100kg'
  },
  {
    year: '2025.112',
    title: '三大项总和持续增长',
    detail: '从 100kg 提升到 230kg，三大项缓慢提升',
    media: '/assets/images/personal_records.jpg',
    mediaAlt: '三大项总和趋势'
  }
];

const progressSlides = [
  { src: '/assets/images/progress1.jpg', alt: '训练阶段 1', label: '阶段 1' },
  { src: '/assets/images/progress2.jpg', alt: '训练阶段 2', label: '阶段 2' }
];

const defaultReviews = [
  { id: 1, name: '肌酸一水合物', type: '补剂', score: 4.8, note: '力量输出稳定提升，性价比高。' },
  { id: 2, name: '乳清蛋白', type: '补剂', score: 4.5, note: '补足蛋白方便，训练后恢复更顺畅。' },
  { id: 3, name: '拉力带', type: '工具', score: 4.6, note: '背部训练末组更集中，减少握力短板干扰。' },
  { id: 4, name: '举重腰带', type: '工具', score: 4.3, note: '大重量深蹲和硬拉安全感明显提高。' }
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
  const [progressIndex, setProgressIndex] = useState(0);
  const touchStartX = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const reviewsRes = await fetch(`${API_BASE}/reviews`).then((r) => r.json());
        setReviews(Array.isArray(reviewsRes) && reviewsRes.length ? reviewsRes : defaultReviews);
      } catch {
        setReviews(defaultReviews);
      }
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

  const prevProgress = () => {
    setProgressIndex((current) => (current - 1 + progressSlides.length) % progressSlides.length);
  };

  const nextProgress = () => {
    setProgressIndex((current) => (current + 1) % progressSlides.length);
  };

  const onTouchStart = (event) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const onTouchEnd = (event) => {
    if (touchStartX.current === null) return;
    const endX = event.changedTouches[0].clientX;
    const distance = endX - touchStartX.current;

    if (Math.abs(distance) > 35) {
      if (distance > 0) prevProgress();
      else nextProgress();
    }
    touchStartX.current = null;
  };

  return (
    <div>
      <Navbar />
      <main className="container section-space">
        <section id="home" className="hero reveal hero-stack">
          <div className="text-column">
            <p className="kicker">Personal Fitness Archive</p>
            <h2>记录训练<br />追踪进步</h2>
            <span className="section-line" />
            <p>我和健身的四年</p>
          </div>
          <div className="visual-column">
            <div className="phone-hero">
              <img src="/assets/images/main_visual.jpg" alt="训练主视觉图" />
            </div>
          </div>
        </section>

        <section id="journey" className="reveal split-layout reverse">
          <div className="visual-column">
            <div className="progress-slider" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
              <div className="progress-track" style={{ transform: `translateX(-${progressIndex * 100}%)` }}>
                {progressSlides.map((slide) => (
                  <div className="progress-slide" key={slide.src}>
                    <img src={slide.src} alt={slide.alt} />
                  </div>
                ))}
              </div>
              <button type="button" className="progress-nav left" onClick={prevProgress} aria-label="上一张">‹</button>
              <button type="button" className="progress-nav right" onClick={nextProgress} aria-label="下一张">›</button>
            </div>
            <div className="progress-dots" role="tablist" aria-label="训练进度图片">
              {progressSlides.map((slide, index) => (
                <button
                  key={slide.src}
                  type="button"
                  className={`progress-dot ${index === progressIndex ? 'active' : ''}`}
                  onClick={() => setProgressIndex(index)}
                  aria-label={`查看${slide.label}`}
                />
              ))}
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
                  <div className="milestone-media">
                    <img src={item.media} alt={item.mediaAlt} loading="lazy" />
                  </div>
                </div>
                <span className="milestone-dot" aria-hidden="true" />
              </article>
            ))}
          </div>
        </section>

        <section id="supplements" className="reveal split-layout">
          <div className="visual-column">
            <div className="phone-hero soft">
              <img src="/assets/images/straps.jpg" alt="护腕和训练工具" loading="lazy" />
            </div>
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

        <section id="recipes" className="reveal split-layout reverse recipe-section">
          <div className="visual-column">
                       <div className="phone-hero soft">
              <img src="/assets/images/after_meals.jpg" alt="增肌期饮食" loading="lazy" />
            </div>
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
