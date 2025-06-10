// import { getCustomProperty, incrementCustomProperty, setCustomProperty } from './updateCustomProperty.js'


// const SPEED = 0.05
// const groundElems = document.querySelectorAll("[data-ground]")

// export function setupGround(){
//     setCustomProperty(groundElems[0], "--left", 0)
//     setCustomProperty(groundElems[1], "--left", 300)
// }

// export function updateGround (delta, speedScale) {
//     groundElems.forEach(ground => {
//         incrementCustomProperty(ground, "--left", delta * speedScale * SPEED * -1)

//         if (getCustomProperty(ground, "--left") <= -300) {
//             incrementCustomProperty(ground, "--left", 600)
//         }
//     })
// }

import {
    getCustomProperty,
    incrementCustomProperty,
    setCustomProperty
  } from './updateCustomProperty.js'
  
  const SPEED = 0.05
  const groundElems = document.querySelectorAll("[data-ground]")
  const backgroundElems = document.querySelectorAll("[data-background]")
  
  const GROUND_WIDTH = 300
  const BACKGROUND_WIDTH = 100 // each background image is 100vw wide
  
  export function setupGround() {
    // Ground setup
    setCustomProperty(groundElems[0], "--left", 0)
    setCustomProperty(groundElems[1], "--left", GROUND_WIDTH)
  
    // Background setup
    setCustomProperty(backgroundElems[0], "--left", 0)
    setCustomProperty(backgroundElems[1], "--left", BACKGROUND_WIDTH)
  }
  
  export function updateGround(delta, speedScale) {
    // Ground scroll
    groundElems.forEach(ground => {
      incrementCustomProperty(ground, "--left", delta * speedScale * SPEED * -1)
      if (getCustomProperty(ground, "--left") <= -GROUND_WIDTH) {
        incrementCustomProperty(ground, "--left", GROUND_WIDTH * 2)
      }
    })
  
    // Background scroll
    backgroundElems.forEach(bg => {
      incrementCustomProperty(bg, "--left", delta * speedScale * SPEED * -1)
      if (getCustomProperty(bg, "--left") <= -BACKGROUND_WIDTH) {
        incrementCustomProperty(bg, "--left", BACKGROUND_WIDTH * 2)
      }
    })
  }
  
