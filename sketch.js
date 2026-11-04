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

// 單一模組：對話系統
let dialogueState = null;
let flags = {
  introSeen: false,
  doorUnlocked: false,
  trapWarned: false
};

const dialogueScripts = {
  intro: [
    { speaker: "阿玲", name: "阿玲", avatar: "mage", text: "你終於醒了……這裡不是正常的房間。" },
    { speaker: "阿玲", name: "阿玲", avatar: "mage", text: "房門外的走廊沒有聲音，只有潮氣和腳步聲。" },
    { speaker: "阿玲", name: "阿玲", avatar: "mage", text: "如果你要離開，先找到那顆發亮的石心。" }
  ],
  doorLocked: [
    { speaker: "門", name: "木門", avatar: "door", text: "門栓住了，裡面傳來輕微的碰撞聲。" },
    { speaker: "門", name: "木門", avatar: "door", text: "看起來需要某樣東西來解鎖。" }
  ],
  doorUnlocked: [
    { speaker: "門", name: "木門", avatar: "door", text: "鎖頭轉動了一下，門開了一條縫。" }
  ],
  trap: [
    { speaker: "警示", name: "石碑", avatar: "stone", text: "『不該踩進陰影。』" },
    { speaker: "警示", name: "石碑", avatar: "stone", text: "字跡模糊，但你仍然能感覺到氣味變冷了。" }
  ]
};

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
  // 背景底色與天空層次
  noStroke();
  for (let y = 0; y < height; y++) {
    const ratio = y / height;
    const c = lerpColor(color(10, 16, 27), color(30, 46, 62), ratio);
    fill(c);
    rect(0, y, width, 1);
  }

  // 月亮光暈
  fill(247, 231, 172, 30);
  circle(width * 0.84, height * 0.18, 90);
  fill(247, 236, 186, 220);
  circle(width * 0.84, height * 0.18, 52);

  // 星星
  fill(255, 248, 212, 220);
  for (let i = 0; i < 24; i++) {
    const x = ((i * 83) % width) + 12;
    const y = ((i * 53) % (height * 0.58)) + 10;
    const size = i % 3 === 0 ? 3 : 2;
    rect(x, y, size, size);
  }

  // 遠景山脈（多層）
  fill(18, 30, 42, 170);
  triangle(0, height * 0.73, width * 0.18, height * 0.52, width * 0.38, height * 0.73);
  triangle(width * 0.24, height * 0.75, width * 0.55, height * 0.45, width * 0.8, height * 0.75);
  triangle(width * 0.65, height * 0.72, width * 0.90, height * 0.54, width, height * 0.72);

  fill(25, 38, 50, 180);
  triangle(0, height * 0.78, width * 0.22, height * 0.62, width * 0.44, height * 0.78);
  triangle(width * 0.30, height * 0.80, width * 0.60, height * 0.58, width * 0.86, height * 0.80);

  // 地面與光影
  fill(19, 29, 39, 160);
  rect(0, height * 0.72, width, height * 0.28);
  fill(255, 255, 255, 14);
  rect(0, height * 0.72, width, 8);
}

function drawGameScene() {
  drawMap();
  drawObstacles();
  drawGoal();
  drawNpc();
  drawPlayer();
  drawHud();

  if (dialogueState && dialogueState.active) {
    drawDialoguePanel();
  } else if (showMessage) {
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
  openDialogue("intro");
  flags.introSeen = true;
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
  if (dialogueState && dialogueState.active) {
    if (key === " " || key === "z" || key === "Z" || keyCode === ENTER) {
      if (dialogueState.displayed < dialogueState.currentText.length) {
        dialogueState.displayed = dialogueState.currentText.length;
      } else {
        advanceDialogue();
      }
    }
    return;
  }

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

  if (key === " " || key === "Spacebar" || key === "z" || key === "Z") {
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

  // 影子
  fill(0, 0, 0, 35);
  ellipse(px, py + 18, 22, 10);

  // 斗篷與衣服
  fill(107, 153, 190);
  rect(px - 11, py - 1, 22, 16);
  fill(77, 110, 134);
  triangle(px - 11, py + 9, px, py - 12, px + 11, py + 9);

  // 頭部
  fill(236, 196, 138);
  ellipse(px, py - 13, 15, 15);

  // 髮型
  fill(65, 82, 95);
  rect(px - 8, py - 19, 16, 6);

  // 眼睛
  fill(28, 44, 58);
  rect(px - 3, py - 13, 2, 2);
  rect(px + 1, py - 13, 2, 2);

  // 胡子
  fill(78, 92, 103);
  rect(px - 5, py - 8, 10, 4);

  // 手臂
  fill(236, 196, 138);
  rect(px - 14, py + 1, 4, 11);
  rect(px + 10, py + 1, 4, 11);

  // 腿
  fill(50, 72, 92);
  rect(px - 6, py + 14, 5, 9);
  rect(px + 1, py + 14, 5, 9);
}

function drawPlayer() {
  const px = player.x * TILE + TILE / 2;
  const py = player.y * TILE + TILE / 2;

  // 地面陰影
  fill(0, 0, 0, 35);
  ellipse(px, py + 19, 20, 8);

  // 斗篷
  fill(146, 92, 58);
  triangle(px - 12, py + 2, px, py - 14, px + 12, py + 2);

  // 頭部與髮型
  fill(240, 205, 150);
  ellipse(px, py - 12, 14, 15);
  fill(83, 59, 42);
  rect(px - 8, py - 17, 16, 6);

  // 衣服主體
  fill(170, 110, 77);
  rect(px - 9, py - 2, 18, 13);

  // 肩膀與手臂
  fill(240, 205, 150);
  rect(px - 13, py - 1, 4, 12);
  rect(px + 9, py - 1, 4, 12);

  // 腿
  fill(62, 83, 116);
  rect(px - 6, py + 11, 5, 11);
  rect(px + 1, py + 11, 5, 11);

  // 鞋子
  fill(38, 49, 65);
  rect(px - 7, py + 21, 6, 3);
  rect(px + 1, py + 21, 6, 3);

  // 面部細節
  fill(52, 38, 28);
  rect(px - 3, py - 13, 2, 2);
  rect(px + 1, py - 13, 2, 2);

  fill(179, 135, 103);
  rect(px - 4, py - 7, 8, 3);
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

function openDialogue(scriptId) {
  const script = dialogueScripts[scriptId];
  if (!script) return;

  dialogueState = {
    active: true,
    scriptId,
    index: 0,
    displayed: 0,
    currentText: script[0].text,
    currentLine: script[0]
  };

  updateDialogueText();
}

function updateDialogueText() {
  if (!dialogueState || !dialogueState.active) return;

  const current = getCurrentDialogueLine();
  if (!current) return;

  dialogueState.currentLine = current;
  dialogueState.currentText = current.text;
  dialogueState.displayed = Math.min(dialogueState.displayed, dialogueState.currentText.length);
}

function getCurrentDialogueLine() {
  if (!dialogueState || !dialogueState.scriptId) return null;
  const script = dialogueScripts[dialogueState.scriptId];
  if (!script || dialogueState.index >= script.length) return null;
  return script[dialogueState.index];
}

function advanceDialogue() {
  if (!dialogueState || !dialogueState.active) return;

  const script = dialogueScripts[dialogueState.scriptId];
  if (!script) {
    dialogueState = null;
    return;
  }

  dialogueState.index += 1;

  if (dialogueState.index >= script.length) {
    dialogueState = null;
    return;
  }

  dialogueState.displayed = 0;
  updateDialogueText();
}

function drawDialoguePanel() {
  if (!dialogueState || !dialogueState.currentLine) return;

  const panelX = 32;
  const panelY = height - 118;
  const panelW = width - 64;
  const panelH = 92;

  fill(16, 22, 30, 220);
  rect(panelX, panelY, panelW, panelH, 10);

  // 頭像框
  const avatarBox = { x: panelX + 16, y: panelY + 16, w: 42, h: 42 };
  fill(30, 42, 52);
  rect(avatarBox.x, avatarBox.y, avatarBox.w, avatarBox.h, 8);

  drawAvatarPortrait(dialogueState.currentLine.avatar, avatarBox.x + 21, avatarBox.y + 21);

  // 名字標籤
  fill(245, 211, 116);
  textSize(14);
  text(dialogueState.currentLine.name, panelX + 72, panelY + 28);

  // 文字內容
  fill(237, 244, 248);
  textSize(15);
  const visibleText = dialogueState.currentText.slice(0, dialogueState.displayed);
  text(visibleText, panelX + 72, panelY + 54, panelW - 92, 42);

  // 繼續提示
  if (dialogueState.displayed >= dialogueState.currentText.length) {
    fill(170, 220, 180);
    textSize(12);
    text("按 空白 / Z 繼續", panelX + panelW - 110, panelY + panelH - 16);
  }

  // 逐字輸出動畫
  if (dialogueState.displayed < dialogueState.currentText.length) {
    dialogueState.displayed += 1;
  }
}

function drawAvatarPortrait(type, cx, cy) {
  if (type === "mage") {
    fill(126, 164, 192);
    rect(cx - 12, cy - 8, 24, 22);
    fill(236, 196, 138);
    ellipse(cx, cy - 12, 12, 12);
    fill(70, 90, 110);
    rect(cx - 5, cy - 8, 10, 4);
  } else if (type === "door") {
    fill(122, 85, 58);
    rect(cx - 12, cy - 10, 24, 20);
    fill(79, 60, 46);
    rect(cx - 3, cy - 2, 6, 14);
  } else if (type === "stone") {
    fill(130, 136, 143);
    rect(cx - 12, cy - 10, 24, 20);
    fill(202, 214, 220);
    rect(cx - 4, cy - 4, 8, 8);
  }
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
