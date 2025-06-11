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
  groundElems.forEach(ground => {
    const index = Number(ground.dataset.index)
    const left = -cameraX + index * GROUND_WIDTH
    setCustomProperty(ground, "--left", left)
  })

  midgroundElems.forEach(mg => {
    const index = Number(mg.dataset.index)
    const left = -cameraX * 0.4 + index * MIDGROUND_WIDTH // parallax speed
    setCustomProperty(mg, "--left", left)
  })

  backgroundElems.forEach(bg => {
    const index = Number(bg.dataset.index)
    const left = -cameraX * 0.2 + index * BACKGROUND_WIDTH // slower parallax
    setCustomProperty(bg, "--left", left)
  })
}


