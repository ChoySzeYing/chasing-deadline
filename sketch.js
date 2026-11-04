let cols = 21;
let rows = 15;
let w = 48;

let maze = [];
let player = { x: 1, y: 1 };
let goal = { x: 19, y: 13 };
let gameState = "playing";
let startTime = 0;
let elapsedTime = 0;

let bgOsc, bgEnv;
let hitOsc, hitEnv;
let winOsc, winEnv;
let audioStarted = false;

function setup() {
  createCanvas(cols * w, rows * w);
  initMaze();
  startTime = millis();
}

function draw() {
  drawBackground();

  if (gameState === "playing") {
    elapsedTime = floor((millis() - startTime) / 1000);
  }

  drawMaze();
  drawPlayer();
  drawUI();

  if (gameState === "win") {
    drawWinScreen();
    noLoop();
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
  if (!bgOsc) return;
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
  // 深藍星點背景
  background(8, 12, 24);
  noStroke();
  for (let i = 0; i < 90; i++) {
    let sx = (i * 73 + frameCount * 0.02) % width;
    let sy = (i * 131) % height;
    let tw = (sin((frameCount + i * 20) * 0.03) + 1) * 0.5;
    fill(180, 210, 255, 40 + tw * 60);
    circle(sx, sy, 1.2 + tw);
  }

  // 遠處山影
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

  // 迷宮外圍裝飾框
  noFill();
  stroke(80, 120, 200, 140);
  strokeWeight(4);
  rect(8, 8, width - 16, height - 16, 18);
  noStroke();
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
        // 石牆主體
        fill(42, 54, 82);
        noStroke();
        rect(cellX, cellY, w, w);

        // 石牆頂部高光
        fill(64, 82, 120);
        rect(cellX, cellY, w, 6);

        // 石牆底部陰影
        fill(24, 34, 56);
        rect(cellX, cellY + w - 6, w, 6);

        // 石磚紋理
        stroke(28, 40, 66);
        strokeWeight(1);
        for (let i = 8; i < w; i += 12) {
          line(cellX + i, cellY, cellX + i, cellY + w);
        }
        for (let j = 10; j < w; j += 14) {
          line(cellX, cellY + j, cellX + w, cellY + j);
        }
      } else {
        // 地面
        fill(22, 32, 54);
        noStroke();
        rect(cellX, cellY, w, w);

        // 地面格線
        stroke(28, 42, 72);
        strokeWeight(1);
        rect(cellX + 1, cellY + 1, w - 2, w - 2);

        // 地面小細節
        noStroke();
        fill(32, 48, 82);
        rect(cellX + 6, cellY + 6, 4, 4);
        rect(cellX + w - 12, cellY + w - 12, 4, 4);
      }
    }
  }

  drawGoal();
}

function drawGoal() {
  let x = goal.x * w + w / 2;
  let y = goal.y * w + w / 2;
  let pulse = sin(frameCount * 0.08) * 4;

  // 寶石光圈
  noStroke();
  fill(255, 215, 90, 110);
  circle(x, y, 34 + pulse);

  fill(255, 230, 120, 160);
  circle(x, y, 22);

  // 寶石本體
  push();
  translate(x, y);
  rotate(frameCount * 0.01);
  fill(255, 220, 110);
  stroke(255, 245, 180);
  strokeWeight(2);
  beginShape();
  for (let i = 0; i < 6; i++) {
    let a = (TWO_PI / 6) * i;
    let r = 11;
    vertex(cos(a) * r, sin(a) * r);
  }
  endShape(CLOSE);
  pop();

  // 寶石高光
  noStroke();
  fill(255, 255, 220);
  circle(x - 4, y - 4, 4);
}

function drawPlayer() {
  let x = player.x * w + w / 2;
  let y = player.y * w + w / 2;
  let bob = sin(frameCount * 0.15) * 1.5;

  // 腳下光圈
  noStroke();
  fill(0, 255, 180, 90);
  circle(x, y + 14, 22);

  // 人物陰影
  fill(0, 0, 0, 70);
  ellipse(x, y + 16, 20, 6);

  push();
  translate(x, y + bob);

  // 身體斗篷
  fill(60, 180, 255);
  noStroke();
  beginShape();
  ellipse(0, 4, 10, 12);
  endShape(CLOSE);

  // 斗篷邊緣
  stroke(30, 110, 180);
  strokeWeight(2);
  beginShape();
  ellipse(0, 4, 10, 12);
  endShape(CLOSE);

  // 頭部
  noStroke();
  fill(255, 210, 160);
  circle(0, -8, 11);

  // 頭髮
  fill(90, 60, 40);
  beginShape();
  arc(0, -10, 12, 8, PI, TWO_PI);
  endShape(CLOSE);

  // 眼睛
  fill(20);
  ellipse(-3, -8, 1.8, 2.4);
  ellipse(3, -8, 1.8, 2.4);

  // 帽子
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
  // UI 面板
  fill(10, 16, 32, 200);
  noStroke();
  rect(12, 12, 160, 42, 12);
  stroke(80, 140, 220, 160);
  strokeWeight(1);
  rect(12, 12, 160, 42, 12);

  fill(255);
  noStroke();
  textSize(14);
  textAlign(LEFT, TOP);
  text("迷宮冒險", 24, 20);
  textSize(12);
  fill(180, 210, 255);
  text("時間：" + elapsedTime + "s", 24, 38);
}

function drawWinScreen() {
  fill(0, 0, 0, 190);
  rect(0, 0, width, height);

  // 勝利卡片
  noStroke();
  fill(255, 220, 110);
  rectMode(CENTER);
  rect(width / 2, height / 2, 360, 200, 22);
  rectMode(CORNER);

  fill(255, 245, 180);
  rect(width / 2 - 165, height / 2 - 90, 330, 6, 4);

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(30);
  text("寶石取得！", width / 2, height / 2 - 30);

  textSize(14);
  fill(200);
  text("完成時間：" + elapsedTime + " 秒", width / 2, height / 2 + 12);
  text("按 R 重新開始", width / 2, height / 2 + 44);
}

function keyPressed() {
  initAudio();

  if (gameState === "win") {
    if (key === "r" || key === "R") {
      resetGame();
    }
    return;
  }

  let beforeX = player.x;
  let beforeY = player.y;

  if (keyCode === UP_ARROW) movePlayer(0, -1);
  else if (keyCode === DOWN_ARROW) movePlayer(0, 1);
  else if (keyCode === LEFT_ARROW) movePlayer(-1, 0);
  else if (keyCode === RIGHT_ARROW) movePlayer(1, 0);

  if (player.x === beforeX && player.y === beforeY) {
    playHitSound();
  }
}

function movePlayer(dx, dy) {
  let newX = player.x + dx;
  let newY = player.y + dy;

  if (newX >= 0 && newX < cols && newY >= 0 && newY < rows) {
    if (maze[newY][newX] === 0) {
      player.x = newX;
      player.y = newY;
      checkWin();
    }
  }
}

function checkWin() {
  if (player.x === goal.x && player.y === goal.y) {
    gameState = "win";
    playWinSound();
    loop();
  }
}

function resetGame() {
  player = { x: 1, y: 1 };
  gameState = "playing";
  initMaze();
  startTime = millis();
  playBGM();
  loop();
}

