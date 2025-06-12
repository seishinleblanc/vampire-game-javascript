import { setupGround, updateGround } from './ground.js'
import {
  setupVampire,
  updateVampire,
  getVampireRect,
  setVampireLose,
  getVampireX
} from './vampire.js'
import { setupCross, updateCross, getCrossRects } from './cross.js'
import { getCustomProperty } from './updateCustomProperty.js'


const WORLD_WIDTH = 100
const WORLD_HEIGHT = 30
const SPEED_SCALE_INCREASE = 0.00001
const MAX_HEARTS = 3
const CAMERA_DEADZONE = 5  // how far from center before camera scrolls

const worldElem = document.querySelector('[data-world]')
const scoreElem = document.querySelector('[data-score]')
const startScreenElem = document.querySelector('[data-start-screen]')
const endScreenElem = document.querySelector('[data-end-screen]')
const gameAreaElem = document.querySelector('[data-game-area]')
const myMusic = document.querySelector('[data-backgroundmusic]')
const fireSound = document.querySelector('[data-firesound]')
const deathSound = document.querySelector('[data-deathsound]')
const dialogueMood = document.getElementById('dialogue-mood')
const gameOverMusic = document.querySelector('[data-gameovermusic]')
const heartContainer = document.querySelector('[data-hearts]')
const screenFlash = document.getElementById('screen-flash')
const transitionOverlay = document.getElementById('transition-overlay')
const dialogueBg = document.getElementById('dialogue-bg')
const dialogueBox = document.getElementById('dialogue-box')
const dialogueText = document.getElementById('dialogue-text')
const nextButton = document.getElementById('next-button')
const avatarElem = document.getElementById('avatar')
const speakerNameElem = document.getElementById('speaker-name')

let lastTime
let speedScale
let score
let currentHearts
let isStaggered = false
let isInvincible = false
let cameraX = 0

const dialogueLines = [
  { text: 'Carmilla, wake up.', speaker: 'Mirelle', avatar: 'imgs/avatar-mirelle.png' },
  { text: "...What? What's happening?", speaker: 'Carmilla', avatar: 'imgs/avatar-carmilla.png' },
  { text: 'Hunters. They breached the gate. You need to get out—now.', speaker: 'Mirelle', avatar: 'imgs/avatar-mirelle.png' },
  { text: 'What about you?', speaker: 'Carmilla', avatar: 'imgs/avatar-carmilla.png' },
  { text: "I'll hold them off. Take the back exit—", speaker: 'Mirelle', avatar: 'imgs/avatar-mirelle.png' },
  { text: "But be careful. They've set traps along the path. Watch your footing.", speaker: 'Mirelle', avatar: 'imgs/avatar-mirelle.png' }
]

let currentLine = 0
let lastAdvanceTime = 0

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
  updateSpeedScale(delta)
  updateScore(delta)

  if (!isInvincible && checkCrossCollision()) {
    removeHeart()
  }

  if (currentHearts <= 0) return handleLose()

  lastTime = time
  window.requestAnimationFrame(update)
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

function updateScore(delta) {
  score += delta * 0.01
  scoreElem.textContent = Math.floor(score)
}

function handleStart() {
  lastTime = null
  speedScale = 1
  score = 0
  cameraX = 0
  currentHearts = MAX_HEARTS
  isStaggered = false
  isInvincible = false
  updateHeartDisplay()

  setupGround()
  setupVampire()
  setupCross()

  // Hide title splash & show backgrounds
  document.getElementById('title-bg').style.display = 'none'
  document.querySelectorAll('[data-background]').forEach(bg => bg.style.display = 'block')

  startScreenElem.classList.add('hide')
  endScreenElem.classList.add('hide')
  gameAreaElem.classList.remove('hide')
  scoreElem.classList.remove('hide')
  dialogueBox.classList.add('hidden')

  dialogueMood.pause()
  dialogueMood.currentTime = 0
  gameOverMusic.pause()
  gameOverMusic.currentTime = 0

  window.requestAnimationFrame(update)
  myMusic.play()
  myMusic.volume = 0.25
}

function handleLose() {
  setVampireLose()
  fireSound.play()
  deathSound.play()
  deathSound.volume = 0.5

  myMusic.pause()
  myMusic.currentTime = 0
  gameOverMusic.currentTime = 0
  gameOverMusic.volume = 0.4
  gameOverMusic.play()

  setTimeout(() => {
    endScreenElem.classList.remove('hide')
    document.addEventListener('keydown', handleStart, { once: true })
    document.addEventListener('click', handleStart, { once: true })
    document.addEventListener('touchstart', handleStart, { once: true })
  }, 300)
}

function removeHeart() {
  if (currentHearts <= 0) return
  currentHearts--
  updateHeartDisplay()
  fireSound.currentTime = 0
  fireSound.volume = 0.4
  fireSound.play()

  if (navigator.vibrate) navigator.vibrate(100)
  const vampireElem = document.querySelector('[data-vampire]')
  vampireElem.classList.add('damaged')
  screenFlash.classList.add('active')
  setTimeout(() => screenFlash.classList.remove('active'), 100)
  isStaggered = true
  isInvincible = true
  setTimeout(() => {
    vampireElem.classList.remove('damaged')
    isStaggered = false
  }, 300)
  setTimeout(() => (isInvincible = false), 1000)
}

function updateHeartDisplay() {
  heartContainer.innerHTML = ''
  for (let i = 0; i < MAX_HEARTS; i++) {
    const heart = document.createElement('img')
    heart.src = i < currentHearts ? 'imgs/heart-full.png' : 'imgs/heart-empty.png'
    heart.classList.add('heart')
    if (i < currentHearts) heart.classList.add('full-heart')
    heartContainer.appendChild(heart)
  }
}

function setPixelToWorldScale() {
  let scale
  if (window.innerWidth / window.innerHeight < WORLD_WIDTH / WORLD_HEIGHT) {
    scale = window.innerWidth / WORLD_WIDTH
  } else {
    scale = window.innerHeight / WORLD_HEIGHT
  }
  worldElem.style.width = `${WORLD_WIDTH * scale}px`
  worldElem.style.height = `${WORLD_HEIGHT * scale}px`
}

// 🩸 Dialogue System

function showDialogueLine(index) {
  const line = dialogueLines[index]
  dialogueText.textContent = line.text
  speakerNameElem.textContent = line.speaker
  avatarElem.src = line.avatar
  speakerNameElem.className = 'speaker-name ' + line.speaker.toLowerCase()
}

function showDialogue() {
  // hide title and show bedroom
  document.getElementById('title-bg').style.display = 'none'
  dialogueBg.style.opacity = '1'

  dialogueBox.classList.remove('hidden')
  dialogueBox.classList.remove('fade-in')
  void dialogueBox.offsetWidth
  dialogueBox.classList.add('fade-in')

  if (dialogueMood.paused) {
    dialogueMood.currentTime = 0
    dialogueMood.volume = 0.4
    dialogueMood.play()
  }

  showDialogueLine(currentLine)
  setTimeout(() => {
    document.addEventListener('keydown', advanceDialogue)
    document.addEventListener('click', advanceDialogue)
    document.addEventListener('touchstart', advanceDialogue)
    nextButton.addEventListener('click', advanceDialogue)
  }, 300)
}

function advanceDialogue(e) {
  const now = Date.now()
  if (now - lastAdvanceTime < 300) return
  lastAdvanceTime = now

  currentLine++
  if (currentLine < dialogueLines.length) {
    showDialogueLine(currentLine)
  } else {
    dialogueBox.classList.add('hidden')
    dialogueBg.style.opacity = '0'
    cleanupDialogueListeners()
    handleStart()
  }

  if (e) e.preventDefault()
}

function cleanupDialogueListeners() {
  document.removeEventListener('keydown', advanceDialogue)
  document.removeEventListener('click', advanceDialogue)
  document.removeEventListener('touchstart', advanceDialogue)
  nextButton.removeEventListener('click', advanceDialogue)
}

function handleTitleKey(e) {
  if (e) e.preventDefault()
  startScreenElem.classList.add('hide')
  showDialogue()
}

window.addEventListener('keydown', handleTitleKey, { once: true })
window.addEventListener('click', handleTitleKey, { once: true })
window.addEventListener('touchstart', handleTitleKey, { once: true })
window.addEventListener('touchstart', e => {
  // treat touch as spacebar
  document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', code: 'Space', bubbles: true }))
}, { passive: false })

export { currentHearts, MAX_HEARTS, updateHeartDisplay }



