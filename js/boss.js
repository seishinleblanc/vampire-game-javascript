const bossContainer = document.getElementById('boss-health');
const bossFill = document.getElementById('boss-health-fill');
const bossNameElem = bossContainer ? bossContainer.querySelector('.boss-name') : null;

const MAX_HEALTH = 100;
let currentHealth = MAX_HEALTH;

export function showBossHealth(name = '') {
  if (bossNameElem) bossNameElem.textContent = name;
  currentHealth = MAX_HEALTH;
  updateDisplay();
  if (bossContainer) bossContainer.classList.remove('hide');
}

export function hideBossHealth() {
  if (bossContainer) bossContainer.classList.add('hide');
}

export function damageBoss(amount) {
  currentHealth = Math.max(0, currentHealth - amount);
  updateDisplay();
  return currentHealth <= 0;
}

function updateDisplay() {
  if (bossFill) bossFill.style.width = `${(currentHealth / MAX_HEALTH) * 100}%`;
}

export { MAX_HEALTH };
