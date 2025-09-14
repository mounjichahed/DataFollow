const tbody = document.getElementById('portfolio-body');
const addBtn = document.getElementById('add-crypto');
let coinList = [];

function savePortfolio() {
  const cryptos = Array.from(tbody.querySelectorAll('select.crypto-name'))
    .map(select => select.value.trim())
    .filter(Boolean);
  localStorage.setItem('portfolio', JSON.stringify(cryptos));
}

function populateSelect(select, selected = '') {
  const emptyOption = document.createElement('option');
  emptyOption.value = '';
  emptyOption.textContent = '';
  select.appendChild(emptyOption);

  coinList.forEach(coin => {
    const option = document.createElement('option');
    option.value = coin.id;
    option.textContent = coin.symbol.toUpperCase();
    if (coin.id === selected) {
      option.selected = true;
    }
    select.appendChild(option);
  });
}

function addRow(name = '') {
  const row = document.createElement('tr');

  const nameCell = document.createElement('td');
  const nameSelect = document.createElement('select');
  nameSelect.classList.add('crypto-name');
  populateSelect(nameSelect, name);
  nameCell.appendChild(nameSelect);
  row.appendChild(nameCell);

  const eurCell = document.createElement('td');
  eurCell.textContent = '-';
  row.appendChild(eurCell);

  const usdCell = document.createElement('td');
  usdCell.textContent = '-';
  row.appendChild(usdCell);

  function update() {
    const crypto = nameSelect.value.trim().toLowerCase();
    if (!crypto) {
      eurCell.textContent = '-';
      usdCell.textContent = '-';
      savePortfolio();
      return;
    }
    fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${crypto}&vs_currencies=eur,usd`)
      .then(res => res.json())
      .then(data => {
        if (data[crypto]) {
          eurCell.textContent = data[crypto].eur;
          usdCell.textContent = data[crypto].usd;
        } else {
          eurCell.textContent = 'N/A';
          usdCell.textContent = 'N/A';
        }
      })
      .catch(() => {
        eurCell.textContent = 'Err';
        usdCell.textContent = 'Err';
      })
      .finally(savePortfolio);
  }

  nameSelect.addEventListener('change', update);
  tbody.appendChild(row);

  if (name) {
    update();
  }
}

addBtn.addEventListener('click', () => addRow());

(function init() {
  fetch('https://api.coingecko.com/api/v3/coins/list')
    .then(res => res.json())
    .then(data => {
      coinList = data;
      const saved = JSON.parse(localStorage.getItem('portfolio') || '[]');
      if (saved.length) {
        saved.forEach(name => addRow(name));
      } else {
        addRow();
      }
    });
})();
