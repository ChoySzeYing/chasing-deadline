const TILE = 60;
const ROOM_COLS = 16;
const ROOM_ROWS = 12;
const WIDTH = ROOM_COLS * TILE;
const HEIGHT = ROOM_ROWS * TILE;
const WALL = 1;
const FLOOR = 0;
const SAVE_KEY = "moonlit_ruins_save_v1";
let playerSprite = null;
let maidImg = null;
let isTalking = false;
let dialogueIndex = 0;

const dialogueLines = [
  "女仆：主人，您终于来了……",
  "女仆：这座废墟里充满了不详的气息。",
  "女仆：请小心，千万不要回头……"
];

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
  muted: false,
  ambientNodes: [],
  bgmInterval: null,

  setMuted(muted) {
    this.muted = muted;
    if (!this.masterGain || !this.ctx) return;
    const target = muted ? 0 : 0.16;
    this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.08);
  },

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

function stripPinkBackground(img) {
  if (!img) return img;
  img.loadPixels();
  const pinkThreshold = 220;

  for (let i = 0; i < img.pixels.length; i += 4) {
    const r = img.pixels[i];
    const g = img.pixels[i + 1];
    const b = img.pixels[i + 2];
    const a = img.pixels[i + 3];

    const isPink = r > pinkThreshold && g < 180 && b > 150 && a > 0;
    if (isPink) {
      img.pixels[i + 3] = 0;
    }
  }

  img.updatePixels();
  return img;
}

function preload() {
  playerSprite = stripPinkBackground(loadImage("player.png"));
  maidImg = loadImage("maid.png");
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

  const maidX = 670;
  const maidY = 210 + sin(frameCount * 0.06) * 8;
  if (maidImg) {
    push();
    imageMode(CENTER);
    fill(0, 0, 0, 42);
    ellipse(maidX, maidY + 70, 36, 12);
    image(maidImg, maidX, maidY, 48, 64);
    pop();
  }

  const px = game.player.x * TILE + TILE / 2;
  const py = game.player.y * TILE + TILE / 2;
  const distanceToMaid = dist(px, py, maidX, maidY);

  if (distanceToMaid < 80 && !isTalking) {
    push();
    fill(240, 228, 195, 220);
    textSize(13);
    textAlign(CENTER, CENTER);
    text("按 Z 键交談", width / 2, height - 36);
    pop();
  }

  if (isTalking) {
    const boxX = 52;
    const boxY = height - 155;
    const boxW = width - 104;
    const boxH = 110;

    push();
    fill(0, 0, 0, 200);
    rect(boxX, boxY, boxW, boxH, 8);
    stroke(255, 255, 255, 190);
    strokeWeight(2);
    rect(boxX + 2, boxY + 2, boxW - 4, boxH - 4, 6);
    noStroke();

    fill(255, 255, 255, 235);
    textSize(15);
    textAlign(LEFT, CENTER);
    text(dialogueLines[dialogueIndex] || "", boxX + 24, boxY + boxH / 2);
    textAlign(CENTER, CENTER);
    pop();
  }

  drawPlayer();
  drawHud();
  drawMessage();
  drawDialogue();
  drawFilmVignette();
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

  if (isTalking) {
    if (key === "z" || key === "Z" || keyCode === 90) {
      if (dialogueIndex < dialogueLines.length - 1) {
        dialogueIndex += 1;
      } else {
        isTalking = false;
        dialogueIndex = 0;
      }
    }
    return;
  }

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

  if (key === "m" || key === "M") {
    audioSystem.ensureContext();
    if (audioSystem.ctx) {
      audioSystem.setMuted(!audioSystem.muted);
      game.ui.message = audioSystem.muted ? "背景音樂已靜音。" : "背景音樂已開啟。";
    }
    return;
  }

  if (actionKey) {
    const px = game.player.x * TILE + TILE / 2;
    const py = game.player.y * TILE + TILE / 2;
    const maidX = 670;
    const maidY = 210 + sin(frameCount * 0.06) * 8;
    const distanceToMaid = dist(px, py, maidX, maidY);

    if (distanceToMaid < 80) {
      isTalking = true;
      dialogueIndex = 0;
      game.ui.message = "女仆正在與你對話。";
      return;
    }

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

  if (keyCode === LEFT_ARROW || key === "a" || key === "A") {
    attemptMove(-1, 0, "left");
  } else if (keyCode === RIGHT_ARROW || key === "d" || key === "D") {
    attemptMove(1, 0, "right");
  } else if (keyCode === UP_ARROW || key === "w" || key === "W") {
    attemptMove(0, -1, "up");
  } else if (keyCode === DOWN_ARROW || key === "s" || key === "S") {
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

function drawFloorTile(x, y, size) {
  const px = x * size;
  const py = y * size;

  noStroke();
  fill(29, 29, 27, 220);
  rect(px, py, size, size);

  const base = 41 + ((x * 7 + y * 5) % 10);
  fill(base, 38 + ((x + y) % 4), 32 + ((x * 2 + y) % 3), 185);
  rect(px + 3, py + 3, size - 6, size - 6);

  stroke(104, 92, 77, 52);
  for (let i = 0; i < 7; i++) {
    const yy = py + 8 + i * 7 + ((x + i) % 2);
    line(px + 8, yy, px + size - 8, yy + random(-2, 2));
  }
  noStroke();

  fill(136, 120, 98, 18);
  rect(px + 10, py + 10, size - 20, size - 20);

  fill(165, 146, 117, 15);
  for (let i = 0; i < 6; i++) {
    const rx = px + 8 + ((i * 17 + x * 9) % (size - 14));
    const ry = py + 9 + ((i * 19 + y * 13) % (size - 18));
    rect(rx, ry, 2, 2);
  }

  stroke(90, 81, 70, 22);
  line(px + 18, py + 12, px + size - 18, py + size - 14);
  line(px + 12, py + size - 18, px + size - 14, py + 16);
  noStroke();
}

function drawWallTile(x, y, size) {
  const px = x * size;
  const py = y * size;
  const shade = 62 + ((x * 3 + y * 2) % 6) * 2;

  noStroke();
  fill(shade, 58 + ((x + y) % 3), 53 + ((x * 2 + y) % 4), 210);
  rect(px, py, size, size);

  fill(32, 27, 25, 120);
  rect(px + 6, py + 6, size - 12, size - 12);

  stroke(126, 112, 92, 55);
  for (let i = 0; i < 4; i++) {
    const yy = py + 10 + i * 15;
    line(px + 10, yy, px + size - 10, yy + random(-2, 2));
  }
  noStroke();

  stroke(88, 76, 64, 38);
  bezier(px + 12, py + 16, px + 28, py + 24, px + 34, py + 40, px + 52, py + 60);
  bezier(px + 30, py + 14, px + 42, py + 28, px + 54, py + 38, px + size - 18, py + size - 18);
  noStroke();

  fill(100, 91, 77, 26);
  rect(px + 10, py + 8, size * 0.18, size * 0.42);
  rect(px + size * 0.72, py + 12, size * 0.15, size * 0.36);
  fill(138, 125, 105, 18);
  ellipse(px + size * 0.28, py + size * 0.24, size * 0.14, size * 0.28);
  ellipse(px + size * 0.76, py + size * 0.34, size * 0.12, size * 0.22);
}

function drawRoom() {
  const room = game.room;
  const px = game.player.x * TILE + TILE / 2;
  const py = game.player.y * TILE + TILE / 2;

  background(10, 12, 16);

  for (let y = 0; y < ROOM_ROWS; y++) {
    for (let x = 0; x < ROOM_COLS; x++) {
      if (room.tiles[y][x] === WALL) drawWallTile(x, y, TILE);
      else drawFloorTile(x, y, TILE);
    }
  }

  const moonX = WIDTH * 0.76;
  const moonY = HEIGHT * 0.2;
  fill(214, 214, 181, 26);
  ellipse(moonX, moonY, 250, 170);
  fill(240, 228, 176, 17);
  ellipse(moonX, moonY, 150, 90);

  const globalGlow = drawingContext.createRadialGradient(width * 0.5, height * 0.5, 50, width * 0.5, height * 0.5, width * 0.9);
  globalGlow.addColorStop(0, "rgba(166, 184, 214, 0.10)");
  globalGlow.addColorStop(0.6, "rgba(22, 26, 32, 0.14)");
  globalGlow.addColorStop(1, "rgba(0, 0, 0, 0.72)");
  drawingContext.fillStyle = globalGlow;
  drawingContext.fillRect(0, 0, width, height);

  const ruinSilhouettes = [
    { x: 160, y: 90, w: 110, h: 60 },
    { x: 620, y: 80, w: 150, h: 70 },
    { x: 820, y: 110, w: 120, h: 60 },
    { x: 110, y: 360, w: 90, h: 50 }
  ];

  push();
  noStroke();
  fill(7, 9, 12, 120);
  for (const s of ruinSilhouettes) {
    beginShape();
    vertex(s.x, s.y + s.h);
    vertex(s.x + 18, s.y + s.h - 10);
    vertex(s.x + 30, s.y + 12);
    vertex(s.x + 52, s.y + s.h - 12);
    vertex(s.x + 72, s.y + 18);
    vertex(s.x + s.w - 12, s.y + 30);
    vertex(s.x + s.w, s.y + s.h);
    endShape(CLOSE);
  }
  pop();

  for (let i = 0; i < 36; i++) {
    const dx = (noise(i * 18, frameCount * 0.05) * width + i * 27) % width;
    const dy = (noise(i * 21, frameCount * 0.04) * height + i * 41) % height;
    fill(200, 210, 220, 14 + (i % 6) * 4);
    ellipse(dx, dy, 2.2, 2.2);
  }

  const fogBand = drawingContext.createLinearGradient(0, 0, 0, height);
  fogBand.addColorStop(0, "rgba(90, 96, 108, 0.08)");
  fogBand.addColorStop(0.5, "rgba(98, 102, 110, 0.04)");
  fogBand.addColorStop(1, "rgba(0, 0, 0, 0.18)");
  drawingContext.fillStyle = fogBand;
  drawingContext.fillRect(0, 0, width, height);

  const localLight = drawingContext.createRadialGradient(px, py, 12, px, py, 220);
  localLight.addColorStop(0, "rgba(255, 203, 126, 0.24)");
  localLight.addColorStop(0.25, "rgba(255, 191, 122, 0.12)");
  localLight.addColorStop(0.75, "rgba(20, 22, 26, 0.42)");
  localLight.addColorStop(1, "rgba(0, 0, 0, 0.88)");
  drawingContext.fillStyle = localLight;
  drawingContext.fillRect(0, 0, width, height);

  fill(0, 0, 0, 18);
  ellipse(px, py + 18, 36, 12);
}

function drawParticles() {
  for (const p of game.particles) {
    p.y += p.speed;
    if (p.y > HEIGHT + 10) {
      p.y = -10;
      p.x = random(WIDTH);
    }

    fill(190, 198, 206, p.alpha);
    ellipse(p.x, p.y, p.r + 0.8, p.r + 0.8);
  }

  for (let i = 0; i < 28; i++) {
    const fogX = (i * 67 + frameCount * 0.35) % (WIDTH + 60) - 30;
    const fogY = (i * 97 + frameCount * 0.18) % (HEIGHT + 80) - 20;
    fill(168, 176, 190, 10 + i % 7);
    ellipse(fogX, fogY, 144, 48);
  }
}

function drawObjects() {
  const objects = game.room.objects || [];

  for (const obj of objects) {
    const px = obj.x * TILE + TILE / 2;
    const py = obj.y * TILE + TILE / 2;

    if (obj.kind === "npc") {
      continue;
    }

    if (obj.kind === "furniture") {
      if (obj.id === "painting") {
        fill(70, 58, 48, 190);
        rect(px - 24, py - 28, 48, 56, 6);
        fill(116, 94, 72, 210);
        rect(px - 18, py - 22, 36, 44, 4);
        fill(210, 188, 143, 150);
        ellipse(px, py - 4, 18, 14);
        fill(88, 80, 72, 120);
        rect(px - 8, py + 8, 16, 8, 3);
      } else if (obj.id === "clock") {
        fill(78, 67, 58, 210);
        rect(px - 18, py - 18, 36, 36, 7);
        fill(212, 194, 154, 210);
        ellipse(px, py, 12, 12);
        stroke(212, 194, 154, 170);
        line(px, py, px, py - 9);
        line(px, py, px + 7, py + 3);
        noStroke();
      } else if (obj.id === "cabinet") {
        fill(82, 66, 55, 195);
        rect(px - 23, py - 20, 46, 36, 7);
        fill(58, 45, 38, 180);
        rect(px - 15, py - 12, 30, 24, 4);
        fill(174, 138, 105, 150);
        rect(px - 11, py - 7, 22, 3);
        fill(100, 87, 76, 120);
        rect(px - 18, py + 10, 36, 4, 2);
      } else if (obj.id === "library_manuscript") {
        fill(92, 72, 58, 180);
        rect(px - 21, py - 18, 42, 40, 7);
        fill(218, 205, 170, 165);
        rect(px - 15, py - 12, 30, 26, 4);
        fill(95, 78, 60, 110);
        for (let i = 0; i < 3; i++) {
          rect(px - 10 + i * 8, py - 10, 5, 20);
        }
      } else {
        fill(90, 74, 60, 180);
        rect(px - 18, py - 18, 36, 36, 6);
        fill(192, 166, 124, 120);
        rect(px - 10, py - 12, 20, 14, 3);
      }
    } else if (obj.kind === "door") {
      fill(92, 72, 58, 210);
      rect(px - 22, py - 30, 44, 60, 8);
      fill(42, 31, 24, 180);
      rect(px - 3, py - 15, 6, 30);
      fill(214, 184, 130, 120);
      rect(px + 8, py - 15, 6, 24);
      if (obj.locked) {
        fill(173, 80, 70, 190);
        ellipse(px + 13, py - 6, 9, 9);
      }
    } else if (obj.kind === "savePoint") {
      fill(84, 82, 68, 220);
      rect(px - 14, py - 14, 28, 28, 6);
      fill(220, 221, 212, 210);
      rect(px - 8, py - 8, 16, 16);
      fill(138, 148, 149, 140);
      ellipse(px, py + 14, 24, 8);
    } else if (obj.kind === "trap") {
      fill(54, 42, 42, 205);
      rect(px - 12, py - 12, 24, 24, 4);
      fill(165, 82, 78, 200);
      ellipse(px, py, 11, 11);
      fill(250, 184, 175, 82);
      ellipse(px, py, 18, 18);
    } else if (obj.kind === "pickup") {
      push();
      translate(px, py);
      fill(110, 132, 136, 120);
      ellipse(0, 0, 20, 20);
      stroke(234, 215, 146, 220);
      strokeWeight(2);
      noFill();
      beginShape();
      vertex(-6, -2);
      bezierVertex(-2, -10, 2, -10, 6, -2);
      bezierVertex(8, 4, 8, 10, 0, 12);
      bezierVertex(-8, 10, -8, 4, -6, -2);
      endShape(CLOSE);
      noStroke();
      fill(255, 232, 156, 200);
      ellipse(0, 0, 8, 8);
      fill(255, 255, 255, 50);
      ellipse(-3, -2, 5, 5);
      pop();
    } else {
      fill(134, 142, 150, 170);
      rect(px - 8, py - 8, 16, 16);
    }
  }
}

function drawPlayer() {
  const px = game.player.x * TILE + TILE / 2;
  const py = game.player.y * TILE + TILE / 2;
  const idlePulse = sin(frameCount * 0.05) * 1.4;
  const walkBob = sin(frameCount * 0.2) * 2.8;
  const bodyY = py + (game.state === "play" ? walkBob : idlePulse);

  if (!playerSprite) return;

  push();
  imageMode(CENTER);
  translate(px, bodyY);
  if (game.player.facing === "left") {
    scale(-1, 1);
  }
  fill(0, 0, 0, 42);
  ellipse(0, 20, 28, 10);
  image(playerSprite, 0, 0, 64, 64);
  pop();
}

function drawPortrait(type, x, y, size = 42) {
  push();
  translate(x, y);
  if (type === "maid") {
    fill(90, 75, 72, 220);
    rect(-size * 0.46, -size * 0.08, size * 0.92, size * 0.7, 12);
    fill(228, 205, 180);
    ellipse(0, -size * 0.24, size * 0.38, size * 0.38);
    fill(52, 44, 48);
    rect(-size * 0.22, -size * 0.44, size * 0.44, size * 0.26, 6);
    fill(136, 119, 108, 220);
    rect(-size * 0.3, size * 0.1, size * 0.6, size * 0.34, 8);
    fill(75, 64, 72, 200);
    rect(-size * 0.1, size * 0.4, size * 0.2, size * 0.28, 6);
  } else if (type === "shadow") {
    fill(42, 38, 42, 224);
    rect(-size * 0.46, -size * 0.08, size * 0.92, size * 0.7, 12);
    fill(76, 78, 84, 180);
    ellipse(0, -size * 0.18, size * 0.34, size * 0.34);
    fill(18, 22, 28, 210);
    rect(-size * 0.18, -size * 0.4, size * 0.36, size * 0.2, 6);
    fill(58, 62, 70, 210);
    rect(-size * 0.26, size * 0.12, size * 0.52, size * 0.30, 8);
  } else if (type === "scholar") {
    fill(84, 78, 88, 220);
    rect(-size * 0.46, -size * 0.08, size * 0.92, size * 0.72, 12);
    fill(224, 199, 170);
    ellipse(0, -size * 0.2, size * 0.36, size * 0.36);
    fill(64, 52, 58);
    rect(-size * 0.2, -size * 0.4, size * 0.4, size * 0.22, 6);
    fill(116, 120, 138, 220);
    rect(-size * 0.28, size * 0.1, size * 0.56, size * 0.28, 8);
  } else {
    fill(92, 84, 84, 220);
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
  push();
  noStroke();

  fill(21, 18, 15, 180);
  rect(12, 12, 176, 36, 9);
  stroke(183, 149, 98, 160);
  rect(14, 14, 172, 32, 7);
  noStroke();

  fill(241, 216, 166);
  textSize(12);
  textAlign(LEFT, CENTER);
  text("時間：" + game.ui.timeText, 26, 31);

  fill(21, 18, 15, 180);
  rect(width - 166, 12, 154, 36, 9);
  stroke(183, 149, 98, 160);
  rect(width - 164, 14, 150, 32, 7);
  noStroke();

  fill(209, 220, 232);
  textSize(11);
  textAlign(LEFT, CENTER);
  text("目標：" + game.ui.targetText, width - 152, 31);

  if (isAtSavePoint()) {
    fill(164, 211, 180, 220);
    textSize(11);
    textAlign(RIGHT, CENTER);
    text("S 儲存", width - 22, 52);
  }

  textAlign(CENTER, CENTER);
  pop();
}

function drawInventoryPanel() {
  const panelX = width * 0.18;
  const panelY = height * 0.18;
  const panelW = width * 0.64;
  const panelH = height * 0.54;

  fill(24, 19, 14, 214);
  rect(panelX, panelY, panelW, panelH, 12);
  stroke(168, 138, 92, 160);
  rect(panelX + 3, panelY + 3, panelW - 6, panelH - 6, 10);
  noStroke();

  fill(238, 219, 165, 230);
  textSize(18);
  text("背包", width / 2, panelY + 30);

  fill(84, 69, 55, 140);
  rect(panelX + 20, panelY + 46, panelW - 40, 2, 2);

  const items = game.inventory.length ? game.inventory : ["空白背包"];
  fill(228, 220, 196);
  textSize(13);

  for (let i = 0; i < items.length; i++) {
    const itemId = items[i];
    const item = itemCatalog[itemId] || { name: itemId };
    const isSelected = game.selectedItemId === itemId;
    const y = panelY + 88 + i * 54;

    fill(isSelected ? 250 : 228, isSelected ? 220 : 220, isSelected ? 150 : 196);
    text(`${i + 1}. ${item.name}`, width / 2 - 12, y);

    if (item.description) {
      fill(185, 168, 141);
      textSize(11);
      text(item.description, width / 2, y + 18);
      textSize(13);
    }
  }
}

function drawMessage() {
  if (!game.ui.message) return;

  push();
  fill(24, 20, 16, 210);
  rect(18, height - 42, width - 36, 32, 8);
  stroke(196, 172, 112, 180);
  rect(20, height - 40, width - 40, 28, 6);
  noStroke();

  fill(242, 228, 198, 220);
  textSize(11);
  textAlign(CENTER, CENTER);
  text(game.ui.message, width / 2, height - 24);
  textAlign(CENTER, CENTER);
  pop();
}

function drawDialogue() {
  const panel = game.ui.dialogue;
  if (!panel || !panel.active) return;

  const current = panel.lines[panel.index];
  if (!current) return;

  const boxX = 36;
  const boxY = height - 138;
  const boxW = width - 72;
  const boxH = 100;

  push();
  noStroke();
  fill(108, 86, 52, 110);
  rect(boxX, boxY, boxW, boxH, 14);

  fill(226, 212, 169, 240);
  rect(boxX + 6, boxY + 6, boxW - 12, boxH - 12, 12);

  fill(118, 94, 69, 120);
  rect(boxX + 12, boxY + 12, boxW - 24, boxH - 24, 10);

  for (let i = 0; i < 90; i++) {
    const px = boxX + 16 + ((i * 19) % (boxW - 40)) + noise(i * 13, frameCount * 0.02) * 3;
    const py = boxY + 18 + ((i * 23) % (boxH - 26)) + noise(i * 17, frameCount * 0.03) * 3;
    fill(120, 101, 74, 28);
    rect(px, py, 2, 2);
  }

  const portraitType = current.portrait || "maid";
  fill(89, 72, 58, 190);
  rect(boxX + 22, boxY + 20, 58, 58, 10);
  drawPortrait(portraitType, boxX + 51, boxY + 50, 28);

  fill(92, 63, 42, 210);
  textSize(13);
  textAlign(LEFT, CENTER);
  text(current.name, boxX + 100, boxY + 28);

  fill(128, 97, 62, 170);
  rect(boxX + 100, boxY + 38, 120, 2, 2);

  const visibleText = current.text.slice(0, panel.displayed);
  fill(56, 41, 31, 220);
  textSize(15);
  text(visibleText, boxX + 100, boxY + 66, boxW - 128, 32);
  textAlign(CENTER, CENTER);

  if (panel.displayed < current.text.length) {
    panel.displayed += 1;
  }

  if (panel.displayed >= current.text.length && (panel.canSkip || panel.index < panel.lines.length - 1)) {
    fill(120, 90, 62);
    textSize(11);
    text("[ 空格 繼續 ]", boxX + boxW - 96, boxY + boxH - 16);
  }
  pop();
}

function drawTitleScreen() {
  background(12, 15, 18);
  drawParticles();

  fill(18, 20, 24, 180);
  rect(0, 0, width, height);

  fill(204, 180, 120, 42);
  ellipse(width * 0.74, height * 0.18, 280, 260);
  fill(234, 203, 130, 70);
  ellipse(width * 0.74, height * 0.18, 170, 170);

  fill(18, 17, 15, 220);
  rect(width * 0.16, height * 0.14, width * 0.68, height * 0.72, 22);
  stroke(179, 148, 100, 110);
  rect(width * 0.16 + 2, height * 0.14 + 2, width * 0.68 - 4, height * 0.72 - 4, 22);
  noStroke();

  for (let i = 0; i < 120; i++) {
    fill(128, 110, 82, 18 + (i % 8));
    rect((i * 17) % width, (i * 29) % height, 2, 2);
  }

  fill(244, 222, 160);
  textSize(34);
  text("Moonlit Ruins", width / 2, height * 0.28);

  fill(222, 214, 195);
  textSize(15);
  text("多槽存檔 / 讀檔 / 結局系統", width / 2, height * 0.38);

  fill(192, 206, 216);
  textSize(15);
  text("Enter：新遊戲   1 / 2 / 3：讀取存檔", width / 2, height * 0.51);

  fill(203, 214, 223, 180);
  textSize(12);
  text("WASD / 方向鍵 移動   Z / 空白 互動   M 靜音", width / 2, height * 0.60);

  fill(177, 194, 205, 170);
  textSize(11);
  text("你可以在存檔石碑前按 S 儲存，並於標題畫面讀取槽位。", width / 2, height * 0.72);

  fill(244, 222, 160, 18);
  rect(width * 0.22, height * 0.10, width * 0.56, 18, 10);
}

function drawDeathScreen() {
  fill(12, 13, 16, 220);
  rect(0, 0, width, height);

  fill(200, 88, 90, 60);
  ellipse(width * 0.5, height * 0.34, 240, 240);
  fill(200, 88, 90, 20);
  ellipse(width * 0.5, height * 0.34, 300, 300);

  fill(214, 88, 90);
  textSize(30);
  text("你走進了黑暗", width / 2, height * 0.33);

  fill(236, 236, 236);
  textSize(14);
  text("你被「" + game.deathReason + "」吞沒，靈魂被重新拉回房間起點。", width / 2, height * 0.45);

  fill(170, 214, 186);
  textSize(13);
  text("按 Enter / 空白 鍵返回房間起點", width / 2, height * 0.58);
}

function drawEndingScreen() {
  fill(14, 16, 20, 220);
  rect(0, 0, width, height);

  fill(244, 216, 150, 72);
  ellipse(width * 0.5, height * 0.2, 320, 180);
  fill(244, 216, 150, 110);
  ellipse(width * 0.5, height * 0.2, 200, 110);

  fill(18, 16, 14, 200);
  rect(width * 0.18, height * 0.18, width * 0.64, height * 0.48, 18);
  stroke(225, 220, 180, 100);
  rect(width * 0.18 + 2, height * 0.18 + 2, width * 0.64 - 4, height * 0.48 - 4, 18);
  noStroke();

  fill(242, 220, 160);
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
  fill(15, 16, 16, 225);
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

function drawFilmVignette() {
  noStroke();
  for (let i = 0; i < 160; i++) {
    const x = (i * 41 + frameCount * 0.8) % width;
    const y = (i * 53 + frameCount * 0.6) % height;
    fill(255, 255, 255, 8 + (i % 4));
    rect(x, y, 2, 2);
  }

  const vignette = drawingContext.createRadialGradient(width / 2, height / 2, 80, width / 2, height / 2, width * 0.95);
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(0.65, "rgba(0,0,0,0.12)");
  vignette.addColorStop(1, "rgba(0,0,0,0.62)");
  drawingContext.fillStyle = vignette;
  drawingContext.fillRect(0, 0, width, height);
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

