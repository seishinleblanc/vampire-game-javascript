import { getCustomProperty, setCustomProperty, incrementCustomProperty } from './updateCustomProperty.js'
import { getVampireX } from './vampire.js'
import { damageBoss } from './boss.js'

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
const RUN_ATTACK_FRAME_COUNT = 6
const RUN_ATTACK_FRAME_TIME = 100
const HURT_FRAME_COUNT = 2
const HURT_FRAME_TIME = 100
const DEFEND_FRAME_COUNT = 5
const DEFEND_FRAME_TIME = 100
const TARGET_LEFT = 70
const ATTACK_RANGE = 8 // reduced by 20% for less aggressive reach
const ATTACK3_RANGE = 15
const RUN_ATTACK_DISTANCE = 20
const RUN_ATTACK_SPEED = 0.03
const DEFEND_CHANCE = 0.25

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

    case 'attack4':
      handleRunAttack(delta)
      break

    case 'defend':
      handleDefend(delta)
      break

    case 'hurt':
      handleHurt(delta)
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

  const distance = Math.abs(knightX - targetX)
  if (distance <= ATTACK_RANGE) {
    startRandomAttack()
  } else if (distance >= RUN_ATTACK_DISTANCE && Math.random() < 0.002) {
    startRunAttack()
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

function handleRunAttack(delta) {
  if (attackFrameTime >= RUN_ATTACK_FRAME_TIME) {
    attackFrame++
    if (attackFrame >= RUN_ATTACK_FRAME_COUNT) {
      knightElem.dataset.state = 'move'
      attackFrame = 0
      knightElem.src = 'assets/images/divine-knight/divine-knight-walking/divine-knight-walking000.png'
    } else {
      knightElem.src = `assets/images/divine-knight/divine-knight-run-attack/divine-knight-run-attack${String(attackFrame).padStart(3,'0')}.png`
    }
    attackFrameTime -= RUN_ATTACK_FRAME_TIME
  }
  attackFrameTime += delta
  knightElem.dataset.frame = attackFrame
  knightElem.dataset.frameTime = attackFrameTime

  const knightX = getCustomProperty(knightElem, '--left')
  const targetX = getVampireX()
  const dir = targetX < knightX ? -1 : 1
  knightElem.style.transform = dir === -1 ? 'scaleX(-1)' : 'scaleX(1)'
  incrementCustomProperty(knightElem, '--left', dir * RUN_ATTACK_SPEED * delta)
}

function handleDefend(delta) {
  if (attackFrameTime >= DEFEND_FRAME_TIME) {
    attackFrame++
    if (attackFrame >= DEFEND_FRAME_COUNT) {
      knightElem.dataset.state = 'move'
      attackFrame = 0
      knightElem.src = 'assets/images/divine-knight/divine-knight-walking/divine-knight-walking000.png'
    } else {
      knightElem.src = `assets/images/divine-knight/divine-knight-defend/divine-knight-defend${String(attackFrame).padStart(3,'0')}.png`
    }
    attackFrameTime -= DEFEND_FRAME_TIME
  }
  attackFrameTime += delta
  knightElem.dataset.frame = attackFrame
  knightElem.dataset.frameTime = attackFrameTime
}

function handleHurt(delta) {
  if (attackFrameTime >= HURT_FRAME_TIME) {
    attackFrame++
    if (attackFrame >= HURT_FRAME_COUNT) {
      knightElem.dataset.state = 'move'
      attackFrame = 0
      knightElem.src = 'assets/images/divine-knight/divine-knight-walking/divine-knight-walking000.png'
    } else {
      knightElem.src = `assets/images/divine-knight/divine-knight-hurt/divine-knight-hurt${String(attackFrame).padStart(3,'0')}.png`
    }
    attackFrameTime -= HURT_FRAME_TIME
  }
  attackFrameTime += delta
  knightElem.dataset.frame = attackFrame
  knightElem.dataset.frameTime = attackFrameTime
}

function startRunAttack() {
  knightElem.dataset.state = 'attack4'
  attackFrame = 0
  attackFrameTime = 0
  knightElem.dataset.frame = '0'
  knightElem.dataset.frameTime = '0'
  knightElem.src = 'assets/images/divine-knight/divine-knight-run-attack/divine-knight-run-attack000.png'
}

function startDefend() {
  knightElem.dataset.state = 'defend'
  attackFrame = 0
  attackFrameTime = 0
  knightElem.dataset.frame = '0'
  knightElem.dataset.frameTime = '0'
  knightElem.src = 'assets/images/divine-knight/divine-knight-defend/divine-knight-defend000.png'
}

function startHurt() {
  knightElem.dataset.state = 'hurt'
  attackFrame = 0
  attackFrameTime = 0
  knightElem.dataset.frame = '0'
  knightElem.dataset.frameTime = '0'
  knightElem.src = 'assets/images/divine-knight/divine-knight-hurt/divine-knight-hurt000.png'
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

export function damageDivineKnight(amount) {
  if (!knightElem) return false
  if (Math.random() < DEFEND_CHANCE) {
    startDefend()
    return false
  }
  startHurt()
  return damageBoss(amount)
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

export function getKnightAttackRect() {
  if (!knightElem) return { left: 0, right: 0, top: 0, bottom: 0 }
  const r = knightElem.getBoundingClientRect()
  const extendX = r.width * 0.25
  const insetY = r.height * 0.45
  return {
    left: r.left - extendX,
    right: r.right + extendX,
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
