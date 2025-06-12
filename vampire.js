// vampire.js
import {
    getCustomProperty,
    incrementCustomProperty,
    setCustomProperty,
  } from "./updateCustomProperty.js";
  
  const vampireElem = document.querySelector("[data-vampire]");
  const JUMP_SPEED = 0.45;
  const GRAVITY = 0.0015;
  const MOVE_SPEED = 0.02;
  // ← now 5 frames instead of 2
  const VAMPIRE_FRAME_COUNT = 5;
  const FRAME_TIME = 100;
  const JUMP_FRAME_COUNT = 5; // 000 used as idle frame
  const JUMP_FRAME_TIME = 100;
  const IDLE_FRAME_COUNT = 5;
  const IDLE_FRAME_TIME = 100;
  
  let isJumping;
  let vampireFrame;
  let currentFrameTime;
  let jumpFrame;
  let currentJumpFrameTime;
  let idleFrame;
  let currentIdleFrameTime;
  let yVelocity;
  let moveDirection = 0;
  // track last non-zero direction for flipping
  let facingDirection = 1;
  
  export function setupVampire() {
    isJumping = false;
    vampireFrame = 0;
    currentFrameTime = 0;
    jumpFrame = 0;
    currentJumpFrameTime = 0;
    idleFrame = 0;
    currentIdleFrameTime = 0;
    yVelocity = 0;
    moveDirection = 0;
    facingDirection = 1;
  
    setCustomProperty(vampireElem, "--bottom", -5);
    setCustomProperty(vampireElem, "--left", 10);
    vampireElem.style.transform = "scaleX(1)";
    vampireElem.src = "imgs/carmilla/idle/carmilla-idle000.png";
  
    document.removeEventListener("keydown", onKeyDown);
    document.removeEventListener("keyup", onKeyUp);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
  }
  
  export function updateVampire(delta, speedScale) {
    handleMovement(delta);
    handleRun(delta, speedScale);
    handleJump(delta);
  }
  
  export function getVampireRect() {
    const r = vampireElem.getBoundingClientRect();
  
    // tweak these percentages until the box hugs her feet and torso, not the transparent area
    const insetX = r.width  * 0.35;  // chop off 35% on left & right
    const insetY = r.height * 0.35;  // chop off 35% at the top
  
    return {
      left:   r.left   + insetX,
      right:  r.right  - insetX,
      top:    r.top    + insetY,
      bottom: r.bottom            // we keep the full bottom so feet still touch ground
    };
  }
  
  export function setVampireLose() {
    vampireElem.src = "imgs/vampire-death.png";
  }
  
  export function getVampireLeft() {
    return getCustomProperty(vampireElem, "--left");
  }
  
  export function setVampireLeft(value) {
    setCustomProperty(vampireElem, "--left", value);
  }
  
  export function getVampireX() {
    return getVampireLeft();
  }
  
  function handleMovement(delta) {
    if (moveDirection !== 0) {
      // update facing
      facingDirection = moveDirection;
      vampireElem.style.transform =
        facingDirection === -1 ? "scaleX(-1)" : "scaleX(1)";
  
      const newLeft = getVampireLeft() + moveDirection * MOVE_SPEED * delta;
      setVampireLeft(Math.max(0, newLeft));
    }
  }
  
  function handleRun(delta, speedScale) {
    // if jumping, let handleJump control the sprite
    if (isJumping) return;

    // if not moving, show stationary
    if (moveDirection === 0) {
        handleIdle(delta);
      return;
    }
  
    // frame advance
    if (currentFrameTime >= FRAME_TIME) {
      vampireFrame = (vampireFrame + 1) % VAMPIRE_FRAME_COUNT;
      // pad to three digits: 001 → 005
      const frameNum = String(vampireFrame + 1).padStart(3, "0");
      vampireElem.src = `imgs/carmilla/running/carmilla-running${frameNum}.png`;
      currentFrameTime -= FRAME_TIME;
    }
    currentFrameTime += delta * speedScale;
  }


  function handleIdle(delta) {
    if (currentIdleFrameTime >= IDLE_FRAME_TIME) {
      idleFrame = (idleFrame + 1) % IDLE_FRAME_COUNT;
      const frameNum = String(idleFrame).padStart(3, "0");
      vampireElem.src = `imgs/carmilla/idle/carmilla-idle${frameNum}.png`;
      currentIdleFrameTime -= IDLE_FRAME_TIME;
    }
    currentIdleFrameTime += delta;
  }
  
  function handleJump(delta) {
    if (!isJumping) return;
  
    // animate jump frames
    if (currentJumpFrameTime >= JUMP_FRAME_TIME) {
        if (jumpFrame < JUMP_FRAME_COUNT) {
          jumpFrame++;
        }
        const frame