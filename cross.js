import { getCustomProperty, incrementCustomProperty, setCustomProperty } from "./updateCustomProperty.js"

const SPEED = 0.05
const CROSS_INTERVAL_MIN = 500
const CROSS_INTERVAL_MAX = 2000
const worldElem = document.querySelector("[data-world]")

let nextCrossTime
export function setupCross() {
    nextCrossTime = CROSS_INTERVAL_MIN
    document.querySelectorAll("[data-cross]").forEach(cross => {
        cross.remove()
    })
}

export function updateCross(delta, speedScale) {
    document.querySelectorAll("[data-cross]").forEach(cross => {
        incrementCustomProperty(cross, "--left", delta * speedScale * SPEED * -1)
        if (getCustomProperty(cross, "--left") <= -100) {
            cross.remove()
        }
    })

    if (nextCrossTime <= 0) {
        createCross()
        nextCrossTime = randomNumberBetween(CROSS_INTERVAL_MIN, CROSS_INTERVAL_MAX) / speedScale
    }
    nextCrossTime -= delta
}

export function getCrossRects() {
    return [...document.querySelectorAll("[data-cross]")].map(cross => {
        return cross.getBoundingClientRect()
    })
}

function createCross() {
    const cross = document.createElement("img")
    cross.dataset.cross = true
    cross.src = "imgs/cactus.png"
    cross.classList.add("cross")
    setCustomProperty(cross, "--left", 100)
    worldElem.append(cross)
}

function randomNumberBetween(min, max) {
    return Math.floor(Math.random() * (max - min +1) + min)
}
