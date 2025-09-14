const tbody = document.getElementById('crypto-values');
const ids = ['bitcoin', 'ethereum', 'litecoin'];

function refreshPrices() {
  fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}&vs_currencies=eur,usd`)
    .then(res => res.json())
    .then(data => {
      tbody.innerHTML = '';
      ids.forEach(id => {
        const price = data[id];
        if (price) {
          const tr = document.createElement('tr');
          const nameTd = document.createElement('td');
          const valueTd = document.createElement('td');
          nameTd.textContent = id.charAt(0).toUpperCase() + id.slice(1);
          valueTd.textContent = `${price.eur} EUR / ${price.usd} USD`;
          tr.appendChild(nameTd);
          tr.appendChild(valueTd);
          tbody.appendChild(tr);
        }
      });
    })
    .catch(() => {
      tbody.innerHTML = '<tr><td colspan="2">Impossible de charger les valeurs.</td></tr>';
    });
}

refreshPrices();
