// ============================================
// TrendSeer – Fashion AI Prediction Platform
// JavaScript – Interactions & Animations
// ============================================

// ── Navigation ──
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// Close mobile nav on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// Active link highlight on scroll
const sections = document.querySelectorAll('section, footer');
const navAnchors = navLinks.querySelectorAll('a:not(.nav-cta)');

function updateActiveLink() {
  let current = '';
  sections.forEach(sec => {
    const top = sec.offsetTop - 140;
    if (window.scrollY >= top) current = sec.getAttribute('id');
  });
  navAnchors.forEach(a => {
    a.classList.remove('active');
    if (a.getAttribute('href') === '#' + current) a.classList.add('active');
  });
}
window.addEventListener('scroll', updateActiveLink);

// Navbar background on scroll
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.style.background = 'rgba(255,255,255,0.8)';
    navbar.style.boxShadow = '0 4px 30px rgba(228,140,164,0.15), 0 1px 3px rgba(0,0,0,0.06)';
  } else {
    navbar.style.background = 'rgba(255,255,255,0.55)';
    navbar.style.boxShadow = '0 4px 30px rgba(228,140,164,0.12), 0 1px 3px rgba(0,0,0,0.04)';
  }
});

// ── Scroll Reveal ──
const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.15 });

revealElements.forEach(el => revealObserver.observe(el));

// ── Prediction Category Cards ──
const predictCards = document.querySelectorAll('.predict-card');
predictCards.forEach(card => {
  card.addEventListener('click', () => {
    predictCards.forEach(c => c.classList.remove('active'));
    card.classList.add('active');
  });
});

// ── Gender Cards – Expand / Collapse ──
const genderCards = document.querySelectorAll('.gender-card');
genderCards.forEach(card => {
  const header = card.querySelector('.gender-card-header');
  const moreTags = card.querySelectorAll('.more-tag');

  const toggleExpand = () => {
    card.classList.toggle('expanded');
    const moreTag = card.querySelector('.more-tag');
    if (card.classList.contains('expanded')) {
      moreTag.textContent = 'Show less';
    } else {
      const gender = card.dataset.gender;
      moreTag.textContent = gender === 'female' ? '+5 more' : '+4 more';
    }
  };

  header.addEventListener('click', toggleExpand);
  moreTags.forEach(t => t.addEventListener('click', toggleExpand));
});

// ── Select items from Gender cards ──
const allItems = document.querySelectorAll('.expanded-item, .gender-tag:not(.more-tag)');
allItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.stopPropagation();
    const productName = item.dataset.item;
    if (!productName) return;

    // Update selected product display
    document.getElementById('selected-product-name').textContent = productName;
    document.getElementById('pred-product').textContent = productName;

    // Determine gender
    const card = item.closest('.gender-card');
    if (card) {
      const gender = card.dataset.gender;
      const catLabel = gender === 'female' ? 'Female Fashion' : 'Male Fashion';
      document.getElementById('selected-product-category').textContent = catLabel;
      document.getElementById('pred-category').textContent = catLabel;
    }

    // Update icon
    const iconMap = {
      'Dresses': '👗', 'Skirts': '🩱', 'Jeans': '👖', 'Shirts': '👔',
      'Hoodies': '🧥', 'Jackets': '🧥', 'Sneakers': '👟', 'Accessories': '👜',
      'High Heels': '👠', 'T-Shirts': '👕', 'Shorts': '🩳'
    };
    const icon = iconMap[productName] || '🛍️';
    document.querySelector('.product-selected-icon').textContent = icon;

    // Highlight selected item
    document.querySelectorAll('.expanded-item').forEach(i => i.classList.remove('selected'));
    if (item.classList.contains('expanded-item')) item.classList.add('selected');

    // Scroll to product section
    setTimeout(() => {
      document.getElementById('product-section').scrollIntoView({ behavior: 'smooth' });
    }, 300);
  });
});

// ── Price Range Slider ──
const priceRange = document.getElementById('price-range');
const rangeDisplay = document.getElementById('range-display');
const predPrice = document.getElementById('pred-price');

priceRange.addEventListener('input', () => {
  const val = priceRange.value;
  rangeDisplay.textContent = `Up to $${val}`;
  predPrice.textContent = `Up to $${val}`;
});

// ── Prediction ──
function runPrediction() {
  const btn = document.getElementById('btn-predict');
  const results = document.getElementById('results-panel');

  btn.classList.add('loading');
  results.classList.remove('visible');

  // Simulate AI processing
  setTimeout(() => {
    btn.classList.remove('loading');

    // Generate randomised results
    const confidence = Math.floor(Math.random() * 25) + 72; // 72-97
    const demand = Math.floor(Math.random() * 20) + 78;     // 78-98

    document.getElementById('res-confidence').innerHTML = `${confidence}<span class="unit">%</span>`;
    document.getElementById('prog-confidence').style.width = confidence + '%';

    document.getElementById('res-demand').innerHTML = `${demand}<span class="unit">/100</span>`;
    document.getElementById('prog-demand').style.width = demand + '%';

    // Trend direction
    const dir = document.getElementById('trend-direction');
    if (confidence > 85) {
      dir.textContent = '↑ Trending Up';
      dir.className = 'trend-indicator trend-up';
      document.getElementById('res-popularity').textContent = 'Rising';
    } else {
      dir.textContent = '→ Stable';
      dir.className = 'trend-indicator trend-stable';
      document.getElementById('res-popularity').textContent = 'Stable';
    }

    // Mini chart
    const chart = document.getElementById('mini-chart');
    chart.innerHTML = '';
    const colors = ['var(--pink-200)', 'var(--pink-300)', 'var(--sage-200)', 'var(--pink-400)', 'var(--sage-300)', 'var(--pink-300)', 'var(--sage-400)', 'var(--pink-500)'];
    for (let i = 0; i < 8; i++) {
      const bar = document.createElement('div');
      bar.className = 'mini-chart-bar';
      const h = Math.floor(Math.random() * 40) + 20;
      bar.style.height = h + 'px';
      bar.style.background = colors[i];
      bar.style.animationDelay = (i * 0.1) + 's';
      chart.appendChild(bar);
    }

    // Audience
    const audiences = [
      { label: 'Gen Z & Millennials', tags: ['Ages 18-34', 'Streetwear Lovers', 'Trend Setters', 'Social Media Active'] },
      { label: 'Fashion Enthusiasts', tags: ['Ages 20-40', 'Style Conscious', 'Brand Loyal', 'Early Adopters'] },
      { label: 'Young Professionals', tags: ['Ages 25-40', 'Urban Dwellers', 'Quality Seekers', 'Minimalists'] },
    ];
    const pick = audiences[Math.floor(Math.random() * audiences.length)];
    document.getElementById('res-audience-label').textContent = pick.label;
    const tagsEl = document.getElementById('audience-tags');
    tagsEl.innerHTML = '';
    pick.tags.forEach((t, i) => {
      const span = document.createElement('span');
      span.className = 'audience-tag' + (i % 2 === 1 ? ' green' : '');
      span.textContent = t;
      tagsEl.appendChild(span);
    });

    // Show results with animation
    results.classList.add('visible');
    results.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Re-trigger progress bar animations
    document.getElementById('prog-confidence').style.animation = 'none';
    document.getElementById('prog-demand').style.animation = 'none';
    requestAnimationFrame(() => {
      document.getElementById('prog-confidence').style.animation = '';
      document.getElementById('prog-demand').style.animation = '';
    });

  }, 1800);
}
