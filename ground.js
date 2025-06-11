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

  const MIDGROUND_WIDTH = 100
  const midgroundElems = document.querySelectorAll("[data-midground]")

  
  export function setupGround() {
    // Ground setup
    setCustomProperty(groundElems[0], "--left", 0)
    setCustomProperty(groundElems[1], "--left", GROUND_WIDTH)
  
    // Background setup
    setCustomProperty(backgroundElems[0], "--left", 0)
    setCustomProperty(backgroundElems[1], "--left", BACKGROUND_WIDTH)

    // Midground setup
    setCustomProperty(midgroundElems[0], "--left", 0)
    setCustomProperty(midgroundElems[1], "--left", 100)
    setCustomProperty(midgroundElems[2], "--left", 200)
    setCustomProperty(midgroundElems[3], "--left", 300)

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

    // Midground scroll
    midgroundElems.forEach(mg => {
      incrementCustomProperty(mg, "--left", delta * speedScale * SPEED * -0.4)
    
      const left = getCustomProperty(mg, "--left")
      if (left <= -MIDGROUND_WIDTH) {
        // Wrap this image forward by total width of the loop
        incrementCustomProperty(mg, "--left", MIDGROUND_WIDTH * midgroundElems.length)
      }
    })
    
    

  }
  
