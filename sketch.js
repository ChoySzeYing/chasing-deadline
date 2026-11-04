let cols = 21;
let rows = 15;
let w = 48;

let maze = [];
let player = { x: 1, y: 1, dir: 0 };
let goal = { x: 19, y: 13 };
let gameState = "start"; // start / playing / win
let startTime = 0;
let elapsedTime = 0;

let bgOsc, bgEnv;
let hitOsc, hitEnv;
let winOsc, winEnv;
let audioStarted = false;

function setup() {
  createCanvas(cols * w, rows * w);
  initMaze();
}

function draw() {
  drawBackground();

  if (gameState === "start") {
    drawStartScreen();
    return;
  }

  if (gameState === "playing") {
    elapsedTime = floor((millis() - startTime) / 1000);
  }

  drawMaze();
  drawPlayer();
  drawUI();

  if (gameState === "win") {
    drawWinScreen();
  }
}

function initAudio() {
  if (audioStarted) return;
  audioStarted = true;

  bgOsc = new p5.Oscillator("sine");
  bgEnv = new p5.Envelope(0.02, 0.2, 0.3, 1.4);
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
}

function playBGM() {
  if (!bgOsc || gameState !== "playing") return;
  let notes = [130.81, 146.83, 164.81, 196, 164.81, 146.83];
  let i = 0;
  function next() {
    if (gameState !== "playing") return;
    bgOsc.freq(notes[i]);
    bgEnv.play();
    i = (i + 1) % notes.length;
    setTimeout(next, 680);
  }
  next();
}

function playHitSound() {
  if (!hitOsc) return;
  hitOsc.freq(95);
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

function drawBackground() {
  background(8, 12, 24);
  noStroke();
  for (let i = 0; i < 90; i++) {
    let sx = (i * 73 + frameCount * 0.02) % width;
    let sy = (i * 131) % height;
    let tw = (sin((frameCount + i * 20) * 0.03) + 1) * 0.5;
    fill(180, 210, 255, 40 + tw * 60);
    circle(sx, sy, 1.2 + tw);
  }
  fill(18, 28, 48, 180);
  noStroke();
  beginShape();
  for (let x = 0; x <= width; x += 30) {
    let y = height - 140 - sin(x * 0.01) * 40 - noise(x * 0.01) * 30;
    vertex(x, y);
  }
  vertex(width, height);
  vertex(0, height);
  endShape(CLOSE);
  noFill();
  stroke(80, 120, 200, 140);
  strokeWeight(4);
  rect(8, 8, width - 16, height - 16, 18);
  noStroke();
}

function drawStartScreen() {
  fill(0, 0, 0, 160);
  rect(0, 0, width, height);
  textAlign(CENTER, CENTER);

  fill(255, 220, 100);
  textSize(44);
  text("迷宮探險", width / 2, height / 2 - 80);

  fill(220);
  textSize(20);
  text("方向鍵移動，搵到寶石就勝利", width / 2, height / 2 - 30);

  fill(100, 200, 255);
  textSize(22);
  let blink = sin(frameCount * 0.08) > 0;
  if (blink) {
    text("按 Enter 開始遊戲", width / 2, height / 2 + 20);
  }

  fill(160);
  textSize(16);
  text("按 R 隨時重新開始", width / 2, height / 2 + 70);
}

function drawWinScreen() {
  fill(0, 0, 0, 180);
  rect(0, 0, width, height);
  textAlign(CENTER, CENTER);

  fill(255, 215, 90);
  rectMode(CENTER);
  rect(width / 2, height / 2, 360, 200, 22);
  rectMode(CORNER);

  fill(30, 30, 50);
  textSize(34);
  text("寶石取得！", width / 2, height / 2 - 40);

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
  drawGoal();
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

function drawPlayer() {
  let cx = player.x * w + w / 2;
  let cy = player.y * w + w / 2;
  push();
  translate(cx, cy);

  // 身體
  fill(20, 180, 220);
  ellipse(0, 6, 24, 28);
  // 頭
  fill(255, 224, 196);
  circle(0, -8, 20);
  // 頭髮
  fill(60, 40, 30);
  arc(0, -12, 18, 12, PI, TWO_PI);
  // 眼
  fill(20);
  if (player.dir === 1) circle(4, -9, 3);
  else if (player.dir === -1) circle(-4, -9, 3);
  else {
    circle(-4, -9, 3);
    circle(4, -9, 3);
  }
  pop();
}

function drawUI() {
  fill(255);
  textSize(16);
  textAlign(LEFT, TOP);
  text("⏱ 時間：" + elapsedTime + " s", 16, 16);
}

function keyPressed() {
  initAudio();

  if (gameState === "start") {
    if (keyCode === ENTER) {
      startGame();
    }
    return;
  }

  if (gameState === "win") {
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
      playHitSound();
    }
  } else {
    playHitSound();
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
}

function resetGame() {
  player = { x: 1, y: 1, dir: 0 };
  gameState = "playing";
  startTime = millis();
  initMaze();
}
