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
import { setupMana, updateMana } from './mana.js'

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
const manaContainer = document.querySelector('.mana-container')
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
  updateMana(delta)

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
  dialogueMood.pause()
  dialogueMood.currentTime = 0
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
    document.querySelectorAll('[data-ground]').forEach(g => g.style.display = '')
    const far = document.querySelector('.farground')
    if (far) far.style.display = ''
    const fg = document.querySelector('.foreground')
    if (fg) fg.style.display = ''
    setupGround()
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
  const far = document.querySelector('.farground')
  if (far) far.style.display = ''
  const fg = document.querySelector('.foreground')
  if (fg) fg.style.display = ''
  currentHearts = MAX_HEARTS
  setupMana()
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
  manaContainer.classList.remove('hide')
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
  manaContainer.classList.add('hide')

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

let dialogueWithBg = true

function startDialogue(lines, onComplete, withBg = true) {
  dialogueLines = lines
  currentLine = 0
  lastAdvanceTime = 0
  onDialogueComplete = onComplete
  dialogueWithBg = withBg
  showDialogue()
}

function showDialogueLine(index) {
  const line = dialogueLines[index]
  dialogueText.textContent = line.text
  speakerNameElem.textContent = line.speaker
  avatarElem.src = line.avatar
  speakerNameElem.className = 'speaker-name ' + line.speaker.toLowerCase()
}

function showDialogue() {
  // hide title and optionally show bedroom
  document.getElementById('title-bg').style.display = 'none'
  dialogueBg.style.opacity = dialogueWithBg ? '1' : '0'

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
    if (dialogueLines === bossDialogueLines && currentLine === 2) {
      cleanupDialogueListeners()
      dialogueBox.classList.add('hidden')
      walkOntoScreen(() => {
        showDialogueLine(currentLine)
        dialogueBox.classList.remove('hidden')
        setTimeout(() => {
          document.addEventListener('keydown', advanceDialogue)
          document.addEventListener('click', advanceDialogue)
          document.addEventListener('touchstart', advanceDialogue)
          nextButton.addEventListener('click', advanceDialogue)
        }, 100)
      })
      return
    }
    showDialogueLine(currentLine)
  } else {
    dialogueBox.classList.add('hidden')
    dialogueBg.style.opacity = '0'
    cleanupDialogueListeners()
    if (typeof onDialogueComplete === 'function') {
      const cb = onDialogueComplete
      onDialogueComplete = null
      cb()
    }
  }

  if (e) e.preventDefault()
}

function cleanupDialogueListeners() {
  document.removeEventListener('keydown', advanceDialogue)
  document.removeEventListener('click', advanceDialogue)
  document.removeEventListener('touchstart', advanceDialogue)
  nextButton.removeEventListener('click', advanceDialogue)
}

function showControls() {
  transitionOverlay.classList.add('fade-out')
  controlsScreenElem.classList.remove('hide')
  document.addEventListener('keydown', handleControlsKey, { once: true })
  document.addEventListener('click', handleControlsKey, { once: true })
  document.addEventListener('touchstart', handleControlsKey, { once: true })
}

function handleControlsKey(e) {
  if (e) e.preventDefault()
  controlsScreenElem.classList.add('hide')
  transitionOverlay.classList.remove('fade-out')
  startDialogue(initialDialogueLines, handleStart)
}

function handleTitleKey(e) {
  if (e) e.preventDefault()
  startScreenElem.classList.add('hide')
  showControls()
}

window.addEventListener('keydown', handleTitleKey, { once: true })
window.addEventListener('click', handleTitleKey, { once: true })
window.addEventListener('touchstart', handleTitleKey, { once: true })
window.addEventListener('touchstart', e => {
  // treat touch as spacebar
  document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', code: 'Space', bubbles: true }))
}, { passive: false })

export { currentHearts, MAX_HEARTS, updateHeartDisplay }




