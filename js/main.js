import { setupGround, updateGround } from './ground.js'
import {
  setupVampire,
  updateVampire,
  getVampireRect,
  setVampireLose,
  getVampireX,
  setMoveDirection,
  enableInput,
  setVampireLeft,
  enterIdle,
  startIdleLoop,
  stopIdleLoop
} from './vampire.js'
import { setupCross, updateCross, getCrossRects } from './cross.js'
import { setupProjectiles, updateProjectiles } from './projectile.js'
import { setupWerewolves, updateWerewolves, getWerewolfElements, stopWolfGrowls } from './werewolf.js'
import { setupDivineKnight, walkOntoScreen, removeDivineKnight, startKnightAI, getKnightElement, getKnightRect, getKnightAttackRect, startDying, setKnightDyingFrame, getKnightX } from './divineKnight.js'
import { setupMana, updateMana } from './mana.js'
import { showBossHealth, hideBossHealth } from './boss.js'
import { setupHearts, updateHearts, getHeartElements } from './hearts.js'

const WORLD_WIDTH = 100
const WORLD_HEIGHT = 30
const SPEED_SCALE_INCREASE = 0.00001
const MAX_HEARTS = 6
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
const heartbeat = document.getElementById('heartbeat')
const retributionSound = document.getElementById('divine-retribution-sfx')
const knightDyingMusic = document.getElementById('divine-knight-dying-music')
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
const creditScreenElem = document.querySelector('[data-credit-screen]')
const creditContentElem = document.querySelector('[data-credit-content]')
const restartPromptElem = document.querySelector('[data-restart-prompt]')
const lightOverlay = document.getElementById('light-overlay')

let lastTime
let speedScale
let currentHearts
let isGameOver = false
let isInvincible = false
let cameraX = 0
let distance = 0
let lastVampireX = 0
let bossTriggered = false
let bossActive = false

const DISTANCE_TO_BOSS = 400

const initialDialogueLines = [
  { text: 'Carmilla, wake up.', speaker: 'Mirelle', avatar: 'assets/images/avatars/avatar-mirelle.png' },
  { text: "...What? What's happening?", speaker: 'Carmilla', avatar: 'assets/images/avatars/avatar-carmilla.png' },
  { text: 'Hunters. They broken through the gate. You need to get out—now.', speaker: 'Mirelle', avatar: 'assets/images/avatars/avatar-mirelle.png' },
  { text: 'What about you?', speaker: 'Carmilla', avatar: 'assets/images/avatars/avatar-carmilla.png' },
  { text: "I’m right behind you. I have to warn the others first. Go—through the back passage.", speaker: 'Mirelle', avatar: 'assets/images/avatars/avatar-mirelle.png' },
  { text: "But be careful. They've set traps along the path. Watch your footing.", speaker: 'Mirelle', avatar: 'assets/images/avatars/avatar-mirelle.png' }
]

const preBossLines = [
  { text: "I can see the forest up ahead, I'm almost free.", speaker: 'Carmilla', avatar: 'assets/images/avatars/avatar-carmilla.png' }
]

const bossDeath1 = [
  { text: "No... this isn't how it ends.", speaker: 'Divine Knight Seraphiel', avatar: 'assets/images/avatars/avatar-divine-knight.PNG' }
]

const bossDeath2 = [
  { text: 'Rest now. The Creator calls you home.', speaker: 'Carmilla', avatar: 'assets/images/avatars/avatar-carmilla.png' },
  { text: 'No....', speaker: 'Divine Knight Seraphiel', avatar: 'assets/images/avatars/avatar-divine-knight.PNG' },
  { text: 'My vow... it isn’t complete. Her will... remains... unfinished.', speaker: 'Divine Knight Seraphiel', avatar: 'assets/images/avatars/avatar-divine-knight.PNG' }
]

const bossDeath3 = [
  { text: 'Creator... grant me strength one last time.', speaker: 'Divine Knight Seraphiel', avatar: 'assets/images/avatars/avatar-divine-knight.PNG' }
]

const bossDeath4 = [
  { text: 'Divine....', speaker: 'Divine Knight Seraphiel', avatar: 'assets/images/avatars/avatar-divine-knight.PNG' }
]

const bossDeath5 = [
  { text: 'RETRIBUTION!', speaker: 'Divine Knight Seraphiel', avatar: 'assets/images/avatars/avatar-divine-knight.PNG' }
]

let dialogueLines = initialDialogueLines.slice()
const bossDialogueLines = [
  { text: 'Thats far enough...', speaker: '???', avatar: 'assets/images/avatars/avatar-divine-knight-hidden.png' },
  { text: "Whoever you are, step aside. I’ve already bled your pets across the road—don’t make me dirty my hands again.", speaker: 'Carmilla', avatar: 'assets/images/avatars/avatar-carmilla.png' },
  { text: 'Foolish vampire. I am Divine Knight Seraphiel, blade of the sanctum, warden of the last light. Your sins end here.', speaker: 'Divine Knight Seraphiel', avatar: 'assets/images/avatars/avatar-divine-knight.PNG' }
]

let currentLine = 0
let lastAdvanceTime = 0
let onDialogueComplete = null

// Initialize world scaling
setPixelToWorldScale()
window.addEventListener('resize', setPixelToWorldScale)

// Ensure end screen is hidden at load
endScreenElem.classList.add('hide')
creditScreenElem.classList.add('hide')

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
  updateWerewolves(delta, speedScale, cameraX, WORLD_WIDTH, getVampireX(), bossActive)
  updateProjectiles(delta, cameraX, WORLD_WIDTH, getCrossRects())
  updateHearts(cameraX, WORLD_WIDTH)
  updateSpeedScale(delta)
  updateDistance()
  updateMana(delta)

  if (!isInvincible && (checkCrossCollision() || checkWerewolfCollision() || checkKnightCollision())) {
    removeHeart()
  }
  checkHeartPickup()

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
  updateVampire(delta, speedScale);

  let x = getVampireX();

  if (bossActive) {
    if (x < 0) {
      setVampireLeft(0);
      x = 0;
    } else if (x > WORLD_WIDTH) {
      setVampireLeft(WORLD_WIDTH);
      x = WORLD_WIDTH;
    }
    cameraX = 0;
  } else {
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
  }

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

function checkKnightCollision() {
  const knight = getKnightElement()
  if (!knight) return false
  const state = knight.dataset.state
  if (!state || !state.startsWith('attack')) return false
  const frame = Number(knight.dataset.frame)
  if (frame < 2) return false
  const knightRect = getKnightAttackRect()
  const vampireRect = getVampireRect()
  return isCollision(knightRect, vampireRect)
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
  enableInput(true)
  showBossHealth()
  startKnightAI()
  stopIdleLoop()
  bossActive = true
  bossTriggered = false
  lastTime = null
  window.requestAnimationFrame(update)
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
  stopWolfGrowls()
  transitionOverlay.classList.add('fade-out')
  setTimeout(() => {
    document.querySelectorAll('[data-background]').forEach(bg => bg.style.display = 'none')
    document.querySelectorAll('[data-midground]').forEach(mg => mg.style.display = 'none')
    document.querySelectorAll('[data-ground]').forEach(g => g.style.display = '')
    const far = document.querySelector('.farground')
    if (far) far.style.display = ''
    document.querySelectorAll('.foreground').forEach(fg => fg.style.display = '')
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
    enterIdle()
    startIdleLoop()
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
  bossActive = false
  worldElem.style.transform = 'translateX(0)'
  bossBg.classList.add('hide')
  hideBossHealth()
  combatMusic.pause()
  combatMusic.currentTime = 0
  if (knightDyingMusic) {
    knightDyingMusic.pause()
    knightDyingMusic.currentTime = 0
  }
  heartbeat.pause()
  heartbeat.currentTime = 0
  removeDivineKnight()
  creditScreenElem.classList.add('hide')
  creditScreenElem.classList.remove('show-prompt')
  document.querySelectorAll('[data-background]').forEach(bg => bg.style.display = 'block')
  document.querySelectorAll('[data-midground]').forEach(mg => mg.style.display = '')
  document.querySelectorAll('[data-ground]').forEach(g => g.style.display = '')
  const far = document.querySelector('.farground')
  if (far) far.style.display = ''
  document.querySelectorAll('.foreground').forEach(fg => fg.style.display = '')
  currentHearts = MAX_HEARTS
  setupMana()
  isInvincible = false
  isGameOver = false
  updateHeartDisplay()

  stopIdleLoop()

  setupGround()
  setupVampire()
  setupCross()
  setupWerewolves()
  setupProjectiles()
  setupHearts()

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
  hideBossHealth()
  bossActive = false
  setVampireLose()
  fireSound.play()
  deathSound.play()
  deathSound.volume = 0.5

  heartContainer.classList.add('hide')
  manaContainer.classList.add('hide')

  combatMusic.pause()
  combatMusic.currentTime = 0
  removeDivineKnight()

  myMusic.pause()
  myMusic.currentTime = 0
  gameOverMusic.currentTime = 0
  gameOverMusic.volume = 0.4
  gameOverMusic.play()

  // allow full death animation to play before fading
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
  }, 800)
}

async function handleBossDefeat() {
  bossActive = false
  bossTriggered = true
  combatMusic.pause()
  combatMusic.currentTime = 0
  hideBossHealth()
  await playBossCutscene()
}

function showCreditsScreen() {
  removeDivineKnight()
  heartContainer.classList.add('hide')
  manaContainer.classList.add('hide')
  gameAreaElem.classList.add('hide')
  worldElem.style.transform = 'translateX(0)'
  cameraX = 0
  creditScreenElem.classList.remove('show-bg')
  creditScreenElem.classList.remove('show-prompt')
  restartPromptElem.classList.remove('blinking')
  creditContentElem.style.animation = 'none'
  void creditContentElem.offsetWidth
  creditContentElem.style.animation = ''
  creditScreenElem.classList.remove('hide')
  creditScreenElem.classList.remove('fade-in')
  void creditScreenElem.offsetWidth
  creditScreenElem.classList.add('fade-in')
  if (heartbeat.paused) {
    heartbeat.currentTime = 0
    heartbeat.volume = 0.5
    heartbeat.play()
  }

  const onCreditsEnd = () => {
    creditScreenElem.classList.add('show-bg')
    setTimeout(() => {
      creditScreenElem.classList.add('show-prompt')
      restartPromptElem.classList.add('blinking')
      document.addEventListener('keydown', restartFromCredits, { once: true })
      document.addEventListener('click', restartFromCredits, { once: true })
      document.addEventListener('touchstart', restartFromCredits, { once: true })
    }, 1000)
  }
  creditContentElem.addEventListener('animationend', onCreditsEnd, { once: true })
}

async function playBossCutscene() {
  enableInput(false)
  setMoveDirection(0)
  stopIdleLoop()
  if (knightDyingMusic && knightDyingMusic.paused) {
    knightDyingMusic.currentTime = 0
    knightDyingMusic.volume = 0.4
    knightDyingMusic.play()
  }

  await new Promise(res => startDying(res))
  setKnightDyingFrame(1)
  await runDialogue(bossDeath1, false, false)

  const offset = getVampireX() < getKnightX() ? -5 : 5
  await moveVampireTo(getKnightX() + offset)
  await runDialogue(bossDeath2, false, false)

  setKnightDyingFrame(2)
  await runDialogue(bossDeath3, false, false)

  setKnightDyingFrame(1)
  await runDialogue(bossDeath4, false, false)

  lightOverlay.classList.add('fade-in')
  await delay(1000)
  setKnightDyingFrame(0)
  await runDialogue(bossDeath5, false, false)

  lightOverlay.classList.add('flash')
  await delay(200)
  transitionOverlay.classList.add('fade-out')
  await delay(1500)
  lightOverlay.classList.remove('flash')
  lightOverlay.classList.remove('fade-in')

  if (knightDyingMusic) {
    knightDyingMusic.pause()
    knightDyingMusic.currentTime = 0
  }

  showCreditsScreen()
}

function runDialogue(lines, withBg = false, playMusic = true) {
  return new Promise(resolve => startDialogue(lines, resolve, withBg, playMusic))
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms))
}

function moveVampireTo(targetX) {
  return new Promise(resolve => {
    const dir = targetX < getVampireX() ? -1 : 1
    setMoveDirection(dir)
    lastTime = null
    const step = time => {
      if (lastTime == null) {
        lastTime = time
        requestAnimationFrame(step)
        return
      }
      const delta = time - lastTime
      updateVampire(delta, 1)
      lastTime = time
      const x = getVampireX()
      if ((dir === 1 && x >= targetX) || (dir === -1 && x <= targetX)) {
        setMoveDirection(0)
        enterIdle()
        resolve()
      } else {
        requestAnimationFrame(step)
      }
    }
    requestAnimationFrame(step)
  })
}

function restartFromCredits(e) {
  if (e) e.preventDefault()
  creditScreenElem.classList.remove('show-bg')
  creditScreenElem.classList.remove('show-prompt')
  restartPromptElem.classList.remove('blinking')
  creditScreenElem.classList.add('hide')
  heartbeat.pause()
  heartbeat.currentTime = 0
  document.getElementById('title-bg').style.display = ''
  startScreenElem.classList.remove('hide')
  document.addEventListener('keydown', handleTitleKey, { once: true })
  document.addEventListener('click', handleTitleKey, { once: true })
  document.addEventListener('touchstart', handleTitleKey, { once: true })
}

  function removeHeart() {
    if (currentHearts <= 0) return
    currentHearts--
    updateHeartDisplay()
    fireSound.currentTime = 0
    fireSound.volume = 0.4
    fireSound.play()

  // Vibration removed to prevent potential freezing on some devices
  const vampireElem = document.querySelector('[data-vampire]')
  vampireElem.classList.add('damaged')
  screenFlash.classList.add('active')
  setTimeout(() => screenFlash.classList.remove('active'), 100)
  document.body.classList.add('shake')
  isInvincible = true
  setTimeout(() => document.body.classList.remove('shake'), 300)
  setTimeout(() => {
    vampireElem.classList.remove('damaged')
  }, 300)
  setTimeout(() => (isInvincible = false), 1000)
}

function updateHeartDisplay() {
  heartContainer.innerHTML = ''
  for (let i = 0; i < MAX_HEARTS; i++) {
    const heart = document.createElement('img')
    heart.src = i < currentHearts ? 'assets/images/UI/heart-full.png' : 'assets/images/UI/heart-empty.png'
    heart.classList.add('heart')
    if (i < currentHearts) heart.classList.add('full-heart')
    heartContainer.appendChild(heart)
  }
}

function addHeart() {
  if (currentHearts >= MAX_HEARTS) return
  currentHearts++
  updateHeartDisplay()
}

function checkHeartPickup() {
  const vampireRect = getVampireRect()
  for (const heart of getHeartElements()) {
    if (isCollision(heart.getBoundingClientRect(), vampireRect)) {
      heart.remove()
      addHeart()
    }
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
let dialoguePlayMusic = true

function startDialogue(lines, onComplete, withBg = true, playMusic = true) {
  dialogueLines = lines
  currentLine = 0
  lastAdvanceTime = 0
  onDialogueComplete = onComplete
  dialogueWithBg = withBg
  dialoguePlayMusic = playMusic
  showDialogue()
}

function showDialogueLine(index) {
  const line = dialogueLines[index]
  if (
  retributionSound &&
  line.text.trim().toUpperCase() === 'DIVINE....'
) {
  setTimeout(() => {
    retributionSound.currentTime = 0
    retributionSound.play()
  }, 2000)
}
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

  if (dialogueLines === bossDialogueLines) {
    if (combatMusic.paused) {
      combatMusic.currentTime = 0
      combatMusic.volume = 0.4
      combatMusic.play()
    }
    dialogueMood.pause()
  } else if (dialoguePlayMusic && dialogueMood.paused) {
    dialogueMood.currentTime = 0
    dialogueMood.volume = 0.4
    dialogueMood.play()
  } else if (!dialoguePlayMusic) {
    dialogueMood.pause()
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

document.addEventListener('bossDefeated', handleBossDefeat)

export { currentHearts, MAX_HEARTS, updateHeartDisplay }




