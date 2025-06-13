// mana.js
const MAX_MANA = 100
const MANA_REGEN_RATE = 0.01 // mana per ms (~10 per second)
const ATTACK_MANA_COST = 20
const MANA_REGEN_DELAY = 1000 // ms delay before regen starts after spending

let currentMana = MAX_MANA
let regenCooldown = 0

const manaFillElem = document.querySelector('[data-mana-fill]')

export function setupMana() {
  currentMana = MAX_MANA
  regenCooldown = 0
  updateManaDisplay()
}

export function updateMana(delta) {
  if (regenCooldown > 0) {
    regenCooldown -= delta
  } else {
    currentMana = Math.min(MAX_MANA, currentMana + MANA_REGEN_RATE * delta)
  }
  updateManaDisplay()
}

export function spendMana(cost = ATTACK_MANA_COST) {
  if (currentMana >= cost) {
    currentMana -= cost
    regenCooldown = MANA_REGEN_DELAY
    updateManaDisplay()
    return true
  }
  return false
}

function updateManaDisplay() {
  if (manaFillElem) {
    manaFillElem.style.width = `${(currentMana / MAX_MANA) * 100}%`
  }
}

export { currentMana, MAX_MANA, ATTACK_MANA_COST }
