
// vampire.js
import {
    getCustomProperty,
    incrementCustomProperty,
    setCustomProperty
  } from './updateCustomProperty.js'
import { createProjectile } from './projectile.js'
import { spendMana } from './mana.js'
  
  const vampireElem = document.querySelector('[data-vampire]')
  const JUMP_SPEED = 0.45
  const GRAVITY = 0.0015
  const MOVE_SPEED = 0.02
  const JUMP_SPEED_MULT = 1.8
  const VAMPIRE_FRAME_COUNT = 5
  const FRAME_TIME = 100
  const JUMP_FRAME_COUNT = 5 // 000 used as idle frame
  const JUMP_FRAME_TIME = 100
  const IDLE_FRAME_COUNT = 5
  const IDLE_FRAME_TIME = 100
  const ATTACK_FRAME_COUNT = 6
  const ATTACK_FRAME_TIME = 100
  
  let isJumping
  let isAttacking
  let vampireFrame
  let currentFrameTime
  let jumpFrame
  let currentJumpFrameTime
  let idleFrame
  let currentIdleFrameTime
  let attackFrame
  let currentAttackFrameTime
  let yVelocity
  let moveDirection = 0
  let facingDirection = 1
  let inputEnabled = false
  let idleLoopId = null
  let idleLastTime = null
  
  export function setupVampire() {
    isJumping = false
    isAttacking = false
    vampireFrame = 0
    currentFrameTime = 0
    jumpFrame = 0
    currentJumpFrameTime = 0
    idleFrame = 0
    currentIdleFrameTime = 0
    attackFrame = 0
    currentAttackFrameTime = 0
    yVelocity = 0
    moveDirection = 0
    facingDirection = 1
  
    setCustomProperty(vampireElem, '--bottom', -5)
    setCustomProperty(vampireElem, '--left', 10)
    vampireElem.style.transform = 'scaleX(1)'
    vampireElem.src = 'assets/images/carmilla/idle/carmilla-idle000.png'
  
    enableInput(true)
  }
  
  export function updateVampire(delta, speedScale) {
    handleMovement(delta)
  
    if (isAttacking) {
      handleAttack(delta)
    } else if (isJumping) {
      handleJump(delta)
    } else if (moveDirection === 0) {
      handleIdle(delta)
    } else {
      handleRun(delta, speedScale)
    }
  }
  
  export function getVampireRect() {
    const r = vampireElem.getBoundingClientRect()
    const insetX = r.width * 0.35
    const insetY = r.height * 0.35
    return {
      left: r.left + insetX,
      right: r.right - insetX,
      top: r.top + insetY,
      bottom: r.bottom
    }
  }
  
  export function setVampireLose() {
    vampireElem.src = 'assets/images/vampire-death.png'
  }
  
  export function getVampireLeft() {
    return getCustomProperty(vampireElem, '--left')
  }
  
  export function setVampireLeft(value) {
    setCustomProperty(vampireElem, '--left', value)
  }
  
  export function getVampireX() {
    return getVampireLeft()
  }
  
  function handleMovement(delta) {
    if (moveDirection !== 0) {
      facingDirection = moveDirection
      vampireElem.style.transform = facingDirection === -1 ? 'scaleX(-1)' : 'scaleX(1)'
      const speed = isJumping ? MOVE_SPEED * JUMP_SPEED_MULT : MOVE_SPEED
      const newLeft = getVampireLeft() + moveDirection * speed * delta
      setVampireLeft(Math.max(0, newLeft))
    }
  }
  
  function handleRun(delta, speedScale) {
    if (currentFrameTime >= FRAME_TIME) {
      vampireFrame = (vampireFrame + 1) % VAMPIRE_FRAME_COUNT
      const frameNum = String(vampireFrame + 1).padStart(3, '0')
      vampireElem.src = `assets/images/carmilla/running/carmilla-running${frameNum}.png`
      currentFrameTime -= FRAME_TIME
    }
    currentFrameTime += delta * speedScale
  }
  
  function handleIdle(delta) {
    if (currentIdleFrameTime >= IDLE_FRAME_TIME) {
      idleFrame = (idleFrame + 1) % IDLE_FRAME_COUNT
      const frameNum = String(idleFrame).padStart(3, '0')
      vampireElem.src = `assets/images/carmilla/idle/carmilla-idle${frameNum}.png`
      currentIdleFrameTime -= IDLE_FRAME_TIME
    }
    currentIdleFrameTime += delta
  }
  
  function handleJump(delta) {
    if (currentJumpFrameTime >= JUMP_FRAME_TIME) {
      if (jumpFrame < JUMP_FRAME_COUNT) {
        jumpFrame++
      }
      const frameNum = String(jumpFrame).padStart(3, '0')
      vampireElem.src = `assets/images/carmilla/jumping/carmilla-jumping${frameNum}.png`
      currentJumpFrameTime -= JUMP_FRAME_TIME
    }
    currentJumpFrameTime += delta
  
    incrementCustomProperty(vampireElem, '--bottom', yVelocity * delta)
  
    if (getCustomProperty(vampireElem, '--bottom') <= 0) {
      setCustomProperty(vampireElem, '--bottom', 0)
      isJumping = false
      vampireElem.src = 'assets/images/carmilla/running/carmilla-running000.png'
    }
  
    yVelocity -= GRAVITY * delta
  }
  
  function handleAttack(delta) {
    if (currentAttackFrameTime >= ATTACK_FRAME_TIME) {
      attackFrame++

      if (attackFrame >= ATTACK_FRAME_COUNT) {
        isAttacking = false
        attackFrame = 0
        return
      }

      const frameNum = String(attackFrame).padStart(3, '0')
      vampireElem.src = `assets/images/carmilla/attack/carmilla-attack${frameNum}.png`

      if (attackFrame === ATTACK_FRAME_COUNT - 1) {
        const startX = getVampireLeft() + (facingDirection === 1 ? 5 : -2)
        const bottom = getCustomProperty(vampireElem, '--bottom') + 17
        createProjectile(startX, facingDirection, bottom)
      }

      currentAttackFrameTime -= ATTACK_FRAME_TIME
    }
    currentAttackFrameTime += delta
  }
  
  function onKeyDown(e) {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') moveDirection = -1
    if (e.code === 'ArrowRight' || e.code === 'KeyD') moveDirection = 1
    if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') onJump()
    if (e.code === 'KeyJ') onAttack()
  }
  
  function onKeyUp(e) {
    if (
      (e.code === 'ArrowLeft' && moveDirection === -1) ||
      (e.code === 'KeyA' && moveDirection === -1) ||
      (e.code === 'ArrowRight' && moveDirection === 1) ||
      (e.code === 'KeyD' && moveDirection === 1)
    ) {
      moveDirection = 0
    }
  }
  
  function onJump() {
    if (isJumping || isAttacking) return
    yVelocity = JUMP_SPEED
    isJumping = true
    jumpFrame = 0
    currentJumpFrameTime = 0
    vampireElem.src = 'assets/images/carmilla/jumping/carmilla-jumping000.png'
  }
  
  function onAttack() {
    if (isAttacking || isJumping) return
    if (!spendMana()) return
    isAttacking = true
    attackFrame = 0
    currentAttackFrameTime = 0
    vampireElem.src = 'assets/images/carmilla/attack/carmilla-attack000.png'
  }

  export function enterIdle() {
    idleFrame = 0
    currentIdleFrameTime = 0
    vampireElem.src = 'assets/images/carmilla/idle/carmilla-idle000.png'
  }

  export function startIdleLoop() {
    if (idleLoopId != null) return
    idleLastTime = null
    const step = time => {
      if (idleLastTime == null) {
        idleLastTime = time
        idleLoopId = requestAnimationFrame(step)
        return
      }
      const delta = time - idleLastTime
      idleLastTime = time
      handleIdle(delta)
      idleLoopId = requestAnimationFrame(step)
    }
    idleLoopId = requestAnimationFrame(step)
  }

  export function stopIdleLoop() {
    if (idleLoopId != null) {
      cancelAnimationFrame(idleLoopId)
      idleLoopId = null
      idleLastTime = null
    }
  }
  

  export function setMoveDirection(dir) {
    moveDirection = dir
  }

  export function enableInput(enable) {
    if (enable && !inputEnabled) {
      document.addEventListener('keydown', onKeyDown)
      document.addEventListener('keyup', onKeyUp)
      inputEnabled = true
    } else if (!enable && inputEnabled) {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('keyup', onKeyUp)
      moveDirection = 0
      inputEnabled = false
    }
  }



