const tbody = document.getElementById('portfolio-body');
const addBtn = document.getElementById('add-crypto');
const saveBtn = document.getElementById('save-portfolio');
let coinList = [];

function loadCoinList() {
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
    })
    .catch(() => {
      coinList = [];
    });
}

function savePortfolio() {
  const items = Array.from(tbody.querySelectorAll('tr')).map(row => {
    return {
      id: row.querySelector('select.crypto-name').value.trim(),
      date: row.querySelector('input.purchase-date').value,
      amount: row.querySelector('input.amount').value,
      price: row.querySelector('input.price').value,
      currency: row.querySelector('select.currency').value
    };
  }).filter(item => item.id);
  localStorage.setItem('portfolio', JSON.stringify(items));
}

function updateTotals() {
  const totals = { eur: { cost: 0, value: 0 }, usd: { cost: 0, value: 0 } };
  Array.from(tbody.querySelectorAll('tr')).forEach(row => {
    const cur = row.querySelector('select.currency').value;
    const cost = parseFloat(row.dataset.cost || '0');
    const value = parseFloat(row.dataset.value || '0');
    totals[cur].cost += cost;
    totals[cur].value += value;
  });
  ['eur', 'usd'].forEach(cur => {
    const cost = totals[cur].cost;
    const value = totals[cur].value;
    const diff = value - cost;
    const percent = cost ? (diff / cost) * 100 : 0;
    document.getElementById(`total-${cur}-cost`).textContent = cost.toFixed(2);
    document.getElementById(`total-${cur}-value`).textContent = value.toFixed(2);
    document.getElementById(`total-${cur}-diff`).textContent = diff.toFixed(2);
    document.getElementById(`total-${cur}-percent`).textContent = percent.toFixed(2) + '%';
  });
}

function populateSelect(select, selected = '') {
  const emptyOption = document.createElement('option');
  emptyOption.value = '';
  emptyOption.textContent = '';
  select.appendChild(emptyOption);

  let found = false;
  coinList.forEach(coin => {
    const option = document.createElement('option');
    option.value = coin.id;
    option.textContent = coin.symbol.toUpperCase();
    if (coin.id === selected) {
      option.selected = true;
      found = true;
    }
    select.appendChild(option);
  });

  if (selected && !found) {
    const option = document.createElement('option');
    option.value = selected;
    option.textContent = selected.toUpperCase();
    option.selected = true;
    select.appendChild(option);
  }
}

function addRow(data = {}) {
  const row = document.createElement('tr');

  const nameCell = document.createElement('td');
  const nameSelect = document.createElement('select');
  nameSelect.classList.add('crypto-name');
  populateSelect(nameSelect, data.id || '');
  nameCell.appendChild(nameSelect);
  row.appendChild(nameCell);

  const dateCell = document.createElement('td');
  const dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateInput.classList.add('purchase-date');
  dateInput.value = data.date || '';
  dateCell.appendChild(dateInput);
  row.appendChild(dateCell);

  const amountCell = document.createElement('td');
  const amountInput = document.createElement('input');
  amountInput.type = 'number';
  amountInput.step = 'any';
  amountInput.classList.add('amount');
  amountInput.value = data.amount || '';
  amountCell.appendChild(amountInput);
  row.appendChild(amountCell);

  const priceCell = document.createElement('td');
  const priceInput = document.createElement('input');
  priceInput.type = 'number';
  priceInput.step = 'any';
  priceInput.classList.add('price');
  priceInput.value = data.price || '';
  priceCell.appendChild(priceInput);
  row.appendChild(priceCell);

  const currencyCell = document.createElement('td');
  const currencySelect = document.createElement('select');
  currencySelect.classList.add('currency');
  ['eur', 'usd'].forEach(cur => {
    const option = document.createElement('option');
    option.value = cur;
    option.textContent = cur.toUpperCase();
    if ((data.currency || 'eur') === cur) {
      option.selected = true;
    }
    currencySelect.appendChild(option);
  });
  currencyCell.appendChild(currencySelect);
  row.appendChild(currencyCell);

  const costCell = document.createElement('td');
  costCell.textContent = '-';
  row.appendChild(costCell);

  const currentCell = document.createElement('td');
  currentCell.textContent = '-';
  row.appendChild(currentCell);

  const diffCell = document.createElement('td');
  diffCell.textContent = '-';
  row.appendChild(diffCell);

  const percentCell = document.createElement('td');
  percentCell.textContent = '-';
  row.appendChild(percentCell);

  const actionCell = document.createElement('td');
  const delBtn = document.createElement('button');
  delBtn.textContent = 'Supprimer';
  delBtn.classList.add('delete-btn');
  delBtn.addEventListener('click', () => {
    row.remove();
    savePortfolio();
    updateTotals();
  });
  actionCell.appendChild(delBtn);
  row.appendChild(actionCell);

  function update() {
    const crypto = nameSelect.value.trim().toLowerCase();
    const amount = parseFloat(amountInput.value);
    const price = parseFloat(priceInput.value);
    const currency = currencySelect.value;

    if (!crypto || isNaN(amount) || isNaN(price)) {
      costCell.textContent = '-';
      currentCell.textContent = '-';
      diffCell.textContent = '-';
      percentCell.textContent = '-';
      row.dataset.cost = 0;
      row.dataset.value = 0;
      savePortfolio();
      updateTotals();
      return;
    }

    const cost = amount * price;
    costCell.textContent = cost.toFixed(2);

    fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${crypto}&vs_currencies=${currency}`)
      .then(res => res.json())
      .then(data => {
        if (data[crypto]) {
          const currentPrice = data[crypto][currency];
          const currentValue = currentPrice * amount;
          const diff = currentValue - cost;
          const percent = cost ? (diff / cost) * 100 : 0;
          currentCell.textContent = currentValue.toFixed(2);
          diffCell.textContent = diff.toFixed(2);
          percentCell.textContent = percent.toFixed(2) + '%';
          row.dataset.cost = cost;
          row.dataset.value = currentValue;
        } else {
          currentCell.textContent = 'N/A';
          diffCell.textContent = 'N/A';
          percentCell.textContent = 'N/A';
          row.dataset.cost = cost;
          row.dataset.value = 0;
        }
      })
      .catch(() => {
        currentCell.textContent = 'Err';
        diffCell.textContent = 'Err';
        percentCell.textContent = 'Err';
        row.dataset.cost = cost;
        row.dataset.value = 0;
      })
      .finally(() => {
        savePortfolio();
        updateTotals();
      });
  }

  [nameSelect, dateInput, amountInput, priceInput, currencySelect].forEach(el => {
    el.addEventListener('change', update);
  });

  tbody.appendChild(row);

  if (data.id) {
    update();
  }
}

addBtn.addEventListener('click', () => addRow());
saveBtn.addEventListener('click', savePortfolio);

(function init() {
  loadCoinList().finally(() => {
    const symbolMap = {};
    coinList.forEach(c => {
      symbolMap[c.symbol.toUpperCase()] = c.id;
    });

    let saved;
    try {
      saved = JSON.parse(localStorage.getItem('portfolio') || '[]');
    } catch {
      saved = [];
    }
    if (!saved.length) {
      const purchases = JSON.parse(localStorage.getItem('purchases') || '[]');
      if (purchases.length) {
        saved = purchases.map(p => {
          const symbol = (p.crypto || '').toUpperCase();
          const id = symbolMap[symbol] || symbol.toLowerCase();
          return {
            id,
            date: new Date().toISOString().slice(0, 10),
            amount: p.quantity,
            price: p.price,
            currency: 'eur'
          };
        });
        localStorage.setItem('portfolio', JSON.stringify(saved));
      }
    }

    if (saved.length) {
      const grouped = {};
      saved.forEach(item => {
        const key = `${item.id}|${item.currency || 'eur'}`;
        const amt = parseFloat(item.amount) || 0;
        const price = parseFloat(item.price) || 0;
        if (!grouped[key]) {
          grouped[key] = {
            id: item.id,
            date: item.date,
            amount: amt,
            price,
            currency: item.currency || 'eur'
          };
        } else {
          const g = grouped[key];
          const totalAmount = g.amount + amt;
          const totalCost = g.amount * g.price + amt * price;
          g.amount = totalAmount;
          g.price = totalCost / totalAmount;
          g.date = item.date;
        }
      });
      Object.values(grouped).forEach(g => {
        g.amount = g.amount.toString();
        g.price = g.price.toString();
        addRow(g);
      });
    } else {
      addRow();
    }
    updateTotals();
  });
})();

