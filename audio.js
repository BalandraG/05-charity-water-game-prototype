// Synthesized arcade sound effects for Helo-Swamps.
// These are generated with the Web Audio API. They are not recorded helicopter samples.

const AUDIO_STORAGE_KEY = 'helo-swamps-audio';
const ENEMY_AUDIO_RANGE = 820;

const gameAudio = {
  ctx: null,
  masterGain: null,
  sfxGain: null,
  engineGain: null,
  playerGain: null,
  enemyGain: null,
  playerSource: null,
  enemySource: null,
  buffers: {},
  voices: [],
  unlocked: false,
  muted: false,
  paused: false,
  playing: false,
  sfxVolume: 0.55,
  engineVolume: 0.32
};

function audioClamp(value, min, max) {
  if (value < min) {
    return min;
  }

  if (value > max) {
    return max;
  }

  return value;
}

function loadAudioSettings() {
  try {
    const raw = window.localStorage.getItem(AUDIO_STORAGE_KEY);

    if (!raw) {
      return;
    }

    const data = JSON.parse(raw);

    if (typeof data.muted === 'boolean') {
      gameAudio.muted = data.muted;
    }

    if (typeof data.sfxVolume === 'number') {
      gameAudio.sfxVolume = audioClamp(data.sfxVolume, 0, 1);
    }

    if (typeof data.engineVolume === 'number') {
      gameAudio.engineVolume = audioClamp(data.engineVolume, 0, 1);
    }
  } catch (error) {
    // Private mode and blocked storage should not break the game.
  }
}

function saveAudioSettings() {
  try {
    window.localStorage.setItem(AUDIO_STORAGE_KEY, JSON.stringify({
      muted: gameAudio.muted,
      sfxVolume: gameAudio.sfxVolume,
      engineVolume: gameAudio.engineVolume
    }));
  } catch (error) {
    // Ignore quota and privacy errors.
  }
}

function makeAudioContext() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;

  if (!AudioCtx) {
    return null;
  }

  return new AudioCtx();
}

function seamLoop(data, fadeSamples) {
  const fade = Math.min(fadeSamples, Math.floor(data.length / 8));

  for (let i = 0; i < fade; i += 1) {
    const weight = i / fade;
    const startSample = data[i];
    const endIndex = data.length - fade + i;
    data[endIndex] = data[endIndex] * (1 - weight) + startSample * weight;
  }
}

function makeRotorBuffer(ctx, bladeHz, throbHz, toneHz, color) {
  const duration = 1;
  const length = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let brown = 0;

  for (let i = 0; i < length; i += 1) {
    const time = i / ctx.sampleRate;
    const white = Math.random() * 2 - 1;
    brown += (white - brown) * color;
    const blades = 0.58 + 0.42 * Math.sin(2 * Math.PI * bladeHz * time);
    const throb = 0.72 + 0.28 * Math.sin(2 * Math.PI * throbHz * time);
    const tone = Math.sin(2 * Math.PI * toneHz * time) * 0.1;
    data[i] = (brown * 2.4 * blades * throb + tone) * 0.38;
  }

  seamLoop(data, 180);
  return buffer;
}

function makeNoiseBurst(ctx, duration, startHz, endHz, toneGain) {
  const length = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < length; i += 1) {
    const progress = i / length;
    const envelope = Math.pow(1 - progress, 1.6);
    const noise = (Math.random() * 2 - 1) * 0.7;
    const hz = startHz + (endHz - startHz) * progress;
    const tone = Math.sin(2 * Math.PI * hz * (i / ctx.sampleRate)) * toneGain;
    data[i] = (noise + tone) * envelope;
  }

  return buffer;
}

function makeHealthBuffer(ctx) {
  const duration = 0.42;
  const length = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  const notes = [523.25, 659.25, 783.99];

  for (let i = 0; i < length; i += 1) {
    const time = i / ctx.sampleRate;
    const noteIndex = Math.min(notes.length - 1, Math.floor(time / 0.12));
    const noteTime = time - noteIndex * 0.12;
    const envelope = Math.max(0, 1 - noteTime / 0.16);
    data[i] = Math.sin(2 * Math.PI * notes[noteIndex] * time) * envelope * 0.28;
  }

  return buffer;
}

function makeVictoryBuffer(ctx) {
  const duration = 1.2;
  const length = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  const notes = [392, 523.25, 659.25, 783.99, 1046.5];

  for (let i = 0; i < length; i += 1) {
    const time = i / ctx.sampleRate;
    const noteIndex = Math.min(notes.length - 1, Math.floor(time / 0.2));
    const noteTime = time - noteIndex * 0.2;
    const envelope = Math.max(0, 1 - noteTime / 0.22);
    const sparkle = Math.sin(2 * Math.PI * notes[noteIndex] * 2 * time) * envelope * 0.08;
    data[i] = Math.sin(2 * Math.PI * notes[noteIndex] * time) * envelope * 0.3 + sparkle;
  }

  return buffer;
}

function makeGameOverBuffer(ctx) {
  const duration = 1.05;
  const length = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < length; i += 1) {
    const progress = i / length;
    const crashEnv = progress < 0.28 ? Math.pow(1 - progress / 0.28, 1.2) : 0.12 * (1 - progress);
    const noise = (Math.random() * 2 - 1) * crashEnv * 0.55;
    const hz = 210 - 170 * progress;
    const wind = Math.sin(2 * Math.PI * hz * (i / ctx.sampleRate)) * (1 - progress) * 0.22;
    data[i] = noise + wind;
  }

  return buffer;
}

function buildAudioBuffers(ctx) {
  gameAudio.buffers.playerRotor = makeRotorBuffer(ctx, 24, 8, 86, 0.045);
  gameAudio.buffers.enemyRotor = makeRotorBuffer(ctx, 21, 6.5, 72, 0.07);
  gameAudio.buffers.collision = makeNoiseBurst(ctx, 0.22, 210, 90, 0.22);
  gameAudio.buffers.clean = makeNoiseBurst(ctx, 0.16, 900, 420, 0.08);
  gameAudio.buffers.deliver = makeNoiseBurst(ctx, 0.38, 520, 180, 0.12);
  gameAudio.buffers.fuel = makeNoiseBurst(ctx, 0.3, 160, 240, 0.16);
  gameAudio.buffers.health = makeHealthBuffer(ctx);
  gameAudio.buffers.gameover = makeGameOverBuffer(ctx);
  gameAudio.buffers.victory = makeVictoryBuffer(ctx);
}

function applyAudioGains() {
  if (!gameAudio.masterGain) {
    return;
  }

  const muteLevel = gameAudio.muted ? 0 : 1;
  gameAudio.masterGain.gain.value = muteLevel;
  gameAudio.sfxGain.gain.value = gameAudio.sfxVolume;

  if (!gameAudio.playing || gameAudio.paused) {
    gameAudio.playerGain.gain.value = 0;
    gameAudio.enemyGain.gain.value = 0;
  }
}

function unlockAudio() {
  if (!gameAudio.ctx) {
    const ctx = makeAudioContext();

    if (!ctx) {
      return false;
    }

    gameAudio.ctx = ctx;
    gameAudio.masterGain = ctx.createGain();
    gameAudio.sfxGain = ctx.createGain();
    gameAudio.engineGain = ctx.createGain();
    gameAudio.playerGain = ctx.createGain();
    gameAudio.enemyGain = ctx.createGain();

    gameAudio.playerGain.connect(gameAudio.engineGain);
    gameAudio.enemyGain.connect(gameAudio.engineGain);
    gameAudio.engineGain.connect(gameAudio.masterGain);
    gameAudio.sfxGain.connect(gameAudio.masterGain);
    gameAudio.masterGain.connect(ctx.destination);
    gameAudio.playerGain.gain.value = 0;
    gameAudio.enemyGain.gain.value = 0;
    buildAudioBuffers(ctx);
    applyAudioGains();
  }

  if (gameAudio.ctx.state === 'suspended') {
    gameAudio.ctx.resume().catch(function () {});
  }

  gameAudio.unlocked = true;
  return true;
}

function stopSource(source) {
  if (!source) {
    return;
  }

  try {
    source.stop();
  } catch (error) {
    // Already stopped.
  }

  try {
    source.disconnect();
  } catch (error) {
    // Already disconnected.
  }
}

function startLoop(buffer, gainNode) {
  if (!gameAudio.ctx || !buffer) {
    return null;
  }

  try {
    const source = gameAudio.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(gainNode);
    source.start();
    return source;
  } catch (error) {
    return null;
  }
}

function stopEngineLoops() {
  stopSource(gameAudio.playerSource);
  stopSource(gameAudio.enemySource);
  gameAudio.playerSource = null;
  gameAudio.enemySource = null;

  if (gameAudio.playerGain) {
    gameAudio.playerGain.gain.value = 0;
  }

  if (gameAudio.enemyGain) {
    gameAudio.enemyGain.gain.value = 0;
  }
}

function startGameplayAudio() {
  if (!unlockAudio()) {
    return;
  }

  stopEngineLoops();
  gameAudio.playing = true;
  gameAudio.paused = false;
  gameAudio.playerSource = startLoop(gameAudio.buffers.playerRotor, gameAudio.playerGain);
  gameAudio.enemySource = startLoop(gameAudio.buffers.enemyRotor, gameAudio.enemyGain);

  if (gameAudio.playerSource) {
    gameAudio.playerSource.playbackRate.value = 1;
  }

  if (gameAudio.enemySource) {
    gameAudio.enemySource.playbackRate.value = 0.92;
  }

  if (gameAudio.playerGain) {
    gameAudio.playerGain.gain.value = gameAudio.engineVolume * 0.42;
  }
}

function stopGameplayAudio() {
  gameAudio.playing = false;
  gameAudio.paused = false;
  stopEngineLoops();
}

function setGameplayAudioPaused(paused) {
  gameAudio.paused = paused === true;

  if (!gameAudio.playing) {
    return;
  }

  if (gameAudio.paused) {
    if (gameAudio.playerGain) {
      gameAudio.playerGain.gain.value = 0;
    }

    if (gameAudio.enemyGain) {
      gameAudio.enemyGain.gain.value = 0;
    }

    return;
  }

  if (gameAudio.ctx && gameAudio.ctx.state === 'suspended') {
    gameAudio.ctx.resume().catch(function () {});
  }

  if (gameAudio.playerGain) {
    gameAudio.playerGain.gain.value = gameAudio.engineVolume * 0.42;
  }
}

function setPlayerMovingAudio(isMoving) {
  if (!gameAudio.playerSource || !gameAudio.playing || gameAudio.paused || gameAudio.muted) {
    return;
  }

  const rate = isMoving ? 1.05 : 1;
  const volume = gameAudio.engineVolume * (isMoving ? 0.5 : 0.38);

  try {
    gameAudio.playerSource.playbackRate.setTargetAtTime(rate, gameAudio.ctx.currentTime, 0.12);
    gameAudio.playerGain.gain.setTargetAtTime(volume, gameAudio.ctx.currentTime, 0.12);
  } catch (error) {
    gameAudio.playerSource.playbackRate.value = rate;
    gameAudio.playerGain.gain.value = volume;
  }
}

function updateEnemyProximityAudio(playerX, playerY, enemies) {
  if (!gameAudio.enemyGain || !gameAudio.playing || gameAudio.paused || gameAudio.muted) {
    if (gameAudio.enemyGain) {
      gameAudio.enemyGain.gain.value = 0;
    }

    return;
  }

  let closeness = 0;

  for (let i = 0; i < enemies.length; i += 1) {
    const enemy = enemies[i];
    const dx = (enemy.x + enemy.width / 2) - playerX;
    const dy = (enemy.y + enemy.height / 2) - playerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    closeness += Math.max(0, 1 - distance / ENEMY_AUDIO_RANGE);
  }

  const level = Math.min(0.58, closeness * 0.18) * gameAudio.engineVolume;

  try {
    gameAudio.enemyGain.gain.setTargetAtTime(level, gameAudio.ctx.currentTime, 0.08);
  } catch (error) {
    gameAudio.enemyGain.gain.value = level;
  }
}

function pruneAudioVoices() {
  const live = [];

  for (let i = 0; i < gameAudio.voices.length; i += 1) {
    if (gameAudio.voices[i].ended !== true) {
      live.push(gameAudio.voices[i]);
    }
  }

  gameAudio.voices = live;

  while (gameAudio.voices.length > 3) {
    const oldest = gameAudio.voices.shift();
    stopSource(oldest.source);
  }
}

function playSfx(name, volumeScale) {
  if (gameAudio.muted || !unlockAudio()) {
    return;
  }

  const buffer = gameAudio.buffers[name];

  if (!buffer || gameAudio.ctx.state === 'suspended') {
    gameAudio.ctx.resume().catch(function () {});
    return;
  }

  pruneAudioVoices();

  try {
    const source = gameAudio.ctx.createBufferSource();
    const gain = gameAudio.ctx.createGain();
    const voice = { source: source, ended: false };
    source.buffer = buffer;
    gain.gain.value = volumeScale || 1;
    source.connect(gain);
    gain.connect(gameAudio.sfxGain);
    source.onended = function () {
      voice.ended = true;
    };
    source.start();
    gameAudio.voices.push(voice);
  } catch (error) {
    // Playback can fail if the context is blocked.
  }
}

function playCollisionSound() {
  playSfx('collision', 0.85);
}

function playCleanSound() {
  playSfx('clean', 0.7);
}

function playDeliverSound() {
  playSfx('deliver', 0.8);
}

function playFuelSound() {
  playSfx('fuel', 0.75);
}

function playHealthSound() {
  playSfx('health', 0.9);
}

function playGameOverSound() {
  playSfx('gameover', 1);
}

function playVictorySound() {
  playSfx('victory', 1);
}

function refreshAudioControls() {
  const muteButton = document.getElementById('audio-mute-button');
  const sfxSlider = document.getElementById('sfx-volume');
  const engineSlider = document.getElementById('engine-volume');
  const dock = document.getElementById('audio-controls');

  if (muteButton) {
    muteButton.setAttribute('aria-pressed', gameAudio.muted ? 'true' : 'false');
    muteButton.textContent = gameAudio.muted ? 'Muted' : 'Sound On';
  }

  if (dock) {
    dock.classList.toggle('is-muted', gameAudio.muted);
  }

  if (sfxSlider) {
    sfxSlider.value = String(Math.round(gameAudio.sfxVolume * 100));
  }

  if (engineSlider) {
    engineSlider.value = String(Math.round(gameAudio.engineVolume * 100));
  }
}

function bindAudioControls() {
  const muteButton = document.getElementById('audio-mute-button');
  const toggleButton = document.getElementById('audio-panel-toggle');
  const panel = document.getElementById('audio-panel');
  const sfxSlider = document.getElementById('sfx-volume');
  const engineSlider = document.getElementById('engine-volume');

  if (muteButton) {
    muteButton.addEventListener('click', function () {
      unlockAudio();
      gameAudio.muted = !gameAudio.muted;
      applyAudioGains();
      saveAudioSettings();
      refreshAudioControls();
    });
  }

  if (toggleButton && panel) {
    toggleButton.addEventListener('click', function () {
      const open = panel.hasAttribute('hidden') === false;
      if (open) {
        panel.hidden = true;
        toggleButton.setAttribute('aria-expanded', 'false');
      } else {
        panel.hidden = false;
        toggleButton.setAttribute('aria-expanded', 'true');
      }
    });
  }

  if (sfxSlider) {
    sfxSlider.addEventListener('input', function () {
      unlockAudio();
      gameAudio.sfxVolume = audioClamp(Number(sfxSlider.value) / 100, 0, 1);
      applyAudioGains();
      saveAudioSettings();
    });
  }

  if (engineSlider) {
    engineSlider.addEventListener('input', function () {
      unlockAudio();
      gameAudio.engineVolume = audioClamp(Number(engineSlider.value) / 100, 0, 1);
      applyAudioGains();

      if (gameAudio.playing && gameAudio.paused === false && gameAudio.playerGain) {
        gameAudio.playerGain.gain.value = gameAudio.engineVolume * 0.42;
      }

      saveAudioSettings();
    });
  }

  refreshAudioControls();
}

loadAudioSettings();
bindAudioControls();
