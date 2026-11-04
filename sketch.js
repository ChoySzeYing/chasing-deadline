const TILE = 32;
const ROOM_COLS = 16;
const ROOM_ROWS = 12;
const WIDTH = ROOM_COLS * TILE;
const HEIGHT = ROOM_ROWS * TILE;
const WALL = 1;
const FLOOR = 0;
const SAVE_KEY = "moonlit_ruins_save_v1";

const itemCatalog = {
  brass_key: {
    id: "brass_key",
    name: "銅鑰匙",
    description: "一把發亮的舊鑰匙，似乎能打開圖書館的大門。",
    useText: "你把銅鑰匙插進鎖孔，扭動了一下，門應聲開啟。"
  },
  dusty_note: {
    id: "dusty_note",
    name: "灰塵紙條",
    description: "紙條邊角有磨損，寫著：『只要站在石碑前，就能記住今天。』",
    useText: "紙條在你手中發出輕微的紙聲，像是提醒你別忘記這裡。"
  },
  moon_charm: {
    id: "moon_charm",
    name: "月光護符",
    description: "小小的銀色護符，讓你在黑暗裡多了一點定心。",
    useText: "護符在你掌心發出一點淡淡光，讓你稍微放下緊張。"
  }
};

const roomTemplates = {
  lobby: {
    id: "lobby",
    name: "起始大廳",
    tiles: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ],
    spawn: { x: 2, y: 8 },
    exits: {
      east: { to: "library", x: 14, y: 5 },
      west: { to: "corridor", x: 1, y: 5 }
    },
    objects: [
      { id: "save_lobby", x: 4, y: 8, kind: "savePoint", label: "存檔石碑", solid: false },
      { id: "pickup_key", x: 6, y: 6, kind: "pickup", label: "銅鑰匙", solid: false, itemId: "brass_key" },
      {
        id: "painting",
        x: 5,
        y: 3,
        kind: "furniture",
        label: "畫像",
        solid: false,
        inspect: {
          onceFlag: "lobby_painting_seen",
          firstText: "你從牆上細看那幅畫，畫裡的月色不斷變深，像有人在另一側捏住它。",
          repeatText: "那幅畫還是掛在那裡，月色依舊靜靜地照著你。"
        }
      },
      {
        id: "maid_npc",
        x: 10,
        y: 7,
        kind: "npc",
        label: "女僕",
        portrait: "maid",
        eventId: "maid_intro",
        solid: false,
        inspect: {
          onceFlag: "maid_seen",
          firstText: "一個站在暗影裡的女子抬起頭，衣角帶著霧氣。她平靜地說：『月亮只照給不想回去的人。』",
          repeatText: "那位女僕仍站在原地，眼睛像月亮一樣發亮，卻完全沒有眨動。"
        }
      },
      {
        id: "clock",
        x: 8,
        y: 5,
        kind: "furniture",
        label: "掛鐘",
        solid: false,
        inspect: {
          onceFlag: "lobby_clock_seen",
          firstText: "時鐘停止在 2:17。指針沒有半點動靜，連擺動都像被按住。",
          repeatText: "時鐘仍停在 2:17，這時間像是某個不願離開的記憶。"
        }
      },
      {
        id: "cabinet",
        x: 11,
        y: 7,
        kind: "furniture",
        label: "櫃子",
        solid: false,
        inspect: {
          onceFlag: "lobby_cabinet_seen",
          firstText: "櫃門微微打開，裡面只有一層薄灰和一點點潮氣，像有人剛離開。",
          repeatText: "櫃門仍保持開了一條縫，灰塵沒有被打擾過。"
        }
      },
      { id: "door_library", x: 14, y: 5, kind: "door", label: "圖書館門", solid: false, exitTo: "library", locked: true, requiredItem: "brass_key" },
      { id: "door_corridor", x: 1, y: 5, kind: "door", label: "走廊門", solid: false, exitTo: "corridor", locked: false }
    ]
  },
  library: {
    id: "library",
    name: "圖書館",
    tiles: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ],
    spawn: { x: 2, y: 8 },
    exits: {
      west: { to: "lobby", x: 2, y: 8 },
      east: { to: "study", x: 13, y: 6 }
    },
    objects: [
      { id: "save_library", x: 8, y: 8, kind: "savePoint", label: "圖書館石碑", solid: false },
      { id: "door_back_lobby", x: 2, y: 8, kind: "door", label: "回大廳門", solid: false, exitTo: "lobby", locked: false },
      {
        id: "library_manuscript",
        x: 10,
        y: 5,
        kind: "furniture",
        label: "書桌",
        solid: false,
        inspect: {
          onceFlag: "library_manuscript_seen",
          firstText: "書桌上的羊皮紙邊緣已經發黑，字跡像是被水浸過。你讀到一句：『把她留在屋裡，月亮就會認出她。』",
          repeatText: "那份羊皮紙仍在書桌上，字跡像脈搏一樣微弱地顫著。"
        }
      }
    ]
  },
  corridor: {
    id: "corridor",
    name: "走廊",
    tiles: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ],
    spawn: { x: 2, y: 8 },
    exits: {
      east: { to: "lobby", x: 14, y: 5 },
      west: { to: "study", x: 1, y: 5 }
    },
    objects: [
      { id: "save_corridor", x: 7, y: 8, kind: "savePoint", label: "走廊石碑", solid: false },
      { id: "trap_corridor", x: 9, y: 6, kind: "trap", label: "裂縫陷阱", solid: false },
      {
        id: "shadow_figure",
        x: 12,
        y: 8,
        kind: "npc",
        label: "影子",
        portrait: "shadow",
        eventId: "shadow_warning",
        solid: false,
        inspect: { onceFlag: "shadow_warning_seen", firstText: "影子像一張被風撕裂的臉，朝你伸出手。它低聲說：『別讓她走出門。』", repeatText: "影子依舊站在那裡，像某個從牆裡長出來的提醒。" }
      }
    ]
  },
  study: {
    id: "study",
    name: "書房",
    tiles: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ],
    spawn: { x: 2, y: 8 },
    exits: {
      west: { to: "lobby", x: 14, y: 5 },
      east: { to: "gallery", x: 14, y: 6 }
    },
    objects: [
      { id: "study_door", x: 14, y: 6, kind: "door", label: "畫廊門", solid: false, exitTo: "gallery", locked: false },
      { id: "study_note", x: 7, y: 6, kind: "pickup", label: "月光護符", solid: false, itemId: "moon_charm" },
      { id: "study_archivist", x: 12, y: 8, kind: "npc", label: "檔案者", portrait: "scholar", eventId: "archivist_clue", solid: false }
    ]
  },
  gallery: {
    id: "gallery",
    name: "畫廊",
    tiles: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ],
    spawn: { x: 2, y: 8 },
    exits: {
      west: { to: "study", x: 14, y: 6 }
    },
    objects: [
      { id: "save_gallery", x: 6, y: 8, kind: "savePoint", label: "畫廊石碑", solid: false },
      {
        id: "portrait_void",
        x: 9,
        y: 5,
        kind: "furniture",
        label: "空白肖像",
        solid: false,
        inspect: {
          onceFlag: "gallery_void_seen",
          firstText: "畫框裡是一片空白，但你的倒影卻在裡面微微起伏。像有人在畫裡用指尖輕輕敲著你的名字。",
          repeatText: "那張空白肖像仍在，倒影依舊安靜地貼著玻璃。"
        }
      }
    ]
  }
};

const game = {
  state: "title",
  currentRoomId: "lobby",
  room: roomTemplates.lobby,
  player: {
    x: 2,
    y: 8,
    facing: "down",
    moveMode: "grid",
    color: [212, 182, 146],
    walkCycle: 0
  },
  ui: {
    message: "",
    dialogue: null,
    inventoryOpen: false,
    saveMenuOpen: false,
    timeText: "02:17",
    targetText: "探索大廳"
  },
  flags: {},
  inventory: [],
  selectedItemId: null,
  saveSlots: [null, null, null],
  ending: null,
  deathReason: "",
  particles: [],
  timeMinutes: 2 * 60 + 17
};

const audioSystem = {
  ctx: null,
  masterGain: null,
  ambienceGain: null,
  bgmGain: null,
  started: false,
  ambientNodes: [],
  bgmInterval: null,

  ensureContext() {
    if (this.ctx) return;

    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;

    this.ctx = new Ctx();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.16;
    this.masterGain.connect(this.ctx.destination);

    this.ambienceGain = this.ctx.createGain();
    this.ambienceGain.gain.value = 0.03;
    this.ambienceGain.connect(this.masterGain);

    this.bgmGain = this.ctx.createGain();
    this.bgmGain.gain.value = 0.04;
    this.bgmGain.connect(this.masterGain);
  },

  start() {
    this.ensureContext();
    if (!this.ctx) return;

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    if (!this.started) {
      this.started = true;
      this.startAmbient();
      this.startBgm();
    }
  },

  playTone({ frequency = 220, duration = 0.12, type = "sine", volume = 0.04, attack = 0.01, decay = 0.1, slide = 0 }) {
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
    if (slide !== 0) {
      osc.frequency.linearRampToValueAtTime(frequency + slide, this.ctx.currentTime + duration);
    }

    gain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration + decay);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + duration + decay + 0.04);
  },

  playSfx(type) {
    if (!this.started) return;

    const map = {
      step: { frequency: 120, duration: 0.09, type: "triangle", volume: 0.03, slide: -25 },
      door: { frequency: 260, duration: 0.18, type: "square", volume: 0.05, slide: 50 },
      pickup: { frequency: 440, duration: 0.14, type: "sine", volume: 0.05, slide: 80 },
      trap: { frequency: 86, duration: 0.3, type: "sawtooth", volume: 0.06, slide: -20 },
      ending: { frequency: 520, duration: 0.8, type: "triangle", volume: 0.08, slide: 180 }
    };

    const preset = map[type] || map.step;
    this.playTone(preset);
  },

  startAmbient() {
    if (!this.ctx || this.ambientNodes.length > 0) return;

    for (let i = 0; i < 2; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = i === 0 ? "sine" : "triangle";
      osc.frequency.value = i === 0 ? 44 : 61;
      gain.gain.value = 0.0001;
      gain.gain.linearRampToValueAtTime(0.016, this.ctx.currentTime + 1.5);
      osc.connect(gain);
      gain.connect(this.ambienceGain);
      osc.start();
      this.ambientNodes.push({ osc, gain });
    }
  },

  pulseLowTone() {
    if (!this.ctx) return;
    this.playTone({
      frequency: 52,
      duration: 1.1,
      type: "sine",
      volume: 0.018,
      attack: 0.2,
      decay: 0.8,
      slide: 6
    });
  },

  startBgm() {
    if (!this.ctx || this.bgmInterval) return;

    const notes = [220, 277, 330, 196];
    let index = 0;

    this.bgmInterval = setInterval(() => {
      if (!this.started || !this.ctx) return;
      const note = notes[index % notes.length];
      this.playTone({ frequency: note, duration: 0.55, type: "sine", volume: 0.02, slide: 10 });
      index += 1;
    }, 620);
  },

  stopBgm() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }
};

const dialogueEvents = {
  maid_intro: {
    default: [
      { name: "女僕", text: "月亮沒有看見你，因為你剛剛從屋裡醒來。" },
      { name: "女僕", text: "如果你想離開，先把門後的名字找回來。" }
    ],
    after: [
      { name: "女僕", text: "你已經記住了這裡的呼吸聲。別讓它再把你推回去。" }
    ]
  },
  shadow_warning: {
    default: [
      { name: "影子", text: "你聽見牆裡有腳步，像有人在不停數著你。" },
      { name: "影子", text: "別讓月光落在你身上，否則你就會被這間屋子看見。" }
    ],
    after: [
      { name: "影子", text: "它已經認出你了。你現在唯一的選擇，是不要回頭。" }
    ]
  },
  archivist_clue: {
    default: [
      { name: "檔案者", text: "這條走廊不是迷宮，是一座記憶的囚籠。" },
      { name: "檔案者", text: "月亮護符不會保護你，它只會提醒你，曾經誰在這裡失去了名字。" }
    ],
    after: [
      { name: "檔案者", text: "你知道了。真正的門不在牆上，而在你曾經以為忘掉的名字裡。" }
    ]
  }
};

const globalDialogue = {
  intro: [
    { name: "系統", text: "你站在起始大廳裡，牆面抹著濕氣，像剛從夜裡醒來。" },
    { name: "系統", text: "這裡沒有聲音，只有時鐘和牆上的薄霧。" },
    { name: "系統", text: "用方向鍵移動，朝著門或傢俱按 Z / 空白鍵調查。" }
  ]
};

function getDefaultSaveSlots() {
  return [null, null, null];
}

function loadSaveSlots() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) {
      game.saveSlots = getDefaultSaveSlots();
      return;
    }

    const parsed = JSON.parse(raw);
    game.saveSlots = Array.isArray(parsed) ? parsed : getDefaultSaveSlots();
  } catch (error) {
    console.warn("loadSaveSlots failed:", error);
    game.saveSlots = getDefaultSaveSlots();
  }
}

function saveCurrentSlot(slotIndex) {
  const payload = {
    currentRoomId: game.currentRoomId,
    player: { ...game.player },
    flags: { ...game.flags },
    inventory: [...game.inventory],
    state: game.state
  };

  game.saveSlots[slotIndex] = payload;
  localStorage.setItem(SAVE_KEY, JSON.stringify(game.saveSlots));
  game.ui.message = `已存至槽位 ${slotIndex + 1}`;
}

function loadSaveSlot(slotIndex) {
  const slot = game.saveSlots[slotIndex];
  if (!slot) {
    game.ui.message = `槽位 ${slotIndex + 1} 尚未存檔。`;
    return false;
  }

  const room = roomTemplates[slot.currentRoomId] || roomTemplates.lobby;
  game.currentRoomId = room.id;
  game.room = room;
  game.player = {
    ...slot.player,
    facing: slot.player?.facing || "down"
  };
  game.flags = { ...(slot.flags || {}) };
  game.inventory = [...(slot.inventory || [])];
  game.selectedItemId = game.inventory[0] || null;
  game.state = slot.state || "play";
  game.ui.dialogue = null;
  game.ui.inventoryOpen = false;
  game.ui.message = `已讀取槽位 ${slotIndex + 1}`;
  return true;
}

function setup() {
  createCanvas(WIDTH, HEIGHT);
  pixelDensity(1);
  noSmooth();
  rectMode(CORNER);
  textAlign(CENTER, CENTER);
  textFont("'Noto Sans TC', 'Microsoft JhengHei', 'Source Han Sans TC', 'PingFang TC', 'Microsoft YaHei', sans-serif");

  game.particles = Array.from({ length: 32 }, () => ({
    x: random(WIDTH),
    y: random(HEIGHT),
    r: random(1, 3),
    speed: random(0.2, 1.2),
    alpha: random(40, 140)
  }));

  loadSaveSlots();
  resetGame();
}

function formatClock(minutes) {
  const totalMinutes = ((Math.floor(minutes) % (24 * 60)) + 24 * 60) % (24 * 60);
  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function draw() {
  background(10, 14, 20);
  game.timeMinutes = (game.timeMinutes + 0.06) % (24 * 60);
  game.ui.timeText = formatClock(game.timeMinutes);
  game.ui.targetText = game.room ? game.room.name : "探索大廳";

  if (game.state === "title") {
    drawTitleScreen();
    return;
  }

  if (game.state === "death") {
    drawDeathScreen();
    return;
  }

  if (game.state === "ending") {
    drawEndingScreen();
    return;
  }

  drawRoom();
  drawParticles();
  drawObjects();
  drawPlayer();
  drawHud();
  drawMessage();
  drawDialogue();
  if (game.ui.inventoryOpen) {
    drawInventoryPanel();
  }
  if (game.ui.saveMenuOpen) {
    drawSaveMenu();
  }
}

function resetGame() {
  game.state = "title";
  game.currentRoomId = "lobby";
  game.room = roomTemplates.lobby;
  game.player.x = game.room.spawn.x;
  game.player.y = game.room.spawn.y;
  game.player.facing = "down";
  game.player.walkCycle = 0;
  game.flags = {};
  game.inventory = [];
  game.selectedItemId = null;
  game.ending = null;
  game.deathReason = "";
  game.timeMinutes = 2 * 60 + 17;
  game.ui.message = "選擇新遊戲或讀取存檔。";
  game.ui.dialogue = null;
  game.ui.inventoryOpen = false;
  game.ui.saveMenuOpen = false;
  game.ui.targetText = "探索大廳";
}

function startNewGame() {
  audioSystem.start();
  game.state = "play";
  game.currentRoomId = "lobby";
  game.room = roomTemplates.lobby;
  game.player.x = game.room.spawn.x;
  game.player.y = game.room.spawn.y;
  game.player.facing = "down";
  game.player.walkCycle = 0;
  game.flags = {};
  game.inventory = [];
  game.selectedItemId = null;
  game.ending = null;
  game.deathReason = "";
  game.timeMinutes = 2 * 60 + 17;
  game.ui.message = "方向鍵移動，Z / 空白互動。";
  game.ui.dialogue = null;
  game.ui.inventoryOpen = false;
  game.ui.saveMenuOpen = false;
  game.ui.targetText = "探索大廳";
  showDialogue(globalDialogue.intro, true);
}

function switchRoom(roomId) {
  const nextRoom = roomTemplates[roomId];
  if (!nextRoom) return;

  game.currentRoomId = roomId;
  game.room = nextRoom;
  game.player.x = nextRoom.spawn.x;
  game.player.y = nextRoom.spawn.y;
  game.player.walkCycle = 0;
  game.ui.message = "已切換房間：" + nextRoom.name;
  audioSystem.playSfx("door");
  evaluateEndings();
}

function respawnPlayerToStart() {
  game.state = "play";
  game.player.x = game.room.spawn.x;
  game.player.y = game.room.spawn.y;
  game.player.facing = "down";
  game.ui.message = "你醒來時，腳下仍然是那間房間。";
  game.deathReason = "";
}

function triggerTrap(trap) {
  if (game.state !== "play") return;

  game.state = "death";
  game.deathReason = trap.label || "陷阱";
  game.ui.message = "你被黑暗吞沒，腳下的裂縫突然把你拖回原點。";
  audioSystem.playSfx("trap");
}

function evaluateEndings() {
  if (game.state !== "play") return;

  const hasNormal = game.inventory.includes("brass_key") && game.flags.lobby_clock_seen && game.currentRoomId === "library";
  const hasTrue = game.inventory.includes("brass_key") &&
    game.inventory.includes("moon_charm") &&
    game.flags.lobby_painting_seen &&
    game.flags.lobby_clock_seen &&
    game.flags.door_door_library_opened;

  if (hasTrue) {
    triggerEnding("true");
    return;
  }

  if (hasNormal) {
    triggerEnding("normal");
  }
}

function triggerEnding(type) {
  if (game.state !== "play") return;

  game.state = "ending";
  game.ending = type;
  audioSystem.playSfx("ending");
  game.ui.message = type === "true" ? "你看見月光真正落在了你身上。" : "你帶著答案離開了這座屋子。";
}

function keyPressed() {
  const actionKey = key === " " || key === "z" || key === "Z" || keyCode === 32;
  const confirmKey = key === "Enter" || keyCode === ENTER;

  if (game.state === "death") {
    if (confirmKey || actionKey || key === " " || key === "Enter") {
      respawnPlayerToStart();
    }
    return;
  }

  if (game.state === "ending") {
    if (confirmKey || actionKey) {
      resetGame();
    }
    return;
  }

  if (game.state === "title") {
    audioSystem.start();

    if (confirmKey) {
      startNewGame();
      return;
    }

    if (key === "1") {
      loadSaveSlot(0);
      if (game.state !== "title") {
        audioSystem.start();
      }
      return;
    }
    if (key === "2") {
      loadSaveSlot(1);
      if (game.state !== "title") {
        audioSystem.start();
      }
      return;
    }
    if (key === "3") {
      loadSaveSlot(2);
      if (game.state !== "title") {
        audioSystem.start();
      }
      return;
    }
    return;
  }

  audioSystem.start();

  if (game.ui.dialogue && game.ui.dialogue.active) {
    if (actionKey || confirmKey) {
      advanceDialogue();
    }
    return;
  }

  if (game.ui.saveMenuOpen) {
    if (key === "1") {
      game.ui.saveMenuOpen = false;
      saveCurrentSlot(0);
      return;
    }
    if (key === "2") {
      game.ui.saveMenuOpen = false;
      saveCurrentSlot(1);
      return;
    }
    if (key === "3") {
      game.ui.saveMenuOpen = false;
      saveCurrentSlot(2);
      return;
    }
    return;
  }

  if (actionKey) {
    interactWithFacingTile();
    return;
  }

  if (key === "i" || key === "I") {
    game.ui.inventoryOpen = !game.ui.inventoryOpen;
    return;
  }

  if (key === "s" || key === "S") {
    if (isAtSavePoint()) {
      game.ui.saveMenuOpen = true;
      game.ui.message = "選擇儲存槽位：1 / 2 / 3";
    } else {
      game.ui.message = "你必須站在存檔點前才能儲存。";
    }
    return;
  }

  if (key === "r" || key === "R") {
    resetGame();
    return;
  }

  if (game.ui.inventoryOpen && !isNaN(Number(key)) && Number(key) >= 1 && Number(key) <= 9) {
    const index = Number(key) - 1;
    if (index < game.inventory.length) {
      game.selectedItemId = game.inventory[index];
      game.ui.message = `已選擇：${itemCatalog[game.selectedItemId].name}`;
    }
    return;
  }

  if (keyCode === LEFT_ARROW) {
    attemptMove(-1, 0, "left");
  } else if (keyCode === RIGHT_ARROW) {
    attemptMove(1, 0, "right");
  } else if (keyCode === UP_ARROW) {
    attemptMove(0, -1, "up");
  } else if (keyCode === DOWN_ARROW) {
    attemptMove(0, 1, "down");
  }
}

function attemptMove(dx, dy, facing) {
  const nx = game.player.x + dx;
  const ny = game.player.y + dy;

  if (isWalkable(nx, ny)) {
    game.player.x = nx;
    game.player.y = ny;
    game.player.facing = facing;
    game.player.walkCycle += 1;
    audioSystem.playSfx("step");

    const trap = (game.room.objects || []).find(
      (obj) => obj.kind === "trap" && obj.x === nx && obj.y === ny
    );

    if (trap) {
      triggerTrap(trap);
      return;
    }

    handleRoomExitCheck();
    evaluateEndings();
    return;
  }

  game.player.facing = facing;
  game.ui.message = "前方被牆擋住。";
}

function isWalkable(x, y) {
  if (x < 0 || y < 0 || x >= ROOM_COLS || y >= ROOM_ROWS) {
    return false;
  }

  const tile = game.room.tiles[y][x];
  if (tile === WALL) {
    return false;
  }

  const blockingObject = (game.room.objects || []).find(
    (obj) => obj.x === x && obj.y === y && obj.solid === true
  );

  return !blockingObject;
}

function handleRoomExitCheck() {
  const exits = game.room.exits || {};

  for (const direction in exits) {
    const trigger = exits[direction];
    if (trigger.x === game.player.x && trigger.y === game.player.y) {
      switchRoom(trigger.to);
      return;
    }
  }
}

function getFacingPosition() {
  const { x, y, facing } = game.player;

  if (facing === "left") return { x: x - 1, y };
  if (facing === "right") return { x: x + 1, y };
  if (facing === "up") return { x, y: y - 1 };
  return { x, y: y + 1 };
}

function interactWithFacingTile() {
  const facingPos = getFacingPosition();
  const target = (game.room.objects || []).find(
    (obj) => obj.x === facingPos.x && obj.y === facingPos.y
  );

  if (!target) {
    game.ui.message = "你面前什麼都沒有。";
    return;
  }

  if (target.kind === "pickup") {
    if (game.inventory.includes(target.itemId)) {
      game.ui.message = "你已經拿起這個道具了。";
      return;
    }

    game.inventory.push(target.itemId);
    game.selectedItemId = target.itemId;
    audioSystem.playSfx("pickup");
    game.ui.message = `你拾起了：${itemCatalog[target.itemId].name}`;
    evaluateEndings();
    return;
  }

  if (target.kind === "npc") {
    const text = target.inspect && ((target.inspect.onceFlag && game.flags[target.inspect.onceFlag]) ? target.inspect.repeatText : target.inspect.firstText);
    if (target.inspect) {
      if (target.inspect.onceFlag) {
        game.flags[target.inspect.onceFlag] = true;
      }
      if (target.eventId) {
        triggerEventDialogue(target.eventId, { name: target.label, portrait: target.portrait || "maid" });
      } else {
        showDialogue([{ name: target.label, text, portrait: target.portrait || "maid" }], true);
      }
      game.ui.message = "你正與「" + target.label + "」對話。";
      return;
    }
  }

  if (target.kind === "door") {
    if (target.locked && target.requiredItem) {
      const usingItem = game.selectedItemId || (game.inventory.includes(target.requiredItem) ? target.requiredItem : null);
      if (!usingItem) {
        game.ui.message = `門鎖住了，需要 ${itemCatalog[target.requiredItem].name}。`;
        return;
      }

      if (usingItem === target.requiredItem) {
        target.locked = false;
        audioSystem.playSfx("door");
        game.ui.message = itemCatalog[target.requiredItem].useText;
        game.flags["door_" + target.id + "_opened"] = true;
        evaluateEndings();
        return;
      }
    }

    const canLeave = roomTemplates[target.exitTo];
    if (canLeave && !target.locked) {
      switchRoom(target.exitTo);
      game.ui.message = "門後是：" + roomTemplates[target.exitTo].name;
    } else {
      game.ui.message = "門鎖住了，無法打開。";
    }
    return;
  }

  if (target.inspect) {
    const flagKey = target.inspect.onceFlag;
    const text = flagKey && game.flags[flagKey]
      ? target.inspect.repeatText
      : target.inspect.firstText;

    if (flagKey) {
      game.flags[flagKey] = true;
    }

    showDialogue([{ name: target.label, text }], true);
    game.ui.message = "你仔細調查了：" + target.label;
    return;
  }

  game.ui.message = "這個物件目前還沒有互動邏輯。";
}

function showDialogue(lines, canSkip) {
  if (!Array.isArray(lines) || lines.length === 0) return;

  game.ui.dialogue = {
    active: true,
    index: 0,
    displayed: 0,
    canSkip,
    lines
  };
}

function triggerEventDialogue(eventId, options = {}) {
  const event = dialogueEvents[eventId];
  if (!event) return false;

  const branch = game.flags[eventId + "_seen"] ? "after" : "default";
  const lines = (event[branch] || event.default || []).map((entry) => ({
    ...entry,
    name: options.name || entry.name,
    portrait: options.portrait || entry.portrait || "maid"
  }));

  if (lines.length > 0) {
    game.flags[eventId + "_seen"] = true;
    showDialogue(lines, true);
    return true;
  }

  return false;
}

function advanceDialogue() {
  const panel = game.ui.dialogue;
  if (!panel) return;

  const current = panel.lines[panel.index];
  if (!current) {
    game.ui.dialogue = null;
    return;
  }

  if (panel.displayed < current.text.length) {
    panel.displayed = current.text.length;
    return;
  }

  panel.index += 1;
  if (panel.index >= panel.lines.length) {
    game.ui.dialogue = null;
    return;
  }

  panel.displayed = 0;
}

function drawRoom() {
  const room = game.room;
  const pulse = sin(frameCount * 0.04) * 8;
  const px = game.player.x * TILE + TILE / 2;
  const py = game.player.y * TILE + TILE / 2;
  const lightRadius = 150 + sin(frameCount * 0.08) * 18;

  noStroke();
  fill(8, 11, 17);
  rect(0, 0, WIDTH, HEIGHT);

  fill(16, 22, 30, 220);
  rect(0, 0, WIDTH, HEIGHT * 0.7);

  fill(29, 38, 47, 210);
  rect(0, HEIGHT * 0.68, WIDTH, HEIGHT * 0.32);

  fill(183, 195, 211, 14);
  rect(0, 0, WIDTH, HEIGHT);

  for (let y = 0; y < ROOM_ROWS; y++) {
    for (let x = 0; x < ROOM_COLS; x++) {
      const tileX = x * TILE;
      const tileY = y * TILE;
      const tile = room.tiles[y][x];

      if (tile === WALL) {
        const brickShade = 48 + ((x + y) % 3) * 6;
        fill(brickShade, 56 + ((x + y) % 3) * 4, 62 + ((x + y) % 2) * 5);
        rect(tileX, tileY, TILE, TILE);

        fill(26, 31, 38, 200);
        rect(tileX + 2, tileY + 2, TILE - 4, TILE - 4);

        fill(80, 89, 96, 90);
        rect(tileX + 3, tileY + 4, TILE - 6, 2);
        rect(tileX + 3, tileY + 12, TILE - 6, 2);

        fill(72, 80, 88, 70);
        rect(tileX + 6, tileY + 9, 4, TILE - 18);

        fill(130, 140, 152, 55);
        rect(tileX + 11, tileY + 6, 2, 8);
        rect(tileX + 5, tileY + 15, 2, 6);
      } else {
        fill(18, 25, 33);
        rect(tileX, tileY, TILE, TILE);

        fill(29, 39, 48, 150);
        rect(tileX + 2, tileY + 2, TILE - 4, TILE - 4);

        if ((x + y) % 2 === 0) {
          fill(23, 31, 40, 78);
          rect(tileX + 4, tileY + 5, TILE - 8, 2);
        }

        fill(58, 68, 77, 35);
        rect(tileX + 11, tileY + 11, 2, 8);
      }
    }
  }

  fill(185, 164, 118, 26);
  rect(12 * TILE - 8, 2 * TILE - 4, 95, 60, 16);
  fill(226, 214, 167, 18);
  ellipse(12 * TILE + 8, 2 * TILE + 10, 220, 130);
  fill(234, 241, 248, 16);
  ellipse(12 * TILE + 8, 2 * TILE + 10, 155 + pulse, 82 + pulse);

  fill(42, 52, 58, 180);
  rect(22, 18, 90, 64, 8);
  fill(69, 86, 101, 120);
  rect(30, 26, 74, 48, 6);
  fill(200, 215, 230, 28);
  rect(38, 34, 58, 32, 5);

  for (let i = 12; i > 0; i--) {
    const alpha = 18 + i * 14;
    fill(172, 200, 220, alpha);
    ellipse(px, py, 90 + i * 20 + pulse, 90 + i * 20 + pulse);
  }

  fill(255, 200, 120, 26);
  ellipse(px, py, 60, 60);

  const darkness = drawingContext.createRadialGradient(px, py, 28, px, py, lightRadius);
  darkness.addColorStop(0, "rgba(255, 214, 148, 0.20)");
  darkness.addColorStop(0.18, "rgba(255, 214, 148, 0.12)");
  darkness.addColorStop(0.48, "rgba(25, 30, 35, 0.42)");
  darkness.addColorStop(1, "rgba(0, 0, 0, 0.98)");
  drawingContext.fillStyle = darkness;
  drawingContext.fillRect(0, 0, width, height);

  fill(0, 0, 0, 15);
  rect(0, 0, width, height);

  fill(0, 0, 0, 62);
  ellipse(px, py + 18, 20, 9);

  fill(13, 17, 22, 172);
  rect(0, 0, WIDTH, 18);
  rect(0, HEIGHT - 18, WIDTH, 18);

  stroke(210, 228, 246, 10);
  for (let x = 0; x <= ROOM_COLS; x++) {
    line(x * TILE, 0, x * TILE, HEIGHT);
  }
  for (let y = 0; y <= ROOM_ROWS; y++) {
    line(0, y * TILE, WIDTH, y * TILE);
  }
  noStroke();

  fill(116, 136, 158, 22);
  rect(4, 4, WIDTH - 8, HEIGHT - 8, 8);
}

function drawParticles() {
  for (const p of game.particles) {
    p.y += p.speed;
    if (p.y > HEIGHT + 10) {
      p.y = -10;
      p.x = random(WIDTH);
    }

    fill(184, 205, 224, p.alpha);
    ellipse(p.x, p.y, p.r + 0.9, p.r + 0.9);
  }

  for (let i = 0; i < 24; i++) {
    const fogX = (i * 67 + frameCount * 0.35) % (WIDTH + 70) - 35;
    const fogY = (i * 97 + frameCount * 0.22) % (HEIGHT + 80) - 20;
    fill(176, 191, 214, 10 + i % 8);
    ellipse(fogX, fogY, 140, 50);
  }
}

function drawObjects() {
  const objects = game.room.objects || [];

  for (const obj of objects) {
    const px = obj.x * TILE + TILE / 2;
    const py = obj.y * TILE + TILE / 2;

    if (obj.kind === "npc") {
      const bob = sin(frameCount * 0.16 + obj.x * 1.5) * 1.6;
      drawNpcSprite(px, py + bob, {
        skin: [220, 188, 166],
        hair: [52, 42, 50],
        clothes: [80, 94, 106],
        cloak: [60, 68, 76],
        trim: [142, 120, 100],
        facing: game.player.facing,
        walk: 0,
        scale: 1.2
      });
      continue;
    }

    if (obj.kind === "furniture") {
      if (obj.id === "painting") {
        fill(70, 49, 41, 180);
        rect(px - 17, py - 19, 34, 38, 3);
        fill(147, 112, 74, 190);
        rect(px - 13, py - 15, 26, 30);
        fill(90, 75, 67, 155);
        rect(px - 9, py - 11, 18, 22);
        fill(235, 214, 146, 90);
        ellipse(px, py - 2, 12, 12);
      } else if (obj.id === "clock") {
        fill(76, 68, 61, 190);
        rect(px - 12, py - 12, 24, 24, 5);
        fill(214, 195, 169, 220);
        ellipse(px, py, 9, 9);
        stroke(214, 195, 169, 170);
        line(px, py, px, py - 6);
        line(px, py, px + 4, py + 2);
        noStroke();
      } else if (obj.id === "cabinet") {
        fill(95, 70, 56, 192);
        rect(px - 16, py - 13, 32, 26, 4);
        fill(61, 47, 38, 170);
        rect(px - 12, py - 9, 24, 18);
        fill(138, 106, 84, 120);
        rect(px - 10, py - 6, 20, 3);
      }
    } else if (obj.kind === "door") {
      fill(119, 88, 65, 210);
      rect(px - 15, py - 18, 30, 36, 4);
      fill(52, 38, 30, 170);
      rect(px - 3, py - 8, 6, 22);
      fill(210, 184, 136, 90);
      rect(px + 6, py - 10, 5, 18);
      if (obj.locked) {
        fill(196, 109, 94, 180);
        ellipse(px + 9, py - 4, 5, 5);
      }
    } else if (obj.kind === "savePoint") {
      fill(141, 158, 181, 190);
      rect(px - 12, py - 12, 24, 24, 5);
      fill(220, 233, 245, 210);
      rect(px - 5, py - 5, 10, 10);
      fill(127, 146, 175, 130);
      ellipse(px, py + 12, 16, 6);
    } else if (obj.kind === "trap") {
      fill(66, 43, 51, 210);
      rect(px - 10, py - 10, 20, 20, 4);
      fill(186, 71, 84, 200);
      ellipse(px, py, 10, 10);
      fill(255, 167, 173, 75);
      ellipse(px, py, 18, 18);
    } else if (obj.kind === "pickup") {
      fill(172, 146, 96, 220);
      rect(px - 8, py - 8, 16, 16, 3);
      fill(245, 221, 126, 225);
      ellipse(px, py, 8, 8);
      fill(255, 244, 182, 120);
      ellipse(px, py, 13, 13);
    } else {
      fill(166, 179, 194, 180);
      rect(px - 6, py - 6, 12, 12);
    }
  }
}

function drawCharacterSprite(x, y, options = {}) {
  const {
    skin = [228, 188, 142],
    hair = [53, 40, 48],
    clothes = [74, 82, 96],
    cloak = [38, 45, 54],
    trim = [154, 129, 94],
    facing = "down",
    walk = 0,
    scale = 1,
    shadow = true,
    silhouette = false
  } = options;

  const sx = x;
  const sy = y + walk;

  if (shadow) {
    fill(0, 0, 0, 65);
    ellipse(sx, sy + 18 * scale, 22 * scale, 10 * scale);
  }

  const coatBody = silhouette ? [50, 56, 63] : clothes;
  const coatColor = color(...coatBody);
  fill(coatColor.levels ? coatColor.levels.slice(0, 3) : coatBody);
  rect(sx - 10 * scale, sy - 2 * scale, 20 * scale, 18 * scale, 4 * scale);

  fill(silhouette ? [90, 96, 106] : cloak);
  quad(
    sx - 12 * scale, sy + 1 * scale,
    sx + 12 * scale, sy + 1 * scale,
    sx + 15 * scale, sy + 18 * scale,
    sx - 15 * scale, sy + 18 * scale
  );

  fill(silhouette ? [50, 50, 58] : hair);
  rect(sx - 9 * scale, sy - 18 * scale, 18 * scale, 8 * scale, 4 * scale);
  rect(sx - 6 * scale, sy - 23 * scale, 12 * scale, 8 * scale, 3 * scale);

  fill(skin);
  ellipse(sx, sy - 16 * scale, 12 * scale, 12 * scale);

  fill(22, 26, 31, 180);
  rect(sx - 3 * scale, sy - 17 * scale, 6 * scale, 2 * scale);

  fill(silhouette ? [94, 101, 112] : trim);
  rect(sx - 9 * scale, sy + 4 * scale, 18 * scale, 4 * scale, 2 * scale);

  fill(silhouette ? [32, 36, 42] : [62, 72, 82]);
  rect(sx - 7 * scale, sy + 16 * scale, 5 * scale, 12 * scale);
  rect(sx + 2 * scale, sy + 16 * scale, 5 * scale, 12 * scale);

  fill(silhouette ? [118, 126, 136] : [90, 108, 123]);
  if (facing === "left") {
    rect(sx - 16 * scale, sy - 2 * scale, 4 * scale, 3 * scale);
  } else if (facing === "right") {
    rect(sx + 12 * scale, sy - 2 * scale, 4 * scale, 3 * scale);
  } else if (facing === "up") {
    rect(sx - 1 * scale, sy - 28 * scale, 3 * scale, 6 * scale);
  } else {
    rect(sx - 1 * scale, sy + 18 * scale, 3 * scale, 6 * scale);
  }
}

function drawPlayer() {
  const px = game.player.x * TILE + TILE / 2;
  const py = game.player.y * TILE + TILE / 2;
  const idlePulse = sin(frameCount * 0.05) * 1.4;
  const walkBob = sin(frameCount * 0.2) * 2.8;
  const stepFrame = Math.floor((frameCount * 0.12) % 3);
  const bodyY = py + (game.state === "play" ? walkBob : idlePulse);
  drawCharacterSprite(px, bodyY, {
    skin: [226, 188, 142],
    hair: [50, 40, 48],
    clothes: [82, 95, 106],
    cloak: [52, 61, 72],
    trim: [144, 120, 95],
    facing: game.player.facing,
    walk: stepFrame === 0 ? -2 : stepFrame === 1 ? 0 : 2,
    scale: 1,
    shadow: true
  });
}

function drawNpcSprite(x, y, options = {}) {
  const stepFrame = Math.floor((frameCount * 0.14) % 3);
  drawCharacterSprite(x, y, {
    ...options,
    walk: stepFrame === 0 ? -2 : stepFrame === 1 ? 0 : 2,
    scale: options.scale || 1.12
  });
}

function drawPortrait(type, x, y, size = 42) {
  push();
  translate(x, y);
  if (type === "maid") {
    fill(88, 75, 84, 220);
    rect(-size * 0.46, -size * 0.08, size * 0.92, size * 0.7, 10);
    fill(224, 204, 176);
    ellipse(0, -size * 0.22, size * 0.38, size * 0.38);
    fill(52, 44, 48);
    rect(-size * 0.22, -size * 0.42, size * 0.44, size * 0.24, 6);
    fill(142, 123, 118, 220);
    rect(-size * 0.3, size * 0.1, size * 0.6, size * 0.34, 8);
    fill(75, 64, 72, 200);
    rect(-size * 0.1, size * 0.42, size * 0.2, size * 0.26, 6);
  } else if (type === "shadow") {
    fill(44, 42, 48, 220);
    rect(-size * 0.46, -size * 0.08, size * 0.92, size * 0.7, 10);
    fill(78, 80, 88, 180);
    ellipse(0, -size * 0.18, size * 0.34, size * 0.34);
    fill(28, 30, 34, 210);
    rect(-size * 0.18, -size * 0.4, size * 0.36, size * 0.2, 6);
    fill(60, 66, 74, 210);
    rect(-size * 0.26, size * 0.12, size * 0.52, size * 0.30, 8);
  } else if (type === "scholar") {
    fill(88, 82, 96, 220);
    rect(-size * 0.46, -size * 0.08, size * 0.92, size * 0.72, 10);
    fill(224, 199, 170);
    ellipse(0, -size * 0.2, size * 0.36, size * 0.36);
    fill(64, 52, 58);
    rect(-size * 0.2, -size * 0.4, size * 0.4, size * 0.22, 6);
    fill(118, 120, 138, 220);
    rect(-size * 0.28, size * 0.1, size * 0.56, size * 0.28, 8);
  } else {
    fill(95, 88, 92, 220);
    rect(-size * 0.42, -size * 0.04, size * 0.84, size * 0.6, 10);
    fill(230, 200, 170);
    ellipse(0, -size * 0.18, size * 0.38, size * 0.38);
    fill(52, 46, 56);
    rect(-size * 0.22, -size * 0.4, size * 0.44, size * 0.2, 6);
    fill(110, 128, 146, 220);
    rect(-size * 0.24, size * 0.12, size * 0.48, size * 0.28, 8);
  }
  pop();
}

function drawHud() {
  fill(11, 18, 25, 215);
  rect(10, 10, 170, 30, 8);
  fill(240, 218, 152);
  textSize(12);
  text("時間：" + game.ui.timeText, 95, 26);

  fill(11, 18, 25, 215);
  rect(width - 160, 10, 150, 30, 8);
  fill(208, 222, 240);
  textSize(11);
  text("目標：" + game.ui.targetText, width - 85, 26);

  if (isAtSavePoint()) {
    fill(160, 220, 188);
    textSize(11);
    text("S 儲存", width - 82, 52);
  }
}

function drawInventoryPanel() {
  fill(12, 18, 24, 228);
  rect(width * 0.18, height * 0.18, width * 0.64, height * 0.54, 12);
  stroke(142, 176, 192, 120);
  rect(width * 0.18 + 2, height * 0.18 + 2, width * 0.64 - 4, height * 0.54 - 4, 12);
  noStroke();

  fill(244, 214, 112);
  textSize(18);
  text("背包", width / 2, height * 0.27);

  const items = game.inventory.length ? game.inventory : ["空白背包"];
  fill(230, 236, 243);
  textSize(13);

  for (let i = 0; i < items.length; i++) {
    const itemId = items[i];
    const item = itemCatalog[itemId] || { name: itemId };
    const isSelected = game.selectedItemId === itemId;
    const y = height * (0.38 + i * 0.12);

    fill(isSelected ? 244 : 230, isSelected ? 214 : 236, isSelected ? 112 : 243);
    text(`${i + 1}. ${item.name}`, width / 2 - 12, y);

    if (item.description) {
      fill(170, 188, 204);
      textSize(11);
      text(item.description, width / 2, y + 16);
      textSize(13);
    }
  }
}

function drawMessage() {
  if (!game.ui.message) return;

  fill(17, 25, 31, 220);
  rect(18, height - 40, width - 36, 26, 8);
  fill(236, 240, 244);
  textSize(11);
  text(game.ui.message, width / 2, height - 25);
}

function drawDialogue() {
  const panel = game.ui.dialogue;
  if (!panel || !panel.active) return;

  const current = panel.lines[panel.index];
  if (!current) return;

  const boxX = 28;
  const boxY = height - 110;
  const boxW = width - 56;
  const boxH = 82;

  fill(18, 14, 22, 240);
  rect(boxX, boxY, boxW, boxH, 12);
  stroke(128, 103, 166, 200);
  rect(boxX + 1, boxY + 1, boxW - 2, boxH - 2, 12);
  noStroke();

  const portraitType = current.portrait || "maid";
  fill(82, 68, 100, 230);
  rect(boxX + 14, boxY + 14, 46, 46, 8);
  drawPortrait(portraitType, boxX + 36, boxY + 36, 22);

  fill(244, 212, 112);
  textSize(13);
  textAlign(LEFT, CENTER);
  text(current.name, boxX + 74, boxY + 22);

  fill(205, 183, 226, 180);
  rect(boxX + 74, boxY + 30, 90, 2, 2);

  const visibleText = current.text.slice(0, panel.displayed);
  fill(230, 238, 247);
  textSize(14);
  text(visibleText, boxX + 74, boxY + 52, boxW - 92, 34);
  textAlign(CENTER, CENTER);

  if (panel.displayed < current.text.length) {
    panel.displayed += 1;
  }

  if (panel.displayed >= current.text.length && (panel.canSkip || panel.index < panel.lines.length - 1)) {
    fill(206, 180, 240);
    textSize(11);
    text("[ 空格 繼續 ]", boxX + boxW - 82, boxY + boxH - 12);
  }
}

function drawTitleScreen() {
  background(6, 9, 15);
  drawParticles();

  fill(15, 19, 27, 170);
  rect(0, 0, width, height);

  fill(248, 220, 150, 80);
  ellipse(width * 0.75, height * 0.22, 210, 210);
  fill(250, 233, 187, 120);
  ellipse(width * 0.75, height * 0.22, 140, 140);

  fill(18, 23, 31, 210);
  rect(width * 0.18, height * 0.18, width * 0.64, height * 0.62, 20);
  stroke(196, 217, 230, 95);
  rect(width * 0.18 + 2, height * 0.18 + 2, width * 0.64 - 4, height * 0.62 - 4, 20);
  noStroke();

  fill(248, 220, 150);
  textSize(30);
  text("Moonlit Ruins", width / 2, height * 0.30);

  fill(230, 238, 247);
  textSize(15);
  text("多槽存檔 / 讀檔 / 結局系統", width / 2, height * 0.40);

  fill(177, 208, 224);
  textSize(14);
  text("Enter：新遊戲", width / 2, height * 0.52);

  fill(214, 229, 242);
  textSize(12);
  text("1 / 2 / 3：讀取存檔槽", width / 2, height * 0.60);

  fill(177, 202, 220, 170);
  textSize(11);
  text("你可以在存檔石碑前按 S 儲存，並於標題畫面讀取槽位。", width / 2, height * 0.72);

  fill(248, 220, 150, 18);
  rect(width * 0.22, height * 0.12, width * 0.56, 16, 10);
}

function drawDeathScreen() {
  fill(8, 10, 14, 220);
  rect(0, 0, width, height);

  fill(220, 90, 90, 80);
  ellipse(width * 0.5, height * 0.34, 250, 250);
  fill(220, 90, 90, 45);
  ellipse(width * 0.5, height * 0.34, 320, 320);

  fill(220, 90, 90);
  textSize(30);
  text("你走進了黑暗", width / 2, height * 0.33);

  fill(236, 236, 236);
  textSize(14);
  text("你被「" + game.deathReason + "」吞沒，靈魂被重新拉回房間起點。", width / 2, height * 0.45);

  fill(165, 214, 184);
  textSize(13);
  text("按 Enter / 空白 鍵返回房間起點", width / 2, height * 0.58);
}

function drawEndingScreen() {
  fill(12, 15, 20, 220);
  rect(0, 0, width, height);

  fill(246, 220, 150, 75);
  ellipse(width * 0.5, height * 0.2, 320, 180);
  fill(246, 220, 150, 110);
  ellipse(width * 0.5, height * 0.2, 200, 110);

  fill(15, 18, 24, 200);
  rect(width * 0.18, height * 0.18, width * 0.64, height * 0.48, 18);
  stroke(225, 220, 180, 100);
  rect(width * 0.18 + 2, height * 0.18 + 2, width * 0.64 - 4, height * 0.48 - 4, 18);
  noStroke();

  fill(246, 220, 150);
  textSize(26);
  text(game.ending === "true" ? "真結局：月光的留聲" : "普通結局：離開房屋", width / 2, height * 0.29);

  fill(236, 240, 244);
  textSize(14);
  text(
    game.ending === "true"
      ? "你將銅鑰匙與月光護符並置，當最後一道光降下時，整棟屋子終於願意把秘密交還給你。"
      : "你帶著不完整的答案離開，房間的門在背後緩緩關上，像是還沒準備放你走。",
    width / 2,
    height * 0.45,
    width * 0.62,
    90
  );

  fill(166, 221, 192);
  textSize(12);
  text("按 Enter 返回標題畫面", width / 2, height * 0.68);
}

function drawSaveMenu() {
  fill(12, 18, 24, 220);
  rect(width * 0.28, height * 0.25, width * 0.44, height * 0.35, 12);

  fill(244, 214, 112);
  textSize(18);
  text("選擇存檔槽位", width / 2, height * 0.34);

  for (let i = 0; i < 3; i++) {
    const slot = game.saveSlots[i];
    const label = slot ? `槽位 ${i + 1}：${roomTemplates[slot.currentRoomId]?.name || "已存檔"}` : `槽位 ${i + 1}：空白`;
    fill(230, 236, 243);
    textSize(13);
    text(`${i + 1} - ${label}`, width / 2, height * (0.46 + i * 0.1));
  }

  fill(170, 224, 184);
  textSize(11);
  text("按 1 / 2 / 3 儲存，或任意鍵離開", width / 2, height * 0.68);
}

function isAtSavePoint() {
  const current = (game.room.objects || []).find(
    (obj) => obj.kind === "savePoint" && obj.x === game.player.x && obj.y === game.player.y
  );
  return Boolean(current);
}

// =============================
// 擴充說明：
// 1. 新增房間：在 roomTemplates 內新增一個新物件，例如 roomC。
// 2. 每個房間要有：id、name、tiles、spawn、exits、objects。
// 3. 新增互動物件：在 objects 陣列插入 { id, x, y, kind, label, solid }
// 4. 互動文本：在 globalDialogue 加入相對應 id 的多行對話陣列。
// 5. 這個底層引擎不包含：鬼魂追蹤、隨機迷宮、劇情掛鉤；後續模組再接上。
// =============================

