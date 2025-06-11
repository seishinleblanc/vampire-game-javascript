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
  
  let isJumping;
  let vampireFrame;
  let currentFrameTime;
  let yVelocity;
  let moveDirection = 0;
  // track last non-zero direction for flipping
  let facingDirection = 1;
  
  export function setupVampire() {
    isJumping = false;
    vampireFrame = 0;
    currentFrameTime = 0;
    yVelocity = 0;
    moveDirection = 0;
    facingDirection = 1;
  
    setCustomProperty(vampireElem, "--bottom", -5);
    setCustomProperty(vampireElem, "--left", 10);
    vampireElem.style.transform = "scaleX(1)";
  
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
    const insetX = r.width  * 0.35;  // chop off 20% on left & right
    const insetY = r.height * 0.35;  // chop off 15% at the top
  
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
    // if not running, show stationary
    if (isJumping || moveDirection === 0) {
      vampireElem.src = "imgs/carmilla/running/carmilla-running000.png";
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
  
  function handleJump(delta) {
    if (!isJumping) return;
  
    incrementCustomProperty(vampireElem, "--bottom", yVelocity * delta);
  
    if (getCustomProperty(vampireElem, "--bottom") <= 0) {
      setCustomProperty(vampireElem, "--bottom", 0);
      isJumping = false;
    }
  
    yVelocity -= GRAVITY * delta;
  }
  
  function onKeyDown(e) {
    if (e.code === "ArrowLeft" || e.code === "KeyA") moveDirection = -1;
    if (e.code === "ArrowRight" || e.code === "KeyD") moveDirection = 1;
    if (
      e.code === "Space" ||
      e.code === "KeyW" ||
      e.code === "ArrowUp"
    )
      onJump();
  }
  
  function onKeyUp(e) {
    if (
      (e.code === "ArrowLeft" && moveDirection === -1) ||
      (e.code === "KeyA" && moveDirection === -1) ||
      (e.code === "ArrowRight" && moveDirection === 1) ||
      (e.code === "KeyD" && moveDirection === 1)
    ) {
      moveDirection = 0;
    }
  }
  
  function onJump() {
    if (isJumping) return;
    yVelocity = JUMP_SPEED;
    isJumping = true;
  }
  


