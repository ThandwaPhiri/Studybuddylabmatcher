/* ============================================
   Study-Buddy Lab Matcher — App Logic
   ============================================ */

const CURRENT_USER = { initials: 'TP', username: 'tphiri' };

let requests = [
  {
    id: 1, module: 'PROG6221', section: 'Practical 3',
    venue: 'Lab 2A – Main Building', time: '10:00', posted: '9 min ago',
    poster: 'TP', username: 'tphiri', status: 'open', urgent: true
  },
  {
    id: 2, module: 'HCIN6222', section: 'Lab Session 4',
    venue: 'Lab 3B – Tech Block', time: '11:30', posted: '22 min ago',
    poster: 'KM', username: 'kmolefe', status: 'open', urgent: false
  },
  {
    id: 3, module: 'CMPG6221', section: 'Workshop 2',
    venue: 'Lab 4 – Science Wing', time: '14:00', posted: '1 hr ago',
    poster: 'LN', username: 'lnkosi', status: 'matched', urgent: false
  },
  {
    id: 4, module: 'MAST6111', section: 'Tutorial 5',
    venue: 'Computer Lab 5 – Library', time: '09:00', posted: '3 min ago',
    poster: 'AS', username: 'asmith', status: 'open', urgent: true
  },
  {
    id: 5, module: 'DISD6211', section: 'Practical 1',
    venue: 'Lab 6C – Innovation Hub', time: '15:30', posted: '45 min ago',
    poster: 'BM', username: 'bmoyo', status: 'open', urgent: false
  }
];

let nextId = 6;
let currentFilter = 'All';

// ── Toast ──
function showToast(message, type = 'info', icon = null) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const icons = { success: '✅', warning: '⚠️', error: '❌', info: '📢' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icon || icons[type]}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3600);
}

// ── Modal ──
function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add('open');
}
function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('open');
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.classList.remove('open');
    });
  });
  updateStats();
});

// ── Render Request Cards ──
function renderRequests(filter = 'All', container = 'requestList') {
  const list = document.getElementById(container);
  if (!list) return;
  const filtered = filter === 'All' ? requests : requests.filter(r => r.module === filter);
  if (filtered.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <div class="empty-title">No requests found</div>
        <p>Nobody has posted a request for ${filter} yet. Be the first!</p>
      </div>`;
    return;
  }
  list.innerHTML = filtered.map(r => `
    <div class="request-card ${r.status === 'matched' ? 'matched' : ''}" id="card-${r.id}">
      <div class="request-module">${r.module}</div>
      <div class="request-info">
        <div class="request-title">${r.section} · ${r.module}</div>
        <div class="request-meta">
          <span>📍 ${r.venue}</span>
          <span>🕐 ${r.time}</span>
          <span>👤 @${r.username}</span>
          <span>⏱ ${r.posted}</span>
        </div>
      </div>
      <div class="request-actions">
        ${r.urgent ? '<span class="badge badge-urgent"><span class="badge-dot"></span>Urgent</span>' : ''}
        <span class="badge ${r.status === 'open' ? 'badge-open' : 'badge-matched'}">
          <span class="badge-dot"></span>
          ${r.status === 'open' ? 'Open' : 'Matched'}
        </span>
        ${r.status === 'open' && r.username !== CURRENT_USER.username
          ? `<button class="btn btn-primary btn-sm" onclick="matchRequest(${r.id})">Match Me</button>`
          : r.username === CURRENT_USER.username
          ? `<button class="btn btn-danger btn-sm" onclick="withdrawRequest(${r.id})">Withdraw</button>`
          : `<button class="btn btn-ghost btn-sm" disabled>Filled</button>`
        }
      </div>
    </div>
  `).join('');
}

// ── Match ──
function matchRequest(id) {
  const req = requests.find(r => r.id === id);
  if (!req || req.status !== 'open') return;
  req.status = 'matched';
  const card = document.getElementById(`card-${id}`);
  if (card) {
    card.classList.add('matched');
    card.querySelector('.badge').className = 'badge badge-matched';
    card.querySelector('.badge').innerHTML = '<span class="badge-dot"></span>Matched';
    const btn = card.querySelector('.btn-primary');
    if (btn) { btn.textContent = 'Filled'; btn.disabled = true; btn.className = 'btn btn-ghost btn-sm'; }
  }
  showToast(`🎉 Matched for ${req.module} – ${req.section}!`, 'success');
  updateStats();
  if (document.getElementById('successModal')) {
    document.getElementById('matchedModule').textContent = req.module;
    document.getElementById('matchedSection').textContent = req.section;
    document.getElementById('matchedVenue').textContent = req.venue;
    openModal('successModal');
  }
}

// ── Withdraw ──
function withdrawRequest(id) {
  if (!confirm('Are you sure you want to withdraw this request?')) return;
  requests = requests.filter(r => r.id !== id);
  renderRequests(currentFilter);
  showToast('Request withdrawn.', 'warning', '↩️');
  updateStats();
}

// ── Stats ──
function updateStats() {
  const open = requests.filter(r => r.status === 'open').length;
  const matched = requests.filter(r => r.status === 'matched').length;
  const el = id => document.getElementById(id);
  if (el('statOpen')) el('statOpen').textContent = open;
  if (el('statMatched')) el('statMatched').textContent = matched;
  if (el('statTotal')) el('statTotal').textContent = requests.length;
}

// ── Filter ──
function setFilter(module) {
  currentFilter = module;
  document.querySelectorAll('.chip').forEach(c => {
    c.classList.toggle('active', c.dataset.module === module);
    c.setAttribute('aria-pressed', c.dataset.module === module ? 'true' : 'false');
  });
  renderRequests(module);
}

// ── Post Form (post.html) ──
let postStep = 1;
function nextStep(step) {
  if (step === 2) {
    const mod = document.getElementById('moduleSelect')?.value;
    const sec = document.getElementById('sectionInput')?.value?.trim();
    if (!mod) { showToast('Please select a module.', 'error'); return; }
    if (!sec) { showToast('Please enter the practical or section.', 'error'); return; }
    document.getElementById('step1Content').style.display = 'none';
    document.getElementById('step2Content').style.display = 'block';
    updateStepUI(2);
  } else if (step === 3) {
    const venue = document.getElementById('venueSelect')?.value;
    const time = document.getElementById('timeInput')?.value;
    if (!venue) { showToast('Please select a venue.', 'error'); return; }
    if (!time) { showToast('Please enter a time.', 'error'); return; }
    const mod = document.getElementById('moduleSelect').value;
    const sec = document.getElementById('sectionInput').value;
    document.getElementById('reviewModule').textContent = mod;
    document.getElementById('reviewSection').textContent = sec;
    document.getElementById('reviewVenue').textContent = venue;
    document.getElementById('reviewTime').textContent = time;
    document.getElementById('step2Content').style.display = 'none';
    document.getElementById('step3Content').style.display = 'block';
    updateStepUI(3);
  }
  postStep = step;
}
function prevStep(step) {
  if (step === 1) {
    document.getElementById('step2Content').style.display = 'none';
    document.getElementById('step1Content').style.display = 'block';
    updateStepUI(1);
  }
  if (step === 2) {
    document.getElementById('step3Content').style.display = 'none';
    document.getElementById('step2Content').style.display = 'block';
    updateStepUI(2);
  }
  postStep = step;
}
function updateStepUI(active) {
  document.querySelectorAll('.step').forEach((el, i) => {
    el.classList.toggle('active', i + 1 === active);
    el.classList.toggle('done', i + 1 < active);
  });
}
function submitRequest() {
  const mod = document.getElementById('moduleSelect')?.value;
  const sec = document.getElementById('sectionInput')?.value;
  const venue = document.getElementById('venueSelect')?.value;
  const time = document.getElementById('timeInput')?.value;
  const urgent = document.getElementById('urgentCheck')?.checked || false;
  requests.unshift({
    id: nextId++, module: mod, section: sec,
    venue, time, posted: 'Just now',
    poster: CURRENT_USER.initials, username: CURRENT_USER.username,
    status: 'open', urgent
  });
  showToast('Your request has been posted!', 'success', '📢');
  setTimeout(() => { window.location.href = 'index.html'; }, 1200);
}
