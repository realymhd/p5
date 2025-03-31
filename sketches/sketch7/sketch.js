// sketch7/sketch.js - 정지 후 재발사 가능 버전

let gravity = 0.2;
let ballPos;
let ballVel;
let radius = 10;
let isFlying = false;
let trajectory = [];
let startDragPos;
let currentDragPos;
let isDragging = false;
let damping = 0.8;
let stopThreshold = 0.1; // 이 속도 미만이면 정지한 것으로 간주

function setup() {
  createCanvas(windowWidth, windowHeight);
  resetBall();
}

function draw() {
  background(230);

  // 1. 비행 중일 때: 물리 업데이트, 충돌 감지
  if (isFlying) {
    ballVel.y += gravity;
    ballPos.add(ballVel);
    trajectory.push(ballPos.copy());
    if (trajectory.length > 500) {
      trajectory.shift();
    }

    // --- 충돌 감지 및 반사 ---
    // 좌우 벽
    if (ballPos.x < radius || ballPos.x > width - radius) {
      ballPos.x = constrain(ballPos.x, radius, width - radius);
      ballVel.x *= -1 * damping;
    }
    // 위쪽 벽
    if (ballPos.y < radius) {
      ballPos.y = radius;
      ballVel.y *= -1 * damping;
    }
    // 아래쪽 벽 (바닥)
    if (ballPos.y >= height - radius) { // 등호 포함하여 정확히 바닥일 때도 체크
      ballPos.y = height - radius; // 위치 보정 먼저
      ballVel.y *= -1 * damping; // Y 속도 반전 및 감쇠
      ballVel.x *= 0.95;       // 바닥 마찰

      // --- 정지 감지 ---
      // Y 속도가 거의 0이고 X 속도도 거의 0일 때 (즉, 전체 속도가 매우 낮을 때)
      // ballVel.mag()는 벡터의 크기(속력)를 계산
      if (ballVel.mag() < stopThreshold) {
          isFlying = false; // 비행 상태 해제 -> 다시 드래그 가능하게 함
          ballVel.set(0, 0); // 속도를 완전히 0으로 설정
          // trajectory = []; // 멈추면 궤적 지우기 (선택 사항)
      }
      // -------------
    }
  }

  // --- 그리기 ---
  // 궤적 그리기
  stroke(0, 0, 255, 100);
  strokeWeight(2);
  noFill();
  beginShape();
  for (let i = 0; i < trajectory.length; i += 2) {
    vertex(trajectory[i].x, trajectory[i].y);
  }
  endShape();

  // 공 그리기
  if (ballPos) {
    fill(255, 0, 0);
    noStroke();
    ellipse(ballPos.x, ballPos.y, radius * 2, radius * 2);
  }

  // 드래그 중일 때: 발사 예측선 그리기
  if (isDragging) {
    currentDragPos = createVector(mouseX, mouseY);
    stroke(0, 128);
    strokeWeight(3);
    line(startDragPos.x, startDragPos.y, currentDragPos.x, currentDragPos.y);
  }
}

function mousePressed() {
  // 비행 중이 아닐 때만 (시작 시 또는 완전히 멈췄을 때) 드래그 시작
  if (!isFlying && ballPos) {
    startDragPos = ballPos.copy(); // 현재 공 위치에서 드래그 시작
    isDragging = true;
  }
}

function mouseReleased() {
  if (isDragging) {
    isDragging = false;

    let launchVector = p5.Vector.sub(currentDragPos, startDragPos);
    let launchPower = launchVector.mag() * 0.06; // 파워 1.2배 증가된 상태
    launchPower = constrain(launchPower, 0.6, 18);
    ballVel = launchVector.normalize().mult(launchPower);

    isFlying = true;
    trajectory = [ballPos.copy()]; // 새 궤적 시작
  }
}

function resetBall() {
  isFlying = false;
  isDragging = false;
  let randomX = random(radius, width - radius);
  ballPos = createVector(randomX, height - radius); // 바닥 랜덤 위치
  ballVel = createVector(0, 0);
  startDragPos = null;
  currentDragPos = null;
  trajectory = [];
}