import { getCustomProperty, setCustomProperty, incrementCustomProperty } from './updateCustomProperty.js'
import { getVampireX } from './vampire.js'

const gameAreaElem = document.querySelector('[data-game-area]')

const WALK_SPEED = 0.015
const MOVE_SPEED = 0.01
const WALK_FRAME_COUNT = 8
const WALK_FRAME_TIME = 100
const IDLE_FRAME_COUNT = 4
const IDLE_FRAME_TIME = 150
const ATTACK1_FRAME_COUNT = 5
const ATTACK1_FRAME_TIME = 100
const ATTACK2_FRAME_COUNT = 4
const ATTACK2_FRAME_TIME = 100
const ATTACK3_FRAME_COUNT = 4
const ATTACK3_FRAME_TIME = 100
const TARGET_LEFT = 70
const ATTACK_RANGE = 10
const ATTACK3_RANGE = 15

let knightElem
let walkFrame = 0
let walkFrameTime = 0
let idleFrame = 0
let idleFrameTime = 0
let attackFrame = 0
let attackFrameTime = 0
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
  knightElem.src = 'assets/images/divine-knight/divine-knight-idle/tile000.png'
  knightElem.dataset.frame = '0'
  knightElem.dataset.frameTime = '0'
  gameAreaElem.append(knightElem)
  requestAnimationFrame(loop)
}

export function walkOntoScreen(callback) {
  if (!knightElem) return
  knightElem.dataset.state = 'walk'
  walkFrame = 0
  walkFrameTime = 0
  knightElem.src = 'assets/images/divine-knight/divine-knight-walking/divine-knight-walking000.png'
  onWalkComplete = callback
}

export function startKnightAI() {
  if (!knightElem) return
  knightElem.dataset.state = 'move'
  walkFrame = 0
  walkFrameTime = 0
  attackFrame = 0
  attackFrameTime = 0
  knightElem.dataset.frame = '0'
  knightElem.dataset.frameTime = '0'
  knightElem.src = 'assets/images/divine-knight/divine-knight-walking/divine-knight-walking000.png'
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
  switch(state) {
    case 'walk':
      if (walkFrameTime >= WALK_FRAME_TIME) {
        walkFrame = (walkFrame + 1) % WALK_FRAME_COUNT
        knightElem.src = `assets/images/divine-knight/divine-knight-walking/divine-knight-walking${String(walkFrame).padStart(3,'0')}.png`
        walkFrameTime -= WALK_FRAME_TIME
      }
      walkFrameTime += delta
      incrementCustomProperty(knightElem, '--left', -WALK_SPEED * delta)
      if (getCustomProperty(knightElem, '--left') <= TARGET_LEFT) {
        setCustomProperty(knightElem, '--left', TARGET_LEFT)
        knightElem.dataset.state = 'idle'
        if (onWalkComplete) { const cb = onWalkComplete; onWalkComplete = null; cb(); }
      }
      break

    case 'move':
      handleMove(delta)
      break

    case 'attack1':
      handleAttack(delta, 1)
      break

    case 'attack2':
      handleAttack(delta, 2)
      break

    case 'attack3':
      handleAttack(delta, 3)
      break

    default:
      if (idleFrameTime >= IDLE_FRAME_TIME) {
        idleFrame = (idleFrame + 1) % IDLE_FRAME_COUNT
        knightElem.src = `assets/images/divine-knight/divine-knight-idle/tile${String(idleFrame).padStart(3,'0')}.png`
        idleFrameTime -= IDLE_FRAME_TIME
      }
      idleFrameTime += delta
  }
}

function handleMove(delta) {
  if (walkFrameTime >= WALK_FRAME_TIME) {
    walkFrame = (walkFrame + 1) % WALK_FRAME_COUNT
    knightElem.src = `assets/images/divine-knight/divine-knight-walking/divine-knight-walking${String(walkFrame).padStart(3,'0')}.png`
    walkFrameTime -= WALK_FRAME_TIME
  }
  walkFrameTime += delta
  knightElem.dataset.frame = walkFrame
  knightElem.dataset.frameTime = walkFrameTime

  const knightX = getCustomProperty(knightElem, '--left')
  const targetX = getVampireX()
  const dir = targetX < knightX ? -1 : 1
  knightElem.style.transform = dir === -1 ? 'scaleX(-1)' : 'scaleX(1)'
  incrementCustomProperty(knightElem, '--left', dir * MOVE_SPEED * delta)

  if (Math.abs(knightX - targetX) <= ATTACK_RANGE) {
    startRandomAttack()
  }
}

function handleAttack(delta, type) {
  const frameCount = type === 1 ? ATTACK1_FRAME_COUNT : type === 2 ? ATTACK2_FRAME_COUNT : ATTACK3_FRAME_COUNT
  const frameTimeConst = type === 1 ? ATTACK1_FRAME_TIME : type === 2 ? ATTACK2_FRAME_TIME : ATTACK3_FRAME_TIME

  if (attackFrameTime >= frameTimeConst) {
    attackFrame++
    if (attackFrame >= frameCount) {
      knightElem.dataset.state = 'move'
      attackFrame = 0
      knightElem.src = 'assets/images/divine-knight/divine-knight-walking/divine-knight-walking000.png'
    } else {
      const folder = type === 1 ? 'divine-knight-attack-one' : type === 2 ? 'divine-knight-attack-two' : 'divine-knight-attack-three'
      knightElem.src = `assets/images/divine-knight/${folder}/divine-knight-${type === 1 ? 'attack-one' : type === 2 ? 'attack-two' : 'attack-three'}${String(attackFrame).padStart(3,'0')}.png`
    }
    attackFrameTime -= frameTimeConst
  }
  attackFrameTime += delta
  knightElem.dataset.frame = attackFrame
  knightElem.dataset.frameTime = attackFrameTime
}

function startRandomAttack() {
  const r = Math.random()
  attackFrame = 0
  attackFrameTime = 0
  knightElem.dataset.frame = '0'
  knightElem.dataset.frameTime = '0'
  if (r < 0.34) {
    knightElem.dataset.state = 'attack1'
    knightElem.src = 'assets/images/divine-knight/divine-knight-attack-one/divine-knight-attack-one000.png'
  } else if (r < 0.67) {
    knightElem.dataset.state = 'attack2'
    knightElem.src = 'assets/images/divine-knight/divine-knight-attack-two/divine-knight-attack-two000.png'
  } else {
    knightElem.dataset.state = 'attack3'
    knightElem.src = 'assets/images/divine-knight/divine-knight-attack-three/divine-knight-attack-three000.png'
  }
}

export function getKnightElement() {
  return knightElem
}

export function getKnightRect() {
  if (!knightElem) return { left: 0, right: 0, top: 0, bottom: 0 }
  const r = knightElem.getBoundingClientRect()
  const insetX = r.width * 0.45
  const insetY = r.height * 0.45
  return {
    left: r.left + insetX,
    right: r.right - insetX,
    top: r.top + insetY,
    bottom: r.bottom
  }
}

export function removeDivineKnight() {
  if (knightElem) {
    knightElem.remove()
    knightElem = null
  }
}