const select = document.getElementById('crypto-select');
const form = document.getElementById('achat-form');
const body = document.getElementById('purchases-body');
let coinList = [];

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
    price: row.children[2].textContent
  }));
  localStorage.setItem('purchases', JSON.stringify(purchases));
}

function addRow({ crypto, quantity, price }) {
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
  body.appendChild(row);
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const crypto = select.value.trim();
  const quantity = document.getElementById('quantity').value;
  const price = document.getElementById('price').value;
  if (!crypto || !quantity || !price) return;

  const symbol = select.options[select.selectedIndex].textContent;
  addRow({ crypto: symbol, quantity, price });
  save();
  form.reset();
});

(function init() {
  fetch('https://api.coingecko.com/api/v3/coins/list')
    .then(res => res.json())
    .then(data => {
      coinList = data;
      populateSelect();
      const saved = JSON.parse(localStorage.getItem('purchases') || '[]');
      saved.forEach(addRow);
    });
})();
