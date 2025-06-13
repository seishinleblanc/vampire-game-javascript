import { getCustomProperty, setCustomProperty, incrementCustomProperty } from './updateCustomProperty.js'

const gameAreaElem = document.querySelector('[data-game-area]')

const SPAWN_INTERVAL_MIN = 5000
const SPAWN_INTERVAL_MAX = 15000
const WEREWOLF_SPEED = 0.01
const REMOVE_DISTANCE = 20

const RUN_FRAME_COUNT = 9
const RUN_FRAME_TIME = 100
const ATTACK_FRAME_COUNT = 7
const ATTACK_FRAME_TIME = 100
const HURT_FRAME_COUNT = 2
const HURT_FRAME_TIME = 100
const DEAD_FRAME_COUNT = 2
const DEAD_FRAME_TIME = 200

let nextSpawnTime = SPAWN_INTERVAL_MIN

export function setupWerewolves() {
  nextSpawnTime = SPAWN_INTERVAL_MIN
  document.querySelectorAll('[data-werewolf]').forEach(w => w.remove())
}

export function updateWerewolves(delta, speedScale, cameraX, worldWidth, vampireX, bossActive = false) {
  if (bossActive) return

  nextSpawnTime -= delta
  if (nextSpawnTime <= 0) {
    spawnWerewolf(cameraX, worldWidth)
    nextSpawnTime = randomTime() / speedScale
  }

  document.querySelectorAll('[data-werewolf]').forEach(wolf => {
    updateWolf(wolf, delta, speedScale, cameraX, worldWidth, vampireX)
  })
}

function spawnWerewolf(cameraX, worldWidth) {
  const side = Math.random() < 0.5 ? 'left' : 'right'
  const wolf = document.createElement('img')
  wolf.dataset.werewolf = true
  wolf.dataset.state = 'run'
  wolf.dataset.frame = '0'
  wolf.dataset.frameTime = '0'
  wolf.dataset.hits = '0'
  const direction = side === 'left' ? 1 : -1
  wolf.dataset.direction = direction
  wolf.classList.add('werewolf')
  setCustomProperty(wolf, '--bottom', 0)

  if (side === 'left') {
    setCustomProperty(wolf, '--left', cameraX - 5)
    wolf.style.transform = 'scaleX(1)'
  } else {
    setCustomProperty(wolf, '--left', cameraX + worldWidth + 5)
    wolf.style.transform = 'scaleX(-1)'
  }

  wolf.src = 'assets/images/white-werewolf/white-werewolf-running/white-werewolf-running000.png'
  gameAreaElem.append(wolf)
}

function updateWolf(wolf, delta, speedScale, cameraX, worldWidth, vampireX) {
    // Determine which direction the wolf should face and move
  const wolfX = getCustomProperty(wolf, '--left')
  const newDirection = wolfX < vampireX ? 1 : -1
  wolf.dataset.direction = newDirection
  wolf.style.transform = newDirection === 1 ? 'scaleX(1)' : 'scaleX(-1)'
  let frame = Number(wolf.dataset.frame)
  let frameTime = Number(wolf.dataset.frameTime) + delta
  const state = wolf.dataset.state

  switch(state) {
    case 'run':
      if (frameTime >= RUN_FRAME_TIME) {
        frame = (frame + 1) % RUN_FRAME_COUNT
        wolf.src = `assets/images/white-werewolf/white-werewolf-running/white-werewolf-running${String(frame).padStart(3,'0')}.png`
        frameTime -= RUN_FRAME_TIME
      }
      incrementCustomProperty(wolf, '--left', Number(wolf.dataset.direction) * WEREWOLF_SPEED * delta * speedScale)

      if (Math.abs(getCustomProperty(wolf, '--left') - vampireX) < 8) {
        wolf.dataset.state = 'attack'
        frame = 0
        frameTime = 0
        wolf.src = 'assets/images/white-werewolf/white-werewolf-attacking/white-werewolf-attacking000.png'
      }
      break

    case 'attack':
      if (frameTime >= ATTACK_FRAME_TIME) {
        frame++
        if (frame >= ATTACK_FRAME_COUNT) {
          wolf.dataset.state = 'run'
          frame = 0
          wolf.src = 'assets/images/white-werewolf/white-werewolf-running/white-werewolf-running000.png'
        } else {
          wolf.src = `assets/images/white-werewolf/white-werewolf-attacking/white-werewolf-attacking${String(frame).padStart(3,'0')}.png`
        }
        frameTime -= ATTACK_FRAME_TIME
      }
      break

    case 'hurt':
      if (frameTime >= HURT_FRAME_TIME) {
        frame++
        if (frame >= HURT_FRAME_COUNT) {
          wolf.dataset.state = 'run'
          frame = 0
          wolf.src = 'assets/images/white-werewolf/white-werewolf-running/white-werewolf-running000.png'
        } else {
          wolf.src = `assets/images/white-werewolf/white-werewolf-hurt/white-werewolf-hurt${String(frame).padStart(3,'0')}.png`
        }
        frameTime -= HURT_FRAME_TIME
      }
      break

    case 'dead':
      if (frameTime >= DEAD_FRAME_TIME) {
        frame++
        if (frame >= DEAD_FRAME_COUNT) {
          wolf.remove()
          return
        } else {
          wolf.src = `assets/images/white-werewolf/white-werewolf-dead/white-werewolf-dead${String(frame).padStart(3,'0')}.png`
        }
        frameTime -= DEAD_FRAME_TIME
      }
      break
  }

  wolf.dataset.frame = frame
  wolf.dataset.frameTime = frameTime

  const worldX = getCustomProperty(wolf, '--left')
  if (worldX < cameraX - REMOVE_DISTANCE || worldX > cameraX + worldWidth + REMOVE_DISTANCE) {
    wolf.remove()
  }
}

function randomTime() {
  return Math.floor(Math.random() * (SPAWN_INTERVAL_MAX - SPAWN_INTERVAL_MIN) + SPAWN_INTERVAL_MIN)
}

export function getWerewolfRects() {
  return [...document.querySelectorAll('[data-werewolf]')].map(w => w.getBoundingClientRect())
}

export function getWerewolfElements() {
  return document.querySelectorAll('[data-werewolf]')
}

export function damageWerewolf(wolf) {
  if (!wolf || wolf.dataset.state === 'dead') return
  let hits = Number(wolf.dataset.hits) + 1
  wolf.dataset.hits = hits
  if (hits >= 3) {
    wolf.dataset.state = 'dead'
    wolf.dataset.frame = 0
    wolf.dataset.frameTime = 0
    wolf.src = 'assets/images/white-werewolf/white-werewolf-dead/white-werewolf-dead000.png'
  } else {
    wolf.dataset.state = 'hurt'
    wolf.dataset.frame = 0
    wolf.dataset.frameTime = 0
    wolf.src = 'assets/images/white-werewolf/white-werewolf-hurt/white-werewolf-hurt000.png'
  }
}