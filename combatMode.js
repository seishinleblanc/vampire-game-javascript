import { currentHearts, MAX_HEARTS, updateHeartDisplay } from './script.js'


let posX = 50
let posY = 50
const step = 2

let currentDirection = "down"
let frameIndex = 0
let lastFrameTime = 0
const frameInterval = 150

let isJumping = false
let jumpStartY = 0
let jumpProgress = 0
const jumpDuration = 20 // frames
const jumpHeight = 10   // percentage of vertical lift

const directions = {
  up: ["carmilla-back-0.png", "carmilla-back-1.png", "carmilla-back-2.png"],
  down: ["carmilla-front-0.png", "carmilla-front-1.png", "carmilla-front-2.png"],
  left: ["carmilla-left-0.png", "carmilla-left-1.png", "carmilla-left-2.png"],
  right: ["carmilla-right-0.png", "carmilla-right-1.png", "carmilla-right-2.png"]
}

export function enterCombatMode(worldElem, transitionOverlay, myMusic, combatMusic) {
    myMusic.pause()
    myMusic.currentTime = 0
  
    combatMusic.currentTime = 0
    combatMusic.volume = 0.4
    combatMusic.play()
  
    transitionOverlay.classList.add('fade-out')
    setTimeout(() => {
      setupCombatScene()
      transitionOverlay.classList.remove('fade-out')
      transitionOverlay.classList.add('fade-in')
      setTimeout(() => {
        transitionOverlay.classList.remove('fade-in')
      }, 400)
    }, 400)
  
    document.addEventListener("keydown", handleMovement)
    requestAnimationFrame(updateJump)
  }
  

function setupCombatScene() {
  document.querySelector("[data-game-area]")?.classList.add("hide")
  const combatContainer = document.getElementById("combat-container")
  const combatWorld = document.getElementById("combat-world")
  combatContainer?.classList.remove("hide")

  const heartContainer = document.querySelector('[data-hearts]')
if (heartContainer) updateHeartDisplay()


  let carmilla = document.getElementById("combat-vampire")
  if (!carmilla) {
    carmilla = document.createElement("img")
    carmilla.id = "combat-vampire"
    carmilla.src = `imgs/carmilla/${directions.down[0]}`
    carmilla.style.position = "absolute"
    carmilla.style.width = "6vmin"
    carmilla.style.height = "auto"
    carmilla.style.zIndex = "1000"
    carmilla.style.imageRendering = "pixelated"
    combatWorld?.appendChild(carmilla)
  }

  posX = 50
  posY = 50
  currentDirection = "down"
  frameIndex = 0
  isJumping = false
  updateCarmillaPosition()
}

function handleMovement(e) {
  const now = Date.now()
  let moved = false

  if (!isJumping) {
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
        posY = Math.max(0, posY - step)
        currentDirection = "up"
        moved = true
        break
      case 'ArrowDown':
      case 's':
        posY = Math.min(100, posY + step)
        currentDirection = "down"
        moved = true
        break
      case 'ArrowLeft':
      case 'a':
        posX = Math.max(0, posX - step)
        currentDirection = "left"
        moved = true
        break
      case 'ArrowRight':
      case 'd':
        posX = Math.min(100, posX + step)
        currentDirection = "right"
        moved = true
        break
    }
  }

  // Initiate jump
  if (e.code === "Space" && !isJumping) {
    isJumping = true
    jumpStartY = posY
    jumpProgress = 0
  }

  if (moved && now - lastFrameTime > frameInterval) {
    frameIndex = (frameIndex + 1) % 3
    lastFrameTime = now
  }

  updateCarmillaPosition()
}

function updateJump() {
  if (isJumping) {
    // Sinusoidal jump arc
    jumpProgress++
    const t = jumpProgress / jumpDuration
    const arc = Math.sin(Math.PI * t) * jumpHeight
    posY = jumpStartY - arc

    if (jumpProgress >= jumpDuration) {
      posY = jumpStartY
      isJumping = false
    }

    updateCarmillaPosition()
  }

  requestAnimationFrame(updateJump)
}

function updateCarmillaPosition() {
  const carmilla = document.getElementById("combat-vampire")
  if (carmilla) {
    carmilla.style.left = `${posX}%`
    carmilla.style.top = `${posY}%`
    carmilla.style.transform = "translate(-50%, -50%)"
    carmilla.src = `imgs/carmilla/${directions[currentDirection][frameIndex]}`
  }
}
