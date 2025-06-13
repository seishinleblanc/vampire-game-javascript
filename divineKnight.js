import { getCustomProperty, setCustomProperty, incrementCustomProperty } from './updateCustomProperty.js'

const gameAreaElem = document.querySelector('[data-game-area]')

const WALK_SPEED = 0.03
const WALK_FRAME_COUNT = 8
const WALK_FRAME_TIME = 100
const IDLE_FRAME_COUNT = 4
const IDLE_FRAME_TIME = 150
const TARGET_LEFT = 70

let knightElem
let walkFrame = 0
let walkFrameTime = 0
let idleFrame = 0
let idleFrameTime = 0
let lastTime = null
let onWalkComplete = null

export function setupDivineKnight() {
  knightElem = document.createElement('img')
  knightElem.dataset.divineKnight = true
  knightElem.dataset.state = 'idle'
  knightElem.classList.add('divine-knight')
  setCustomProperty(knightElem, '--bottom', 0)
  setCustomProperty(knightElem, '--left', 110)
  knightElem.style.transform = 'scaleX(-1)'
  knightElem.src = 'imgs/divine-knight/divine-knight-idle/tile000.png'
  gameAreaElem.append(knightElem)
  requestAnimationFrame(loop)
}

export function walkOntoScreen(callback) {
  if (!knightElem) return
  knightElem.dataset.state = 'walk'
  walkFrame = 0
  walkFrameTime = 0
  knightElem.src = 'imgs/divine-knight/divine-knight-walking/divine-knight-walking000.png'
  onWalkComplete = callback
}

function loop(time) {
  if (lastTime == null) {
    lastTime = time
    requestAnimationFrame(loop)
    return
  }
  const delta = time - lastTime
  lastTime = time
  updateKnight(delta)
  requestAnimationFrame(loop)
}

function updateKnight(delta) {
  if (!knightElem) return
  const state = knightElem.dataset.state
  if (state === 'walk') {
    if (walkFrameTime >= WALK_FRAME_TIME) {
      walkFrame = (walkFrame + 1) % WALK_FRAME_COUNT
      knightElem.src = `imgs/divine-knight/divine-knight-walking/divine-knight-walking${String(walkFrame).padStart(3,'0')}.png`
      walkFrameTime -= WALK_FRAME_TIME
    }
    walkFrameTime += delta
    incrementCustomProperty(knightElem, '--left', -WALK_SPEED * delta)
    if (getCustomProperty(knightElem, '--left') <= TARGET_LEFT) {
      setCustomProperty(knightElem, '--left', TARGET_LEFT)
      knightElem.dataset.state = 'idle'
      if (onWalkComplete) { const cb = onWalkComplete; onWalkComplete = null; cb(); }
    }
  } else {
    if (idleFrameTime >= IDLE_FRAME_TIME) {
      idleFrame = (idleFrame + 1) % IDLE_FRAME_COUNT
      knightElem.src = `imgs/divine-knight/divine-knight-idle/tile${String(idleFrame).padStart(3,'0')}.png`
      idleFrameTime -= IDLE_FRAME_TIME
    }
    idleFrameTime += delta
  }
}

export function getKnightElement() {
  return knightElem
}