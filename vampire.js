import { getCustomProperty, incrementCustomProperty, setCustomProperty } from "./updateCustomProperty.js"

const vampireElem = document.querySelector("[data-vampire]")
const JUMP_SPEED = 0.45
const GRAVITY = 0.0015
const VAMPIRE_FRAME_COUNT = 2
const FRAME_TIME = 100

let isJumping
let vampireFrame
let currentFrameTime
let yVelocity
export function setupVampire () {
    isJumping = false
    vampireFrame = 0
    currentFrameTime = 0
    yVelocity = 0
    setCustomProperty(vampireElem, "--bottom", 0)
    document.removeEventListener("keydown", onJump)
    document.addEventListener("keydown", onJump)
}

export function updateVampire(delta, speedScale) {
    handleRun(delta, speedScale)
    handleJump(delta)
}

export function getVampireRect() {
    return vampireElem.getBoundingClientRect()
}

export function setVampireLose() {
    vampireElem.src = "imgs/vampire-death.png"
}

function handleRun(delta, speedScale) {
    if (isJumping) {
        vampireElem.src = `imgs/vampire-stationary.png`
        return
    }

    if (currentFrameTime >= FRAME_TIME) {
        vampireFrame = (vampireFrame + 1) % VAMPIRE_FRAME_COUNT
        vampireElem.src = `imgs/vampire-run-${vampireFrame}.png`
        currentFrameTime -= FRAME_TIME
    }
    currentFrameTime += delta * speedScale
}

function handleJump(delta) {
    if (!isJumping) return

    incrementCustomProperty(vampireElem, "--bottom", yVelocity * delta)
    
    if (getCustomProperty(vampireElem, "--bottom") <=0) {
        setCustomProperty(vampireElem, "--bottom", 0 )
        isJumping = false
    }

    yVelocity -= GRAVITY * delta
}

function onJump(e) {
    if (e.code !== "Space" || isJumping) return

    yVelocity = JUMP_SPEED
    isJumping = true
}