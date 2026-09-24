// Menu data — transcribed from menu.jpg. Prices in PHP. `from: true` = starting price ("+" on the printed menu).
const MENU = [
  {
    id: 'burgers', title: 'Burgers & Sandwiches', items: [
      { id: 'burrito', name: 'Burrito', img: 'burrito', price: 300 },
      { id: 'hamburger', name: 'Hamburger', img: 'hamburger', price: 200 },
      { id: 'cheeseburger', name: 'Cheeseburger', img: 'cheeseburger', price: 250 },
      { id: 'bacon-cheeseburger', name: 'Bacon Cheeseburger', img: 'cheeseburger', price: 350 },
      { id: 'extra-patty', name: 'Extra Patty', desc: 'Add to any burger', price: 100 },
      { id: 'hotdog', name: 'Hotdog', img: 'hotdog', price: 150 },
      { id: 'chicken-sandwich', name: 'Chicken Sandwich', img: 'chicken-sandwich', price: 200 },
      { id: 'chicken-cheese', name: 'Chicken Sandwich with Cheese', img: 'chicken-sandwich', price: 250 },
      { id: 'chicken-bacon-cheese', name: 'Chicken Sandwich with Bacon & Cheese', img: 'chicken-bacon-cheese', price: 300 },
    ],
  },
  {
    id: 'mains', title: 'Mains', items: [
      { id: 'steak', name: 'Steak & Fries', img: 'steak', price: 900, from: true },
      { id: 'pizza', name: 'Pizza', img: 'pizza', price: 350, from: true },
      { id: 'pasta', name: 'Pasta', img: 'pasta', price: 300, from: true },
      { id: 'salads', name: 'Salads', img: 'salads', price: 250, from: true },
    ],
  },
  {
    id: 'breakfast', title: 'Breakfast',
    note: 'Served on white bread toast with egg & your choice of bacon, ham, or cheese.',
    items: [
      { id: 'bec', name: 'Bacon, Egg & Cheese', img: 'bacon-egg-cheese', price: 150, from: true },
      { id: 'hec', name: 'Ham, Egg & Cheese', img: 'ham-egg-cheese', price: 150, from: true },
      { id: 'ec', name: 'Egg & Cheese', img: 'egg-cheese', price: 150, from: true },
      {
        id: 'pancakes', name: 'Pancakes', img: 'pancakes', options: [
          { label: '1 pc', price: 150 }, { label: '2 pcs', price: 200 }, { label: '3 pcs', price: 250 },
        ],
      },
    ],
  },
  {
    id: 'sides', title: 'Sides', items: [
      { id: 'fries', name: 'Fries', img: 'fries', options: [{ label: 'Regular', price: 150 }, { label: 'Large', price: 200 }] },
      { id: 'onion-rings', name: 'Onion Rings', img: 'onion-rings', price: 200 },
    ],
  },
  {
    id: 'drinks', title: 'Smoothies & Milkshakes',
    gallery: ['shake-strawberry', 'shake-mango', 'shake-cookies', 'shake-oreo'],
    items: [
      {
        id: 'smoothie', name: 'Smoothie', img: 'shake-mango', desc: 'Ask for today’s fruits', options: [
          { label: 'Small', price: 150 }, { label: 'Regular', price: 200 }, { label: 'Large', price: 250 }, { label: 'Premium', price: 300 },
        ],
      },
      {
        id: 'milkshake', name: 'Milkshake', img: 'shake-cookies', desc: 'Ask for today’s flavors', options: [
          { label: 'Small', price: 150 }, { label: 'Regular', price: 200 }, { label: 'Large', price: 250 }, { label: 'Premium', price: 300 },
        ],
      },
    ],
  },
];

const ITEMS = new Map(MENU.flatMap(s => s.items.map(i => [i.id, i])));
const peso = n => '₱' + n.toLocaleString('en-PH');
const $ = sel => document.querySelector(sel);
const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ---------- Order state (per-device, localStorage) ----------
const STORE_KEY = 'campcafe.order.v1';
let order = [];
try { order = JSON.parse(localStorage.getItem(STORE_KEY)) || []; } catch { order = []; }
order = order.filter(l => ITEMS.has(l.id));
const save = () => { try { localStorage.setItem(STORE_KEY, JSON.stringify(order)); } catch {} };

const unitPrice = line => {
  const item = ITEMS.get(line.id);
  return item.options ? item.options.find(o => o.label === line.opt)?.price ?? 0 : item.price;
};

function addToOrder(id, opt) {
  const line = order.find(l => l.id === id && l.opt === opt);
  if (line) line.qty++;
  else order.push({ id, opt, qty: 1 });
  save(); renderOrder();
}

function changeQty(idx, delta) {
  order[idx].qty += delta;
  if (order[idx].qty <= 0) order.splice(idx, 1);
  save(); renderOrder();
}

// ---------- Menu rendering ----------
function renderMenu() {
  $('#cats').innerHTML = MENU.map(s => `<a href="#${s.id}" data-id="${s.id}">${esc(s.title)}</a>`).join('')
    + `<a href="#specials" data-id="specials">Specials</a>`;

  $('#menu').innerHTML = MENU.map(s => `
    <section class="section" id="${s.id}">
      <div class="section-head"><h2>${esc(s.title)}</h2></div>
      ${s.note ? `<p class="section-note">${esc(s.note)}</p>` : ''}
      ${s.gallery ? `<div class="shakes">${s.gallery.map(g => `<img src="img/${g}.jpg" alt="" loading="lazy">`).join('')}</div>` : ''}
      <div class="grid">${s.items.map(renderItem).join('')}</div>
    </section>`).join('');
}

function renderItem(item) {
  const img = item.img ? `<img src="img/${item.img}.jpg" alt="${esc(item.name)}" loading="lazy">` : '';
  const opts = item.options
    ? `<div class="opts" role="group" aria-label="Size">${item.options.map((o, i) =>
        `<button class="opt" data-opt="${esc(o.label)}" aria-pressed="${i === 0}">${esc(o.label)} · ${peso(o.price)}</button>`).join('')}</div>`
    : '';
  const price = item.options
    ? `<span class="price" data-price>${peso(item.options[0].price)}</span>`
    : `<span class="price">${item.from ? '<span class="from">from</span>' : ''}${peso(item.price)}${item.from ? '+' : ''}</span>`;
  return `
    <article class="item" data-id="${item.id}">
      ${img}
      <div class="item-body">
        <h3>${esc(item.name)}</h3>
        ${item.desc ? `<p class="desc">${esc(item.desc)}</p>` : ''}
        ${opts}
        <div class="item-foot">${price}<button class="add" aria-label="Add ${esc(item.name)} to order">+ Add</button></div>
      </div>
    </article>`;
}

$('#menu').addEventListener('click', e => {
  const card = e.target.closest('.item');
  if (!card) return;
  const item = ITEMS.get(card.dataset.id);

  const optBtn = e.target.closest('.opt');
  if (optBtn) {
    card.querySelectorAll('.opt').forEach(b => b.setAttribute('aria-pressed', b === optBtn));
    const o = item.options.find(o => o.label === optBtn.dataset.opt);
    card.querySelector('[data-price]').textContent = peso(o.price);
    return;
  }

  const addBtn = e.target.closest('.add');
  if (addBtn) {
    const opt = item.options ? card.querySelector('.opt[aria-pressed="true"]').dataset.opt : undefined;
    addToOrder(item.id, opt);
    addBtn.textContent = '✓ Added';
    addBtn.classList.add('added');
    clearTimeout(addBtn._t);
    addBtn._t = setTimeout(() => { addBtn.textContent = '+ Add'; addBtn.classList.remove('added'); }, 900);
  }
});

// ---------- Order sheet ----------
function renderOrder() {
  const count = order.reduce((n, l) => n + l.qty, 0);
  const total = order.reduce((n, l) => n + unitPrice(l) * l.qty, 0);
  const hasFrom = order.some(l => ITEMS.get(l.id).from);
  const totalText = peso(total) + (hasFrom ? '+' : '');

  $('#orderFab').hidden = count === 0;
  $('#orderCount').textContent = count;
  $('#fabTotal').textContent = totalText;
  $('#orderTotal').textContent = totalText;
  $('#orderNote').textContent = hasFrom ? 'Some items have starting prices — final price depends on your choice.' : '';

  $('#orderList').innerHTML = order.length
    ? order.map((l, i) => {
        const item = ITEMS.get(l.id);
        return `<li>
          <div class="name">${esc(item.name)}${l.opt ? `<small>${esc(l.opt)}</small>` : ''}</div>
          <div class="qty"><button data-idx="${i}" data-d="-1" aria-label="Less">−</button><span>${l.qty}</span><button data-idx="${i}" data-d="1" aria-label="More">+</button></div>
          <div class="line-price">${peso(unitPrice(l) * l.qty)}${item.from ? '+' : ''}</div>
        </li>`;
      }).join('')
    : '<li class="empty">Nothing yet — tap “+ Add” on any dish.</li>';
}

const sheet = $('#orderSheet');
$('#orderFab').addEventListener('click', () => sheet.showModal());
$('#closeSheet').addEventListener('click', () => sheet.close());
$('#closeSheet2').addEventListener('click', () => sheet.close());
sheet.addEventListener('click', e => { if (e.target === sheet) sheet.close(); });
$('#orderList').addEventListener('click', e => {
  const b = e.target.closest('button[data-idx]');
  if (b) changeQty(+b.dataset.idx, +b.dataset.d);
});
$('#clearOrder').addEventListener('click', () => { order = []; save(); renderOrder(); sheet.close(); });

// ---------- Share (QR on screen + native share sheet) ----------
// Keep in sync with img/qr.svg — regenerate the QR if this URL changes.
const SHARE_URL = 'https://camp-cafe.pages.dev/';
const shareSheet = $('#shareSheet');
$('#shareUrl').textContent = SHARE_URL.replace(/^https:\/\/|\/$/g, '');

const openShare = () => shareSheet.showModal();
$('#shareBtn').addEventListener('click', openShare);
$('#shareBtn2').addEventListener('click', openShare);
shareSheet.querySelector('[data-close]').addEventListener('click', () => shareSheet.close());
shareSheet.addEventListener('click', e => { if (e.target === shareSheet) shareSheet.close(); });

const copyBtn = $('#copyLink');
copyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(SHARE_URL);
    copyBtn.textContent = '✓ Copied';
  } catch {
    prompt('Copy this link:', SHARE_URL);
  }
  setTimeout(() => { copyBtn.textContent = 'Copy link'; }, 1500);
});

const nativeBtn = $('#nativeShare');
if (navigator.share) {
  nativeBtn.addEventListener('click', () => {
    navigator.share({ title: 'Camp Cafe Menu', text: 'Check out the Camp Cafe menu 🏕️', url: SHARE_URL }).catch(() => {});
  });
} else {
  nativeBtn.hidden = true; // desktop browsers without Web Share: QR + copy link only
}

// ---------- Active category highlight ----------
function watchSections() {
  const nav = $('#cats');
  const links = new Map([...nav.querySelectorAll('a')].map(a => [a.dataset.id, a]));

  // Only scroll the nav strip horizontally. scrollIntoView() would also scroll the window,
  // which cancels an in-flight smooth scroll and leaves the tapped section unreached.
  const setActive = id => {
    links.forEach(a => a.classList.toggle('active', a.dataset.id === id));
    const a = links.get(id);
    nav.scrollTo({ left: a.offsetLeft - (nav.clientWidth - a.offsetWidth) / 2, behavior: 'smooth' });
  };

  let jumping = false, jumpTimer;
  nav.addEventListener('click', e => {
    const a = e.target.closest('a');
    if (!a) return;
    e.preventDefault();
    const target = document.getElementById(a.dataset.id);
    const top = target.getBoundingClientRect().top + window.scrollY - nav.offsetHeight - 8;
    jumping = true;
    clearTimeout(jumpTimer);
    jumpTimer = setTimeout(() => { jumping = false; }, 1000);
    setActive(a.dataset.id);
    window.scrollTo({ top, behavior: 'smooth' });
    history.replaceState(null, '', '#' + a.dataset.id);
  });

  const obs = new IntersectionObserver(entries => {
    if (jumping) return;
    entries.forEach(en => { if (en.isIntersecting) setActive(en.target.id); });
  }, { rootMargin: '-40% 0px -55% 0px' });
  document.querySelectorAll('.section, #specials').forEach(s => obs.observe(s));
}

renderMenu();
renderOrder();
watchSections();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js'));
}
