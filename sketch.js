let player;
let tasks = [];
let hazards = [];
let restSpots = [];

let energy = 100;
let taskProgress = 0;
const TASK_GOAL = 100;
let gameState = "start"; // start / play / win / lose
let timer = 0;

class Player {
  constructor() {
    this.x = width / 2;
    this.y = height / 2;
    this.r = 14;
    this.speed = 4.2;
  }
  update() {
    if (keyIsDown(87) || keyIsDown(UP_ARROW)) this.y -= this.speed;
    if (keyIsDown(83) || keyIsDown(DOWN_ARROW)) this.y += this.speed;
    if (keyIsDown(65) || keyIsDown(LEFT_ARROW)) this.x -= this.speed;
    if (keyIsDown(68) || keyIsDown(RIGHT_ARROW)) this.x += this.speed;

    this.x = constrain(this.x, this.r, width - this.r);
    this.y = constrain(this.y, this.r, height - this.r);
  }
  draw() {
    noStroke();
    fill(220, 235, 255);
    circle(this.x, this.y, this.r * 2);
  }
}

class TaskPoint {
  constructor() {
    this.x = random(80, width - 80);
    this.y = random(80, height - 80);
    this.r = 22;
    this.gain = 0.6;
  }
  draw() {
    noStroke();
    fill(70, 140, 255, 190);
    circle(this.x, this.y, this.r * 2);
  }
}

class Hazard {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.vx = random(-2.2, 2.2);
    this.vy = random(-2.2, 2.2);
    this.r = 26;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < this.r || this.x > width - this.r) this.vx *= -1;
    if (this.y < this.r || this.y > height - this.r) this.vy *= -1;
  }
  draw() {
    noStroke();
    fill(255, 80, 90, 170);
    circle(this.x, this.y, this.r * 2);
  }
}

class RestSpot {
  constructor() {
    this.x = random(80, width - 80);
    this.y = random(80, height - 80);
    this.r = 20;
  }
  draw() {
    noStroke();
    fill(90, 220, 130, 180);
    circle(this.x, this.y, this.r * 2);
  }
}

function setup() {
  createCanvas(900, 620).parent("container");
  resetGame();
}

function resetGame() {
  player = new Player();
  energy = 100;
  taskProgress = 0;
  timer = 0;
  tasks = [];
  hazards = [];
  restSpots = [];
  for (let i = 0; i < 5; i++) tasks.push(new TaskPoint());
  for (let i = 0; i < 3; i++) hazards.push(new Hazard());
  for (let i = 0; i < 2; i++) restSpots.push(new RestSpot());
  gameState = "play";
}

function draw() {
  background(12, 14, 28, 28);

  if (gameState === "start") {
    drawStartScreen();
    return;
  }
  if (gameState === "win") {
    drawWinScreen();
    return;
  }
  if (gameState === "lose") {
    drawLoseScreen();
    return;
  }

  timer++;
  energy -= 0.022;

  if (timer % 320 === 0 && hazards.length < 7) {
    hazards.push(new Hazard());
  }

  player.update();

  for (let t of tasks) {
    t.draw();
    if (dist(player.x, player.y, t.x, t.y) < t.r + player.r) {
      taskProgress += t.gain;
    }
  }

  for (let h of hazards) {
    h.update();
    h.draw();
    if (dist(player.x, player.y, h.x, h.y) < h.r + player.r) {
      energy -= 0.6;
    }
  }

  for (let r of restSpots) {
    r.draw();
    if (dist(player.x, player.y, r.x, r.y) < r.r + player.r) {
      energy += 0.18;
    }
  }

  player.draw();
  drawUI();

  if (energy <= 0) gameState = "lose";
  if (taskProgress >= TASK_GOAL) gameState = "win";
}

function drawUI() {
  noStroke();
  fill(255);
  textSize(16);
  text(`Energy: ${energy.toFixed(1)}`, 20, 28);
  text(`Task: ${taskProgress.toFixed(1)} / ${TASK_GOAL}`, 20, 52);

  push();
  fill(40, 40, 40);
  rect(18, 62, 164, 14);
  fill(energy > 30 ? (energy > 60 ? "#8cf" : "#ffd") : "#f66");
  rect(20, 64, map(energy, 0, 100, 0, 160), 10);
  pop();
}

function drawStartScreen() {
  background(8, 10, 22);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(36);
  text("Chasing Deadline", width / 2, height / 2 - 60);
  textSize(18);
  text("WASD / Arrow keys to move", width / 2, height / 2 - 10);
  text("Blue = Tasks | Red = Stress | Green = Rest", width / 2, height / 2 + 20);
  textSize(16);
  fill("#aaa");
  text("Press SPACE to start", width / 2, height / 2 + 70);
}

function drawWinScreen() {
  background(10, 22, 18);
  fill(160, 255, 200);
  textAlign(CENTER, CENTER);
  textSize(42);
  text("You made it!", width / 2, height / 2 - 20);
  textSize(20);
  text("Deadline survived", width / 2, height / 2 + 25);
  fill("#ccc");
  textSize(16);
  text("Press SPACE to play again", width / 2, height / 2 + 70);
}

function drawLoseScreen() {
  background(22, 10, 12);
  fill(255, 140, 140);
  textAlign(CENTER, CENTER);
  textSize(42);
  text("Burnout", width / 2, height / 2 - 20);
  textSize(20);
  text("Your energy ran out", width / 2, height / 2 + 25);
  fill("#ccc");
  textSize(16);
  text("Press SPACE to try again", width / 2, height / 2 + 70);
}

function keyPressed() {
  if (keyCode === 32) {
    if (gameState === "start" || gameState === "win" || gameState === "lose") {
      resetGame();
      gameState = "play";
    }
  }
}
