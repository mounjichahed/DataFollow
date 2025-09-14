const select = document.getElementById('crypto-select');
const form = document.getElementById('achat-form');
const body = document.getElementById('purchases-body');
const quantityInput = document.getElementById('quantity');
const priceInput = document.getElementById('price');
const totalInput = document.getElementById('total');
let coinList = [];

function getCoinList() {
  const cached = localStorage.getItem('coinList');
  if (cached) {
    coinList = JSON.parse(cached);
    return Promise.resolve();
  }
  return fetch('https://api.coingecko.com/api/v3/coins/list')
    .then(res => res.json())
    .then(data => {
      coinList = data;
      localStorage.setItem('coinList', JSON.stringify(data));
    });
}

function populateSelect() {
  const emptyOption = document.createElement('option');
  emptyOption.value = '';
  emptyOption.textContent = '';
  select.appendChild(emptyOption);

  coinList.forEach(coin => {
    const option = document.createElement('option');
    option.value = coin.id;
    option.textContent = coin.symbol.toUpperCase();
    select.appendChild(option);
  });
}

function save() {
  const purchases = Array.from(body.querySelectorAll('tr')).map(row => ({
    crypto: row.children[0].textContent,
    quantity: row.children[1].textContent,
    price: row.children[2].textContent,
    total: row.children[3].textContent
  }));
  localStorage.setItem('purchases', JSON.stringify(purchases));
}

function addRow({ crypto, quantity, price, total }) {
  const row = document.createElement('tr');
  const cCell = document.createElement('td');
  cCell.textContent = crypto;
  row.appendChild(cCell);
  const qCell = document.createElement('td');
  qCell.textContent = quantity;
  row.appendChild(qCell);
  const pCell = document.createElement('td');
  pCell.textContent = price;
  row.appendChild(pCell);
  const tCell = document.createElement('td');
  tCell.textContent = total;
  row.appendChild(tCell);
  body.appendChild(row);
}

function updateTotal() {
  const q = parseFloat(quantityInput.value) || 0;
  const p = parseFloat(priceInput.value) || 0;
  totalInput.value = (q * p).toFixed(2);
}

quantityInput.addEventListener('input', updateTotal);
priceInput.addEventListener('input', updateTotal);

form.addEventListener('submit', e => {
  e.preventDefault();
  const crypto = select.value.trim();
  const quantity = quantityInput.value;
  const price = priceInput.value;
  const total = totalInput.value;
  if (!crypto || !quantity || !price) return;

  const symbol = select.options[select.selectedIndex].textContent;
  addRow({ crypto: symbol, quantity, price, total });
  save();
  const portfolio = JSON.parse(localStorage.getItem('portfolio') || '[]');
  portfolio.push({ id: crypto, date: new Date().toISOString().slice(0,10), amount: quantity, price, currency: 'eur' });
  localStorage.setItem('portfolio', JSON.stringify(portfolio));
  form.reset();
  updateTotal();
});

(function init() {
  getCoinList().then(() => {
    populateSelect();
    const saved = JSON.parse(localStorage.getItem('purchases') || '[]');
    saved.forEach(addRow);
    updateTotal();
  });
})();
