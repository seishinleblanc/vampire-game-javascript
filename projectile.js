import { getCustomProperty, setCustomProperty, incrementCustomProperty } from './updateCustomProperty.js'

const PROJECTILE_SPEED = 0.1
const FRAME_TIME = 100
const FRAME_COUNT = 3
const REMOVE_DISTANCE = 5

const gameAreaElem = document.querySelector('[data-game-area]')

export function setupProjectiles() {
  document.querySelectorAll('[data-projectile]').forEach(p => p.remove())
}

export function createProjectile(x, direction, bottom = 17) {
  const proj = document.createElement('img')
  proj.dataset.projectile = true
  proj.dataset.direction = direction
  proj.dataset.frame = '0'
  proj.dataset.frameTime = '0'
  proj.src = 'imgs/carmilla/attack/projectile000.png'
  proj.classList.add('projectile')
  setCustomProperty(proj, '--left', x)
  setCustomProperty(proj, '--bottom', bottom)
  gameAreaElem.append(proj)
}

export function updateProjectiles(delta, cameraX, worldWidth, crossRects) {
  document.querySelectorAll('[data-projectile]').forEach(proj => {
    // animate frames
    let frameTime = Number(proj.dataset.frameTime) + delta
    if (frameTime >= FRAME_TIME) {
      let frame = (Number(proj.dataset.frame) + 1) % FRAME_COUNT
      proj.dataset.frame = frame
      proj.src = `imgs/carmilla/attack/projectile${String(frame).padStart(3, '0')}.png`
      frameTime -= FRAME_TIME
    }
    proj.dataset.frameTime = frameTime

    const dir = Number(proj.dataset.direction)
    incrementCustomProperty(proj, '--left', dir * PROJECTILE_SPEED * delta)
    const worldX = getCustomProperty(proj, '--left')

    const projRect = getProjectileRect(proj)
    if (crossRects.some(r => isCollision(r, projRect))) {
      proj.remove()
      return
    }

    if (worldX < cameraX - REMOVE_DISTANCE ||
        worldX > cameraX + worldWidth + REMOVE_DISTANCE) {
      proj.remove()
    }
  })
}

function getProjectileRect(proj) {
    const r = proj.getBoundingClientRect()
    const insetX = r.width * 0.3
    const insetY = r.height * 0.3
    return {
      left: r.left + insetX,
      right: r.right - insetX,
      top: r.top + insetY,
      bottom: r.bottom - insetY
    }
  }
  

function isCollision(r1, r2) {
  return (
    r1.left < r2.right &&
    r1.right > r2.left &&
    r1.top < r2.bottom &&
    r1.bottom > r2.top
  )
}