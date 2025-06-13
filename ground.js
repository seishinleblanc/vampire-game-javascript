import {
  getCustomProperty,
  setCustomProperty
} from './updateCustomProperty.js'

const GROUND_WIDTH = 100
const MIDGROUND_WIDTH = 100
const BACKGROUND_WIDTH = 100
const FOREGROUND_SPEED = 0.1

const groundElems = document.querySelectorAll("[data-ground]")
const midgroundElems = document.querySelectorAll("[data-midground]")
const backgroundElems = document.querySelectorAll("[data-background]")
const foregroundElem = document.querySelector('.foreground')

export function setupGround() {
  groundElems.forEach((ground, i) => {
    setCustomProperty(ground, "--left", i * GROUND_WIDTH)
    ground.dataset.index = i
  })

  if (foregroundElem) {
    setCustomProperty(foregroundElem, "--left", 0)
  }

  midgroundElems.forEach((mg, i) => {
    setCustomProperty(mg, "--left", i * MIDGROUND_WIDTH)
    mg.dataset.index = i
  })

  backgroundElems.forEach((bg, i) => {
    setCustomProperty(bg, "--left", i * BACKGROUND_WIDTH)
    bg.dataset.index = i
  })
}

export function updateGround(cameraX) {
  const groundOffset = cameraX % GROUND_WIDTH
  const baseGround = Math.floor(cameraX / GROUND_WIDTH)
  groundElems.forEach((ground, i) => {
    const left = (baseGround + i) * GROUND_WIDTH - groundOffset
    setCustomProperty(ground, "--left", left)
  })

  const midCamera = cameraX * 0.4
  const midOffset = midCamera % MIDGROUND_WIDTH
  const baseMid = Math.floor(midCamera / MIDGROUND_WIDTH)
  midgroundElems.forEach((mg, i) => {
    const left = (baseMid + i) * MIDGROUND_WIDTH - midOffset // parallax speed
    setCustomProperty(mg, "--left", left)
  })

  const bgCamera = cameraX * 0.2
  const bgOffset = bgCamera % BACKGROUND_WIDTH
  const baseBg = Math.floor(bgCamera / BACKGROUND_WIDTH)
  backgroundElems.forEach((bg, i) => {
    const left = (baseBg + i) * BACKGROUND_WIDTH - bgOffset // slower parallax
    setCustomProperty(bg, "--left", left)
  })

  if (foregroundElem) {
    const fgLeft = -cameraX * FOREGROUND_SPEED
    setCustomProperty(foregroundElem, "--left", fgLeft)
  }
}


