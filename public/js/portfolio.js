const tbody = document.getElementById('portfolio-body');
const addBtn = document.getElementById('add-crypto');

function savePortfolio() {
  const cryptos = Array.from(tbody.querySelectorAll('input.crypto-name'))
    .map(input => input.value.trim())
    .filter(Boolean);
  localStorage.setItem('portfolio', JSON.stringify(cryptos));
}

function addRow(name = '') {
  const row = document.createElement('tr');

  const nameCell = document.createElement('td');
  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.value = name;
  nameInput.classList.add('crypto-name');
  nameCell.appendChild(nameInput);
  row.appendChild(nameCell);

  const eurCell = document.createElement('td');
  eurCell.textContent = '-';
  row.appendChild(eurCell);

  const usdCell = document.createElement('td');
  usdCell.textContent = '-';
  row.appendChild(usdCell);

  function update() {
    const crypto = nameInput.value.trim().toLowerCase();
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

  nameInput.addEventListener('change', update);
  tbody.appendChild(row);

  if (name) {
    update();
  }
}

addBtn.addEventListener('click', () => addRow());

(function init() {
  const saved = JSON.parse(localStorage.getItem('portfolio') || '[]');
  if (saved.length) {
    saved.forEach(name => addRow(name));
  } else {
    addRow();
  }
})();
