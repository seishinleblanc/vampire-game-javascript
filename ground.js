import {
  getCustomProperty,
  setCustomProperty
} from './updateCustomProperty.js'

const GROUND_WIDTH = 300
const MIDGROUND_WIDTH = 100
const BACKGROUND_WIDTH = 100

const groundElems = document.querySelectorAll("[data-ground]")
const midgroundElems = document.querySelectorAll("[data-midground]")
const backgroundElems = document.querySelectorAll("[data-background]")

export function setupGround() {
  groundElems.forEach((ground, i) => {
    setCustomProperty(ground, "--left", i * GROUND_WIDTH)
    ground.dataset.index = i
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
  groundElems.forEach(ground => {
    const index = Number(ground.dataset.index)
    const left = index * GROUND_WIDTH - groundOffset
    setCustomProperty(ground, "--left", left)
  })

  const midOffset = (cameraX * 0.4) % MIDGROUND_WIDTH
  midgroundElems.forEach(mg => {
    const index = Number(mg.dataset.index)
    const left = index * MIDGROUND_WIDTH - midOffset // parallax speed
    setCustomProperty(mg, "--left", left)
  })

  const bgOffset = (cameraX * 0.2) % BACKGROUND_WIDTH
  backgroundElems.forEach(bg => {
    const index = Number(bg.dataset.index)
    const left = index * BACKGROUND_WIDTH - bgOffset // slower parallax
    setCustomProperty(bg, "--left", left)
  })
}


