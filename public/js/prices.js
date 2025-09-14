const container = document.getElementById('crypto-values');
const ids = ['bitcoin', 'ethereum', 'litecoin'];

function refreshPrices() {
  fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}&vs_currencies=eur,usd`)
    .then(res => res.json())
    .then(data => {
      container.innerHTML = '';
      ids.forEach(id => {
        const price = data[id];
        if (price) {
          const p = document.createElement('p');
          const name = id.charAt(0).toUpperCase() + id.slice(1);
          p.textContent = `${name} : ${price.eur} EUR / ${price.usd} USD`;
          container.appendChild(p);
        }
      });
    })
    .catch(() => {
      container.textContent = 'Impossible de charger les valeurs.';
    });
}

refreshPrices();
