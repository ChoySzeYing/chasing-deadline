let player;
let tasks = [];
let restSpots = [];
let stressors = [];
let energy;
let taskProgress;
let gameStarted = false;
let gameOver = false;
let win = false;

function setup() {
  createCanvas(800, 600);
  resetGame();
}

function resetGame() {
  player = createVector(width / 2, height / 2);
  energy = 300;
  taskProgress = 0;
  gameOver = false;
  win = false;

  tasks = [];
  restSpots = [];
  stressors = [];

  for (let i = 0; i < 6; i++) {
    tasks.push(createVector(random(50, width - 50), random(50, height - 50)));
  }
  for (let i = 0; i < 3; i++) {
    restSpots.push(createVector(random(50, width - 50), random(50, height - 50)));
  }
  for (let i = 0; i < 8; i++) {
    let s = createVector(random(50, width - 50), random(50, height - 50));
    s.v = createVector(random(-2, 2), random(-2, 2));
    stressors.push(s);
  }
}

function draw() {
  background(20);

  if (!gameStarted) {
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(24);
    text("Press SPACE to start", width / 2, height / 2);
    return;
  }

  if (gameOver) {
    fill(255, 80, 80);
    textAlign(CENTER, CENTER);
    textSize(32);
    text("Burnout! Press SPACE to restart", width / 2, height / 2);
    return;
  }

  if (win) {
    fill(80, 255, 120);
    textAlign(CENTER, CENTER);
    textSize(32);
    text("You finished all tasks! Press SPACE", width / 2, height / 2);
    return;
  }

  // 玩家移動，按住就會連續郁
  let speed = 4;
  if (keyIsDown(87) || keyIsDown(UP_ARROW)) player.y -= speed;
  if (keyIsDown(83) || keyIsDown(DOWN_ARROW)) player.y += speed;
  if (keyIsDown(65) || keyIsDown(LEFT_ARROW)) player.x -= speed;
  if (keyIsDown(68) || keyIsDown(RIGHT_ARROW)) player.x += speed;

  // 唔會走出畫面
  player.x = constrain(player.x, 20, width - 20);
  player.y = constrain(player.y, 20, height - 20);

  // 紅點周圍撞牆彈返轉頭
  for (let s of stressors) {
    s.add(s.v);
    if (s.x < 20 || s.x > width - 20) s.v.x *= -1;
    if (s.y < 20 || s.y > height - 20) s.v.y *= -1;
  }

  // 撿藍色任務點
  for (let i = tasks.length - 1; i >= 0; i--) {
    let t = tasks[i];
    if (dist(player.x, player.y, t.x, t.y) < 28) {
      taskProgress += 20;
      tasks.splice(i, 1);
    }
  }

  // 綠點回能量
  for (let r of restSpots) {
    if (dist(player.x, player.y, r.x, r.y) < 28) {
      energy += 0.6;
    }
  }

  // 撞到紅點扣能量
  for (let s of stressors) {
    if (dist(player.x, player.y, s.x, s.y) < 28) {
      energy -= 1.2;
    }
  }

  energy -= 0.12;
  energy = constrain(energy, 0, 400);
  taskProgress = constrain(taskProgress, 0, 100);

  if (energy <= 0) gameOver = true;
  if (taskProgress >= 100) win = true;

  // 畫晒所有圓圈
  noStroke();
  for (let t of tasks) {
    fill(60, 140, 255);
    circle(t.x, t.y, 26);
  }
  for (let r of restSpots) {
    fill(60, 220, 90);
    circle(r.x, r.y, 26);
  }
  for (let s of stressors) {
    fill(230, 40, 40);
    circle(s.x, s.y, 30);
  }

  fill(240);
  circle(player.x, player.y, 22);

  // UI：能量同任務條
  fill(255);
  textAlign(LEFT, TOP);
  textSize(16);
  text(`Energy: ${energy.toFixed(1)}`, 12, 12);
  text(`Task: ${taskProgress.toFixed(1)} / 100`, 12, 34);

  noFill();
  stroke(80, 160, 255);
  strokeWeight(5);
  rect(10, 52, 300, 14);
  fill(80, 160, 255);
  noStroke();
  rect(10, 52, map(taskProgress, 0, 100, 0, 300), 14);
}

function keyPressed() {
  if (key === " ") {
    if (!gameStarted) {
      gameStarted = true;
    } else if (gameOver || win) {
      resetGame();
    }
  }
}
