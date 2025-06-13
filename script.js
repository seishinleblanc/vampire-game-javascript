import { setupGround, updateGround } from './ground.js'
import {
  setupVampire,
  updateVampire,
  getVampireRect,
  setVampireLose,
  getVampireX,
  setMoveDirection,
  enableInput,
  setVampireLeft
} from './vampire.js'
import { setupCross, updateCross, getCrossRects } from './cross.js'
import { setupProjectiles, updateProjectiles } from './projectile.js'
import { setupWerewolves, updateWerewolves, getWerewolfElements } from './werewolf.js'
import { getCustomProperty } from './updateCustomProperty.js'
import { setupDivineKnight, walkOntoScreen } from './divineKnight.js'

const WORLD_WIDTH = 100
const WORLD_HEIGHT = 30
const SPEED_SCALE_INCREASE = 0.00001
const MAX_HEARTS = 5
const CAMERA_DEADZONE = 5  // how far from center before camera scrolls

const worldElem = document.querySelector('[data-world]')
const startScreenElem = document.querySelector('[data-start-screen]')
const endScreenElem = document.querySelector('[data-end-screen]')
const gameAreaElem = document.querySelector('[data-game-area]')
const myMusic = document.querySelector('[data-backgroundmusic]')
const fireSound = document.querySelector('[data-firesound]')
const deathSound = document.querySelector('[data-deathsound]')
const dialogueMood = document.getElementById('dialogue-mood')
const gameOverMusic = document.querySelector('[data-gameovermusic]')
const combatMusic = document.querySelector('[data-combatmusic]')
const heartContainer = document.querySelector('[data-hearts]')
const screenFlash = document.getElementById('screen-flash')
const transitionOverlay = document.getElementById('transition-overlay')
const dialogueBg = document.getElementById('dialogue-bg')
const dialogueBox = document.getElementById('dialogue-box')
const dialogueText = document.getElementById('dialogue-text')
const nextButton = document.getElementById('next-button')
const avatarElem = document.getElementById('avatar')
const speakerNameElem = document.getElementById('speaker-name')
const bossBg = document.getElementById('boss-bg')
const controlsScreenElem = document.querySelector('[data-controls-screen]')

let lastTime
let speedScale
let currentHearts
let isGameOver = false
let isStaggered = false
let isInvincible = false
let cameraX = 0
let distance = 0
let lastVampireX = 0
let bossTriggered = false

const DISTANCE_TO_BOSS = 400

const initialDialogueLines = [
  { text: 'Carmilla, wake up.', speaker: 'Mirelle', avatar: 'imgs/avatar-mirelle.png' },
  { text: "...What? What's happening?", speaker: 'Carmilla', avatar: 'imgs/avatar-carmilla.png' },
  { text: 'Hunters. They breached the gate. You need to get out—now.', speaker: 'Mirelle', avatar: 'imgs/avatar-mirelle.png' },
  { text: 'What about you?', speaker: 'Carmilla', avatar: 'imgs/avatar-carmilla.png' },
  { text: "I'll hold them off. Take the back exit—", speaker: 'Mirelle', avatar: 'imgs/avatar-mirelle.png' },
  { text: "But be careful. They've set traps along the path. Watch your footing.", speaker: 'Mirelle', avatar: 'imgs/avatar-mirelle.png' }
]

const preBossLines = [
  { text: "I can see the forest up ahead, I've made it out!", speaker: 'Carmilla', avatar: 'imgs/avatar-carmilla.png' }
]

let dialogueLines = initialDialogueLines.slice()
const bossDialogueLines = [
  { text: 'Thats far enough...', speaker: '???', avatar: 'imgs/avatars/avatar-divine-knight-hidden.png' },
  { text: "Huh? You think a mere human like you is any match for a vampire? I'll kill you like I killed your hounds.", speaker: 'Carmilla', avatar: 'imgs/avatar-carmilla.png' },
  { text: 'Foolish vampire. I am Divine Knight Seraphiel, blade of the sanctum, warden of the last light. Your sins end here.', speaker: 'Divine Knight Seraphiel', avatar: 'imgs/avatars/avatar-divine-knight.PNG' }
]

let currentLine = 0
let lastAdvanceTime = 0
let onDialogueComplete = null

// Initialize world scaling
setPixelToWorldScale()
window.addEventListener('resize', setPixelToWorldScale)

// Ensure end screen is hidden at load
endScreenElem.classList.add('hide')

function update(time) {
  if (lastTime == null) {
    lastTime = time
    window.requestAnimationFrame(update)
    return
  }

  const delta = time - lastTime

  updatePlayerAndCamera(delta)
  updateGround(cameraX)
  updateCross(cameraX)
  updateWerewolves(delta, speedScale, cameraX, WORLD_WIDTH, getVampireX())
  updateProjectiles(delta, cameraX, WORLD_WIDTH, getCrossRects())
  updateSpeedScale(delta)
  updateDistance()

  if (!isInvincible && (checkCrossCollision() || checkWerewolfCollision())) {
    removeHeart()
  }

  if (currentHearts <= 0) {
    if (!isGameOver) handleLose()
    return
  }

  lastTime = time
  if (!bossTriggered) {
    window.requestAnimationFrame(update)
  }
}

// Margin‐based dead‐zone at the edges
function updatePlayerAndCamera(delta) {
  if (!isStaggered) updateVampire(delta, speedScale);

  const x = getVampireX();
  const halfW = WORLD_WIDTH / 2;
  const leftBoundary  = cameraX + halfW - CAMERA_DEADZONE;
  const rightBoundary = cameraX + halfW + CAMERA_DEADZONE;

  if (x < leftBoundary) {
    cameraX = x - (halfW - CAMERA_DEADZONE);
  } else if (x > rightBoundary) {
    cameraX = x - (halfW + CAMERA_DEADZONE);
  }

  // clamp so you don’t scroll beyond the level bounds
  cameraX = Math.max(0, Math.min(cameraX, /* maxWorldWidth - viewportWidth */));

  // slide the entire world
  worldElem.style.transform = `translateX(${-cameraX}% )`;
}

function checkCrossCollision() {
  const vampireRect = getVampireRect()
  return getCrossRects().some(rect => isCollision(rect, vampireRect))
}

function checkWerewolfCollision() {
  const vampireRect = getVampireRect()
  const wolves = getWerewolfElements()
  return Array.from(wolves).some(w => {
    if (w.dataset.state !== 'attack') return false
    const frame = Number(w.dataset.frame)
    if (frame < 6) return false
    return isCollision(w.getBoundingClientRect(), vampireRect)
  })
}

function isCollision(r1, r2) {
  return (
    r1.left < r2.right &&
    r1.top < r2.bottom &&
    r1.right > r2.left &&
    r1.bottom > r2.top
  )
}

function updateSpeedScale(delta) {
  speedScale += delta * SPEED_SCALE_INCREASE
}

function updateDistance() {
  const x = getVampireX()
  if (lastVampireX === 0) lastVampireX = x
  distance += x - lastVampireX
  lastVampireX = x

  if (!bossTriggered && distance >= DISTANCE_TO_BOSS) {
    bossTriggered = true
    startBossTransition()
  }
}

function triggerBossEncounter() {
  startDialogue(bossDialogueLines, startBossFight, false, false)
}

function startBossTransition() {
  myMusic.pause()
  myMusic.currentTime = 0
  startDialogue(preBossLines, runOffscreen, false, false)
}

function startBossFight() {
  console.log('Boss fight begins!')
  myMusic.pause()
  myMusic.currentTime = 0
  combatMusic.currentTime = 0
  combatMusic.volume = 0.4
  combatMusic.play()
}

function runOffscreen() {
  enableInput(false)
  document.querySelectorAll('[data-cross]').forEach(c => c.remove())
  document.querySelectorAll('[data-werewolf]').forEach(w => w.remove())
  setMoveDirection(1)
  lastTime = null
  requestAnimationFrame(stepOffscreen)
}

function stepOffscreen(time) {
  if (lastTime == null) {
    lastTime = time
    requestAnimationFrame(stepOffscreen)
    return
  }
  const delta = time - lastTime
  // Move Carmilla but keep the camera fixed so she can run off-screen
  updateVampire(delta, 1)
  updateGround(cameraX)
  lastTime = time

  if (getVampireX() - cameraX > WORLD_WIDTH + 5) {
    transitionToBossArea()
  } else {
    requestAnimationFrame(stepOffscreen)
  }
}

function transitionToBossArea() {
  transitionOverlay.classList.add('fade-out')
  setTimeout(() => {
    document.querySelectorAll('[data-background]').forEach(bg => bg.style.display = 'none')
    document.querySelectorAll('[data-midground]').forEach(mg => mg.style.display = 'none')
    document.querySelectorAll('[data-ground]').forEach(g => g.style.display = 'none')
    const fg = document.querySelector('.farground')
    if (fg) fg.style.display = 'none'
    bossBg.classList.remove('hide')
    setupDivineKnight()
    cameraX = 0
    worldElem.style.transform = 'translateX(0)'
    setVampireLeft(-10)
    transitionOverlay.classList.remove('fade-out')
    transitionOverlay.classList.add('fade-in')
    setTimeout(() => {
      transitionOverlay.classList.remove('fade-in')
      lastTime = null
      setMoveDirection(1)
      requestAnimationFrame(stepIntoCenter)
    }, 400)
  }, 400)
}

function stepIntoCenter(time) {
  if (lastTime == null) {
    lastTime = time
    requestAnimationFrame(stepIntoCenter)
    return
  }
  const delta = time - lastTime
  updateVampire(delta, 1)
  lastTime = time
  if (getVampireX() >= 50) {
    setMoveDirection(0)
    triggerBossEncounter()
  } else {
    requestAnimationFrame(stepIntoCenter)
  }
}

function handleStart() {
  transitionOverlay.classList.remove('fade-out')
  transitionOverlay.classList.add('fade-in')
  setTimeout(() => transitionOverlay.classList.remove('fade-in'), 400)

  lastTime = null
  speedScale = 1
  cameraX = 0
  distance = 0
  lastVampireX = 0
  bossTriggered = false
  worldElem.style.transform = 'translateX(0)'
  bossBg.classList.add('hide')
  document.querySelectorAll('[data-background]').forEach(bg => bg.style.display = 'block')
  document.querySelectorAll('[data-midground]').forEach(mg => mg.style.display = '')
  document.querySelectorAll('[data-ground]').forEach(g => g.style.display = '')
  const fg = document.querySelector('.farground')
  if (fg) fg.style.display = ''
  currentHearts = MAX_HEARTS
  isStaggered = false
  isInvincible = false
  isGameOver = false
  updateHeartDisplay()

  setupGround()
  setupVampire()
  setupCross()
  setupWerewolves()
  setupProjectiles()

  // Hide title splash & show backgrounds
  document.getElementById('title-bg').style.display = 'none'
  document.querySelectorAll('[data-background]').forEach(bg => bg.style.display = 'block')

  startScreenElem.classList.add('hide')
  endScreenElem.classList.add('hide')
  gameAreaElem.classList.remove('hide')
  heartContainer.classList.remove('hide')
  dialogueBox.classList.add('hidden')
  controlsScreenElem.classList.add('hide')

  dialogueMood.pause()
  dialogueMood.currentTime = 0
  gameOverMusic.pause()
  gameOverMusic.currentTime = 0

  window.requestAnimationFrame(update)
  myMusic.play()
  myMusic.volume = 0.25
}

function handleLose() {
  isGameOver = true
  setVampireLose()
  fireSound.play()
  deathSound.play()
  deathSound.volume = 0.5

  heartContainer.classList.add('hide')

  myMusic.pause()
  myMusic.currentTime = 0
  gameOverMusic.currentTime = 0
  gameOverMusic.volume = 0.4
  gameOverMusic.play()

  // allow death animation to play before fading
  setTimeout(() => {
    transitionOverlay.style.transition = 'opacity 2s ease'
    transitionOverlay.classList.add('fade-out')
    transitionOverlay.style.zIndex = '1000'

    let shown = false
    const showGameOver = () => {
      if (shown) return
      shown = true
      // Now that the screen is black, center the UI by resetting world position
      worldElem.style.transform = 'translateX(0)'
      cameraX = 0
      transitionOverlay.style.zIndex = '998'
      endScreenElem.classList.remove('hide')
      endScreenElem.classList.remove('fade-in')
      void endScreenElem.offsetWidth
      endScreenElem.classList.add('fade-in')
      document.addEventListener('keydown', handleStart, { once: true })
      document.addEventListener('click', handleStart, { once: true })
      document.addEventListener('touchstart', handleStart, { once: true })
    }

    transitionOverlay.addEventListener('transitionend', showGameOver, { once: true })
    setTimeout(showGameOver, 2100) // fallback in case transitionend doesn't fire
  }, 300)
}

  function removeHeart() {
    if (currentHearts <= 0) return
    currentHearts--
    updateHeartDisplay()
    fire