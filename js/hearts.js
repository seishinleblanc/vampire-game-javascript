import { getCustomProperty, setCustomProperty } from './updateCustomProperty.js'

const gameAreaElem = document.querySelector('[data-game-area]')
const REMOVE_DISTANCE = 20

export function setupHearts() {
  document.querySelectorAll('[data-heart]').forEach(h => h.remove())
}

export function spawnHeart(worldX) {
  const heart = document.createElement('img')
  heart.dataset.heart = true
  heart.dataset.worldX = worldX
  heart.src = 'assets/images/UI/heart-full.png'
  heart.classList.add('pickup-heart')
  setCustomProperty(heart, '--left', worldX)
  setCustomProperty(heart, '--bottom', 5)
  gameAreaElem.append(heart)
}

export function updateHearts(cameraX, worldWidth) {
  document.querySelectorAll('[data-heart]').forEach(h => {
    const x = Number(h.dataset.worldX)
    if (x < cameraX - REMOVE_DISTANCE || x > cameraX + worldWidth + REMOVE_DISTANCE) {
      h.remove()
    } else {
      setCustomProperty(h, '--left', x)
    }
  })
}

export function getHeartElements() {
  return document.querySelectorAll('[data-heart]')
}
