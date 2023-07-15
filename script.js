import { setupGround, updateGround, } from './ground.js'
import { setupVampire, updateVampire, getVampireRect, setVampireLose } from './vampire.js'
import { setupCross, updateCross, getCrossRects } from './cross.js'

const WORLD_WIDTH = 100
const WORLD_HEIGHT = 30
const SPEED_SCALE_INCREASE = 0.00001

const worldElem = document.querySelector('[data-world]')
const scoreElem = document.querySelector('[data-score]')
const startScreenElem = document.querySelector('[data-start-screen]')
const myMusic = document.querySelector("[data-backgroundmusic]")
const fireSound = document.querySelector("[data-firesound]")
const deathSound = document.querySelector("[data-deathsound]")

setPixelToWorldScale()
window.addEventListener("resize", setPixelToWorldScale)
document.addEventListener("keydown", handleStart, { once: true })


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
    updateCross (delta, speedScale)
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
    score += delta * .01
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
        document.addEventListener("keydown", handleStart, { once: true}) 
        startScreenElem.classList.remove("hide")
        myMusic.pause()
    }, 100)
}

function setPixelToWorldScale() {
    let worldToPixelScale
    if (window.innerWidth / window.innerHeight < WORLD_WIDTH / WORLD_HEIGHT )
    {
        worldToPixelScale = window.innerWidth / WORLD_WIDTH
    } else {
        worldToPixelScale = window.innerHeight / WORLD_HEIGHT
    }

    worldElem.style.width = `${WORLD_WIDTH * worldToPixelScale}px`
    worldElem.style.height = `${WORLD_HEIGHT * worldToPixelScale}px`

}
