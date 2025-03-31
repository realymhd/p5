// sketch8/sketch.js - 진공 상태 진자 (감쇠 제거)

// --- 진자 변수 ---
let pivot;
let bob;
let len;
let initialLen;
let angle;
let angleVel = 0;
let angleAcc = 0;

// --- 물리/환경 변수 ---
let gravity = 0.4;
// --- 감쇠 제거 ---
let damping = 1; // 감쇠 없음 (1로 설정)
// ----------------
let bobRadius = 20;
let minLen = 50;
let maxLen;

// --- 마우스 인터랙션 변수 ---
let isDraggingBob = false;
let pivotClickRadius = 10;

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(RADIANS);

  pivot = createVector(width / 2, 60);

  initialLen = height * 0.6;
  len = initialLen;
  maxLen = height * 1.2;

  angle = 0; // 초기 상태는 정지

  bob = createVector();
  calculateBobPosition();

  console.log("진공 진자 시뮬레이션: 감쇠 없음");
}

function draw() {
  background(245);

  // --- 물리 업데이트 (드래그 중 아닐 때) ---
  if (!isDraggingBob) {
    angleAcc = (-1 * gravity / len) * sin(angle);
    angleVel += angleAcc;
    angleVel *= damping; // damping이 1이므로 속도 변화 없음
    angle += angleVel;
  }

  // --- 추 위치 계산 ---
  calculateBobPosition();

  // --- 그리기 ---
  stroke(0);
  strokeWeight(2);
  line(pivot.x, pivot.y, bob.x, bob.y); // 줄

  fill(50);
  noStroke();
  ellipse(pivot.x, pivot.y, pivotClickRadius * 2, pivotClickRadius * 2); // 고정점

  if (isDraggingBob) {
    fill(150, 0, 0); // 드래그 중 색상
  } else {
    fill(200, 0, 0); // 평소 색상
  }
  noStroke();
  ellipse(bob.x, bob.y, bobRadius * 2, bobRadius * 2); // 추
}

function calculateBobPosition() {
  bob.x = pivot.x + len * sin(angle);
  bob.y = pivot.y + len * cos(angle);
}

// --- 마우스 인터랙션 --- (이전과 동일)
function mousePressed() {
  let dPivot = dist(mouseX, mouseY, pivot.x, pivot.y);
  if (dPivot < pivotClickRadius) {
    resetPendulum();
    return;
  }
  let dBob = dist(mouseX, mouseY, bob.x, bob.y);
  if (dBob < bobRadius) {
    isDraggingBob = true;
    angleVel = 0;
    angleAcc = 0;
  }
}

function mouseDragged() {
  if (isDraggingBob) {
    let newLen = dist(pivot.x, pivot.y, mouseX, mouseY);
    len = constrain(newLen, minLen, maxLen);
    let diffX = mouseX - pivot.x;
    let diffY = mouseY - pivot.y;
    angle = atan2(diffX, diffY);
    angleVel = 0;
    angleAcc = 0;
  }
}

function mouseReleased() {
  if (isDraggingBob) {
    isDraggingBob = false;
  }
}

// 진자를 정지 상태로 리셋
function resetPendulum() {
  angle = 0;
  angleVel = 0;
  angleAcc = 0;
  len = initialLen;
  isDraggingBob = false;
}