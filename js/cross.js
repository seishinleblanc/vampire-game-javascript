import { getCustomProperty, setCustomProperty } from "./updateCustomProperty.js"

const SPAWN_INTERVAL = 100     // world units between crosses
const CROSS_OFFSET = 100       // spawn ahead of camera
const REMOVE_DISTANCE = 50     // remove behind camera

// Now attach crosses to the gameplay area so CSS visibility works
const gameAreaElem = document.querySelector('[data-game-area]')

let lastSpawnX

export function setupCross() {
  lastSpawnX = -Infinity
  document.querySelectorAll("[data-cross]").forEach(cross => cross.remove())
}

export function updateCross(cameraX) {
  // Remove crosses far behind
  document.querySelectorAll("[data-cross]").forEach(cross => {
    const crossX = Number(cross.dataset.worldX)
    if (crossX < cameraX - REMOVE_DISTANCE) {
      cross.remove()
    } else {
      // Crosses live inside the translated world element, so their
      // `--left` value should stay in world coordinates. The world
      // itself is shifted by `cameraX`, which will place the cross
      // correctly on screen. Using world coordinates here avoids a
      // double translation effect.
      setCustomProperty(cross, "--left", crossX)
    }
  })

  // Spawn new cross ahead
  if (cameraX > lastSpawnX + SPAWN_INTERVAL) {
    const newX = cameraX + CROSS_OFFSET
    createCross(newX)
    lastSpawnX = cameraX
  }
}

export function getCrossRects() {
  return [...document.querySelectorAll("[data-cross]")]
    .map(cross => cross.getBoundingClientRect())
}

function createCross(worldX) {
  const cross = document.createElement("img")
  cross.dataset.cross = true
  cross.dataset.worldX = worldX
  cross.src = "assets/images/cross.png"
  cross.classList.add("cross")
  setCustomProperty(cross, "--left", worldX)

  // append into game area so CSS .game-area .cross applies
  gameAreaElem.append(cross)
}

  
  