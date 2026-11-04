// Pixel Maze RPG
// - p5.js 單一繪圖核心
// - 使用 HTML5 Audio 播放背景音樂，不使用 Web Audio / Oscillator
// - 可直接部署到 GitHub Pages

const MAP = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 3, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 1, 2, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

const TILE = 32;
const PLAYER_SPEED = 1;

let player;
let goal = { x: 9, y: 9 };
let npc = { x: 8, y: 2 };
let gameWon = false;
let messageText = "";
let showMessage = false;
let messageTimer = 0;

const npcDialogues = [
  "冒險者，寶石就在東北邊的迷宮深處。",
  "小心，牆裡常有陷阱。",
  "你能聽見石壁後面傳來古老的回聲。",
  "通過迷宮後，願你帶著光芒回來。"
];

const starPositions = [
  [30, 40], [60, 50], [100, 30], [160, 45], [220, 36],
  [280, 58], [330, 42], [390, 24], [430, 52], [470, 38],
  [80, 80], [160, 90], [230, 82], [350, 88], [430, 96]
];

function setup() {
  const canvas = createCanvas(MAP[0].length * TILE, MAP.length * TILE);
  canvas.parent("game");

  noStroke();
  rectMode(CORNER);
  textAlign(CENTER, CENTER);
  textFont("monospace");

  findStartPosition();
  setupBgm();
}

function draw() {
  drawBackground();
  drawMap();
  drawGoal();
  drawNpc();
  drawPlayer();

  drawPrompt();

  if (showMessage) {
    drawDialogueBox();
  }

  if (gameWon) {
    drawWinScreen();
  }

  if (showMessage && messageTimer > 0) {
    messageTimer--;
    if (messageTimer === 0) {
      showMessage = false;
      messageText = "";
    }
  }
}

function drawBackground() {
  // 夜晚天空：深藍與紫色漸層
  const top = color(12, 17, 29);
  const mid = color(30, 45, 61);
  const bottom = color(18, 27, 37);

  for (let y = 0; y < height; y++) {
    const t = y / height;
    const c = lerpColor(top, bottom, t);
    stroke(c);
    line(0, y, width, y);
  }

  // 月亮
  fill(244, 235, 191, 220);
  noStroke();
  circle(width * 0.82, height * 0.18, 42);

  // 星星
  fill(255, 255, 220, 210);
  starPositions.forEach(([x, y]) => {
    rect(x, y, 2, 2);
  });

  // 遠景山脈
  fill(26, 39, 50, 180);
  triangle(0, height * 0.72, width * 0.18, height * 0.52, width * 0.38, height * 0.72);
  triangle(width * 0.26, height * 0.74, width * 0.5, height * 0.48, width * 0.72, height * 0.74);
  triangle(width * 0.68, height * 0.72, width * 0.84, height * 0.54, width, height * 0.72);

  // 地面霧氣
  fill(17, 27, 37, 130);
  rect(0, height * 0.72, width, height * 0.28);
}

function findStartPosition() {
  for (let y = 0; y < MAP.length; y++) {
    for (let x = 0; x < MAP[y].length; x++) {
      if (MAP[y][x] === 3) {
        player = { x, y };
        MAP[y][x] = 0;
        return;
      }
    }
  }

  player = { x: 1, y: 1 };
}

function keyPressed() {
  if (gameWon) {
    if (key === "r" || key === "R") {
      resetGame();
    }
    return;
  }

  if (key === " " || key === "Spacebar") {
    talkToNpc();
    return;
  }

  let dx = 0;
  let dy = 0;

  if (keyCode === LEFT_ARROW) dx = -PLAYER_SPEED;
  else if (keyCode === RIGHT_ARROW) dx = PLAYER_SPEED;
  else if (keyCode === UP_ARROW) dy = -PLAYER_SPEED;
  else if (keyCode === DOWN_ARROW) dy = PLAYER_SPEED;

  if (dx !== 0 || dy !== 0) {
    attemptMove(dx, dy);
  }
}

function attemptMove(dx, dy) {
  const nextX = player.x + dx;
  const nextY = player.y + dy;

  if (isWall(nextX, nextY)) {
    return;
  }

  player.x = nextX;
  player.y = nextY;

  if (player.x === goal.x && player.y === goal.y) {
    gameWon = true;
  }
}

function isWall(x, y) {
  if (x < 0 || y < 0 || y >= MAP.length || x >= MAP[0].length) {
    return true;
  }

  return MAP[y][x] === 1;
}

function drawMap() {
  for (let y = 0; y < MAP.length; y++) {
    for (let x = 0; x < MAP[y].length; x++) {
      const px = x * TILE;
      const py = y * TILE;
      const tile = MAP[y][x];

      if (tile === 1) {
        fill(95, 110, 123);
        rect(px, py, TILE, TILE);

        fill(69, 81, 92);
        rect(px + 3, py + 3, TILE - 6, TILE - 6);
      } else {
        fill(42, 62, 77);
        rect(px, py, TILE, TILE);

        fill(58, 79, 92);
        rect(px + 2, py + 2, TILE - 4, TILE - 4);
      }
    }
  }
}

function drawGoal() {
  const px = goal.x * TILE + TILE / 2;
  const py = goal.y * TILE + TILE / 2;

  fill(247, 214, 102);
  rect(px - 8, py - 8, 16, 16);

  fill(255, 234, 138);
  triangle(px, py - 12, px + 8, py + 6, px - 8, py + 6);

  fill(255, 248, 203);
  rect(px - 3, py - 1, 6, 10);
}

function drawNpc() {
  const px = npc.x * TILE + TILE / 2;
  const py = npc.y * TILE + TILE / 2;

  fill(152, 212, 244);
  rect(px - 8, py - 11, 16, 14);

  fill(152, 212, 244);
  rect(px - 10, py + 3, 20, 12);

  fill(38, 62, 72);
  rect(px - 3, py - 7, 2, 2);
  rect(px + 1, py - 7, 2, 2);
}

function drawPlayer() {
  const px = player.x * TILE + TILE / 2;
  const py = player.y * TILE + TILE / 2;

  fill(247, 201, 138);
  rect(px - 6, py - 12, 12, 10);

  fill(247, 201, 138);
  rect(px - 7, py - 2, 14, 12);

  fill(70, 58, 44);
  rect(px - 8, py + 10, 5, 4);
  rect(px + 3, py + 10, 5, 4);

  fill(82, 60, 46);
  rect(px - 3, py - 9, 2, 2);
  rect(px + 1, py - 9, 2, 2);
}

function talkToNpc() {
  const distance = abs(player.x - npc.x) + abs(player.y - npc.y);

  if (distance <= 1) {
    const pick = floor(random(npcDialogues.length));
    messageText = npcDialogues[pick];
    showMessage = true;
    messageTimer = 180;
  }
}

function drawPrompt() {
  const distance = abs(player.x - npc.x) + abs(player.y - npc.y);

  if (distance <= 1 && !gameWon) {
    fill(246, 210, 122);
    textSize(12);
    text("按空白鍵對話", player.x * TILE + TILE / 2, player.y * TILE - 12);
  }
}

function drawDialogueBox() {
  const boxX = 18;
  const boxY = height - 66;
  const boxW = width - 36;
  const boxH = 42;

  fill(17, 25, 33, 220);
  rect(boxX, boxY, boxW, boxH, 8);

  fill(237, 244, 248);
  textSize(14);
  text(messageText, boxX + boxW / 2, boxY + boxH / 2 + 2);
}

function drawWinScreen() {
  fill(18, 25, 31, 200);
  rect(0, 0, width, height);

  fill(247, 214, 102);
  textSize(28);
  text("寶石取得！", width / 2, height / 2 - 12);

  fill(220, 232, 240);
  textSize(16);
  text("按 R 重新開始", width / 2, height / 2 + 20);
}

function resetGame() {
  for (let y = 0; y < MAP.length; y++) {
    for (let x = 0; x < MAP[y].length; x++) {
      if (MAP[y][x] === 3) {
        MAP[y][x] = 0;
      }
    }
  }

  player = { x: 1, y: 1 };
  gameWon = false;
  showMessage = false;
  messageText = "";
  messageTimer = 0;
}

function setupBgm() {
  const bgm = document.getElementById("bgm");
  if (!bgm) {
    return;
  }

  bgm.volume = 0.35;

  const startAudio = () => {
    bgm.play().catch(() => {
      // 如果被瀏覽器限制，等到使用者下一次互動後再嘗試
    });
  };

  window.addEventListener("pointerdown", startAudio, { once: true });
  window.addEventListener("keydown", startAudio, { once: true });
}
