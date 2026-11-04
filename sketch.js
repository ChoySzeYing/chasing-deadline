const TILE = 48;
let player;
let map;
let timeLeft;
let gameState = "game";
let bgImage = null;
let playerSprite = null;
let npcSprite = null;
let portalSprite = null;
let vignetteImage = null;

let dialog = {
  active: false,
  speaker: "",
  fullText: "",
  lines: [],
  timer: 0,
  charGap: 5,
  done: false,
  boxW: 540,
  boxH: 150
};

let npcs = [];

function setup() {
  createCanvas(960, 720);
  frameRate(24);
  imageMode(CENTER);
  textFont("Microsoft JhengHei, SimHei, sans-serif");

  map = [
    [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ];

  player = {
    x: 1,
    y: 0,
    dir: "down",
    step: 0
  };

  npcs.push({
    x: 10,
    y: 1,
    name: "阿玲",
    talk: "你終於醒了……這裡不是正常的房間。"
  });

  npcs.push({ x: 6, y: 2, name: "", portal: true });
  npcs.push({ x: 13, y: 4, name: "", portal: true });
  npcs.push({ x: 8, y: 7, name: "", portal: true });

  timeLeft = 80;
  setInterval(() => {
    if (gameState === "game" && !dialog.active) timeLeft--;
  }, 1000);

  generateBackground();
  generatePlayerSprite();
  generateNpcSprite();
  generatePortalSprite();
  generateVignette();
}

function draw() {
  background(12);
  if (gameState !== "game") return;

  image(bgImage, width / 2, height / 2);
  drawPlayerOnMap();
  drawNpcsOnMap();
  drawPortalsOnMap();
  drawLighting();
  drawUi();
  updateDialog();
  drawDialog();
  image(vignetteImage, width / 2, height / 2);
}

function generateBackground() {
  bgImage = createGraphics(width, height);
  bgImage.background(18, 20, 26);

  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      const px = x * TILE + TILE / 2;
      const py = y * TILE + TILE / 2;

      if (map[y][x] === 1) {
        drawWallTile(bgImage, px, py);
      } else {
        drawFloorTile(bgImage, px, py);
      }
    }
  }

  drawBackgroundDetails(bgImage);
}

function drawWallTile(g, px, py) {
  g.push();
  g.translate(px, py);

  g.fill(34, 36, 42);
  g.noStroke();
  g.rect(-TILE / 2, -TILE / 2, TILE, TILE);

  g.stroke(22, 24, 28);
  g.strokeWeight(2);
  g.rect(-TILE / 2 + 4, -TILE / 2 + 4, TILE - 8, TILE - 8);

  g.stroke(28, 30, 36);
  g.strokeWeight(1);
  g.line(0, -TILE / 2 + 4, 0, TILE / 2 - 4);
  g.line(-TILE / 2 + 4, 0, TILE / 2 - 4, 0);

  g.noStroke();
  g.fill(60, 64, 74, 180);
  g.rect(-TILE / 2 + 8, -TILE / 2 + 8, 8, 4);
  g.fill(20, 22, 26, 200);
  g.rect(-TILE / 2 + 22, TILE / 2 - 12, 6, 4);

  g.pop();
}

function drawFloorTile(g, px, py) {
  g.push();
  g.translate(px, py);

  g.fill(46, 48, 54);
  g.noStroke();
  g.rect(-TILE / 2, -TILE / 2, TILE, TILE);

  g.stroke(34, 36, 42);
  g.strokeWeight(1);
  g.line(-TILE / 2, -TILE / 2, TILE / 2, -TILE / 2);
  g.line(-TILE / 2, -TILE / 2, -TILE / 2, TILE / 2);

  g.noStroke();
  g.fill(38, 40, 46, 160);
  g.ellipse(-8, -6, 6, 3);
  g.ellipse(10, 8, 8, 3);

  g.pop();
}

function drawBackgroundDetails(g) {
  g.push();
  g.noStroke();

  for (let i = 0; i < 180; i++) {
    const rx = random(width);
    const ry = random(height);
    const ra = random(1, 3);
    const rb = random(30, 90);
    g.fill(120, 130, 150, rb);
    g.circle(rx, ry, ra);
  }

  g.pop();
}

function generatePlayerSprite() {
  playerSprite = createGraphics(64, 96);
  playerSprite.clear();
  playerSprite.imageMode(CENTER);

  playerSprite.push();
  playerSprite.translate(32, 48);

  playerSprite.noStroke();
  playerSprite.fill(0, 0, 0, 90);
  playerSprite.ellipse(0, 34, 26, 8);

  playerSprite.fill(210, 45, 72);
  playerSprite.stroke(140, 25, 48);
  playerSprite.strokeWeight(1.5);
  playerSprite.beginShape();
  playerSprite.vertex(-10, -22);
  playerSprite.vertex(10, -22);
  playerSprite.vertex(8, -34);
  playerSprite.vertex(-8, -34);
  playerSprite.endShape(CLOSE);

  playerSprite.fill(72, 156, 224);
  playerSprite.noStroke();
  playerSprite.ellipse(0, 4, 14, 18);

  playerSprite.fill(255, 214, 166);
  playerSprite.circle(0, -16, 16);

  playerSprite.fill(82, 54, 38);
  playerSprite.arc(0, -18, 18, 12, PI, TWO_PI);

  playerSprite.fill(16);
  playerSprite.ellipse(-4, -16, 2, 3);
  playerSprite.ellipse(4, -16, 2, 3);

  playerSprite.pop();
}

function generateNpcSprite() {
  npcSprite = createGraphics(64, 96);
  npcSprite.clear();
  npcSprite.imageMode(CENTER);

  npcSprite.push();
  npcSprite.translate(32, 48);

  npcSprite.noStroke();
  npcSprite.fill(0, 0, 0, 90);
  npcSprite.ellipse(0, 34, 26, 8);

  npcSprite.fill(114, 162, 210);
  npcSprite.stroke(70, 110, 160);
  npcSprite.strokeWeight(1.5);
  npcSprite.ellipse(0, 4, 14, 18);

  npcSprite.fill(255, 222, 184);
  npcSprite.noStroke();
  npcSprite.circle(0, -16, 16);

  npcSprite.fill(54, 36, 28);
  npcSprite.arc(0, -18, 18, 12, PI, TWO_PI);

  npcSprite.fill(16);
  npcSprite.ellipse(-4, -16, 2, 3);
  npcSprite.ellipse(4, -16, 2, 3);

  npcSprite.pop();
}

function generatePortalSprite() {
  portalSprite = createGraphics(64, 64);
  portalSprite.clear();
  portalSprite.imageMode(CENTER);

  portalSprite.push();
  portalSprite.translate(32, 32);

  portalSprite.noStroke();
  portalSprite.fill(255, 70, 70, 100);
  portalSprite.circle(0, 0, 40);

  portalSprite.fill(170, 32, 32);
  portalSprite.rect(-14, -14, 28, 28);

  portalSprite.fill(255, 110, 110);
  portalSprite.rect(-10, -10, 20, 20);

  portalSprite.pop();
}

function generateVignette() {
  vignetteImage = createGraphics(width, height);
  vignetteImage.clear();
  vignetteImage.noFill();

  for (let i = 0; i < 40; i++) {
    const alpha = map(i, 0, 40, 0, 180);
    vignetteImage.stroke(0, 0, 0, alpha);
    vignetteImage.strokeWeight(20);
    vignetteImage.rect(-i * 5, -i * 5, width + i * 10, height + i * 10);
  }
}

function drawPlayerOnMap() {
  const cx = player.x * TILE + TILE / 2;
  const cy = player.y * TILE + TILE / 2;
  const bob = player.step % 2 === 0 ? 0 : -1;
  image(playerSprite, cx, cy + bob);
}

function drawNpcsOnMap() {
  for (let n of npcs) {
    if (n.portal) continue;
    const cx = n.x * TILE + TILE / 2;
    const cy = n.y * TILE + TILE / 2;
    image(npcSprite, cx, cy);

    push();
    imageMode(CENTER);
    fill(255, 255, 255, 220);
    noStroke();
    textAlign(CENTER, BOTTOM);
    textSize(12);
    text(n.name, cx, cy - 42);
    pop();
  }
}

function drawPortalsOnMap() {
  for (let n of npcs) {
    if (!n.portal) continue;
    const cx = n.x * TILE + TILE / 2;
    const cy = n.y * TILE + TILE / 2;
    const pulse = sin(frameCount * 0.09) * 4;

    push();
    imageMode(CENTER);
    noStroke();
    fill(255, 80, 80, 60);
    circle(cx, cy, 36 + pulse);
    image(portalSprite, cx, cy);
    pop();
  }
}

function drawLighting() {
  const cx = player.x * TILE + TILE / 2;
  const cy = player.y * TILE + TILE / 2;

  push();
  imageMode(CENTER);
  noStroke();
  fill(255, 220, 140, 40);
  circle(cx, cy, 180);
  pop();
}

function drawUi() {
  push();
  noStroke();
  fill(255, 255, 255, 230);
  textAlign(LEFT, TOP);
  textSize(18);
  text(`時間：${timeLeft}s`, 24, 24);
  textAlign(RIGHT, TOP);
  text("目標｜離開迷宮", width - 24, 24);
  pop();
}

function canWalk(tx, ty) {
  if (ty < 0 || ty >= map.length || tx < 0 || tx >= map[0].length) return false;
  return map[ty][tx] === 0;
}

function tryMove(dx, dy) {
  if (dialog.active) return;
  const nx = player.x + dx;
  const ny = player.y + dy;
  if (canWalk(nx, ny)) {
    if (dx === 1) player.dir = "right";
    if (dx === -1) player.dir = "left";
    if (dy === 1) player.dir = "down";
    if (dy === -1) player.dir = "up";
    player.x = nx;
    player.y = ny;
    player.step++;
    checkNPC();
  }
}

function checkNPC() {
  for (let n of npcs) {
    if (player.x === n.x && player.y === n.y && !n.portal) {
      openDialog(n.name, n.talk);
    }
  }
}

function wrapTextChinese(str, maxW) {
  let out = [];
  let line = "";
  for (let ch of str) {
    if (textWidth(line + ch) < maxW) {
      line += ch;
    } else {
      out.push(line);
      line = ch;
    }
  }
  if (line) out.push(line);
  return out;
}

function openDialog(name, txt) {
  dialog.active = true;
  dialog.speaker = name;
  dialog.fullText = txt;
  dialog.displayed = "";
  dialog.lines = wrapTextChinese(txt, dialog.boxW - 48);
  dialog.timer = 0;
  dialog.done = false;
}

function updateDialog() {
  if (!dialog.active || dialog.done) return;
  dialog.timer++;
  if (dialog.timer >= dialog.charGap) {
    dialog.timer = 0;
    if (dialog.displayed.length < dialog.fullText.length) {
      dialog.displayed = dialog.fullText.substring(0, dialog.displayed.length + 1);
      dialog.lines = wrapTextChinese(dialog.displayed, dialog.boxW - 48);
    } else {
      dialog.done = true;
    }
  }
}

function drawDialog() {
  if (!dialog.active) return;
  push();

  const bx = width / 2 - dialog.boxW / 2;
  const by = height - 160;

  fill(10, 10, 16, 240);
  noStroke();
  rect(bx, by, dialog.boxW, dialog.boxH, 14);

  stroke(120, 90, 180);
  strokeWeight(2);
  rect(bx, by, dialog.boxW, dialog.boxH, 14);

  noStroke();
  fill(212, 204, 236);
  textSize(18);
  textAlign(LEFT, TOP);
  text(dialog.speaker, bx + 28, by + 18);

  fill(242);
  textSize(16);
  let lh = 26;
  for (let i = 0; i < dialog.lines.length; i++) {
    text(dialog.lines[i], bx + 28, by + 48 + i * lh);
  }

  if (dialog.done) {
    fill(170);
    textAlign(RIGHT, BOTTOM);
    textSize(14);
    text("[空格 繼續]", bx + dialog.boxW - 28, by + dialog.boxH - 18);
  }

  pop();
}

function handleSpace() {
  if (!dialog.active) return;
  if (!dialog.done) {
    dialog.displayed = dialog.fullText;
    dialog.lines = wrapTextChinese(dialog.fullText, dialog.boxW - 48);
    dialog.done = true;
  } else {
    dialog.active = false;
  }
}

function keyPressed() {
  if (key === " ") {
    handleSpace();
    return;
  }
  if (keyCode === UP_ARROW) tryMove(0, -1);
  if (keyCode === DOWN_ARROW) tryMove(0, 1);
  if (keyCode === LEFT_ARROW) tryMove(-1, 0);
  if (keyCode === RIGHT_ARROW) tryMove(1, 0);
}
