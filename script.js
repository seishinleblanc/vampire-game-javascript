// import { setupGround, updateGround, } from './ground.js'
// import { setupVampire, updateVampire, getVampireRect, setVampireLose } from './vampire.js'
// import { setupCross, updateCross, getCrossRects } from './cross.js'

// const WORLD_WIDTH = 100
// const WORLD_HEIGHT = 30
// const SPEED_SCALE_INCREASE = 0.00001

// const worldElem = document.querySelector('[data-world]')
// const scoreElem = document.querySelector('[data-score]')
// const startScreenElem = document.querySelector('[data-start-screen]')
// const endScreenElem = document.querySelector('[data-end-screen]')
// const myMusic = document.querySelector("[data-backgroundmusic]")
// const fireSound = document.querySelector("[data-firesound]")
// const deathSound = document.querySelector("[data-deathsound]")

// setPixelToWorldScale()
// window.addEventListener("resize", setPixelToWorldScale)
// document.addEventListener("keydown", handleStart, { once: true })
// endScreenElem.classList.add("hide")


// let lastTime
// let speedScale
// let score
// function update(time) {
//     if (lastTime == null) {
//         lastTime = time
//         window.requestAnimationFrame(update)
//         return
//     }
//     const delta = time - lastTime

//     updateGround(delta, speedScale)
//     updateVampire(delta, speedScale)
//     updateCross (delta, speedScale)
//     updateSpeedScale(delta)
//     updateScore(delta)
//     if (checkLose()) return handleLose()

//     lastTime = time
//     window.requestAnimationFrame(update)
// }

// function checkLose() {
//     const vampireRect = getVampireRect()
//     return getCrossRects().some(rect => isCollision(rect, vampireRect))
// }

// function isCollision(rect1, rect2) {
//     return (
//     rect1.left < rect2.right && 
//     rect1.top < rect2.bottom && 
//     rect1.right > rect2.left && 
//     rect1.bottom > rect2.top
//     )
// }

// function updateSpeedScale(delta) {
//     speedScale += delta * SPEED_SCALE_INCREASE
// }

// function updateScore(delta) {
//     score += delta * .01
//     scoreElem.textContent = Math.floor(score)
// }

// function handleStart() {
//     lastTime = null
//     speedScale = 1
//     score = 0
//     setupGround()
//     setupVampire()
//     setupCross()
//     startScreenElem.classList.add("hide")
//     endScreenElem.classList.add("hide")
//     window.requestAnimationFrame(update)
//     myMusic.play()
//     myMusic.volume = 0.25
// } 

// function handleLose() {
//     setVampireLose()
//     fireSound.play()
//     deathSound.play()
//     deathSound.volume = 0.5
//     setTimeout(() => {
//         document.addEventListener("keydown", handleStart, { once: true}) 
//         endScreenElem.classList.remove("hide")
//         myMusic.pause()
//     }, 300)
// }

// function setPixelToWorldScale() {
//     let worldToPixelScale
//     if (window.innerWidth / window.innerHeight < WORLD_WIDTH / WORLD_HEIGHT )
//     {
//         worldToPixelScale = window.innerWidth / WORLD_WIDTH
//     } else {
//         worldToPixelScale = window.innerHeight / WORLD_HEIGHT
//     }

//     worldElem.style.width = `${WORLD_WIDTH * worldToPixelScale}px`
//     worldElem.style.height = `${WORLD_HEIGHT * worldToPixelScale}px`

// }

import { setupGround, updateGround } from './ground.js'
import {
  setupVampire,
  updateVampire,
  getVampireRect,
  setVampireLose
} from './vampire.js'
import { setupCross, updateCross, getCrossRects } from './cross.js'
import { enterCombatMode } from './combatMode.js'

const WORLD_WIDTH = 100
const WORLD_HEIGHT = 30
const SPEED_SCALE_INCREASE = 0.00001
const MAX_HEARTS = 3

const worldElem = document.querySelector('[data-world]')
const scoreElem = document.querySelector('[data-score]')
const startScreenElem = document.querySelector('[data-start-screen]')
const endScreenElem = document.querySelector('[data-end-screen]')
const gameAreaElem = document.querySelector('[data-game-area]')
const myMusic = document.querySelector("[data-backgroundmusic]")
const fireSound = document.querySelector("[data-firesound]")
const deathSound = document.querySelector("[data-deathsound]")
const dialogueMood = document.getElementById("dialogue-mood")
const gameOverMusic = document.querySelector("[data-gameovermusic]")
const combatMusic = document.querySelector("[data-combatmusic]")
const heartContainer = document.querySelector('[data-hearts]')
const screenFlash = document.getElementById("screen-flash")
const transitionOverlay = document.getElementById("transition-overlay")
const dialogueBg = document.getElementById("dialogue-bg")

let lastTime
let speedScale
let score
let currentHearts
let isStaggered = false
let isInvincible = false
let inCombatMode = false

setPixelToWorldScale()
window.addEventListener("resize", setPixelToWorldScale)
endScreenElem.classList.add("hide")

function update(time) {
  if (lastTime == null) {
    lastTime = time
    window.requestAnimationFrame(update)
    return
  }
  const delta = time - lastTime

  if (inCombatMode) {
    window.requestAnimationFrame(update)
    return
  }

  updateGround(delta, speedScale)
  if (!isStaggered) updateVampire(delta, speedScale)
  updateCross(delta, speedScale)
  updateSpeedScale(delta)
  updateScore(delta)

  if (!isInvincible && checkCrossCollision()) {
    removeHeart()
  }

  if (!inCombatMode && score >= 150) {
    inCombatMode = true
    enterCombatMode(worldElem, transitionOverlay, myMusic, combatMusic)
  }

  if (currentHearts <= 0) return handleLose()

  lastTime = time
  window.requestAnimationFrame(update)
}

function checkCrossCollision() {
  const vampireRect = getVampireRect()
  return getCrossRects().some(rect => isCollision(rect, vampireRect))
}

function isCollision(rect1, rect2) {
  return (
    rect1.left < rect2.right &&
    rect1.top < rect2.bottom &&
    rect1.right > rect2.left &&
    rect1.bottom > rect2.top
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
  currentHearts = MAX_HEARTS
  isStaggered = false
  isInvincible = false
  inCombatMode = false
  updateHeartDisplay()

  setupGround()
  setupVampire()
  setupCross()

  document.getElementById("title-bg").style.display = "none"

  document.querySelectorAll('[data-background]').forEach(bg => {
    bg.style.display = 'block'
  })

  

  startScreenElem.classList.add("hide")
  endScreenElem.classList.add("hide")
  gameAreaElem.classList.remove("hide")
  dialogueBox.classList.remove("fade-in")
  dialogueBox.classList.add("hidden")

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
    endScreenElem.classList.remove("hide")
    document.addEventListener("keydown", handleStart, { once: true })
    document.addEventListener("click", handleStart, { once: true })
    document.addEventListener("touchstart", handleStart, { once: true })
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

  setTimeout(() => {
    isInvincible = false
  }, 1000)
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
  let worldToPixelScale
  if (window.innerWidth / window.innerHeight < WORLD_WIDTH / WORLD_HEIGHT) {
    worldToPixelScale = window.innerWidth / WORLD_WIDTH
  } else {
    worldToPixelScale = window.innerHeight / WORLD_HEIGHT
  }

  worldElem.style.width = `${WORLD_WIDTH * worldToPixelScale}px`
  worldElem.style.height = `${WORLD_HEIGHT * worldToPixelScale}px`
}

// 🩸 Dialogue System
const dialogueBox = document.getElementById("dialogue-box")
const dialogueText = document.getElementById("dialogue-text")
const nextButton = document.getElementById("next-button")
const avatarElem = document.getElementById("avatar")
const speakerNameElem = document.getElementById("speaker-name")

const dialogueLines = [
  { text: "Carmilla, wake up.", speaker: "Mirelle", avatar: "imgs/avatar-mirelle.png" },
  { text: "...What? What's happening?", speaker: "Carmilla", avatar: "imgs/avatar-carmilla.png" },
  { text: "Hunters. They breached the gate. You need to get out—now.", speaker: "Mirelle", avatar: "imgs/avatar-mirelle.png" },
  { text: "What about you?", speaker: "Carmilla", avatar: "imgs/avatar-carmilla.png" },
  { text: "I'll hold them off. Take the back exit—", speaker: "Mirelle", avatar: "imgs/avatar-mirelle.png" },
  { text: "But be careful. They've set traps along the path. Watch your footing.", speaker: "Mirelle", avatar: "imgs/avatar-mirelle.png" }
]

let currentLine = 0
let dialogueActive = false
let lastAdvanceTime = 0

function handleTitleKey(e) {
  if (e) e.preventDefault()
  startScreenElem.classList.add("hide")
  showDialogue()
}

function showDialogueLine(index) {
  const line = dialogueLines[index]
  dialogueText.textContent = line.text
  speakerNameElem.textContent = line.speaker
  avatarElem.src = line.avatar
  speakerNameElem.className = "speaker-name " + line.speaker.toLowerCase()
}

function showDialogue() {
  dialogueActive = true
  if (dialogueBg) dialogueBg.style.opacity = "1"
  dialogueBox.classList.remove("hidden")
  dialogueBox.classList.remove("fade-in")
  void dialogueBox.offsetWidth
  dialogueBox.classList.add("fade-in")

  if (dialogueMood.paused) {
    dialogueMood.currentTime = 0
    dialogueMood.volume = 0.4
    dialogueMood.play()
  }

  showDialogueLine(currentLine)

  setTimeout(() => {
    document.addEventListener("keydown", advanceDialogue)
    document.addEventListener("click", advanceDialogue)
    document.addEventListener("touchstart", advanceDialogue)
    nextButton.addEventListener("click", advanceDialogue)
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
    dialogueBox.classList.add("hidden")
    dialogueActive = false
    if (dialogueBg) dialogueBg.style.opacity = "0"
    cleanupDialogueListeners()
    handleStart()
  }

  if (e) e.preventDefault()
}

function cleanupDialogueListeners() {
  document.removeEventListener("keydown", advanceDialogue)
  document.removeEventListener("click", advanceDialogue)
  document.removeEventListener("touchstart", advanceDialogue)
  nextButton.removeEventListener("click", advanceDialogue)
}

window.addEventListener("keydown", handleTitleKey, { once: true })
window.addEventListener("click", handleTitleKey, { once: true })
window.addEventListener("touchstart", handleTitleKey, { once: true })

window.addEventListener("touchstart", (e) => {
  const event = new KeyboardEvent("keydown", { key: " ", code: "Space", bubbles: true })
  document.dispatchEvent(event)
}, { passive: false })

export { currentHearts, MAX_HEARTS, updateHeartDisplay }


