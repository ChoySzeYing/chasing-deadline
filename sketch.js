let cols = 21;
let rows = 15;
let w = 48;

let maze = [];
let player = { x: 1, y: 1, dir: 0 };
let goal = { x: 19, y: 13 };
let ghosts = [];
let gameState = "start";
let startTime = 0;
let elapsedTime = 0;
let hitCooldown = 0;

let bgOsc, bgEnv;
let hitOsc, hitEnv;
let winOsc, winEnv;
let ghostOsc, ghostEnv;
let audioStarted = false;

function setup() {
  createCanvas(cols * w, rows * w);
  initMaze();
  initGhosts();
}

function draw() {
  drawBackground();

  if (gameState === "start") {
    drawStartScreen();
    return;
  }

  if (gameState === "playing") {
    elapsedTime = floor((millis() - startTime) / 1000);

    if (hitCooldown > 0) hitCooldown--;

    updateGhosts();
    checkGhostCollision();
  }

  drawMaze();
  drawGoal();
  drawGhosts();
  drawPlayer();
  drawUI();

  if (gameState === "win") {
    drawWinScreen();
  }

  if (gameState === "lose") {
    drawLoseScreen();
  }
}

function initAudio() {
  if (audioStarted) return;
  audioStarted = true;

  bgOsc = new p5.Oscillator("sine");
  bgEnv = new p5.Envelope(0.02, 0.18, 0.25, 1.2);
  bgOsc.amp(bgEnv);
  bgOsc.start();
  playBGM();

  hitOsc = new p5.Oscillator("square");
  hitEnv = new p5.Envelope(0.005, 0.1, 0, 0.12);
  hitOsc.amp(hitEnv);
  hitOsc.start();

  winOsc = new p5.Oscillator("sine");
  winEnv = new p5.Envelope(0.01, 0.35, 0.4, 1.8);
  winOsc.amp(winEnv);
  winOsc.start();

  ghostOsc = new p5.Oscillator("sawtooth");
  ghostEnv = new p5.Envelope(0.01, 0.08, 0, 0.1);
  ghostOsc.amp(ghostEnv);
  ghostOsc.start();
}

function playBGM() {
  if (!bgOsc || gameState !== "playing") return;
  let notes = [146.83, 130.81, 116.54, 130.81];
  let i = 0;
  function next() {
    if (gameState !== "playing") return;
    bgOsc.freq(notes[i]);
    bgEnv.play();
    i = (i + 1) % notes.length;
    setTimeout(next, 760);
  }
  next();
}

function playHitSound() {
  if (!hitOsc) return;
  hitOsc.freq(90);
  hitEnv.play();
}

function playWinSound() {
  if (!winOsc) return;
  winOsc.freq(523.25);
  setTimeout(() => winOsc.freq(659.25), 160);
  setTimeout(() => winOsc.freq(783.99), 340);
  setTimeout(() => winOsc.freq(1046.50), 520);
  winEnv.play();
}

function playLoseSound() {
  if (!ghostOsc) return;
  ghostOsc.freq(180);
  setTimeout(() => ghostOsc.freq(140), 220);
  setTimeout(() => ghostOsc.freq(110), 440);
  ghostEnv.play();
}

function drawBackground() {
  background(12, 16, 28);

  noStroke();
  for (let i = 0; i < 70; i++) {
    let sx = (i * 97 + frameCount * 0.01) % width;
    let sy = (i * 53) % height;
    fill(120, 140, 180, 30);
    circle(sx, sy, 1);
  }

  fill(18, 24, 42, 180);
  beginShape();
  for (let x = 0; x <= width; x += 28) {
    let y = height - 120 - sin(x * 0.008) * 30 - noise(x * 0.01) * 24;
    vertex(x, y);
  }
  vertex(width, height);
  vertex(0, height);
  endShape(CLOSE);

  noFill();
  stroke(120, 90, 180, 140);
  strokeWeight(4);
  rect(8, 8, width - 16, height - 16, 18);
  noStroke();
}

function drawStartScreen() {
  fill(0, 0, 0, 170);
  rect(0, 0, width, height);
  textAlign(CENTER, CENTER);

  fill(180, 140, 255);
  textSize(46);
  text("迷宮驚魂", width / 2, height / 2 - 90);

  fill(200);
  textSize(18);
  text("方向鍵移動，躲避鬼魂，取得寶石", width / 2, height / 2 - 30);

  fill(110, 255, 220);
  textSize(22);
  let blink = sin(frameCount * 0.08) > 0;
  if (blink) {
    text("按 Enter 開始遊戲", width / 2, height / 2 + 20);
  }

  fill(150);
  textSize(15);
  text("按 R 重新開始", width / 2, height / 2 + 70);
}

function drawWinScreen() {
  fill(0, 0, 0, 180);
  rect(0, 0, width, height);
  textAlign(CENTER, CENTER);

  fill(255, 220, 110);
  rectMode(CENTER);
  rect(width / 2, height / 2, 360, 200, 22);
  rectMode(CORNER);

  fill(30, 30, 50);
  textSize(34);
  text("成功逃離！", width / 2, height / 2 - 40);

  fill(60, 60, 90);
  textSize(18);
  text("完成時間：" + elapsedTime + " 秒", width / 2, height / 2);

  fill(80, 80, 110);
  textSize(18);
  let blink = sin(frameCount * 0.08) > 0;
  if (blink) {
    text("按 Enter / R 再玩一次", width / 2, height / 2 + 50);
  }
}

function drawLoseScreen() {
  fill(40, 0, 10, 200);
  rect(0, 0, width, height);
  textAlign(CENTER, CENTER);

  fill(255, 90, 110);
  textSize(40);
  text("被鬼魂抓到！", width / 2, height / 2 - 40);

  fill(200);
  textSize(18);
  text("堅持時間：" + elapsedTime + " 秒", width / 2, height / 2 + 10);

  fill(255);
  textSize(18);
  let blink = sin(frameCount * 0.08) > 0;
  if (blink) {
    text("按 Enter / R 重新開始", width / 2, height / 2 + 50);
  }
}

function initMaze() {
  for (let y = 0; y < rows; y++) {
    maze[y] = [];
    for (let x = 0; x < cols; x++) {
      maze[y][x] = 1;
    }
  }

  let stack = [];
  maze[1][1] = 0;
  stack.push({ x: 1, y: 1 });

  while (stack.length > 0) {
    let current = stack[stack.length - 1];
    let neighbors = getUnvisitedNeighbors(current.x, current.y);
    if (neighbors.length === 0) {
      stack.pop();
    } else {
      let next = random(neighbors);
      let wallX = current.x + (next.x - current.x) / 2;
      let wallY = current.y + (next.y - current.y) / 2;
      maze[wallY][wallX] = 0;
      maze[next.y][next.x] = 0;
      stack.push(next);
    }
  }

  maze[goal.y][goal.x] = 0;
}

function getUnvisitedNeighbors(x, y) {
  let neighbors = [];
  if (y - 2 > 0 && maze[y - 2][x] === 1) neighbors.push({ x, y: y - 2 });
  if (x + 2 < cols - 1 && maze[y][x + 2] === 1) neighbors.push({ x: x + 2, y });
  if (y + 2 < rows - 1 && maze[y + 2][x] === 1) neighbors.push({ x, y: y + 2 });
  if (x - 2 > 0 && maze[y][x - 2] === 1) neighbors.push({ x: x - 2, y });
  return neighbors;
}

function initGhosts() {
  ghosts = [];
  let count = 3;

  for (let i = 0; i < count; i++) {
    let gx, gy;
    do {
      gx = floor(random(2, cols - 2));
      gy = floor(random(2, rows - 2));
    } while (maze[gy][gx] === 1 || (gx < 5 && gy < 5));

    ghosts.push({
      x: gx,
      y: gy,
      moveTimer: 0,
      moveInterval: 30 + i * 12
    });
  }
}

function updateGhosts() {
  for (let g of ghosts) {
    g.moveTimer++;
    if (g.moveTimer >= g.moveInterval) {
      g.moveTimer = 0;
      moveGhost(g);
    }
  }
}

function moveGhost(g) {
  let dirs = [
    { dx: 1, dy: 0 },
    { dx: -1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: 0, dy: -1 }
  ];

  dirs.sort((a, b) => {
    let da = abs((g.x + a.dx) - player.x) + abs((g.y + a.dy) - player.y);
    let db = abs((g.x + b.dx) - player.x) + abs((g.y + b.dy) - player.y);
    return da - db;
  });

  for (let d of dirs) {
    let nx = g.x + d.dx;
    let ny = g.y + d.dy;
    if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && maze[ny][nx] === 0) {
      g.x = nx;
      g.y = ny;
      return;
    }
  }
}

function checkGhostCollision() {
  for (let g of ghosts) {
    if (g.x === player.x && g.y === player.y) {
      gameState = "lose";
      playLoseSound();
      return;
    }
  }
}

function drawMaze() {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let cellX = x * w;
      let cellY = y * w;

      if (maze[y][x] === 1) {
        fill(42, 54, 82);
        noStroke();
        rect(cellX, cellY, w, w);
        fill(64, 82, 120);
        rect(cellX, cellY, w, 6);
        fill(24, 34, 56);
        rect(cellX, cellY + w - 6, w, 6);
        stroke(28, 40, 66);
        strokeWeight(1);
        for (let i = 8; i < w; i += 12) line(cellX + i, cellY, cellX + i, cellY + w);
        for (let j = 10; j < w; j += 14) line(cellX, cellY + j, cellX + w, cellY + j);
        noStroke();
      } else {
        fill(22, 32, 54);
        rect(cellX, cellY, w, w);
        stroke(28, 42, 72);
        strokeWeight(1);
        rect(cellX + 1, cellY + 1, w - 2, w - 2);
        noStroke();
      }
    }
  }
}

function drawGoal() {
  let x = goal.x * w + w / 2;
  let y = goal.y * w + w / 2;
  let pulse = sin(frameCount * 0.08) * 4;

  noStroke();
  fill(255, 215, 90, 110);
  circle(x, y, 30 + pulse);
  fill(255, 220, 110);
  circle(x, y, 20);
  fill(255, 245, 180);
  circle(x - 5, y - 5, 6);
}

function drawGhosts() {
  for (let g of ghosts) {
    let x = g.x * w + w / 2;
    let y = g.y * w + w / 2;
    let wobble = sin(frameCount * 0.1 + g.x) * 2;

    noStroke();
    fill(180, 100, 255, 180);
    beginShape();
    ellipse(x, y + wobble, 26, 30);
    endShape(CLOSE);

    fill(255, 255, 255);
    circle(x - 6, y - 4 + wobble, 6);
    circle(x + 6, y - 4 + wobble, 6);

    fill(0);
    circle(x - 6, y - 4 + wobble, 3);
    circle(x + 6, y - 4 + wobble, 3);
  }
}

function drawPlayer() {
  let cx = player.x * w + w / 2;
  let cy = player.y * w + w / 2;
  let bob = sin(frameCount * 0.15) * 1.5;

  push();
  translate(cx, cy + bob);

  fill(0, 255, 180, 80);
  noStroke();
  circle(0, 14, 20);

  fill(60, 180, 255);
  stroke(30, 110, 180);
  strokeWeight(2);
  beginShape();
  ellipse(0, 4, 10, 12);
  endShape(CLOSE);

  noStroke();
  fill(255, 210, 160);
  circle(0, -8, 11);

  fill(90, 60, 40);
  beginShape();
  arc(0, -10, 12, 8, PI, TWO_PI);
  endShape(CLOSE);

  fill(20);
  if (player.dir === 1) {
    ellipse(4, -8, 1.8, 2.4);
  } else if (player.dir === -1) {
    ellipse(-4, -8, 1.8, 2.4);
  } else {
    ellipse(-3, -8, 1.8, 2.4);
    ellipse(3, -8, 1.8, 2.4);
  }

  fill(220, 50, 80);
  stroke(160, 30, 50);
  strokeWeight(1.5);
  beginShape();
  moveTo(-7, -12);
  lineTo(7, -12);
  lineTo(5, -18);
  lineTo(-5, -18);
  endShape(CLOSE);

  pop();
}

function drawUI() {
  fill(10, 16, 32, 200);
  noStroke();
  rect(12, 12, 180, 42, 12);
  stroke(120, 90, 180, 160);
  strokeWeight(1);
  rect(12, 12, 180, 42, 12);

  fill(255);
  noStroke();
  textSize(14);
  textAlign(LEFT, TOP);
  text("迷宮驚魂", 24, 20);
  textSize(12);
  fill(180, 210, 255);
  text("時間：" + elapsedTime + "s", 24, 38);
}

function keyPressed() {
  initAudio();

  if (gameState === "start") {
    if (keyCode === ENTER) {
      startGame();
    }
    return;
  }

  if (gameState === "win" || gameState === "lose") {
    if (keyCode === ENTER || key === "r" || key === "R") {
      resetGame();
    }
    return;
  }

  if (key === "r" || key === "R") {
    resetGame();
    return;
  }

  if (keyCode === UP_ARROW) {
    player.dir = 0;
    movePlayer(0, -1);
  } else if (keyCode === DOWN_ARROW) {
    player.dir = 0;
    movePlayer(0, 1);
  } else if (keyCode === LEFT_ARROW) {
    player.dir = -1;
    movePlayer(-1, 0);
  } else if (keyCode === RIGHT_ARROW) {
    player.dir = 1;
    movePlayer(1, 0);
  }
}

function movePlayer(dx, dy) {
  let nx = player.x + dx;
  let ny = player.y + dy;

  if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
    if (maze[ny][nx] === 0) {
      player.x = nx;
      player.y = ny;
      checkWin();
    } else {
      if (hitCooldown === 0) {
        playHitSound();
        hitCooldown = 8;
      }
    }
  } else {
    if (hitCooldown === 0) {
      playHitSound();
      hitCooldown = 8;
    }
  }
}

function checkWin() {
  if (player.x === goal.x && player.y === goal.y) {
    gameState = "win";
    playWinSound();
  }
}

function startGame() {
  player = { x: 1, y: 1, dir: 0 };
  gameState = "playing";
  startTime = millis();
  initMaze();
  initGhosts();
  playBGM();
}

function resetGame() {
  player = { x: 1, y: 1, dir: 0 };
  gameState = "playing";
  startTime = millis();
  initMaze();
  initGhosts();
  playBGM();
}
