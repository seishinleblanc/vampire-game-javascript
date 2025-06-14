import {
  getCustomProperty,
  setCustomProperty
} from './updateCustomProperty.js'

const GROUND_WIDTH = 100
const MIDGROUND_WIDTH = 100
const BACKGROUND_WIDTH = 100
const FOREGROUND_WIDTH = 100
const FOREGROUND_SPEED = 1.2

const groundElems = document.querySelectorAll("[data-ground]")
const midgroundElems = document.querySelectorAll("[data-midground]")
const backgroundElems = document.querySelectorAll("[data-background]")
const foregroundElems = document.querySelectorAll('[data-foreground]')

export function setupGround() {
  groundElems.forEach((ground, i) => {
    setCustomProperty(ground, "--left", i * GROUND_WIDTH)
    ground.dataset.index = i
  })

  foregroundElems.forEach((fg, i) => {
    setCustomProperty(fg, "--left", i * FOREGROUND_WIDTH)
    fg.dataset.index = i
  })

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
    const left = (baseGround + i) * GROUND_WIDTH - groundOffset - cameraX
    setCustomProperty(ground, "--left", left)
  })

  const midCamera = cameraX * 0.4
  const midOffset = midCamera % MIDGROUND_WIDTH
  const baseMid = Math.floor(midCamera / MIDGROUND_WIDTH)
  midgroundElems.forEach((mg, i) => {
    const left = (baseMid + i) * MIDGROUND_WIDTH - midOffset - cameraX
    setCustomProperty(mg, "--left", left)
  })

  const bgCamera = cameraX * 0.2
  const bgOffset = bgCamera % BACKGROUND_WIDTH
  const baseBg = Math.floor(bgCamera / BACKGROUND_WIDTH)
  backgroundElems.forEach((bg, i) => {
    const left = (baseBg + i) * BACKGROUND_WIDTH - bgOffset // slower parallax
    setCustomProperty(bg, "--left", left)
  })

  const fgCamera = cameraX * FOREGROUND_SPEED
  const fgOffset = fgCamera % FOREGROUND_WIDTH
  const baseFg = Math.floor(fgCamera / FOREGROUND_WIDTH) - 1
  foregroundElems.forEach((fg, i) => {
    const left = (baseFg + i) * FOREGROUND_WIDTH - fgOffset
    setCustomProperty(fg, "--left", left)
  })
}


