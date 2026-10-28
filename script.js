// The three screens used by the game.
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const hallOfFameScreen = document.getElementById('hall-of-fame-screen');

// Buttons that switch between screens.
const startButton = document.getElementById('start-button');
const startHofButton = document.getElementById('start-hof-button');
const playAgainButton = document.getElementById('play-again-button');
const mainMenuButton = document.getElementById('main-menu-button');
const viewLeaderboardsButton = document.getElementById('view-leaderboards-button');
const hofBackButton = document.getElementById('hof-back-button');
const hofEasyButton = document.getElementById('hof-easy-button');
const hofHardButton = document.getElementById('hof-hard-button');
const scoreSaveForm = document.getElementById('score-save-form');
const playerNameInput = document.getElementById('player-name-input');
const saveScoreButton = document.getElementById('save-score-button');
const scoreSaveStatus = document.getElementById('score-save-status');
const gameOverTitle = document.getElementById('game-over-title');
const finalTimeLabel = document.getElementById('final-time-label');
const pauseButton = document.getElementById('pause-button');
const mobilePauseButton = document.getElementById('mobile-pause-button');

// The helicopter and the swamp it flies around in.
const helicopter = document.getElementById('helicopter');
const helicopterFacing = helicopter.querySelector('.helicopter-facing');
const gameArea = document.getElementById('game-area');
const world = document.getElementById('world');
const minimap = document.getElementById('minimap');
const minimapToggle = document.getElementById('minimap-toggle');
const minimapStage = document.getElementById('minimap-stage');
const minimapWorld = document.getElementById('minimap-world');
const minimapView = document.getElementById('minimap-view');
const minimapHeli = document.getElementById('minimap-heli');

// 3.2 × √2 ≈ 4.525 viewports on each side, about 20.48× the original area.
const WORLD_SCALE = 3.2 * Math.SQRT2;
const DIRTY_POND_COUNT = 20;
const DELIVERY_POND_COUNT = 2;
const GRID_COLS = 6;
const GRID_ROWS = 6;
const OBSTACLES_PER_TYPE = 24;
const DIFFICULTY_EASY = 'easy';
const DIFFICULTY_HARD = 'hard';
const POND_SIZE_TYPES = {
  small: {
    key: 'small',
    maxContamination: 5,
    widthView: 0.26,
    heightView: 0.30
  },
  medium: {
    key: 'medium',
    maxContamination: 10,
    widthView: 0.40,
    heightView: 0.48
  },
  large: {
    key: 'large',
    maxContamination: 15,
    widthView: 0.56,
    heightView: 0.66
  }
};
const POND_SIZE_MIX = [
  'small', 'small', 'small', 'small', 'small', 'small', 'small',
  'medium', 'medium', 'medium', 'medium', 'medium', 'medium', 'medium',
  'large', 'large', 'large', 'large', 'large', 'large'
];
const POND_DIRTY_COLORS = {
  inner: [255, 176, 86],
  mid: [255, 144, 42],
  outer: [196, 92, 20],
  shore: [107, 68, 35]
};
const POND_CLEAN_COLORS = {
  inner: [110, 196, 255],
  mid: [46, 157, 247],
  outer: [26, 127, 212],
  shore: [90, 122, 40]
};

let contaminatedZones = [];
let deliveryZones = [];
let fuelingStations = [];
let obstacleList = [];
let enemyHelicopters = [];
let spawnXPct = 12;
let spawnYPct = 22;
let helicopterWidth = 80;
let helicopterHeight = 102;

// Score, water tank, and the short HUD message for cleaning.
const scoreValue = document.getElementById('score-value');
const waterCount = document.getElementById('water-count');
const waterSlotList = document.querySelectorAll('.water-slot');
const actionFeedback = document.getElementById('action-feedback');
const healthValue = document.getElementById('health-value');
const healthFill = document.getElementById('health-fill');
const healthBar = document.getElementById('health-bar');
const fuelValue = document.getElementById('fuel-value');
const fuelFill = document.getElementById('fuel-fill');
const fuelBar = document.getElementById('fuel-bar');
const gameOverReasonDisplay = document.getElementById('game-over-reason');
const MAX_WATER = 5;
const CLEAN_POINTS = 10;
const DELIVERY_POINTS = 25;
const CLEAN_COOLDOWN_MS = 500;
const MAX_HEALTH = 100;
const DAMAGE_AMOUNT = 20;
const DAMAGE_COOLDOWN_MS = 1000;
const MAX_FUEL = 100;
const FUEL_PER_SECOND = 0.5;
const REFUEL_AMOUNT = 10;
const REFUEL_COST = 10;
const MONEY_PER_DELIVERY_UNIT = 10;
const COLLISION_MONEY_PENALTY = 50;
const COLLISION_SCORE_PENALTY = 10;
const LEADERBOARD_STORAGE_KEY = 'helo-swamps-leaderboard-v1';
const LEADERBOARD_VERSION = 1;
const LEADERBOARD_MAX_RUNS = 80;
const HEALTH_PICKUP_SCORE_STEP = 700;
const HEALTH_PICKUP_HEAL = 50;
const SMALL_HEALTH_PICKUP_HEAL = 10;
const HEALTH_PICKUP_WIDTH_PCT = 1.7;
const HEALTH_PICKUP_HEIGHT_PCT = 1.7;
const SMALL_HEALTH_PICKUP_WIDTH_PCT = 1.35;
const SMALL_HEALTH_PICKUP_HEIGHT_PCT = 1.35;
const ENEMY_COUNT = 4;
const ENEMY_SPEED_SCALE = 1.4;
const ENEMY_HARD_SPEED_SCALE = ENEMY_SPEED_SCALE * 1.5;
const ENEMY_ARRIVE_PX = 28;
const ENEMY_TURN_MIN_MS = 2200;
const ENEMY_TURN_MAX_MS = 5200;

let score = 0;
let money = 0;
let totalMoneyEarned = 0;
let waterAmount = 0;
let healthPickup = null;
let smallHealthPickups = [];
let queuedHealthPickups = 0;
let queuedSmallHealthPickups = 0;
let smallHealthPickupsAwarded = 0;
let healthPickupThresholdsReached = 0;
let lastPickupSpawnAttempt = 0;
let lastCleanTime = 0;
let spaceHeld = false;
let pauseHeld = false;
let totalWaterCleaned = 0;
let zonesCleaned = 0;
let totalWaterDelivered = 0;
let deliveriesCompleted = 0;
let health = MAX_HEALTH;
let fuel = MAX_FUEL;
let lastDamageTime = 0;
let gameIsOver = false;
let gameOverReason = '';
let nextHealthPickupScore = HEALTH_PICKUP_SCORE_STEP;
let runElapsedMs = 0;
let timerFrozen = false;
let currentRunId = '';
let currentRunSaved = false;
let hallOfFameReturnScreen = 'start-screen';
let hofDifficulty = DIFFICULTY_EASY;
let isPaused = false;
let pauseStartedAt = 0;
let menuDifficulty = DIFFICULTY_EASY;
let activeDifficulty = DIFFICULTY_EASY;

const finalScore = document.getElementById('final-score');
const moneyValue = document.getElementById('money-value');
const finalMoney = document.getElementById('final-money');
const finalTime = document.getElementById('final-time');
const zonesCleanedDisplay = document.getElementById('zones-cleaned');
const totalMoneyEarnedDisplay = document.getElementById('total-money-earned');
const deliveriesCompletedDisplay = document.getElementById('deliveries-completed');

// Survival timer shown in the top HUD.
const survivalTimer = document.getElementById('survival-timer');
let timerStartTime = 0;
let timerId = 0;

// Keyboard and touch each keep their own held directions so releasing one
// device does not cancel the other.
const keyboardKeys = {
  up: false,
  down: false,
  left: false,
  right: false
};
const touchKeys = {
  up: false,
  down: false,
  left: false,
  right: false
};

function isDirectionHeld(direction) {
  return keyboardKeys[direction] === true || touchKeys[direction] === true;
}

// Prefer pointer capability over screen width or user-agent strings.
function deviceHasTouchInput() {
  if (typeof window.matchMedia === 'function') {
    const coarseQuery = window.matchMedia('(any-pointer: coarse)');

    if (coarseQuery.matches) {
      return true;
    }

    // Supported queries keep their text. Unsupported ones become "not all".
    if (coarseQuery.media === '(any-pointer: coarse)') {
      return false;
    }
  }

  return typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 0;
}

function syncTouchInputMode() {
  if (deviceHasTouchInput()) {
    document.documentElement.classList.add('has-touch-input');
    document.documentElement.classList.remove('no-touch-input');
  } else {
    document.documentElement.classList.remove('has-touch-input');
    document.documentElement.classList.add('no-touch-input');
  }
}

syncTouchInputMode();

function isHardMode() {
  return activeDifficulty === DIFFICULTY_HARD;
}

function getDifficultyLabel() {
  return isHardMode() ? 'HARD' : 'EASY';
}

function getObstaclesPerType() {
  return isHardMode() ? OBSTACLES_PER_TYPE * 2 : OBSTACLES_PER_TYPE;
}

function getEnemiesPerQuadrant() {
  return isHardMode() ? 2 : ENEMY_COUNT / 4;
}

function getEnemySpeedScale() {
  return isHardMode() ? ENEMY_HARD_SPEED_SCALE : ENEMY_SPEED_SCALE;
}

function getFuelPerSecond() {
  return isHardMode() ? FUEL_PER_SECOND * 2 : FUEL_PER_SECOND;
}

function updateDifficultyDisplays() {
  const label = getDifficultyLabel();
  const badge = document.getElementById('difficulty-value');
  const finalDifficulty = document.getElementById('final-difficulty');

  if (badge) {
    badge.textContent = label;
    badge.classList.toggle('is-hard', isHardMode());
  }

  if (finalDifficulty) {
    finalDifficulty.textContent = label;
  }
}

function setMenuDifficulty(mode) {
  menuDifficulty = mode === DIFFICULTY_HARD ? DIFFICULTY_HARD : DIFFICULTY_EASY;
  const easyInput = document.getElementById('difficulty-easy');
  const hardInput = document.getElementById('difficulty-hard');

  if (easyInput) {
    easyInput.checked = menuDifficulty === DIFFICULTY_EASY;
  }

  if (hardInput) {
    hardInput.checked = menuDifficulty === DIFFICULTY_HARD;
  }

  const options = document.querySelectorAll('.difficulty-option');

  for (let i = 0; i < options.length; i += 1) {
    const input = options[i].querySelector('input');
    options[i].classList.toggle('is-selected', input && input.checked);
  }
}

// Helicopter location in pixels, measured from the top-left of the world.
let helicopterX = 0;
let helicopterY = 0;
let cameraX = 0;
let cameraY = 0;

// Degrees clockwise from the default pose (nose up, tail down).
const DEFAULT_FACING_ANGLE = 0;
let facingAngle = DEFAULT_FACING_ANGLE;

// Used by requestAnimationFrame to keep speed the same on fast or slow screens.
let lastTimestamp = 0;
let animationId = 0;

// Hide every screen, then show only the one whose id was passed in.
function showScreen(screenId) {
  startScreen.hidden = true;
  gameScreen.hidden = true;
  gameOverScreen.hidden = true;

  if (hallOfFameScreen) {
    hallOfFameScreen.hidden = true;
  }

  const screenToShow = document.getElementById(screenId);

  // Only continue if that screen exists in the HTML.
  if (screenToShow) {
    screenToShow.hidden = false;
  }

  // Movement and the timer only run while the gameplay screen is open.
  if (screenId === 'game-screen') {
    document.body.classList.add('is-playing');
    resetGameStats();
    generateWorldLayout();
    resetHelicopterPosition();
    startGameLoop();
    startSurvivalTimer();
    startGameplayAudio();
  } else {
    document.body.classList.remove('is-playing');
    // Save the last time and score before the timer is cleared.
    if (screenId === 'game-over-screen') {
      updateFinalStats();
      prepareScoreSaveForm();
    }

    if (screenId === 'hall-of-fame-screen') {
      renderHallOfFame();
    }

    resetPauseState();
    stopGameLoop();
    clearHeldKeys();
    stopSurvivalTimer();
    collapseMinimap();
    stopGameplayAudio();
  }
}

function getWorldWidth() {
  return gameArea.clientWidth * WORLD_SCALE;
}

function getWorldHeight() {
  return gameArea.clientHeight * WORLD_SCALE;
}

function cacheHelicopterSize() {
  if (helicopter.offsetWidth > 0) {
    helicopterWidth = helicopter.offsetWidth;
    helicopterHeight = helicopter.offsetHeight;
  }
}

function cacheEnemySizes() {
  for (let i = 0; i < enemyHelicopters.length; i += 1) {
    const enemy = enemyHelicopters[i];
    const width = enemy.el.offsetWidth;
    const height = enemy.el.offsetHeight;

    if (width > 0) {
      enemy.width = width;
    }

    if (height > 0) {
      enemy.height = height;
    }

    const bounds = getQuadrantBounds(enemy.quadrant);

    if (enemy.x < bounds.left) {
      enemy.x = bounds.left;
    }

    if (enemy.y < bounds.top) {
      enemy.y = bounds.top;
    }

    if (enemy.x > bounds.right - enemy.width) {
      enemy.x = bounds.right - enemy.width;
    }

    if (enemy.y > bounds.bottom - enemy.height) {
      enemy.y = bounds.bottom - enemy.height;
    }

    enemy.el.style.left = enemy.x + 'px';
    enemy.el.style.top = enemy.y + 'px';
  }
}

function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

function randomInt(min, max) {
  return Math.floor(randomRange(min, max + 1));
}

function shuffleList(list) {
  const copy = list.slice();

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const held = copy[i];
    copy[i] = copy[j];
    copy[j] = held;
  }

  return copy;
}

function makeOrganicRadius() {
  const corners = [];

  for (let i = 0; i < 8; i += 1) {
    corners.push(String(Math.round(randomRange(36, 74))) + '%');
  }

  return corners.slice(0, 4).join(' ') + ' / ' + corners.slice(4).join(' ');
}

function pctBoxesOverlap(a, b, gap) {
  return !(
    a.right + gap <= b.left ||
    a.left >= b.right + gap ||
    a.bottom + gap <= b.top ||
    a.top >= b.bottom + gap
  );
}

function mixChannel(fromValue, toValue, amount) {
  return Math.round(fromValue + (toValue - fromValue) * amount);
}

function mixRgb(fromRgb, toRgb, amount) {
  return 'rgb(' +
    mixChannel(fromRgb[0], toRgb[0], amount) + ', ' +
    mixChannel(fromRgb[1], toRgb[1], amount) + ', ' +
    mixChannel(fromRgb[2], toRgb[2], amount) + ')';
}

function getPondCleanAmount(pond) {
  const maxContamination = Number(pond.dataset.maxContamination);
  const remaining = Number(pond.dataset.remaining);

  if (maxContamination <= 0) {
    return 1;
  }

  return 1 - remaining / maxContamination;
}

function updateMinimapPondMark(pond) {
  if (!pond.dataset.pondId) {
    return;
  }

  const mark = minimapWorld.querySelector('.minimap-pond[data-pond-id="' + pond.dataset.pondId + '"]');

  if (!mark) {
    return;
  }

  const remaining = Number(pond.dataset.remaining);
  const cleanAmount = getPondCleanAmount(pond);
  mark.style.background = mixRgb(POND_DIRTY_COLORS.outer, POND_CLEAN_COLORS.mid, cleanAmount);
  mark.classList.toggle('minimap-pond--cleaned', remaining <= 0);
}

function updatePondAppearance(pond) {
  const remaining = Number(pond.dataset.remaining);
  const cleanAmount = getPondCleanAmount(pond);
  const inner = mixRgb(POND_DIRTY_COLORS.inner, POND_CLEAN_COLORS.inner, cleanAmount);
  const mid = mixRgb(POND_DIRTY_COLORS.mid, POND_CLEAN_COLORS.mid, cleanAmount);
  const outer = mixRgb(POND_DIRTY_COLORS.outer, POND_CLEAN_COLORS.outer, cleanAmount);
  const shore = mixRgb(POND_DIRTY_COLORS.shore, POND_CLEAN_COLORS.shore, cleanAmount);

  pond.style.background =
    'radial-gradient(ellipse at 36% 30%, ' + inner + ' 0 22%, ' + mid + ' 50%, ' + outer + ' 100%)';
  pond.style.boxShadow =
    '0 0 0 0.4rem ' + shore + ', inset 0 0.5rem 1.1rem rgba(90, 35, 8, ' + (0.28 * (1 - cleanAmount)).toFixed(2) + ')';

  const muddyBits = pond.querySelectorAll('.puddle, .zone-mud-rock, .zone-stick');

  for (let i = 0; i < muddyBits.length; i += 1) {
    muddyBits[i].style.opacity = String(1 - cleanAmount);
  }

  pond.classList.toggle('water-zone--fully-cleaned', remaining <= 0);
  pond.setAttribute('aria-label', remaining <= 0 ? 'Cleaned pond' : 'Contaminated water');
  updateMinimapPondMark(pond);
}

function placeZoneFromTemplate(templateId, spec) {
  const template = document.getElementById(templateId);
  const zone = template.content.firstElementChild.cloneNode(true);

  zone.style.left = spec.left + '%';
  zone.style.top = spec.top + '%';
  zone.style.width = spec.width + '%';
  zone.style.height = spec.height + '%';
  zone.style.borderRadius = spec.radius;
  zone.dataset.left = String(spec.left);
  zone.dataset.top = String(spec.top);
  zone.dataset.width = String(spec.width);
  zone.dataset.height = String(spec.height);

  if (spec.pondId) {
    zone.dataset.pondId = spec.pondId;
  }

  if (spec.sizeKey) {
    const size = POND_SIZE_TYPES[spec.sizeKey];
    zone.dataset.size = size.key;
    zone.dataset.maxContamination = String(size.maxContamination);
    zone.dataset.remaining = String(size.maxContamination);
    zone.classList.add('water-zone--' + size.key);
  }

  if (spec.cluster) {
    const cluster = zone.querySelector('.community-cluster');
    if (cluster) {
      cluster.classList.add(spec.cluster);
    }
  }

  world.insertBefore(zone, helicopter);

  if (spec.sizeKey) {
    updatePondAppearance(zone);
  }

  return zone;
}

function placeFuelingStation(spec) {
  const template = document.getElementById('fueling-station-template');
  const station = template.content.firstElementChild.cloneNode(true);

  station.style.left = spec.left + '%';
  station.style.top = spec.top + '%';
  station.style.width = spec.width + '%';
  station.style.height = spec.height + '%';
  station.style.borderRadius = spec.radius;
  station.dataset.left = String(spec.left);
  station.dataset.top = String(spec.top);
  station.dataset.width = String(spec.width);
  station.dataset.height = String(spec.height);
  world.insertBefore(station, helicopter);
  return station;
}

function pickAdjacentCell(cell, used, cells) {
  const options = [];
  let fallback = null;
  let fallbackDist = Infinity;

  for (let i = 0; i < cells.length; i += 1) {
    const other = cells[i];

    if (other === cell || used.indexOf(other) !== -1) {
      continue;
    }

    const manhattan = Math.abs(other.col - cell.col) + Math.abs(other.row - cell.row);

    if (manhattan === 1) {
      options.push(other);
    }

    if (manhattan < fallbackDist) {
      fallbackDist = manhattan;
      fallback = other;
    }
  }

  if (options.length > 0) {
    return options[Math.floor(Math.random() * options.length)];
  }

  return fallback;
}

function placeObstacleFromTemplate(type, leftPct, topPct) {
  const template = document.getElementById('obstacle-' + type + '-template');
  const obstacle = template.content.firstElementChild.cloneNode(true);
  obstacle.style.left = leftPct + '%';
  obstacle.style.top = topPct + '%';
  world.insertBefore(obstacle, helicopter);
}

function clearGeneratedWorld() {
  const generated = world.querySelectorAll('.water-zone, .fueling-station, .obstacle, .helicopter--enemy, .health-pickup');

  for (let i = 0; i < generated.length; i += 1) {
    generated[i].remove();
  }

  enemyHelicopters = [];
  healthPickup = null;
  smallHealthPickups = [];
}

function buildGridCells() {
  const cells = [];
  const cellW = 100 / GRID_COLS;
  const cellH = 100 / GRID_ROWS;

  for (let row = 0; row < GRID_ROWS; row += 1) {
    for (let col = 0; col < GRID_COLS; col += 1) {
      cells.push({
        col: col,
        row: row,
        left: col * cellW,
        top: row * cellH,
        width: cellW,
        height: cellH
      });
    }
  }

  return cells;
}

function jitterBoxInCell(cell, widthPct, heightPct) {
  const pad = 0.8;
  const maxLeft = cell.left + cell.width - widthPct - pad;
  const maxTop = cell.top + cell.height - heightPct - pad;
  const left = randomRange(cell.left + pad, Math.max(cell.left + pad, maxLeft));
  const top = randomRange(cell.top + pad, Math.max(cell.top + pad, maxTop));

  return {
    left: left,
    top: top,
    width: widthPct,
    height: heightPct,
    right: left + widthPct,
    bottom: top + heightPct,
    radius: makeOrganicRadius()
  };
}

function cellDistanceSquared(a, b) {
  const dx = a.col - b.col;
  const dy = a.row - b.row;
  return dx * dx + dy * dy;
}

function pickSpreadCells(pool, alreadyUsed, count) {
  const chosen = [];
  const available = pool.slice();

  while (chosen.length < count && available.length > 0) {
    let bestIndex = 0;
    let bestScore = -1;

    for (let i = 0; i < available.length; i += 1) {
      const cell = available[i];
      let nearest = Infinity;

      for (let u = 0; u < alreadyUsed.length; u += 1) {
        const dist = cellDistanceSquared(cell, alreadyUsed[u]);
        if (dist < nearest) {
          nearest = dist;
        }
      }

      for (let c = 0; c < chosen.length; c += 1) {
        const dist = cellDistanceSquared(cell, chosen[c]);
        if (dist < nearest) {
          nearest = dist;
        }
      }

      const score = nearest + Math.random() * 0.2;

      if (score > bestScore) {
        bestScore = score;
        bestIndex = i;
      }
    }

    chosen.push(available[bestIndex]);
    available.splice(bestIndex, 1);
  }

  return chosen;
}

function makeObstacleBox(left, top) {
  return {
    left: left,
    top: top,
    right: left + 3,
    bottom: top + 4
  };
}

function canPlaceBox(box, blocked, gap) {
  if (box.left < 1.5 || box.top < 1.5 || box.right > 97.5 || box.bottom > 96.5) {
    return false;
  }

  for (let b = 0; b < blocked.length; b += 1) {
    if (pctBoxesOverlap(box, blocked[b], gap)) {
      return false;
    }
  }

  return true;
}

function placeAllObstacles(blocked) {
  const typeNames = ['rock', 'log', 'tree'];
  const perType = getObstaclesPerType();
  const queue = [];

  for (let t = 0; t < typeNames.length; t += 1) {
    for (let n = 0; n < perType; n += 1) {
      queue.push(typeNames[t]);
    }
  }

  const types = shuffleList(queue);
  const candidates = [];
  const cols = isHardMode() ? 28 : 20;
  const rows = isHardMode() ? 22 : 16;

  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      candidates.push({
        left: 2 + (c + randomRange(0.1, 0.75)) * (94 / cols),
        top: 2 + (r + randomRange(0.1, 0.75)) * (90 / rows)
      });
    }
  }

  const spots = shuffleList(candidates);
  let placed = 0;

  function tryPlace(left, top, gap) {
    const box = makeObstacleBox(left, top);

    if (canPlaceBox(box, blocked, gap) === false) {
      return false;
    }

    placeObstacleFromTemplate(types[placed], left, top);
    blocked.push(box);
    placed += 1;
    return true;
  }

  for (let i = 0; i < spots.length && placed < types.length; i += 1) {
    tryPlace(spots[i].left, spots[i].top, 2.2);
  }

  const fallbackGaps = [1.6, 1.0, 0.45];
  const fallbackAttempts = isHardMode() ? [400, 700, 1200] : [250, 400, 800];

  for (let pass = 0; pass < fallbackGaps.length && placed < types.length; pass += 1) {
    const remaining = types.length - placed;
    const budget = fallbackAttempts[pass] * remaining;

    for (let attempt = 0; attempt < budget && placed < types.length; attempt += 1) {
      tryPlace(randomRange(2, 94), randomRange(2, 92), fallbackGaps[pass]);
    }
  }

  let safety = 0;
  const safetyLimit = isHardMode() ? 40000 : 12000;

  while (placed < types.length && safety < safetyLimit) {
    tryPlace(randomRange(2, 94), randomRange(2, 92), 0.2);
    safety += 1;
  }

  if (placed < types.length) {
    showActionFeedback(
      'Could not place all obstacles (' + placed + '/' + types.length + ').',
      'warning'
    );
  }
}

function refreshWorldLists() {
  contaminatedZones = world.querySelectorAll('.water-zone--contaminated');
  deliveryZones = world.querySelectorAll('.water-zone--clean');
  fuelingStations = world.querySelectorAll('.fueling-station');
  obstacleList = world.querySelectorAll('.obstacle');
}

function generateWorldLayout() {
  world.style.width = WORLD_SCALE * 100 + '%';
  world.style.height = WORLD_SCALE * 100 + '%';
  cacheHelicopterSize();
  clearGeneratedWorld();

  const cells = buildGridCells();
  const spawnCell = cells[GRID_COLS];
  spawnXPct = spawnCell.left + spawnCell.width * 0.45;
  spawnYPct = spawnCell.top + spawnCell.height * 0.45;

  const remaining = [];

  for (let i = 0; i < cells.length; i += 1) {
    if (cells[i] !== spawnCell) {
      remaining.push(cells[i]);
    }
  }

  const farthest = remaining.slice().sort(function (a, b) {
    const da = (a.col - spawnCell.col) * (a.col - spawnCell.col) + (a.row - spawnCell.row) * (a.row - spawnCell.row);
    const db = (b.col - spawnCell.col) * (b.col - spawnCell.col) + (b.row - spawnCell.row) * (b.row - spawnCell.row);
    return db - da;
  });

  const deliveryCells = [farthest[0]];
  let bestIndex = 1;
  let bestDist = -1;

  for (let i = 1; i < farthest.length; i += 1) {
    const dx = farthest[i].col - farthest[0].col;
    const dy = farthest[i].row - farthest[0].row;
    const dist = dx * dx + dy * dy;

    if (dist > bestDist) {
      bestDist = dist;
      bestIndex = i;
    }
  }

  deliveryCells.push(farthest[bestIndex]);

  const used = [spawnCell, deliveryCells[0], deliveryCells[1]];
  const fuelCells = [null, null];

  for (let i = 0; i < deliveryCells.length; i += 1) {
    const fuelCell = pickAdjacentCell(deliveryCells[i], used, cells);

    if (fuelCell) {
      fuelCells[i] = fuelCell;
      used.push(fuelCell);
    }
  }

  const dirtyPool = remaining.filter(function (cell) {
    return used.indexOf(cell) === -1;
  });
  const dirtyCells = pickSpreadCells(dirtyPool, used, DIRTY_POND_COUNT);

  const deliveryWidthPct = (0.48 / WORLD_SCALE) * 100;
  const deliveryHeightPct = (0.576 / WORLD_SCALE) * 100;
  const fuelWidthPct = (0.16 / WORLD_SCALE) * 100;
  const fuelHeightPct = (0.17 / WORLD_SCALE) * 100;

  deliveryCells.forEach(function (cell, index) {
    const spec = jitterBoxInCell(cell, deliveryWidthPct, deliveryHeightPct);
    spec.cluster = index === 1 ? 'community-cluster--south' : '';
    placeZoneFromTemplate('delivery-zone-template', spec);

    if (fuelCells[index]) {
      const fuelSpec = jitterBoxInCell(fuelCells[index], fuelWidthPct, fuelHeightPct);
      placeFuelingStation(fuelSpec);
    }
  });

  const pondSizeKeys = shuffleList(POND_SIZE_MIX);

  dirtyCells.forEach(function (cell, index) {
    const size = POND_SIZE_TYPES[pondSizeKeys[index]];
    const widthPct = ((size.widthView + randomRange(-size.widthView * 0.06, size.widthView * 0.06)) / WORLD_SCALE) * 100;
    const heightPct = ((size.heightView + randomRange(-size.heightView * 0.06, size.heightView * 0.06)) / WORLD_SCALE) * 100;
    const spec = jitterBoxInCell(cell, widthPct, heightPct);
    spec.sizeKey = size.key;
    spec.pondId = 'dirty-' + index;
    placeZoneFromTemplate('contaminated-zone-template', spec);
  });

  const blocked = [
    {
      left: spawnCell.left,
      top: spawnCell.top,
      right: spawnCell.left + spawnCell.width,
      bottom: spawnCell.top + spawnCell.height
    }
  ];

  const placedZones = world.querySelectorAll('.water-zone');

  for (let i = 0; i < placedZones.length; i += 1) {
    const zone = placedZones[i];
    const pad = zone.classList.contains('water-zone--clean') ? 6 : 1.6;
    blocked.push({
      left: Number(zone.dataset.left) - pad,
      top: Number(zone.dataset.top) - pad,
      right: Number(zone.dataset.left) + Number(zone.dataset.width) + pad,
      bottom: Number(zone.dataset.top) + Number(zone.dataset.height) + pad
    });
  }

  const placedFuel = world.querySelectorAll('.fueling-station');

  for (let i = 0; i < placedFuel.length; i += 1) {
    const station = placedFuel[i];
    blocked.push({
      left: Number(station.dataset.left) - 2.2,
      top: Number(station.dataset.top) - 2.2,
      right: Number(station.dataset.left) + Number(station.dataset.width) + 2.2,
      bottom: Number(station.dataset.top) + Number(station.dataset.height) + 2.2
    });
  }

  placeAllObstacles(blocked);

  refreshWorldLists();
  spawnEnemyHelicopters();
  rebuildMinimapMarks();
  updateMinimapAspect();
}

function rebuildMinimapMarks() {
  const marks = minimapWorld.querySelectorAll('.minimap-pond, .minimap-house, .minimap-pump, .minimap-enemy, .minimap-health');

  for (let i = 0; i < marks.length; i += 1) {
    marks[i].remove();
  }

  for (let i = 0; i < contaminatedZones.length; i += 1) {
    const zone = contaminatedZones[i];
    const mark = document.createElement('span');
    const sizeName = zone.dataset.size || 'medium';
    mark.className = 'minimap-pond minimap-pond--dirty minimap-pond--' + sizeName;
    mark.dataset.pondId = zone.dataset.pondId;
    mark.style.left = zone.dataset.left + '%';
    mark.style.top = zone.dataset.top + '%';
    mark.style.width = zone.dataset.width + '%';
    mark.style.height = zone.dataset.height + '%';
    mark.style.borderRadius = zone.style.borderRadius;
    minimapWorld.insertBefore(mark, minimapView);
    updateMinimapPondMark(zone);
  }

  for (let i = 0; i < deliveryZones.length; i += 1) {
    const zone = deliveryZones[i];
    const house = document.createElement('span');
    const left = Number(zone.dataset.left) + Number(zone.dataset.width) / 2;
    const top = Number(zone.dataset.top) + Number(zone.dataset.height) / 2;
    house.className = 'minimap-house';
    house.title = 'Delivery village';
    house.style.left = left + '%';
    house.style.top = top + '%';
    minimapWorld.insertBefore(house, minimapView);
  }

  for (let i = 0; i < fuelingStations.length; i += 1) {
    const station = fuelingStations[i];
    const pump = document.createElement('span');
    const left = Number(station.dataset.left) + Number(station.dataset.width) / 2;
    const top = Number(station.dataset.top) + Number(station.dataset.height) / 2;
    pump.className = 'minimap-pump';
    pump.title = 'Fueling station';
    pump.style.left = left + '%';
    pump.style.top = top + '%';
    minimapWorld.insertBefore(pump, minimapView);
  }

  for (let i = 0; i < enemyHelicopters.length; i += 1) {
    const mark = document.createElement('span');
    mark.className = 'minimap-enemy';
    mark.title = 'Enemy helicopter';
    minimapWorld.insertBefore(mark, minimapHeli);
    enemyHelicopters[i].minimapMark = mark;
  }

  if (healthPickup && healthPickup.element) {
    healthPickup.minimapMark = createHealthMinimapMark(
      healthPickup.leftPct,
      healthPickup.topPct,
      'minimap-health--large',
      HEALTH_PICKUP_WIDTH_PCT,
      HEALTH_PICKUP_HEIGHT_PCT
    );
  }

  for (let s = 0; s < smallHealthPickups.length; s += 1) {
    const pickup = smallHealthPickups[s];

    if (pickup.element) {
      pickup.minimapMark = createHealthMinimapMark(
        pickup.leftPct,
        pickup.topPct,
        'minimap-health--small',
        SMALL_HEALTH_PICKUP_WIDTH_PCT,
        SMALL_HEALTH_PICKUP_HEIGHT_PCT
      );
    }
  }
}

function updateMinimapAspect() {
  if (gameArea.clientWidth > 0 && gameArea.clientHeight > 0) {
    minimapStage.style.aspectRatio = gameArea.clientWidth + ' / ' + gameArea.clientHeight;
  }
}

function updateMinimapIndicators() {
  const worldW = getWorldWidth();
  const worldH = getWorldHeight();

  if (worldW <= 0 || worldH <= 0) {
    return;
  }

  const heliLeft = ((helicopterX + helicopterWidth / 2) / worldW * 100).toFixed(2) + '%';
  const heliTop = ((helicopterY + helicopterHeight / 2) / worldH * 100).toFixed(2) + '%';
  const viewLeft = (cameraX / worldW * 100).toFixed(2) + '%';
  const viewTop = (cameraY / worldH * 100).toFixed(2) + '%';
  const viewWidth = (gameArea.clientWidth / worldW * 100).toFixed(2) + '%';
  const viewHeight = (gameArea.clientHeight / worldH * 100).toFixed(2) + '%';

  if (minimapHeli.style.left !== heliLeft) {
    minimapHeli.style.left = heliLeft;
  }

  if (minimapHeli.style.top !== heliTop) {
    minimapHeli.style.top = heliTop;
  }

  if (minimapView.style.left !== viewLeft) {
    minimapView.style.left = viewLeft;
  }

  if (minimapView.style.top !== viewTop) {
    minimapView.style.top = viewTop;
  }

  if (minimapView.style.width !== viewWidth) {
    minimapView.style.width = viewWidth;
  }

  if (minimapView.style.height !== viewHeight) {
    minimapView.style.height = viewHeight;
  }

  for (let i = 0; i < enemyHelicopters.length; i += 1) {
    const enemy = enemyHelicopters[i];

    if (!enemy.minimapMark) {
      continue;
    }

    const left = ((enemy.x + enemy.width / 2) / worldW * 100).toFixed(2) + '%';
    const top = ((enemy.y + enemy.height / 2) / worldH * 100).toFixed(2) + '%';

    if (enemy.minimapMark.style.left !== left) {
      enemy.minimapMark.style.left = left;
    }

    if (enemy.minimapMark.style.top !== top) {
      enemy.minimapMark.style.top = top;
    }
  }
}

function setMinimapExpanded(expanded) {
  minimap.classList.toggle('minimap--expanded', expanded);
  minimapToggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  minimapToggle.textContent = expanded ? 'Close' : 'Expand';
}

function toggleMinimap() {
  setMinimapExpanded(minimap.classList.contains('minimap--expanded') === false);
}

function collapseMinimap() {
  if (minimap.classList.contains('minimap--expanded')) {
    setMinimapExpanded(false);
  }
}

// Place the helicopter in the reserved spawn cell, away from ponds.
function resetHelicopterPosition() {
  cacheHelicopterSize();
  helicopterX = getWorldWidth() * (spawnXPct / 100) - helicopterWidth / 2;
  helicopterY = getWorldHeight() * (spawnYPct / 100) - helicopterHeight / 2;
  keepHelicopterInsideWorld();
  helicopter.style.left = helicopterX + 'px';
  helicopter.style.top = helicopterY + 'px';
  resetHelicopterFacing();
  updateCamera(0, true);
  updateActionButtonLabel();
  updateMinimapIndicators();
}

// Keep the whole helicopter inside the large swamp, not just the visible viewport.
function keepHelicopterInsideWorld() {
  const maxX = getWorldWidth() - helicopterWidth;
  const maxY = getWorldHeight() - helicopterHeight;

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

function keepHelicopterInsideGameArea() {
  keepHelicopterInsideWorld();
}

// Slide the world so the helicopter stays in view, without leaving the map edges.
function updateCamera(elapsedSeconds, snap) {
  const viewWidth = gameArea.clientWidth;
  const viewHeight = gameArea.clientHeight;
  const worldWidth = getWorldWidth();
  const worldHeight = getWorldHeight();

  let targetX = helicopterX + helicopterWidth / 2 - viewWidth / 2;
  let targetY = helicopterY + helicopterHeight / 2 - viewHeight / 2;

  const maxX = Math.max(0, worldWidth - viewWidth);
  const maxY = Math.max(0, worldHeight - viewHeight);

  if (targetX < 0) {
    targetX = 0;
  }

  if (targetY < 0) {
    targetY = 0;
  }

  if (targetX > maxX) {
    targetX = maxX;
  }

  if (targetY > maxY) {
    targetY = maxY;
  }

  if (snap) {
    cameraX = targetX;
    cameraY = targetY;
  } else {
    const follow = Math.min(1, elapsedSeconds * 8);
    cameraX += (targetX - cameraX) * follow;
    cameraY += (targetY - cameraY) * follow;
  }

  world.style.transform = 'translate(' + (-cameraX) + 'px, ' + (-cameraY) + 'px)';
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
function getClockMs() {
  if (window.performance && typeof window.performance.now === 'function') {
    return window.performance.now();
  }

  return Date.now();
}

function startSurvivalTimer() {
  stopSurvivalTimer();
  timerFrozen = false;
  runElapsedMs = 0;
  timerStartTime = getClockMs();
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

function freezeGameplayTimer() {
  if (timerFrozen) {
    return;
  }

  runElapsedMs = getElapsedSurvivalMs();
  timerFrozen = true;
}

function getElapsedSurvivalMs() {
  if (timerFrozen) {
    return runElapsedMs;
  }

  let elapsedMs = getClockMs() - timerStartTime;

  // If we are paused right now, ignore the time since the pause started.
  if (isPaused && pauseStartedAt !== 0) {
    elapsedMs -= getClockMs() - pauseStartedAt;
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
  pauseStartedAt = getClockMs();
  clearHeldKeys();
  lastTimestamp = 0;
  setPauseButtonsLabel('Resume');
  showActionFeedback('Paused. Press P or Resume to continue.', '');
  setGameplayAudioPaused(true);
}

function resumeGame() {
  const pausedMs = getClockMs() - pauseStartedAt;

  // Move the timer start forward so paused seconds are not added to survival time.
  timerStartTime += pausedMs;

  // Move the last-hit time forward so the 1-second damage cooldown also ignores the pause.
  if (lastDamageTime !== 0) {
    lastDamageTime += pausedMs;
  }

  if (lastCleanTime !== 0) {
    lastCleanTime += pausedMs;
  }

  // Keep enemy patrol deadlines frozen for the same paused span.
  for (let i = 0; i < enemyHelicopters.length; i += 1) {
    enemyHelicopters[i].nextTurnAt += pausedMs;
  }

  isPaused = false;
  pauseStartedAt = 0;
  lastTimestamp = 0;
  setPauseButtonsLabel('Pause');
  showActionFeedback('Back in the air!', '');
  setGameplayAudioPaused(false);
}

function clearHeldKeys() {
  keyboardKeys.up = false;
  keyboardKeys.down = false;
  keyboardKeys.left = false;
  keyboardKeys.right = false;
  touchKeys.up = false;
  touchKeys.down = false;
  touchKeys.left = false;
  touchKeys.right = false;
  spaceHeld = false;
}

// Tab switch, minimize, or window blur should not leave WASD stuck and flying.
function handleWindowInactive() {
  clearHeldKeys();

  if (gameScreen.hidden || gameIsOver || isPaused) {
    return;
  }

  pauseGame();
}

// Reset score and water when a new game starts.
function resetGameStats() {
  score = 0;
  money = 0;
  totalMoneyEarned = 0;
  waterAmount = 0;
  lastCleanTime = 0;
  spaceHeld = false;
  pauseHeld = false;
  totalWaterCleaned = 0;
  zonesCleaned = 0;
  totalWaterDelivered = 0;
  deliveriesCompleted = 0;
  health = MAX_HEALTH;
  fuel = MAX_FUEL;
  lastDamageTime = 0;
  gameIsOver = false;
  gameOverReason = '';
  nextHealthPickupScore = HEALTH_PICKUP_SCORE_STEP;
  runElapsedMs = 0;
  timerFrozen = false;
  currentRunId = '';
  currentRunSaved = false;
  healthPickupThresholdsReached = 0;
  queuedHealthPickups = 0;
  queuedSmallHealthPickups = 0;
  smallHealthPickupsAwarded = 0;
  lastPickupSpawnAttempt = 0;
  clearHealthPickups();
  resetPauseState();
  helicopter.classList.remove('helicopter--hit');
  updateScoreDisplay();
  updateMoneyDisplay();
  updateWaterDisplay();
  updateHealthDisplay();
  updateFuelDisplay();
  if (gameOverReasonDisplay) {
    gameOverReasonDisplay.textContent = '';
  }
  showActionFeedback('Clean water in an orange pond, then deliver it at a blue village pond.', '');

  if (cleanButton.textContent !== 'CLEAN') {
    cleanButton.textContent = 'CLEAN';
  }

  updateDifficultyDisplays();
}

function updateScoreDisplay() {
  scoreValue.textContent = String(score);
  checkHealthPickupThresholds();
}

function formatMoney(amount) {
  return '$' + String(Math.max(0, Math.floor(amount)));
}

function updateMoneyDisplay() {
  if (money < 0) {
    money = 0;
  }

  moneyValue.textContent = formatMoney(money);
}

function updateHealthDisplay() {
  healthValue.textContent = `${health}%`;
  healthFill.style.width = `${health}%`;
  healthBar.setAttribute('aria-valuenow', String(health));
  healthBar.setAttribute('aria-valuetext', `${health} percent`);
}

function updateFuelDisplay() {
  const shown = fuel <= 0 ? 0 : Math.max(1, Math.min(MAX_FUEL, Math.round(fuel)));
  fuelValue.textContent = shown + '%';
  fuelFill.style.width = Math.max(0, Math.min(MAX_FUEL, fuel)) + '%';
  fuelBar.setAttribute('aria-valuenow', String(shown));
  fuelBar.setAttribute('aria-valuetext', shown + ' percent');
  fuelFill.classList.toggle('fuel-fill--caution', fuel > 20 && fuel <= 50);
  fuelFill.classList.toggle('fuel-fill--critical', fuel <= 20);
}

function consumeFuel(elapsedSeconds) {
  if (gameScreen.hidden || isPaused || gameIsOver) {
    return;
  }

  fuel -= getFuelPerSecond() * elapsedSeconds;

  if (fuel < 0) {
    fuel = 0;
  }

  if (fuel > MAX_FUEL) {
    fuel = MAX_FUEL;
  }

  updateFuelDisplay();

  if (fuel <= 0) {
    endGame('fuel');
  }
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

function getElementWorldBox(element) {
  return {
    left: element.offsetLeft,
    top: element.offsetTop,
    width: element.offsetWidth,
    height: element.offsetHeight,
    right: element.offsetLeft + element.offsetWidth,
    bottom: element.offsetTop + element.offsetHeight
  };
}

function getHelicopterWorldBox() {
  return {
    left: helicopterX,
    top: helicopterY,
    width: helicopterWidth,
    height: helicopterHeight,
    right: helicopterX + helicopterWidth,
    bottom: helicopterY + helicopterHeight
  };
}

function isHelicopterOverPond(pondElement) {
  const helicopterCenter = getBoxCenter(getHelicopterWorldBox());
  return isPointInsideEllipse(helicopterCenter.x, helicopterCenter.y, getElementWorldBox(pondElement));
}

function clientBoxesOverlap(elementA, elementB) {
  const boxA = elementA.getBoundingClientRect();
  const boxB = elementB.getBoundingClientRect();
  const separateOnX = boxA.right <= boxB.left || boxA.left >= boxB.right;
  const separateOnY = boxA.bottom <= boxB.top || boxA.top >= boxB.bottom;
  return separateOnX === false && separateOnY === false;
}

// Grow the fuel hover ellipse for touch / narrow screens without changing the artwork.
function getFuelInteractionBox(station) {
  const box = getElementWorldBox(station);
  const useTouchPad = deviceHasTouchInput() || gameArea.clientWidth < 768;
  const padX = useTouchPad
    ? Math.max(helicopterWidth * 0.9, box.width * 0.45, 36)
    : Math.max(helicopterWidth * 0.15, 10);
  const padY = useTouchPad
    ? Math.max(helicopterHeight * 0.75, box.height * 0.35, 32)
    : Math.max(helicopterHeight * 0.12, 8);

  return {
    left: box.left - padX,
    top: box.top - padY,
    width: box.width + padX * 2,
    height: box.height + padY * 2,
    right: box.right + padX,
    bottom: box.bottom + padY
  };
}

function isHelicopterOverAnyPond(zoneList) {
  for (let i = 0; i < zoneList.length; i += 1) {
    if (isHelicopterOverPond(zoneList[i])) {
      return true;
    }
  }

  return false;
}

function isOverContaminatedWater() {
  return isHelicopterOverAnyPond(contaminatedZones);
}

function getOverlappingContaminatedPond() {
  let depletedPond = null;

  for (let i = 0; i < contaminatedZones.length; i += 1) {
    const pond = contaminatedZones[i];

    if (isHelicopterOverPond(pond)) {
      if (Number(pond.dataset.remaining) > 0) {
        return pond;
      }

      depletedPond = pond;
    }
  }

  return depletedPond;
}

function isOverDeliveryZone() {
  if (isHelicopterOverAnyPond(deliveryZones)) {
    return true;
  }

  // Village houses sit on the shore; hovering them should still count as delivery.
  for (let i = 0; i < deliveryZones.length; i += 1) {
    const cluster = deliveryZones[i].querySelector('.community-cluster');

    if (cluster && clientBoxesOverlap(helicopter, cluster)) {
      return true;
    }
  }

  return false;
}

function isOverFuelingStation() {
  const helicopterCenter = getBoxCenter(getHelicopterWorldBox());

  for (let i = 0; i < fuelingStations.length; i += 1) {
    if (isPointInsideEllipse(helicopterCenter.x, helicopterCenter.y, getFuelInteractionBox(fuelingStations[i]))) {
      return true;
    }
  }

  return false;
}

function getCurrentAction() {
  if (isOverFuelingStation()) {
    return 'fuel';
  }

  if (isOverDeliveryZone()) {
    return 'deliver';
  }

  if (isOverContaminatedWater()) {
    return 'clean';
  }

  return 'none';
}

// The mobile action button uses the same zone check as Space.
function updateActionButtonLabel() {
  const action = getCurrentAction();
  let nextLabel = 'CLEAN';

  if (action === 'fuel') {
    nextLabel = 'FUEL $10';
  } else if (action === 'deliver') {
    nextLabel = 'DELIVER';
  }

  if (cleanButton.textContent !== nextLabel) {
    cleanButton.textContent = nextLabel;
  }
}

// Space chooses fuel, deliver, clean, or a hint from the same priority used on mobile.
function handleSpaceAction() {
  if (gameScreen.hidden || isPaused) {
    return;
  }

  const action = getCurrentAction();

  if (action === 'fuel') {
    tryRefuel();
    return;
  }

  if (action === 'deliver') {
    tryDeliverWater();
    return;
  }

  if (action === 'clean') {
    tryCleanWater();
    return;
  }

  showActionFeedback('Fly to a pond, village, or fuel station, then press Space.', 'warning');
}

// Collect 1 unit of water and add 10 points. Only works in the orange zone.
function tryCleanWater() {
  if (gameScreen.hidden || isPaused || gameIsOver) {
    return;
  }

  const pond = getOverlappingContaminatedPond();

  if (!pond) {
    return;
  }

  const now = Date.now();

  if (now - lastCleanTime < CLEAN_COOLDOWN_MS) {
    return;
  }

  const remaining = Number(pond.dataset.remaining);

  if (remaining <= 0) {
    showActionFeedback('This pond is already clean.', 'warning');
    return;
  }

  if (waterAmount >= MAX_WATER) {
    showActionFeedback('Tank is full (5/5). Cannot collect more water.', 'warning');
    return;
  }

  pond.dataset.remaining = String(remaining - 1);
  waterAmount += 1;
  totalWaterCleaned += 1;
  score += CLEAN_POINTS;
  lastCleanTime = now;

  if (remaining - 1 <= 0) {
    zonesCleaned += 1;
    awardSmallHealthPickup();
  }

  updatePondAppearance(pond);
  updateWaterDisplay();
  updateScoreDisplay();

  if (remaining - 1 <= 0) {
    showActionFeedback('Pond fully cleaned. +10 points.', 'success');
  } else {
    showActionFeedback('Cleaned 1 unit of water. +10 points.', 'success');
  }

  playCleanSound();

  if (zonesCleaned >= DIRTY_POND_COUNT) {
    endGame('victory');
  }
}

function tryRefuel() {
  if (gameScreen.hidden || isPaused || gameIsOver) {
    return;
  }

  if (isOverFuelingStation() === false) {
    return;
  }

  const now = Date.now();

  if (now - lastCleanTime < CLEAN_COOLDOWN_MS) {
    return;
  }

  if (fuel >= MAX_FUEL) {
    showActionFeedback('FUEL FULL', 'warning');
    lastCleanTime = now;
    return;
  }

  if (money < REFUEL_COST) {
    showActionFeedback('NEED $10', 'warning');
    lastCleanTime = now;
    return;
  }

  const added = Math.min(REFUEL_AMOUNT, MAX_FUEL - fuel);

  if (added <= 0) {
    showActionFeedback('FUEL FULL', 'warning');
    lastCleanTime = now;
    return;
  }

  money -= REFUEL_COST;

  if (money < 0) {
    money = 0;
  }

  fuel += added;

  if (fuel > MAX_FUEL) {
    fuel = MAX_FUEL;
  }

  lastCleanTime = now;
  updateMoneyDisplay();
  updateFuelDisplay();
  showActionFeedback('Refueled +' + added + '. -$10. Fuel ' + Math.round(fuel) + '/100.', 'success');
  playFuelSound();
}

// Drop off every carried unit at once. Each unit adds 25 points to the current score.
function tryDeliverWater() {
  if (gameScreen.hidden || isPaused || gameIsOver) {
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
  const moneyEarned = unitsDelivered * MONEY_PER_DELIVERY_UNIT;

  score += pointsEarned;
  money += moneyEarned;
  totalMoneyEarned += moneyEarned;
  totalWaterDelivered += unitsDelivered;
  deliveriesCompleted += 1;
  waterAmount = 0;

  updateScoreDisplay();
  updateMoneyDisplay();
  updateWaterDisplay();
  showActionFeedback(
    'Delivered ' + unitsDelivered + ' water. +' + pointsEarned + ' points. +$' + moneyEarned + '.',
    'success'
  );
  playDeliverSound();
}

function createHealthMinimapMark(leftPct, topPct, extraClass, widthPct, heightPct) {
  const mark = document.createElement('span');
  const markWidth = widthPct || HEALTH_PICKUP_WIDTH_PCT;
  const markHeight = heightPct || HEALTH_PICKUP_HEIGHT_PCT;
  mark.className = extraClass ? 'minimap-health ' + extraClass : 'minimap-health';
  mark.title = extraClass === 'minimap-health--small' ? 'Small health +10' : 'Health package +50';
  mark.style.left = (leftPct + markWidth / 2) + '%';
  mark.style.top = (topPct + markHeight / 2) + '%';
  minimapWorld.insertBefore(mark, minimapHeli);
  return mark;
}

function clearHealthPickups() {
  const leftovers = world.querySelectorAll('.health-pickup');

  for (let i = 0; i < leftovers.length; i += 1) {
    leftovers[i].remove();
  }

  const marks = minimapWorld.querySelectorAll('.minimap-health');

  for (let m = 0; m < marks.length; m += 1) {
    marks[m].remove();
  }

  healthPickup = null;
  smallHealthPickups = [];
}

function addPctBoxFromElement(element, pad, blocked) {
  const box = getElementWorldBox(element);
  const worldW = getWorldWidth();
  const worldH = getWorldHeight();

  if (worldW <= 0 || worldH <= 0) {
    return;
  }

  blocked.push({
    left: box.left / worldW * 100 - pad,
    top: box.top / worldH * 100 - pad,
    right: box.right / worldW * 100 + pad,
    bottom: box.bottom / worldH * 100 + pad
  });
}

function buildHealthPickupBlockedBoxes() {
  const blocked = [];
  const worldW = getWorldWidth();
  const worldH = getWorldHeight();

  for (let i = 0; i < contaminatedZones.length; i += 1) {
    addPctBoxFromElement(contaminatedZones[i], 1.4, blocked);
  }

  for (let d = 0; d < deliveryZones.length; d += 1) {
    addPctBoxFromElement(deliveryZones[d], 2.4, blocked);
    const cluster = deliveryZones[d].querySelector('.community-cluster');

    if (cluster) {
      addPctBoxFromElement(cluster, 1.6, blocked);
    }
  }

  for (let f = 0; f < fuelingStations.length; f += 1) {
    addPctBoxFromElement(fuelingStations[f], 1.6, blocked);
  }

  for (let o = 0; o < obstacleList.length; o += 1) {
    addPctBoxFromElement(obstacleList[o], 0.9, blocked);
  }

  blocked.push({
    left: helicopterX / worldW * 100 - 4,
    top: helicopterY / worldH * 100 - 4,
    right: (helicopterX + helicopterWidth) / worldW * 100 + 4,
    bottom: (helicopterY + helicopterHeight) / worldH * 100 + 4
  });

  for (let e = 0; e < enemyHelicopters.length; e += 1) {
    const enemy = enemyHelicopters[e];
    blocked.push({
      left: enemy.x / worldW * 100 - 1.8,
      top: enemy.y / worldH * 100 - 1.8,
      right: (enemy.x + enemy.width) / worldW * 100 + 1.8,
      bottom: (enemy.y + enemy.height) / worldH * 100 + 1.8
    });
  }

  if (healthPickup) {
    blocked.push({
      left: healthPickup.leftPct - 0.8,
      top: healthPickup.topPct - 0.8,
      right: healthPickup.leftPct + HEALTH_PICKUP_WIDTH_PCT + 0.8,
      bottom: healthPickup.topPct + HEALTH_PICKUP_HEIGHT_PCT + 0.8
    });
  }

  for (let s = 0; s < smallHealthPickups.length; s += 1) {
    const pickup = smallHealthPickups[s];
    blocked.push({
      left: pickup.leftPct - 0.8,
      top: pickup.topPct - 0.8,
      right: pickup.leftPct + SMALL_HEALTH_PICKUP_WIDTH_PCT + 0.8,
      bottom: pickup.topPct + SMALL_HEALTH_PICKUP_HEIGHT_PCT + 0.8
    });
  }

  return blocked;
}

function findHealthPickupSpot(widthPct, heightPct) {
  const blocked = buildHealthPickupBlockedBoxes();
  const gaps = [2.2, 1.4, 0.8, 0.3];
  let found = null;

  for (let g = 0; g < gaps.length && found === null; g += 1) {
    const attempts = g === 0 ? 70 : 110;

    for (let i = 0; i < attempts && found === null; i += 1) {
      const left = randomRange(3, 95.5 - widthPct);
      const top = randomRange(3, 94.5 - heightPct);
      const box = {
        left: left,
        top: top,
        right: left + widthPct,
        bottom: top + heightPct
      };

      if (canPlaceBox(box, blocked, gaps[g])) {
        found = box;
      }
    }
  }

  return found;
}

function spawnHealthPickup() {
  if (healthPickup || gameScreen.hidden) {
    return false;
  }

  const template = document.getElementById('health-pickup-template');

  if (!template) {
    return false;
  }

  const found = findHealthPickupSpot(HEALTH_PICKUP_WIDTH_PCT, HEALTH_PICKUP_HEIGHT_PCT);

  if (found === null) {
    return false;
  }

  const element = template.content.firstElementChild.cloneNode(true);
  element.style.left = found.left + '%';
  element.style.top = found.top + '%';
  world.insertBefore(element, helicopter);

  healthPickup = {
    element: element,
    minimapMark: createHealthMinimapMark(
      found.left,
      found.top,
      'minimap-health--large',
      HEALTH_PICKUP_WIDTH_PCT,
      HEALTH_PICKUP_HEIGHT_PCT
    ),
    leftPct: found.left,
    topPct: found.top
  };

  return true;
}

function spawnSmallHealthPickup() {
  if (gameScreen.hidden) {
    return false;
  }

  const template = document.getElementById('health-pickup-small-template');

  if (!template) {
    return false;
  }

  const found = findHealthPickupSpot(SMALL_HEALTH_PICKUP_WIDTH_PCT, SMALL_HEALTH_PICKUP_HEIGHT_PCT);

  if (found === null) {
    return false;
  }

  const element = template.content.firstElementChild.cloneNode(true);
  element.style.left = found.left + '%';
  element.style.top = found.top + '%';
  world.insertBefore(element, helicopter);

  smallHealthPickups.push({
    element: element,
    minimapMark: createHealthMinimapMark(
      found.left,
      found.top,
      'minimap-health--small',
      SMALL_HEALTH_PICKUP_WIDTH_PCT,
      SMALL_HEALTH_PICKUP_HEIGHT_PCT
    ),
    leftPct: found.left,
    topPct: found.top
  });

  return true;
}

function awardSmallHealthPickup() {
  if (smallHealthPickupsAwarded >= DIRTY_POND_COUNT) {
    return;
  }

  smallHealthPickupsAwarded += 1;
  queuedSmallHealthPickups += 1;
  trySpawnQueuedSmallHealthPickup();
}

function trySpawnQueuedSmallHealthPickup() {
  while (queuedSmallHealthPickups > 0) {
    if (spawnSmallHealthPickup() === false) {
      return;
    }

    queuedSmallHealthPickups -= 1;
  }
}

function trySpawnQueuedHealthPickup() {
  if (healthPickup || queuedHealthPickups < 1) {
    return;
  }

  if (spawnHealthPickup()) {
    queuedHealthPickups -= 1;
  }
}

function checkHealthPickupThresholds() {
  // Milestones never move backward if a crash drops the score below a threshold.
  if (score < nextHealthPickupScore) {
    return;
  }

  while (score >= nextHealthPickupScore) {
    queuedHealthPickups += 1;
    healthPickupThresholdsReached += 1;
    nextHealthPickupScore += HEALTH_PICKUP_SCORE_STEP;
  }

  trySpawnQueuedHealthPickup();
}

function applyHealthPickupHeal(amount, message) {
  health += amount;

  if (health > MAX_HEALTH) {
    health = MAX_HEALTH;
  }

  updateHealthDisplay();
  showActionFeedback(message, 'success');
  playHealthSound();
}

function removeHealthPickupRecord(record) {
  if (!record) {
    return;
  }

  if (record.element) {
    record.element.remove();
  }

  if (record.minimapMark) {
    record.minimapMark.remove();
  }
}

function collectHealthPickup() {
  if (!healthPickup || gameIsOver || isPaused) {
    return;
  }

  const collected = healthPickup;
  healthPickup = null;
  removeHealthPickupRecord(collected);
  applyHealthPickupHeal(HEALTH_PICKUP_HEAL, '+50 HEALTH');
  trySpawnQueuedHealthPickup();
}

function collectSmallHealthPickup(index) {
  if (gameIsOver || isPaused || index < 0 || index >= smallHealthPickups.length) {
    return;
  }

  const collected = smallHealthPickups[index];
  smallHealthPickups.splice(index, 1);
  removeHealthPickupRecord(collected);
  applyHealthPickupHeal(SMALL_HEALTH_PICKUP_HEAL, '+10 HEALTH');
}

function checkHealthPickupCollection() {
  if (gameScreen.hidden || isPaused || gameIsOver) {
    return;
  }

  const now = Date.now();

  if (now - lastPickupSpawnAttempt > 450) {
    lastPickupSpawnAttempt = now;

    if (!healthPickup && queuedHealthPickups > 0) {
      trySpawnQueuedHealthPickup();
    }

    if (queuedSmallHealthPickups > 0) {
      trySpawnQueuedSmallHealthPickup();
    }
  }

  const helicopterBox = getHelicopterWorldBox();

  if (healthPickup && healthPickup.element) {
    if (rectanglesOverlap(helicopterBox, getElementWorldBox(healthPickup.element))) {
      collectHealthPickup();
    }
  }

  for (let i = smallHealthPickups.length - 1; i >= 0; i -= 1) {
    const pickup = smallHealthPickups[i];

    if (pickup.element && rectanglesOverlap(helicopterBox, getElementWorldBox(pickup.element))) {
      collectSmallHealthPickup(i);
    }
  }
}

function getPlayerPixelsPerSecond() {
  const smallerSide = Math.min(gameArea.clientWidth, gameArea.clientHeight);
  return smallerSide * 0.4;
}

function getQuadrantBounds(index) {
  const worldW = getWorldWidth();
  const worldH = getWorldHeight();
  const col = index % 2;
  const row = index < 2 ? 0 : 1;
  const margin = Math.min(worldW, worldH) * 0.03;

  return {
    left: col * worldW / 2 + margin,
    top: row * worldH / 2 + margin,
    right: (col + 1) * worldW / 2 - margin,
    bottom: (row + 1) * worldH / 2 - margin
  };
}

function isEnemyBoxBlocked(box) {
  const spawnX = getWorldWidth() * (spawnXPct / 100);
  const spawnY = getWorldHeight() * (spawnYPct / 100);
  const spawnSafe = {
    left: spawnX - 160,
    top: spawnY - 160,
    right: spawnX + 160,
    bottom: spawnY + 160
  };

  if (rectanglesOverlap(box, spawnSafe)) {
    return true;
  }

  const lists = [contaminatedZones, deliveryZones, fuelingStations];

  for (let listIndex = 0; listIndex < lists.length; listIndex += 1) {
    const list = lists[listIndex];

    for (let i = 0; i < list.length; i += 1) {
      if (rectanglesOverlap(box, getElementWorldBox(list[i]))) {
        return true;
      }
    }
  }

  for (let i = 0; i < enemyHelicopters.length; i += 1) {
    const other = enemyHelicopters[i];
    const otherBox = {
      left: other.x,
      top: other.y,
      right: other.x + other.width,
      bottom: other.y + other.height
    };

    if (rectanglesOverlap(box, otherBox)) {
      return true;
    }
  }

  return false;
}

function pickEnemyDestination(enemy) {
  const bounds = getQuadrantBounds(enemy.quadrant);
  const minTravel = Math.max(80, (bounds.right - bounds.left) * 0.22);
  const centerX = enemy.x + enemy.width / 2;
  const centerY = enemy.y + enemy.height / 2;
  let destX = centerX;
  let destY = centerY;

  for (let attempt = 0; attempt < 18; attempt += 1) {
    destX = randomRange(bounds.left + enemy.width / 2, bounds.right - enemy.width / 2);
    destY = randomRange(bounds.top + enemy.height / 2, bounds.bottom - enemy.height / 2);
    const dx = destX - centerX;
    const dy = destY - centerY;

    if (Math.sqrt(dx * dx + dy * dy) >= minTravel) {
      break;
    }
  }

  enemy.destX = destX;
  enemy.destY = destY;
  enemy.nextTurnAt = Date.now() + randomRange(ENEMY_TURN_MIN_MS, ENEMY_TURN_MAX_MS);
}

function spawnEnemyHelicopters() {
  const template = document.getElementById('enemy-helicopter-template');
  const perQuadrant = getEnemiesPerQuadrant();
  let missed = 0;

  for (let q = 0; q < 4; q += 1) {
    const bounds = getQuadrantBounds(q);

    for (let n = 0; n < perQuadrant; n += 1) {
      const el = template.content.firstElementChild.cloneNode(true);
      world.insertBefore(el, helicopter);

      const width = el.offsetWidth || helicopterWidth;
      const height = el.offsetHeight || helicopterHeight;
      let x = (bounds.left + bounds.right) / 2 - width / 2;
      let y = (bounds.top + bounds.bottom) / 2 - height / 2;
      let placed = false;

      for (let attempt = 0; attempt < 160 && placed === false; attempt += 1) {
        const tryX = randomRange(bounds.left, Math.max(bounds.left, bounds.right - width));
        const tryY = randomRange(bounds.top, Math.max(bounds.top, bounds.bottom - height));
        const box = {
          left: tryX,
          top: tryY,
          right: tryX + width,
          bottom: tryY + height
        };

        if (isEnemyBoxBlocked(box) === false) {
          x = tryX;
          y = tryY;
          placed = true;
        }
      }

      if (placed === false) {
        el.remove();
        missed += 1;
        continue;
      }

      el.style.left = x + 'px';
      el.style.top = y + 'px';

      const enemy = {
        el: el,
        facingEl: el.querySelector('.helicopter-facing'),
        x: x,
        y: y,
        width: width,
        height: height,
        angle: 0,
        destX: x,
        destY: y,
        quadrant: q,
        nextTurnAt: 0,
        minimapMark: null
      };

      pickEnemyDestination(enemy);
      enemyHelicopters.push(enemy);
    }
  }

  if (missed > 0) {
    showActionFeedback('Could not place ' + missed + ' enemy helicopter(s).', 'warning');
  }
}

function updateEnemyFacing(enemy, moveX, moveY) {
  if (moveX === 0 && moveY === 0) {
    return;
  }

  const targetAngle = Math.atan2(moveX, -moveY) * (180 / Math.PI);
  let delta = targetAngle - enemy.angle;

  while (delta > 180) {
    delta -= 360;
  }

  while (delta < -180) {
    delta += 360;
  }

  enemy.angle += delta;
  enemy.facingEl.style.transform = 'rotate(' + enemy.angle + 'deg)';
}

function updateEnemyHelicopters(elapsedSeconds) {
  if (gameScreen.hidden || isPaused || gameIsOver) {
    return;
  }

  const speed = getPlayerPixelsPerSecond() * getEnemySpeedScale();
  const now = Date.now();

  for (let i = 0; i < enemyHelicopters.length; i += 1) {
    const enemy = enemyHelicopters[i];
    const bounds = getQuadrantBounds(enemy.quadrant);
    const centerX = enemy.x + enemy.width / 2;
    const centerY = enemy.y + enemy.height / 2;
    let dx = enemy.destX - centerX;
    let dy = enemy.destY - centerY;
    let dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < ENEMY_ARRIVE_PX || now >= enemy.nextTurnAt) {
      pickEnemyDestination(enemy);
      dx = enemy.destX - centerX;
      dy = enemy.destY - centerY;
      dist = Math.sqrt(dx * dx + dy * dy);
    }

    if (dist < 1) {
      continue;
    }

    const step = Math.min(speed * elapsedSeconds, dist);
    const moveX = dx / dist;
    const moveY = dy / dist;
    enemy.x += moveX * step;
    enemy.y += moveY * step;

    if (enemy.x < bounds.left) {
      enemy.x = bounds.left;
    }

    if (enemy.y < bounds.top) {
      enemy.y = bounds.top;
    }

    if (enemy.x > bounds.right - enemy.width) {
      enemy.x = bounds.right - enemy.width;
    }

    if (enemy.y > bounds.bottom - enemy.height) {
      enemy.y = bounds.bottom - enemy.height;
    }

    enemy.el.style.left = enemy.x + 'px';
    enemy.el.style.top = enemy.y + 'px';
    updateEnemyFacing(enemy, moveX, moveY);
  }
}

function getEnemyHitBox(enemy) {
  return {
    left: enemy.x + 10,
    top: enemy.y + 12,
    right: enemy.x + enemy.width - 10,
    bottom: enemy.y + enemy.height - 12
  };
}

function checkEnemyCollisions() {
  if (gameScreen.hidden || isPaused || gameIsOver) {
    return;
  }

  const now = Date.now();

  if (now - lastDamageTime < DAMAGE_COOLDOWN_MS) {
    return;
  }

  const playerBox = getHelicopterWorldBox();

  for (let i = 0; i < enemyHelicopters.length; i += 1) {
    if (rectanglesOverlap(playerBox, getEnemyHitBox(enemyHelicopters[i]))) {
      applyObstacleDamage('Hit by an enemy helicopter. -20 health.');
      return;
    }
  }
}

// Move the helicopter a little each frame while directional keys are held.
function updateHelicopter(timestamp) {
  animationId = requestAnimationFrame(updateHelicopter);

  // Extra safety: never move on the Start or Game Over screens.
  if (gameScreen.hidden || isPaused || gameIsOver) {
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

  // Cap the step so a long pause (like switching tabs) does not teleport the helicopter.
  if (elapsedSeconds > 0.05) {
    elapsedSeconds = 0.05;
  }

  // Build a direction from the keys that are currently held.
  let moveX = 0;
  let moveY = 0;

  if (isDirectionHeld('left')) {
    moveX -= 1;
  }

  if (isDirectionHeld('right')) {
    moveX += 1;
  }

  if (isDirectionHeld('up')) {
    moveY -= 1;
  }

  if (isDirectionHeld('down')) {
    moveY += 1;
  }

  // If two directions are held, 0.707 (about 1 / sqrt(2)) keeps diagonal speed the same.
  if (moveX !== 0 && moveY !== 0) {
    moveX *= 0.707;
    moveY *= 0.707;
  }

  // Speed is based on the game area size so it feels similar on phone and desktop.
  const pixelsPerSecond = getPlayerPixelsPerSecond();

  const previousX = helicopterX;
  const previousY = helicopterY;

  helicopterX += moveX * pixelsPerSecond * elapsedSeconds;
  helicopterY += moveY * pixelsPerSecond * elapsedSeconds;

  keepHelicopterInsideWorld();

  if (helicopterX !== previousX || helicopterY !== previousY) {
    consumeFuel(elapsedSeconds);
  }

  setPlayerMovingAudio(helicopterX !== previousX || helicopterY !== previousY);

  helicopter.style.left = helicopterX + 'px';
  helicopter.style.top = helicopterY + 'px';

  if (gameIsOver) {
    return;
  }

  updateHelicopterFacing(moveX, moveY);
  updateCamera(elapsedSeconds, false);
  updateEnemyHelicopters(elapsedSeconds);

  // Check hits after the helicopter has moved this frame.
  checkObstacleCollisions();
  checkEnemyCollisions();
  checkHealthPickupCollection();
  updateActionButtonLabel();
  updateMinimapIndicators();
  updateEnemyProximityAudio(
    helicopterX + helicopterWidth / 2,
    helicopterY + helicopterHeight / 2,
    enemyHelicopters
  );
}

// The CSS helicopter is drawn facing up, so 0deg is forward.
function updateHelicopterFacing(moveX, moveY) {
  if (moveX === 0 && moveY === 0) {
    return;
  }

  const targetAngle = Math.atan2(moveX, -moveY) * (180 / Math.PI);
  let delta = targetAngle - facingAngle;

  while (delta > 180) {
    delta -= 360;
  }

  while (delta < -180) {
    delta += 360;
  }

  const nextAngle = facingAngle + delta;

  if (nextAngle === facingAngle) {
    return;
  }

  facingAngle = nextAngle;
  helicopterFacing.style.transform = 'rotate(' + facingAngle + 'deg)';
}

function resetHelicopterFacing() {
  facingAngle = DEFAULT_FACING_ANGLE;
  helicopterFacing.style.transition = 'none';
  helicopterFacing.style.transform = 'rotate(0deg)';
  helicopterFacing.offsetHeight;
  helicopterFacing.style.transition = '';
}

// Damage happens in its own function so movement math stays simple.
function checkObstacleCollisions() {
  if (gameScreen.hidden || isPaused || gameIsOver) {
    return;
  }

  const now = Date.now();

  // One shared cooldown so several obstacles cannot hit at the same time.
  if (now - lastDamageTime < DAMAGE_COOLDOWN_MS) {
    return;
  }

  const helicopterBox = getHelicopterWorldBox();

  for (let i = 0; i < obstacleList.length; i += 1) {
    const obstacleBox = getPaddedWorldBox(obstacleList[i], 8);

    if (rectanglesOverlap(helicopterBox, obstacleBox)) {
      applyObstacleDamage();
      return;
    }
  }
}

// Grow an obstacle box a little so close flies still count as a hit.
function getPaddedWorldBox(element, pad) {
  const box = getElementWorldBox(element);

  return {
    left: box.left - pad,
    top: box.top - pad,
    right: box.right + pad,
    bottom: box.bottom + pad
  };
}

function applyObstacleDamage(message) {
  if (gameIsOver || isPaused) {
    return;
  }

  const now = Date.now();

  if (now - lastDamageTime < DAMAGE_COOLDOWN_MS) {
    return;
  }

  health -= DAMAGE_AMOUNT;

  if (health < 0) {
    health = 0;
  }

  if (health > MAX_HEALTH) {
    health = MAX_HEALTH;
  }

  money -= COLLISION_MONEY_PENALTY;

  if (money < 0) {
    money = 0;
  }

  score -= COLLISION_SCORE_PENALTY;

  if (score < 0) {
    score = 0;
  }

  lastDamageTime = now;
  updateHealthDisplay();
  updateMoneyDisplay();
  updateScoreDisplay();
  showActionFeedback((message || 'Hit an obstacle. -20 health.') + ' -$50. -10 score.', 'warning');
  flashHelicopter();

  if (health === 0) {
    endGame('health');
  } else {
    playCollisionSound();
  }
}

// End the game only once. The current score and time are copied to Game Over first.
function endGame(reason) {
  if (gameIsOver) {
    return;
  }

  gameIsOver = true;
  gameOverReason = reason || 'health';
  freezeGameplayTimer();
  currentRunId = 'run-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 1e9).toString(36);
  currentRunSaved = false;
  stopGameplayAudio();

  if (gameOverReason === 'victory') {
    playVictorySound();
  } else {
    playGameOverSound();
  }

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
  if (zonesCleanedDisplay) {
    zonesCleanedDisplay.textContent = zonesCleaned + ' / ' + DIRTY_POND_COUNT;
  }
  deliveriesCompletedDisplay.textContent = String(deliveriesCompleted);
  if (totalMoneyEarnedDisplay) {
    totalMoneyEarnedDisplay.textContent = formatMoney(totalMoneyEarned);
  }
  if (finalMoney) {
    finalMoney.textContent = formatMoney(money);
  }

  if (gameOverTitle) {
    gameOverTitle.textContent = gameOverReason === 'victory' ? 'MISSION COMPLETE' : 'GAME OVER';
  }

  if (finalTimeLabel) {
    finalTimeLabel.textContent = gameOverReason === 'victory' ? 'Completion Time' : 'Elapsed Time';
  }

  if (gameOverScreen) {
    gameOverScreen.classList.toggle('is-victory', gameOverReason === 'victory');
  }

  if (gameOverReasonDisplay) {
    if (gameOverReason === 'victory') {
      gameOverReasonDisplay.textContent = 'All 20 ponds cleaned';
    } else if (gameOverReason === 'fuel') {
      gameOverReasonDisplay.textContent = 'OUT OF FUEL';
    } else {
      gameOverReasonDisplay.textContent = 'OUT OF HEALTH';
    }
  }

  updateDifficultyDisplays();
}

function flashHelicopter() {
  helicopter.classList.add('helicopter--hit');

  setTimeout(function () {
    helicopter.classList.remove('helicopter--hit');
  }, 200);
}

function isHudControlTarget(target) {
  if (!target || !target.closest) {
    return false;
  }

  return Boolean(target.closest('button, a, input, textarea, select'));
}

// Remember that a movement key was pressed. Arrow keys are blocked from scrolling.
function handleKeyDown(event) {
  if (gameScreen.hidden || gameIsOver) {
    return;
  }

  const key = event.key;

  if (key === 'Escape') {
    collapseMinimap();
    return;
  }

  if (key === 'p' || key === 'P') {
    event.preventDefault();

    // Key-repeat would otherwise flicker pause on and off while P is held.
    if (event.repeat || pauseHeld) {
      return;
    }

    pauseHeld = true;
    togglePause();
    return;
  }

  if (isPaused) {
    return;
  }

  // Space on Pause, Expand, or a link should click that control only.
  // The mobile CLEAN button is the Space action, so it still runs handleSpaceAction.
  if (key === ' ' && isHudControlTarget(event.target) && event.target.id !== 'clean-button') {
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

  if (key === 'p' || key === 'P') {
    pauseHeld = false;
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
window.addEventListener('blur', handleWindowInactive);
document.addEventListener('visibilitychange', function () {
  if (document.hidden) {
    handleWindowInactive();
  }
});

// Fold, rotate, or resize: keep the current flight and retarget the camera.
function handleViewportChange() {
  syncTouchInputMode();

  if (gameScreen.hidden) {
    return;
  }

  cacheHelicopterSize();
  cacheEnemySizes();
  keepHelicopterInsideWorld();
  helicopter.style.left = helicopterX + 'px';
  helicopter.style.top = helicopterY + 'px';
  updateCamera(0, true);
  updateMinimapAspect();
  updateMinimapIndicators();
  updateActionButtonLabel();
}

window.addEventListener('resize', handleViewportChange);
window.addEventListener('orientationchange', handleViewportChange);

if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', handleViewportChange);
}

if (typeof window.matchMedia === 'function') {
  const touchPointerQuery = window.matchMedia('(any-pointer: coarse)');

  if (typeof touchPointerQuery.addEventListener === 'function') {
    touchPointerQuery.addEventListener('change', handleViewportChange);
  } else if (typeof touchPointerQuery.addListener === 'function') {
    touchPointerQuery.addListener(handleViewportChange);
  }
}

function emptyLeaderboardData() {
  return {
    version: LEADERBOARD_VERSION,
    runs: []
  };
}

function isValidLeaderboardRun(run) {
  if (!run || typeof run !== 'object') {
    return false;
  }

  if (typeof run.id !== 'string' || run.id.length < 1) {
    return false;
  }

  if (typeof run.name !== 'string' || run.name.length < 1 || run.name.length > 20) {
    return false;
  }

  if (run.difficulty !== DIFFICULTY_EASY && run.difficulty !== DIFFICULTY_HARD) {
    return false;
  }

  if (typeof run.score !== 'number' || !isFinite(run.score) || run.score < 0) {
    return false;
  }

  if (typeof run.moneyRemaining !== 'number' || !isFinite(run.moneyRemaining) || run.moneyRemaining < 0) {
    return false;
  }

  if (typeof run.totalMoneyEarned !== 'number' || !isFinite(run.totalMoneyEarned) || run.totalMoneyEarned < 0) {
    return false;
  }

  if (typeof run.zonesCleaned !== 'number' || !isFinite(run.zonesCleaned) || run.zonesCleaned < 0) {
    return false;
  }

  if (typeof run.elapsedMs !== 'number' || !isFinite(run.elapsedMs) || run.elapsedMs < 0) {
    return false;
  }

  if (typeof run.victory !== 'boolean') {
    return false;
  }

  if (typeof run.date !== 'string' || run.date.length < 1) {
    return false;
  }

  return true;
}

function loadLeaderboardData() {
  try {
    const raw = window.localStorage.getItem(LEADERBOARD_STORAGE_KEY);

    if (!raw) {
      return emptyLeaderboardData();
    }

    const parsed = JSON.parse(raw);

    if (!parsed || parsed.version !== LEADERBOARD_VERSION || !parsed.runs || parsed.runs.length === undefined) {
      return emptyLeaderboardData();
    }

    const runs = [];

    for (let i = 0; i < parsed.runs.length; i += 1) {
      if (isValidLeaderboardRun(parsed.runs[i])) {
        runs.push(parsed.runs[i]);
      }
    }

    return {
      version: LEADERBOARD_VERSION,
      runs: runs
    };
  } catch (error) {
    return emptyLeaderboardData();
  }
}

function saveLeaderboardData(data) {
  try {
    window.localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    return false;
  }
}

function compareRuns(a, b, primary, direction) {
  if (a[primary] !== b[primary]) {
    return direction === 'desc' ? b[primary] - a[primary] : a[primary] - b[primary];
  }

  if (a.score !== b.score) {
    return b.score - a.score;
  }

  if (a.elapsedMs !== b.elapsedMs) {
    return a.elapsedMs - b.elapsedMs;
  }

  if (a.date !== b.date) {
    return a.date < b.date ? -1 : 1;
  }

  if (a.id !== b.id) {
    return a.id < b.id ? -1 : 1;
  }

  return 0;
}

function rankLeaderboard(runs, difficulty, category) {
  const filtered = [];

  for (let i = 0; i < runs.length; i += 1) {
    const run = runs[i];

    if (run.difficulty !== difficulty) {
      continue;
    }

    if (category === 'fastest' && run.victory !== true) {
      continue;
    }

    filtered.push(run);
  }

  filtered.sort(function (a, b) {
    if (category === 'richest') {
      if (a.moneyRemaining !== b.moneyRemaining) {
        return b.moneyRemaining - a.moneyRemaining;
      }

      return compareRuns(a, b, 'score', 'desc');
    }

    if (category === 'fastest') {
      if (a.elapsedMs !== b.elapsedMs) {
        return a.elapsedMs - b.elapsedMs;
      }

      return compareRuns(a, b, 'score', 'desc');
    }

    return compareRuns(a, b, 'score', 'desc');
  });

  return filtered.slice(0, 10);
}

function sanitizePlayerName(raw) {
  if (typeof raw !== 'string') {
    return '';
  }

  let name = raw.replace(/[\u0000-\u001F\u007F]/g, '');
  name = name.replace(/\s+/g, ' ').trim();

  if (name.length > 20) {
    name = name.slice(0, 20);
  }

  return name;
}

function setScoreSaveStatus(message, kind) {
  if (!scoreSaveStatus) {
    return;
  }

  scoreSaveStatus.textContent = message;
  scoreSaveStatus.classList.remove('is-error', 'is-success');

  if (kind) {
    scoreSaveStatus.classList.add(kind);
  }
}

function prepareScoreSaveForm() {
  if (!playerNameInput || !saveScoreButton) {
    return;
  }

  if (currentRunSaved) {
    playerNameInput.disabled = true;
    saveScoreButton.disabled = true;
    saveScoreButton.textContent = 'Saved';
    setScoreSaveStatus('Score saved to this browser\'s Hall of Fame.', 'is-success');
    return;
  }

  playerNameInput.disabled = false;
  saveScoreButton.disabled = false;
  saveScoreButton.textContent = 'Save Score';

  if (!playerNameInput.value) {
    const data = loadLeaderboardData();

    if (data.runs.length > 0) {
      playerNameInput.value = data.runs[data.runs.length - 1].name;
    }
  }

  setScoreSaveStatus('Saving is optional. One name covers every board this run qualifies for.', '');
}

function buildCurrentRunRecord(name) {
  return {
    id: currentRunId,
    name: name,
    difficulty: activeDifficulty,
    score: score,
    moneyRemaining: money,
    totalMoneyEarned: totalMoneyEarned,
    zonesCleaned: zonesCleaned,
    elapsedMs: runElapsedMs,
    victory: gameOverReason === 'victory',
    date: new Date().toISOString()
  };
}

function saveCurrentRun(name) {
  if (currentRunSaved) {
    setScoreSaveStatus('This run is already saved.', 'is-success');
    return false;
  }

  if (!currentRunId) {
    setScoreSaveStatus('No finished flight to save yet.', 'is-error');
    return false;
  }

  const data = loadLeaderboardData();

  for (let i = 0; i < data.runs.length; i += 1) {
    if (data.runs[i].id === currentRunId) {
      currentRunSaved = true;
      setScoreSaveStatus('This run is already saved.', 'is-success');
      return false;
    }
  }

  data.runs.push(buildCurrentRunRecord(name));

  const byDifficulty = {};

  for (let r = 0; r < data.runs.length; r += 1) {
    const difficulty = data.runs[r].difficulty;

    if (!byDifficulty[difficulty]) {
      byDifficulty[difficulty] = [];
    }

    byDifficulty[difficulty].push(data.runs[r]);
  }

  const trimmed = [];
  const keys = [DIFFICULTY_EASY, DIFFICULTY_HARD];

  for (let k = 0; k < keys.length; k += 1) {
    const group = byDifficulty[keys[k]] || [];
    const start = Math.max(0, group.length - LEADERBOARD_MAX_RUNS);

    for (let g = start; g < group.length; g += 1) {
      trimmed.push(group[g]);
    }
  }

  data.runs = trimmed;

  if (saveLeaderboardData(data) === false) {
    setScoreSaveStatus('Could not save on this browser. Your game still finished.', 'is-error');
    return false;
  }

  currentRunSaved = true;
  playerNameInput.disabled = true;
  saveScoreButton.disabled = true;
  saveScoreButton.textContent = 'Saved';
  setScoreSaveStatus('Saved to this browser\'s Hall of Fame.', 'is-success');
  return true;
}

function renderHofList(container, rows, formatValue) {
  if (!container) {
    return;
  }

  container.textContent = '';

  if (rows.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'hof-empty';
    empty.textContent = 'No records yet. Finish a flight and save your name.';
    container.appendChild(empty);
    return;
  }

  const list = document.createElement('ol');
  list.className = 'hof-list';

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const item = document.createElement('li');
    const rank = document.createElement('span');
    const name = document.createElement('span');
    const value = document.createElement('span');

    rank.className = 'hof-rank';
    name.className = 'hof-name';
    value.className = 'hof-value';
    rank.textContent = String(i + 1) + '.';
    name.textContent = row.name;
    value.textContent = formatValue(row);
    item.appendChild(rank);
    item.appendChild(name);
    item.appendChild(value);
    list.appendChild(item);
  }

  container.appendChild(list);
}

function updateHofDifficultyButtons() {
  if (hofEasyButton) {
    hofEasyButton.classList.toggle('is-selected', hofDifficulty === DIFFICULTY_EASY);
    hofEasyButton.setAttribute('aria-pressed', hofDifficulty === DIFFICULTY_EASY ? 'true' : 'false');
  }

  if (hofHardButton) {
    hofHardButton.classList.toggle('is-selected', hofDifficulty === DIFFICULTY_HARD);
    hofHardButton.setAttribute('aria-pressed', hofDifficulty === DIFFICULTY_HARD ? 'true' : 'false');
  }
}

function renderHallOfFame() {
  const data = loadLeaderboardData();
  const richest = rankLeaderboard(data.runs, hofDifficulty, 'richest');
  const scorers = rankLeaderboard(data.runs, hofDifficulty, 'scorers');
  const fastest = rankLeaderboard(data.runs, hofDifficulty, 'fastest');

  updateHofDifficultyButtons();
  renderHofList(document.getElementById('hof-richest'), richest, function (run) {
    return formatMoney(run.moneyRemaining);
  });
  renderHofList(document.getElementById('hof-scorers'), scorers, function (run) {
    return String(run.score);
  });
  renderHofList(document.getElementById('hof-fastest'), fastest, function (run) {
    return formatSurvivalTime(Math.floor(run.elapsedMs / 1000));
  });
}

function openHallOfFame(returnScreen, difficulty) {
  hallOfFameReturnScreen = returnScreen;
  hofDifficulty = difficulty === DIFFICULTY_HARD ? DIFFICULTY_HARD : DIFFICULTY_EASY;
  showScreen('hall-of-fame-screen');
}

// Start Game opens the gameplay screen using the menu difficulty.
startButton.addEventListener('click', function () {
  if (difficultyHardInput && difficultyHardInput.checked) {
    menuDifficulty = DIFFICULTY_HARD;
  } else {
    menuDifficulty = DIFFICULTY_EASY;
  }

  activeDifficulty = menuDifficulty;
  showScreen('game-screen');
});

// Play Again keeps the difficulty from the game that just ended.
playAgainButton.addEventListener('click', function () {
  showScreen('game-screen');
});

// Main Menu returns to the start screen so difficulty can be changed.
mainMenuButton.addEventListener('click', function () {
  setMenuDifficulty(activeDifficulty);
  showScreen('start-screen');
});

if (startHofButton) {
  startHofButton.addEventListener('click', function () {
    openHallOfFame('start-screen', menuDifficulty);
  });
}

if (viewLeaderboardsButton) {
  viewLeaderboardsButton.addEventListener('click', function () {
    openHallOfFame('game-over-screen', activeDifficulty);
  });
}

if (hofBackButton) {
  hofBackButton.addEventListener('click', function () {
    showScreen(hallOfFameReturnScreen || 'start-screen');
  });
}

if (hofEasyButton) {
  hofEasyButton.addEventListener('click', function () {
    hofDifficulty = DIFFICULTY_EASY;
    renderHallOfFame();
  });
}

if (hofHardButton) {
  hofHardButton.addEventListener('click', function () {
    hofDifficulty = DIFFICULTY_HARD;
    renderHallOfFame();
  });
}

if (scoreSaveForm) {
  scoreSaveForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const name = sanitizePlayerName(playerNameInput ? playerNameInput.value : '');

    if (name.length < 1) {
      setScoreSaveStatus('Enter a name between 1 and 20 characters.', 'is-error');
      return;
    }

    if (playerNameInput) {
      playerNameInput.value = name;
    }

    saveCurrentRun(name);
  });
}

const difficultyEasyInput = document.getElementById('difficulty-easy');
const difficultyHardInput = document.getElementById('difficulty-hard');

function handleDifficultyChange(event) {
  setMenuDifficulty(event.target.value);
}

if (difficultyEasyInput) {
  difficultyEasyInput.addEventListener('change', handleDifficultyChange);
}

if (difficultyHardInput) {
  difficultyHardInput.addEventListener('change', handleDifficultyChange);
}

const difficultyOptions = document.querySelectorAll('.difficulty-option');

for (let i = 0; i < difficultyOptions.length; i += 1) {
  difficultyOptions[i].addEventListener('click', function () {
    const input = difficultyOptions[i].querySelector('input');

    if (input) {
      input.checked = true;
      setMenuDifficulty(input.value);
    }
  });
}

pauseButton.addEventListener('click', function () {
  togglePause();
});

mobilePauseButton.addEventListener('click', function () {
  togglePause();
});

// Mobile / pointer controls use touchKeys and the same game loop as the keyboard.
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
      // Capture can fail for some synthetic pointers. The key flag still works.
    }

    touchKeys[direction] = true;
  });

  function stopDirection() {
    touchKeys[direction] = false;
  }

  button.addEventListener('pointerup', stopDirection);
  button.addEventListener('pointercancel', stopDirection);
  button.addEventListener('lostpointercapture', stopDirection);
}

bindMoveButton(moveUpButton, 'up');
bindMoveButton(moveDownButton, 'down');
bindMoveButton(moveLeftButton, 'left');
bindMoveButton(moveRightButton, 'right');

// One tap equals one Space press: clean or deliver, depending on location.
cleanButton.addEventListener('pointerdown', function (event) {
  event.preventDefault();

  if (touchControlsAreActive() === false) {
    return;
  }

  handleSpaceAction();
});

minimapToggle.addEventListener('click', function (event) {
  event.stopPropagation();
  toggleMinimap();
});

minimapStage.addEventListener('click', function () {
  if (minimap.classList.contains('minimap--expanded') === false) {
    setMinimapExpanded(true);
  }
});
