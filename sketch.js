const MAP = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 3, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1],
  [1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1],
  [1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 0, 2, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

const TILE = 38;
const PLAYER_SPEED = 1;
const TOTAL_TIME = 90;

let state = "title";
let player;
let goal = { x: 9, y: 9 };
let npc = { x: 8, y: 2 };
let obstacles = [
  { x: 4, y: 3 },
  { x: 7, y: 2 },
  { x: 4, y: 6 },
  { x: 8, y: 7 },
  { x: 2, y: 8 }
];

let messageText = "";
let showMessage = false;
let messageTimer = 0;
let startTime = 0;
let timeLeft = TOTAL_TIME;

const npcDialogues = [
  "冒險者，寶石就在迷宮深處，時間不多了。",
  "遠處的石柱會擋住你的路，先避開它們。",
  "月光下，真正的勇者會在倒數中前進。",
  "拿到寶石就能離開這座古老迷宮。"
];

function setup() {
  const canvas = createCanvas(MAP[0].length * TILE, MAP.length * TILE);
  canvas.parent("game");

  noStroke();
  rectMode(CORNER);
  textAlign(CENTER, CENTER);
  textFont("monospace");

  resetGame();
  setupBgm();
}

function draw() {
  drawBackground();

  if (state === "title") {
    drawTitleScreen();
    return;
  }

  if (state === "playing") {
    updateGameState();
    drawGameScene();
    return;
  }

  if (state === "victory") {
    drawVictoryScreen();
    return;
  }

  if (state === "gameover") {
    drawGameOverScreen();
  }
}

function updateGameState() {
  timeLeft = max(0, TOTAL_TIME - (millis() - startTime) / 1000);
  if (timeLeft <= 0) {
    state = "gameover";
    timeLeft = 0;
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
  fill(12, 18, 26);
  rect(0, 0, width, height);

  for (let y = 0; y < height; y++) {
    const ratio = y / height;
    const base = lerpColor(color(11, 18, 30), color(34, 52, 66), ratio);
    stroke(base);
    line(0, y, width, y);
  }

  // 月亮
  noStroke();
  fill(247, 236, 186, 220);
  circle(width * 0.84, height * 0.18, 54);

  // 星星
  fill(255, 246, 206, 220);
  for (let i = 0; i < 18; i++) {
    const x = (i * 79) % width;
    const y = ((i * 37) % (height * 0.55)) + 12;
    rect(x, y, 2, 2);
  }

  // 山脈
  fill(19, 30, 41, 200);
  triangle(0, height * 0.72, width * 0.17, height * 0.52, width * 0.38, height * 0.72);
  triangle(width * 0.24, height * 0.74, width * 0.52, height * 0.46, width * 0.8, height * 0.74);
  triangle(width * 0.68, height * 0.72, width * 0.88, height * 0.55, width, height * 0.72);

  // 地面霧氣
  fill(20, 34, 46, 160);
  rect(0, height * 0.72, width, height * 0.28);
}

function drawGameScene() {
  drawMap();
  drawObstacles();
  drawGoal();
  drawNpc();
  drawPlayer();
  drawHud();

  if (showMessage) {
    drawDialogueBox();
  }
}

function drawTitleScreen() {
  // 深色半透明遮罩
  fill(9, 14, 20, 200);
  rect(0, 0, width, height);

  fill(247, 214, 118);
  textSize(34);
  text("Moonlit Ruins", width / 2, height / 2 - 35);

  fill(228, 238, 245);
  textSize(16);
  text("迷宮探險 RPG", width / 2, height / 2 + 4);

  fill(175, 214, 176);
  textSize(14);
  text("按 Enter 開始冒險", width / 2, height / 2 + 52);

  textSize(12);
  fill(210, 220, 228);
  text("方向鍵移動 • 空白鍵對話 • R 重置", width / 2, height / 2 + 80);
}

function drawVictoryScreen() {
  fill(9, 16, 22, 210);
  rect(0, 0, width, height);

  fill(247, 214, 102);
  textSize(32);
  text("寶石取得！", width / 2, height / 2 - 18);

  fill(228, 241, 250);
  textSize(16);
  text("你成功離開古老迷宮", width / 2, height / 2 + 18);

  fill(179, 225, 181);
  textSize(14);
  text("按 R 再玩一次", width / 2, height / 2 + 48);
}

function drawGameOverScreen() {
  fill(18, 10, 16, 220);
  rect(0, 0, width, height);

  fill(240, 110, 110);
  textSize(30);
  text("時間到了！", width / 2, height / 2 - 20);

  fill(228, 241, 250);
  textSize(16);
  text("你未能在月光前取得寶石", width / 2, height / 2 + 18);

  fill(179, 225, 181);
  textSize(14);
  text("按 R 重新開始", width / 2, height / 2 + 48);
}

function resetGame() {
  findStartPosition();
  startTime = millis();
  state = "title";
  showMessage = false;
  messageText = "";
  messageTimer = 0;
  timeLeft = TOTAL_TIME;
}

function startGame() {
  state = "playing";
  startTime = millis();
  timeLeft = TOTAL_TIME;
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
  if (state === "title") {
    if (key === "Enter") {
      startGame();
    }
    return;
  }

  if (state === "victory" || state === "gameover") {
    if (key === "r" || key === "R") {
      resetGame();
      state = "title";
    }
    return;
  }

  if (key === " " || key === "Spacebar") {
    talkToNpc();
    return;
  }

  if (key === "r" || key === "R") {
    resetGame();
    state = "title";
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

  if (isWall(nextX, nextY) || isObstacle(nextX, nextY)) {
    return;
  }

  player.x = nextX;
  player.y = nextY;

  if (player.x === goal.x && player.y === goal.y) {
    state = "victory";
  }
}

function isWall(x, y) {
  if (x < 0 || y < 0 || y >= MAP.length || x >= MAP[0].length) {
    return true;
  }

  return MAP[y][x] === 1;
}

function isObstacle(x, y) {
  return obstacles.some((obs) => obs.x === x && obs.y === y);
}

function drawMap() {
  for (let y = 0; y < MAP.length; y++) {
    for (let x = 0; x < MAP[y].length; x++) {
      const px = x * TILE;
      const py = y * TILE;
      const tile = MAP[y][x];

      if (tile === 1) {
        fill(93, 108, 119);
        rect(px, py, TILE, TILE);

        fill(66, 78, 89);
        rect(px + 3, py + 3, TILE - 6, TILE - 6);
      } else {
        fill(37, 57, 71);
        rect(px, py, TILE, TILE);

        fill(58, 77, 91);
        rect(px + 2, py + 2, TILE - 4, TILE - 4);
      }
    }
  }
}

function drawObstacles() {
  obstacles.forEach((obs) => {
    const px = obs.x * TILE + TILE / 2;
    const py = obs.y * TILE + TILE / 2;

    fill(162, 96, 74);
    rect(px - 11, py - 11, 22, 22);

    fill(103, 65, 55);
    triangle(px - 12, py + 10, px, py - 11, px + 12, py + 10);
  });
}

function drawGoal() {
  const px = goal.x * TILE + TILE / 2;
  const py = goal.y * TILE + TILE / 2;

  fill(248, 214, 101);
  rect(px - 10, py - 10, 20, 20);

  fill(255, 240, 162);
  triangle(px, py - 15, px + 9, py + 6, px - 9, py + 6);

  fill(255, 248, 210);
  rect(px - 3, py - 1, 6, 10);
}

function drawNpc() {
  const px = npc.x * TILE + TILE / 2;
  const py = npc.y * TILE + TILE / 2;

  fill(0, 0, 0, 40);
  ellipse(px, py + 18, 22, 10);

  fill(117, 192, 230);
  rect(px - 11, py - 2, 22, 18);

  fill(236, 196, 138);
  ellipse(px, py - 12, 16, 16);

  fill(38, 56, 68);
  rect(px - 3, py - 13, 2, 2);
  rect(px + 1, py - 13, 2, 2);

  fill(74, 94, 103);
  rect(px - 5, py - 8, 10, 4);
}

function drawPlayer() {
  const px = player.x * TILE + TILE / 2;
  const py = player.y * TILE + TILE / 2;

  fill(0, 0, 0, 40);
  ellipse(px, py + 18, 20, 8);

  fill(128, 85, 58);
  triangle(px - 10, py + 2, px, py - 14, px + 10, py + 2);

  fill(242, 197, 143);
  ellipse(px, py - 12, 14, 15);

  fill(67, 42, 31);
  rect(px - 8, py - 17, 16, 5);

  fill(144, 97, 76);
  rect(px - 8, py - 2, 16, 12);

  fill(242, 197, 143);
  rect(px - 12, py - 1, 4, 12);
  rect(px + 8, py - 1, 4, 12);

  fill(54, 74, 98);
  rect(px - 6, py + 10, 5, 10);
  rect(px + 1, py + 10, 5, 10);

  fill(62, 46, 36);
  rect(px - 3, py - 13, 2, 2);
  rect(px + 1, py - 13, 2, 2);
}

function drawHud() {
  const timerText = "時間: " + ceil(timeLeft) + "s";

  fill(18, 28, 37, 220);
  rect(12, 12, 120, 32, 8);
  fill(248, 211, 116);
  textSize(16);
  text(timerText, 72, 30);

  if (player.x === npc.x && player.y === npc.y) {
    fill(255, 255, 255, 210);
    textSize(11);
    text("NPC", player.x * TILE + TILE / 2, player.y * TILE - 24);
  }
}

function talkToNpc() {
  const distance = abs(player.x - npc.x) + abs(player.y - npc.y);

  if (distance <= 1) {
    const pick = floor(random(npcDialogues.length));
    messageText = npcDialogues[pick];
    showMessage = true;
    messageTimer = 200;
  }
}

function drawDialogueBox() {
  const boxX = 18;
  const boxY = height - 62;
  const boxW = width - 36;
  const boxH = 46;

  fill(18, 27, 35, 230);
  rect(boxX, boxY, boxW, boxH, 10);

  fill(237, 244, 248);
  textSize(14);
  text(messageText, boxX + boxW / 2, boxY + boxH / 2 + 2);
}

function setupBgm() {
  const bgm = document.getElementById("bgm");
  if (!bgm) {
    return;
  }

  bgm.volume = 0.38;

  const startAudio = () => {
    bgm.play().catch(() => {
      // 瀏覽器可能阻止自動播放，等到使用者互動後再試一次
    });
  };

  window.addEventListener("pointerdown", startAudio, { once: true });
  window.addEventListener("keydown", startAudio, { once: true });
}
