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
import { setupVampire, updateVampire, getVampireRect, setVampireLose } from './vampire.js'
import { setupCross, updateCross, getCrossRects } from './cross.js'

const WORLD_WIDTH = 100
const WORLD_HEIGHT = 30
const SPEED_SCALE_INCREASE = 0.00001

const worldElem = document.querySelector('[data-world]')
const scoreElem = document.querySelector('[data-score]')
const startScreenElem = document.querySelector('[data-start-screen]')
const endScreenElem = document.querySelector('[data-end-screen]')
const gameAreaElem = document.querySelector('[data-game-area]')
const myMusic = document.querySelector("[data-backgroundmusic]")
const fireSound = document.querySelector("[data-firesound]")
const deathSound = document.querySelector("[data-deathsound]")
const dialogueMood = document.getElementById("dialogue-mood")

setPixelToWorldScale()
window.addEventListener("resize", setPixelToWorldScale)
document.addEventListener("keydown", handleTitleKey, { once: true })
endScreenElem.classList.add("hide")

let lastTime
let speedScale
let score

function update(time) {
    if (lastTime == null) {
        lastTime = time
        window.requestAnimationFrame(update)
        return
    }
    const delta = time - lastTime

    updateGround(delta, speedScale)
    updateVampire(delta, speedScale)
    updateCross(delta, speedScale)
    updateSpeedScale(delta)
    updateScore(delta)
    if (checkLose()) return handleLose()

    lastTime = time
    window.requestAnimationFrame(update)
}

function checkLose() {
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
    setupGround()
    setupVampire()
    setupCross()
    startScreenElem.classList.add("hide")
    endScreenElem.classList.add("hide")
    gameAreaElem.classList.remove("hide")
    dialogueBox.classList.remove("fade-in")
    dialogueBox.classList.add("hidden")

    // Stop dialogue ambience
    dialogueMood.pause()
    dialogueMood.currentTime = 0

    // Start game
    window.requestAnimationFrame(update)
    myMusic.play()
    myMusic.volume = 0.25
}

function handleLose() {
    setVampireLose()
    fireSound.play()
    deathSound.play()
    deathSound.volume = 0.5
    setTimeout(() => {
        document.addEventListener("keydown", handleStart, { once: true })
        endScreenElem.classList.remove("hide")
        myMusic.pause()
    }, 300)
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
    {
        text: "Carmilla, wake up.",
        speaker: "Mirelle",
        avatar: "imgs/avatar-mirelle.png"
    },
    {
        text: "...What? What's happening?",
        speaker: "Carmilla",
        avatar: "imgs/avatar-carmilla.png"
    },
    {
        text: "Hunters. They breached the gate. You need to get out—now.",
        speaker: "Mirelle",
        avatar: "imgs/avatar-mirelle.png"
    },
    {
        text: "What about you?",
        speaker: "Carmilla",
        avatar: "imgs/avatar-carmilla.png"
    },
    {
        text: "I'll hold them off. Take the back exit—",
        speaker: "Mirelle",
        avatar: "imgs/avatar-mirelle.png"
    },
    {
        text: "But be careful. They've set traps along the path. Watch your footing.",
        speaker: "Mirelle",
        avatar: "imgs/avatar-mirelle.png"
    }
]

let currentLine = 0
let dialogueActive = false

function handleTitleKey() {
    startScreenElem.classList.add("hide")
    showDialogue()
}

function showDialogueLine(index) {
    const line = dialogueLines[index]
    dialogueText.textContent = line.text
    speakerNameElem.textContent = line.speaker
    avatarElem.src = line.avatar

    // Update name color
    speakerNameElem.className = "speaker-name " + line.speaker.toLowerCase()
}

function showDialogue() {
    dialogueActive = true
    dialogueBox.classList.remove("hidden")

    // Fade-in animation
    dialogueBox.classList.remove("fade-in")
    void dialogueBox.offsetWidth
    dialogueBox.classList.add("fade-in")

    // Start dialogue ambient sound
    dialogueMood.currentTime = 0
    dialogueMood.volume = 0.4
    dialogueMood.play()

    showDialogueLine(currentLine)
}

nextButton.addEventListener("click", () => {
    currentLine++
    if (currentLine < dialogueLines.length) {
        showDialogueLine(currentLine)
    } else {
        dialogueBox.classList.add("hidden")
        dialogueActive = false
        handleStart()
    }
})

window.addEventListener("load", () => {
    // Title screen waits
})
