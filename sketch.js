// Pixel Maze RPG
// - 只使用 p5.js，沒有任何音效與 Web Audio API。
// - 適合直接部署到 GitHub Pages。
// - 走到終點寶石即可過關。

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

const TILE = 24;

let player;
let goal = { x: 9, y: 9 };
let gameWon = false;

function setup() {
  const canvas = createCanvas(MAP[0].length * TILE, MAP.length * TILE);
  canvas.parent("game");

  noStroke();
  rectMode(CORNER);
  textFont("monospace");

  findStartPosition();
}

function draw() {
  background(16, 23, 31);

  drawMap();
  drawGoal();
  drawPlayer();

  if (gameWon) {
    drawWinScreen();
  }
}

// 先找到起點，並把地圖中的起點轉成可走地面
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

  // 若沒有起點，預設 1,1
  player = { x: 1, y: 1 };
}

function drawMap() {
  for (let y = 0; y < MAP.length; y++) {
    for (let x = 0; x < MAP[y].length; x++) {
      const px = x * TILE;
      const py = y * TILE;
      const tile = MAP[y][x];

      if (tile === 1) {
        // 牆壁
        fill(95, 111, 126);
        rect(px, py, TILE, TILE);

        // 牆身陰影與細節
        fill(67, 80, 90);
        rect(px + 3, py + 3, TILE - 6, TILE - 6);
      } else {
        // 地板
        fill(36, 52, 66);
        rect(px, py, TILE, TILE);

        fill(51, 67, 79);
        rect(px + 2, py + 2, TILE - 4, TILE - 4);
      }
    }
  }
}

function drawGoal() {
  const px = goal.x * TILE + TILE / 2;
  const py = goal.y * TILE + TILE / 2;

  // 寶石外框
  fill(245, 219, 130);
  rect(px - 8, py - 6, 16, 12);

  // 寶石主體
  fill(255, 219, 109);
  triangle(px, py - 10, px + 6, py + 4, px - 6, py + 4);
  fill(255, 242, 189);
  rect(px - 3, py - 2, 6, 8);
}

function drawPlayer() {
  const px = player.x * TILE + TILE / 2;
  const py = player.y * TILE + TILE / 2;

  // 頭
  fill(246, 195, 101);
  rect(px - 6, py - 12, 12, 10);

  // 身體
  fill(246, 195, 101);
  rect(px - 7, py - 2, 14, 12);

  // 腳
  fill(55, 46, 40);
  rect(px - 8, py + 10, 5, 4);
  rect(px + 3, py + 10, 5, 4);

  // 臉部細節
  fill(80, 60, 45);
  rect(px - 3, py - 9, 2, 2);
  rect(px + 1, py - 9, 2, 2);
}

function keyPressed() {
  if (gameWon) {
    if (key === "r" || key === "R") {
      resetGame();
    }
    return;
  }

  let dx = 0;
  let dy = 0;

  if (keyCode === LEFT_ARROW) dx = -1;
  else if (keyCode === RIGHT_ARROW) dx = 1;
  else if (keyCode === UP_ARROW) dy = -1;
  else if (keyCode === DOWN_ARROW) dy = 1;

  if (dx === 0 && dy === 0) return;

  attemptMove(dx, dy);
}

function attemptMove(dx, dy) {
  const nextX = player.x + dx;
  const nextY = player.y + dy;

  if (isWall(nextX, nextY)) {
    return; // 碰牆，不能穿過
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

function drawWinScreen() {
  fill(18, 24, 31, 200);
  rect(0, 0, width, height);

  fill(247, 211, 125);
  textAlign(CENTER, CENTER);
  textSize(28);
  text("寶石取得！", width / 2, height / 2 - 12);

  fill(220, 233, 240);
  textSize(16);
  text("按 R 重新開始", width / 2, height / 2 + 20);
}

function resetGame() {
  // 重新建回初始地圖
  for (let y = 0; y < MAP.length; y++) {
    for (let x = 0; x < MAP[y].length; x++) {
      if (MAP[y][x] === 3) {
        MAP[y][x] = 0;
      }
    }
  }

  // 重新設定玩家起點
  player = { x: 1, y: 1 };

  // 保持目標位置不變
  gameWon = false;
}
