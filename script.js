// The three screens used by the game.
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const gameOverScreen = document.getElementById('game-over-screen');

// Buttons that switch between screens.
const startButton = document.getElementById('start-button');
const playAgainButton = document.getElementById('play-again-button');
const mainMenuButton = document.getElementById('main-menu-button');
const pauseButton = document.getElementById('pause-button');
const mobilePauseButton = document.getElementById('mobile-pause-button');

// The helicopter and the swamp it flies around in.
const helicopter = document.getElementById('helicopter');
const gameArea = document.getElementById('game-area');
const contaminatedZone = document.getElementById('contaminated-zone');
const deliveryZone = document.getElementById('delivery-zone');

// Score, water tank, and the short HUD message for cleaning.
const scoreValue = document.getElementById('score-value');
const waterCount = document.getElementById('water-count');
const waterSlotList = document.querySelectorAll('.water-slot');
const actionFeedback = document.getElementById('action-feedback');
const healthValue = document.getElementById('health-value');
const healthFill = document.getElementById('health-fill');
const healthBar = document.getElementById('health-bar');
const obstacleList = document.querySelectorAll('.obstacle');

const MAX_WATER = 5;
const CLEAN_POINTS = 10;
const DELIVERY_POINTS = 25;
const CLEAN_COOLDOWN_MS = 500;
const MAX_HEALTH = 100;
const DAMAGE_AMOUNT = 20;
const DAMAGE_COOLDOWN_MS = 1000;

let score = 0;
let waterAmount = 0;
let lastCleanTime = 0;
let spaceHeld = false;
let totalWaterCleaned = 0;
let totalWaterDelivered = 0;
let deliveriesCompleted = 0;
let health = MAX_HEALTH;
let lastDamageTime = 0;
let gameIsOver = false;
let isPaused = false;
let pauseStartedAt = 0;

const finalScore = document.getElementById('final-score');
const finalTime = document.getElementById('final-time');
const waterCleanedDisplay = document.getElementById('water-cleaned');
const deliveriesCompletedDisplay = document.getElementById('deliveries-completed');

// Survival timer shown in the top HUD.
const survivalTimer = document.getElementById('survival-timer');
let timerStartTime = 0;
let timerId = 0;

// Keep keyboard and touch directions separate so one input cannot cancel the other.
const keyboardKeys = {
  up: false,
  down: false,
  left: false,
  right: false
};
const touchPointers = {
  up: new Set(),
  down: new Set(),
  left: new Set(),
  right: new Set()
};

// Helicopter location in pixels, measured from the top-left of the game area.
let helicopterX = 0;
let helicopterY = 0;

// Used by requestAnimationFrame to keep speed the same on fast or slow screens.
let lastTimestamp = 0;
let animationId = 0;

// Hide every screen, then show only the one whose id was passed in.
function showScreen(screenId) {
  startScreen.hidden = true;
  gameScreen.hidden = true;
  gameOverScreen.hidden = true;

  const screenToShow = document.getElementById(screenId);

  // Only continue if that screen exists in the HTML.
  if (screenToShow) {
    screenToShow.hidden = false;
  }

  // Movement and the timer only run while the gameplay screen is open.
  if (screenId === 'game-screen') {
    resetGameStats();
    resetHelicopterPosition();
    startGameLoop();
    startSurvivalTimer();
  } else {
    // Save the last time and score before the timer is cleared.
    if (screenId === 'game-over-screen') {
      updateFinalStats();
    }

    resetPauseState();
    stopGameLoop();
    clearHeldKeys();
    stopSurvivalTimer();
  }
}

// Place the helicopter at its starting spot, matching the CSS left/top values.
function resetHelicopterPosition() {
  helicopterX = gameArea.clientWidth * 0.38;
  helicopterY = gameArea.clientHeight * 0.38;
  keepHelicopterInsideGameArea();
  helicopter.style.left = helicopterX + 'px';
  helicopter.style.top = helicopterY + 'px';
}

// Keep the whole helicopter inside the swamp, using the real container size.
function keepHelicopterInsideGameArea() {
  const maxX = gameArea.clientWidth - helicopter.offsetWidth;
  const maxY = gameArea.clientHeight - helicopter.offsetHeight;

  if (helicopterX < 0) {
    helicopterX = 0;
  }

  if (helicopterY < 0) {
    helicopterY = 0;
  }

  if (helicopterX > maxX) {
    helicopterX = maxX;
  }

  if (helicopterY > maxY) {
    helicopterY = maxY;
  }
}

function startGameLoop() {
  lastTimestamp = 0;

  if (animationId === 0) {
    animationId = requestAnimationFrame(updateHelicopter);
  }
}

function stopGameLoop() {
  if (animationId !== 0) {
    cancelAnimationFrame(animationId);
    animationId = 0;
  }

  lastTimestamp = 0;
}

// Turn a number of seconds into MM:SS, like 00:07 or 01:05.
function formatSurvivalTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  let minutesText = String(minutes);
  let secondsText = String(seconds);

  if (minutes < 10) {
    minutesText = '0' + minutes;
  }

  if (seconds < 10) {
    secondsText = '0' + seconds;
  }

  return `${minutesText}:${secondsText}`;
}

// Start a new timer from 00:00. Any old timer is cleared first so only one runs.
function startSurvivalTimer() {
  stopSurvivalTimer();
  timerStartTime = Date.now();
  survivalTimer.textContent = '00:00';
  timerId = setInterval(updateSurvivalTimer, 250);
}

function stopSurvivalTimer() {
  if (timerId !== 0) {
    clearInterval(timerId);
    timerId = 0;
  }
}

// Use real elapsed time so a late interval still shows the correct MM:SS.
function updateSurvivalTimer() {
  if (gameScreen.hidden) {
    stopSurvivalTimer();
    return;
  }

  // Keep the last MM:SS on screen while paused. Do not count paused time.
  if (isPaused) {
    return;
  }

  const elapsedMs = getElapsedSurvivalMs();
  const totalSeconds = Math.floor(elapsedMs / 1000);
  survivalTimer.textContent = formatSurvivalTime(totalSeconds);
}

function getElapsedSurvivalMs() {
  let elapsedMs = Date.now() - timerStartTime;

  // If we are paused right now, ignore the time since the pause started.
  if (isPaused && pauseStartedAt !== 0) {
    elapsedMs -= Date.now() - pauseStartedAt;
  }

  if (elapsedMs < 0) {
    elapsedMs = 0;
  }

  return elapsedMs;
}

function setPauseButtonsLabel(label) {
  pauseButton.textContent = label;
  mobilePauseButton.textContent = label;
}

function resetPauseState() {
  isPaused = false;
  pauseStartedAt = 0;
  setPauseButtonsLabel('Pause');
}

function togglePause() {
  if (gameScreen.hidden || gameIsOver) {
    return;
  }

  if (isPaused) {
    resumeGame();
  } else {
    pauseGame();
  }
}

function pauseGame() {
  isPaused = true;
  pauseStartedAt = Date.now();
  clearHeldKeys();
  lastTimestamp = 0;
  setPauseButtonsLabel('Resume');
  showActionFeedback('Paused. Press P or Resume to continue.', '');
}

function resumeGame() {
  const pausedMs = Date.now() - pauseStartedAt;

  // Move the timer start forward so paused seconds are not added to survival time.
  timerStartTime += pausedMs;

  // Move the last-hit time forward so the 1-second damage cooldown also ignores the pause.
  if (lastDamageTime !== 0) {
    lastDamageTime += pausedMs;
  }

  if (lastCleanTime !== 0) {
    lastCleanTime += pausedMs;
  }

  isPaused = false;
  pauseStartedAt = 0;
  lastTimestamp = 0;
  setPauseButtonsLabel('Pause');
  showActionFeedback('Back in the air!', '');
}

function clearHeldKeys() {
  keyboardKeys.up = false;
  keyboardKeys.down = false;
  keyboardKeys.left = false;
  keyboardKeys.right = false;
  touchPointers.up.clear();
  touchPointers.down.clear();
  touchPointers.left.clear();
  touchPointers.right.clear();
  spaceHeld = false;
}

// Reset score and water when a new game starts.
function resetGameStats() {
  clearHeldKeys();
  score = 0;
  waterAmount = 0;
  lastCleanTime = 0;
  spaceHeld = false;
  totalWaterCleaned = 0;
  totalWaterDelivered = 0;
  deliveriesCompleted = 0;
  health = MAX_HEALTH;
  lastDamageTime = 0;
  gameIsOver = false;
  resetPauseState();
  helicopter.classList.remove('helicopter--hit');
  updateScoreDisplay();
  updateWaterDisplay();
  updateHealthDisplay();
  showActionFeedback('Clean water in the orange zone, then deliver it in the blue zone.', '');
}

function updateScoreDisplay() {
  scoreValue.textContent = String(score);
}

function updateHealthDisplay() {
  healthValue.textContent = `${health}%`;
  healthFill.style.width = `${health}%`;
  healthBar.setAttribute('aria-valuenow', String(health));
  healthBar.setAttribute('aria-valuetext', `${health} percent`);
}

function updateWaterDisplay() {
  waterCount.textContent = `${waterAmount}/${MAX_WATER}`;

  for (let i = 0; i < waterSlotList.length; i += 1) {
    if (i < waterAmount) {
      waterSlotList[i].classList.add('water-slot--filled');
    } else {
      waterSlotList[i].classList.remove('water-slot--filled');
    }
  }
}

function showActionFeedback(message, kind) {
  actionFeedback.textContent = message;
  actionFeedback.className = 'action-feedback';

  if (kind === 'success') {
    actionFeedback.classList.add('action-feedback--success');
  }

  if (kind === 'warning') {
    actionFeedback.classList.add('action-feedback--warning');
  }
}

// True when two boxes overlap on both the X and Y axes.
function rectanglesOverlap(boxA, boxB) {
  const separateOnX = boxA.right <= boxB.left || boxA.left >= boxB.right;
  const separateOnY = boxA.bottom <= boxB.top || boxA.top >= boxB.bottom;
  return separateOnX === false && separateOnY === false;
}

function getBoxCenter(box) {
  return {
    x: (box.left + box.right) / 2,
    y: (box.top + box.bottom) / 2
  };
}

// The ponds look like ovals, so a rectangle check would count nearby grass as water.
function isPointInsideEllipse(x, y, box) {
  const center = getBoxCenter(box);
  const radiusX = box.width / 2;
  const radiusY = box.height / 2;

  if (radiusX <= 0 || radiusY <= 0) {
    return false;
  }

  const distanceX = (x - center.x) / radiusX;
  const distanceY = (y - center.y) / radiusY;
  return distanceX * distanceX + distanceY * distanceY <= 1;
}

function isHelicopterOverPond(pondElement) {
  const helicopterCenter = getBoxCenter(helicopter.getBoundingClientRect());
  return isPointInsideEllipse(helicopterCenter.x, helicopterCenter.y, pondElement.getBoundingClientRect());
}

function isOverContaminatedWater() {
  return isHelicopterOverPond(contaminatedZone);
}

function isOverDeliveryZone() {
  return isHelicopterOverPond(deliveryZone);
}

// Space chooses clean, deliver, or a hint, based on which zone the helicopter is in.
function handleSpaceAction() {
  if (gameScreen.hidden || isPaused) {
    return;
  }

  const overDirtyWater = isOverContaminatedWater();
  const overDelivery = isOverDeliveryZone();

  // If both zones overlap, deliver when carrying water; otherwise clean.
  if (overDelivery && overDirtyWater) {
    if (waterAmount > 0) {
      tryDeliverWater();
    } else {
      tryCleanWater();
    }
    return;
  }

  if (overDelivery) {
    tryDeliverWater();
    return;
  }

  if (overDirtyWater) {
    tryCleanWater();
    return;
  }

  showActionFeedback('Fly to contaminated water to clean, or to the blue zone to deliver.', 'warning');
}

// Collect 1 unit of water and add 10 points. Only works in the orange zone.
function tryCleanWater() {
  if (gameScreen.hidden || isPaused) {
    return;
  }

  if (isOverContaminatedWater() === false) {
    return;
  }

  const now = Date.now();

  if (now - lastCleanTime < CLEAN_COOLDOWN_MS) {
    return;
  }

  if (waterAmount >= MAX_WATER) {
    showActionFeedback('Tank is full (5/5). Cannot collect more water.', 'warning');
    return;
  }

  waterAmount += 1;
  totalWaterCleaned += 1;
  score += CLEAN_POINTS;
  lastCleanTime = now;
  updateWaterDisplay();
  updateScoreDisplay();
  showActionFeedback('Cleaned 1 unit of water. +10 points.', 'success');
}

// Drop off every carried unit at once. Each unit adds 25 points to the current score.
function tryDeliverWater() {
  if (gameScreen.hidden || isPaused) {
    return;
  }

  if (isOverDeliveryZone() === false) {
    return;
  }

  if (waterAmount < 1) {
    showActionFeedback('Tank is empty. Clean water before delivering.', 'warning');
    return;
  }

  const unitsDelivered = waterAmount;
  const pointsEarned = unitsDelivered * DELIVERY_POINTS;

  score += pointsEarned;
  totalWaterDelivered += unitsDelivered;
  deliveriesCompleted += 1;
  waterAmount = 0;

  updateScoreDisplay();
  updateWaterDisplay();
  showActionFeedback(`Delivered ${unitsDelivered} water. +${pointsEarned} points.`, 'success');
}

// Move the helicopter a little each frame while directional keys are held.
function updateHelicopter(timestamp) {
  animationId = requestAnimationFrame(updateHelicopter);

  // Extra safety: never move on the Start or Game Over screens.
  if (gameScreen.hidden || isPaused) {
    lastTimestamp = timestamp;
    return;
  }

  // Skip the first frame so the elapsed time is not a huge jump.
  if (lastTimestamp === 0) {
    lastTimestamp = timestamp;
    return;
  }

  let elapsedSeconds = (timestamp - lastTimestamp) / 1000;
  lastTimestamp = timestamp;

  // Catch up in small steps, but discard excess time after a long frame stall.
  if (elapsedSeconds > 0.25) {
    elapsedSeconds = 0.25;
  }

  // Build a direction from the keys that are currently held.
  let moveX = 0;
  let moveY = 0;

  if (keyboardKeys.left || touchPointers.left.size > 0) {
    moveX -= 1;
  }

  if (keyboardKeys.right || touchPointers.right.size > 0) {
    moveX += 1;
  }

  if (keyboardKeys.up || touchPointers.up.size > 0) {
    moveY -= 1;
  }

  if (keyboardKeys.down || touchPointers.down.size > 0) {
    moveY += 1;
  }

  // If two directions are held, 0.707 (about 1 / sqrt(2)) keeps diagonal speed the same.
  if (moveX !== 0 && moveY !== 0) {
    moveX *= 0.707;
    moveY *= 0.707;
  }

  // Speed is based on the game area size so it feels similar on phone and desktop.
  const smallerSide = Math.min(gameArea.clientWidth, gameArea.clientHeight);
  const pixelsPerSecond = smallerSide * 0.4;

  while (elapsedSeconds > 0) {
    const stepSeconds = Math.min(elapsedSeconds, 0.05);
    helicopterX += moveX * pixelsPerSecond * stepSeconds;
    helicopterY += moveY * pixelsPerSecond * stepSeconds;

    keepHelicopterInsideGameArea();
    helicopter.style.left = helicopterX + 'px';
    helicopter.style.top = helicopterY + 'px';

    checkObstacleCollisions();

    if (gameIsOver) {
      return;
    }

    elapsedSeconds -= stepSeconds;
  }
}

// Damage happens in its own function so movement math stays simple.
function checkObstacleCollisions() {
  if (gameScreen.hidden || isPaused) {
    return;
  }

  const now = Date.now();

  // One shared cooldown so several obstacles cannot hit at the same time.
  if (now - lastDamageTime < DAMAGE_COOLDOWN_MS) {
    return;
  }

  const helicopterBox = helicopter.getBoundingClientRect();

  for (let i = 0; i < obstacleList.length; i += 1) {
    const obstacleBox = getPaddedBox(obstacleList[i], 8);

    if (rectanglesOverlap(helicopterBox, obstacleBox)) {
      applyObstacleDamage();
      return;
    }
  }
}

// Grow an obstacle box a little so close flies still count as a hit.
function getPaddedBox(element, pad) {
  const box = element.getBoundingClientRect();

  return {
    left: box.left - pad,
    top: box.top - pad,
    right: box.right + pad,
    bottom: box.bottom + pad
  };
}

function applyObstacleDamage() {
  if (gameIsOver || isPaused) {
    return;
  }

  health -= DAMAGE_AMOUNT;

  if (health < 0) {
    health = 0;
  }

  if (health > MAX_HEALTH) {
    health = MAX_HEALTH;
  }

  lastDamageTime = Date.now();
  updateHealthDisplay();
  showActionFeedback('Hit an obstacle. -20 health.', 'warning');
  flashHelicopter();

  if (health === 0) {
    endGame();
  }
}

// End the game only once. The current score and time are copied to Game Over first.
function endGame() {
  if (gameIsOver) {
    return;
  }

  gameIsOver = true;
  showScreen('game-over-screen');
}

function getElapsedSurvivalTime() {
  if (timerStartTime === 0) {
    return survivalTimer.textContent;
  }

  const totalSeconds = Math.floor(getElapsedSurvivalMs() / 1000);
  return formatSurvivalTime(totalSeconds);
}

function updateFinalStats() {
  const finalTimeText = getElapsedSurvivalTime();
  survivalTimer.textContent = finalTimeText;
  finalScore.textContent = String(score);
  finalTime.textContent = finalTimeText;
  waterCleanedDisplay.textContent = String(totalWaterCleaned);
  deliveriesCompletedDisplay.textContent = String(deliveriesCompleted);
}

function flashHelicopter() {
  helicopter.classList.add('helicopter--hit');

  setTimeout(function () {
    helicopter.classList.remove('helicopter--hit');
  }, 200);
}

// Remember that a movement key was pressed. Arrow keys are blocked from scrolling.
function handleKeyDown(event) {
  if (gameScreen.hidden || gameIsOver) {
    return;
  }

  const key = event.key;

  if (key === 'p' || key === 'P') {
    event.preventDefault();
    if (event.repeat !== true) {
      togglePause();
    }
    return;
  }

  if (isPaused) {
    return;
  }

  if (key === 'ArrowUp' || key === 'ArrowDown' || key === 'ArrowLeft' || key === 'ArrowRight' || key === ' ') {
    event.preventDefault();
  }

  // Space cleans or delivers once per key press. Holding it does not repeat the action.
  if (key === ' ') {
    if (spaceHeld === false) {
      spaceHeld = true;
      handleSpaceAction();
    }

    return;
  }

  if (key === 'ArrowUp' || key === 'w' || key === 'W') {
    keyboardKeys.up = true;
  }

  if (key === 'ArrowDown' || key === 's' || key === 'S') {
    keyboardKeys.down = true;
  }

  if (key === 'ArrowLeft' || key === 'a' || key === 'A') {
    keyboardKeys.left = true;
  }

  if (key === 'ArrowRight' || key === 'd' || key === 'D') {
    keyboardKeys.right = true;
  }
}

// When a key is released, that direction stops immediately on the next frame.
function handleKeyUp(event) {
  const key = event.key;

  if (key === ' ') {
    spaceHeld = false;
  }

  if (key === 'ArrowUp' || key === 'w' || key === 'W') {
    keyboardKeys.up = false;
  }

  if (key === 'ArrowDown' || key === 's' || key === 'S') {
    keyboardKeys.down = false;
  }

  if (key === 'ArrowLeft' || key === 'a' || key === 'A') {
    keyboardKeys.left = false;
  }

  if (key === 'ArrowRight' || key === 'd' || key === 'D') {
    keyboardKeys.right = false;
  }
}

document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);

function handleFocusLoss() {
  clearHeldKeys();

  if (gameScreen.hidden === false && gameIsOver === false && isPaused === false) {
    pauseGame();
  }
}

window.addEventListener('blur', handleFocusLoss);
document.addEventListener('visibilitychange', function () {
  if (document.hidden) {
    handleFocusLoss();
  }
});

// Keep the helicopter inside the swamp if the window size changes.
window.addEventListener('resize', function () {
  if (gameScreen.hidden) {
    return;
  }

  keepHelicopterInsideGameArea();
  helicopter.style.left = helicopterX + 'px';
  helicopter.style.top = helicopterY + 'px';
});

// Start Game opens the gameplay screen.
startButton.addEventListener('click', function () {
  showScreen('game-screen');
});

// Play Again also opens the gameplay screen.
playAgainButton.addEventListener('click', function () {
  showScreen('game-screen');
});

// Main Menu returns to the start screen.
mainMenuButton.addEventListener('click', function () {
  showScreen('start-screen');
});

pauseButton.addEventListener('click', function () {
  togglePause();
});

mobilePauseButton.addEventListener('click', function () {
  togglePause();
});

// Mobile controls use the same movement loop as the keyboard.
const moveUpButton = document.getElementById('move-up-button');
const moveDownButton = document.getElementById('move-down-button');
const moveLeftButton = document.getElementById('move-left-button');
const moveRightButton = document.getElementById('move-right-button');
const cleanButton = document.getElementById('clean-button');

function touchControlsAreActive() {
  return gameScreen.hidden === false && gameIsOver === false && isPaused === false;
}

// Hold a direction button to move. Capture the pointer so a slide off the button still ends cleanly.
function bindMoveButton(button, direction) {
  button.addEventListener('pointerdown', function (event) {
    event.preventDefault();

    if (touchControlsAreActive() === false) {
      return;
    }

    try {
      button.setPointerCapture(event.pointerId);
    } catch (error) {
      // Capture can fail for synthetic pointers, but their active state is still recorded.
    }

    touchPointers[direction].add(event.pointerId);
  });

  function stopDirection(event) {
    touchPointers[direction].delete(event.pointerId);
  }

  button.addEventListener('pointerup', stopDirection);
  button.addEventListener('pointercancel', stopDirection);
  button.addEventListener('lostpointercapture', stopDirection);
}

bindMoveButton(moveUpButton, 'up');
bindMoveButton(moveDownButton, 'down');
bindMoveButton(moveLeftButton, 'left');
bindMoveButton(moveRightButton, 'right');

// Click supports mouse, touch, Enter, and Space without duplicate pointer actions.
cleanButton.addEventListener('click', function () {
  if (touchControlsAreActive() === false) {
    return;
  }

  handleSpaceAction();
});
