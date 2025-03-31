// sketches/sketch6/sketch.js
// 로렌츠 끌개 (Lorenz Attractor) 시각화 - Orbit + Tilt 카메라 제어

// --- 로렌츠 시스템 변수 ---
let x = 0.1;
let y = 0;
let z = 0;
let sigma = 10;
let rho   = 28;
let beta  = 8.0 / 3.0;
let dt = 0.01;
let points = [];
let maxPoints = 2500;

// --- 사용자 정의 카메라 변수 (구면 좌표계 기반) ---
let camX, camY, camZ; // 카메라 위치 (계산 결과)
let centerX = 0, centerY = 0, centerZ = 0; // 바라보는 지점 (고정)

let distance;   // 카메라와 중심점 사이의 거리 (Zoom 제어)
let angleH = 0; // 수평 각도 (Azimuth) - Orbit 제어 (Y축 기준 회전)
let angleV = Math.PI / 6; // 수직 각도 (Elevation) - Tilt 제어 (XZ 평면 기준)

// 드래그 상태 추적
let isDragging = false;
let prevMouseX, prevMouseY;

// 제어 감도
let orbitSensitivity = 0.01; // 수평 회전 감도
let tiltSensitivity = 0.01;  // 수직 회전 감도
let zoomSensitivity = 0.5;   // 줌 감도 (거리 변화량)

// --- 색상 관련 변수 ---
let hueStart = 0;

function setup() {
  createCanvas(windowWidth, windowHeight * 0.9, WEBGL);
  colorMode(HSB, 360, 100, 100, 100);
  points.push(createVector(x, y, z));

  // --- 초기 카메라 설정 ---
  distance = 500; // 초기 거리

  // 초기 카메라 위치 계산
  calculateCameraPosition();
}

// 현재 각도(angleH, angleV)와 거리(distance)를 바탕으로
// 카메라 위치(camX,Y,Z) 계산 (구면좌표 -> 직교좌표 변환)
function calculateCameraPosition() {
  // p5.js WEBGL 좌표계 (Y가 위쪽) 기준
  // angleH: Y축 기준 회전각 (0일 때 +Z축 방향 가정)
  // angleV: XZ 평면 기준 회전각 (0일 때 XZ 평면, PI/2일 때 +Y축)
  camX = centerX + distance * cos(angleV) * sin(angleH);
  camY = centerY + distance * sin(angleV); // Y가 위쪽이므로 sin(angleV) 사용
  camZ = centerZ + distance * cos(angleV) * cos(angleH);
}

function draw() {
  background(5, 5, 10);

  // --- 카메라 설정 ---
  camera(camX, camY, camZ,       // 계산된 카메라 위치
         centerX, centerY, centerZ, // 항상 원점을 바라봄
         0, 1, 0);              // 월드 좌표계의 위쪽 방향 (Y축)

  // --- 로렌츠 방정식 계산 ---
  let dx = (sigma * (y - x)) * dt;
  let dy = (x * (rho - z) - y) * dt;
  let dz = (x * y - beta * z) * dt;
  x = x + dx;
  y = y + dy;
  z = z + dz;
  points.unshift(createVector(x, y, z));
  if (points.length > maxPoints) {
    points.pop();
  }

  // --- 3D 렌더링 ---
  // scale() 함수 사용 안 함

  // 끌개 궤적 그리기
  noFill();
  strokeWeight(1.5);
  beginShape();
  for (let i = 0; i < points.length; i++) {
    let p = points[i];
    let hue = (hueStart + i * 0.1) % 360;
    let saturation = 90;
    let brightness = map(i, 0, points.length, 100, 60);
    let alpha = map(i, 0, points.length, 100, 10);
    stroke(hue, saturation, brightness, alpha);
    vertex(p.x, p.y, p.z);
  }
  endShape();

  hueStart = (hueStart + 0.5) % 360;
}

// --- 마우스 인터랙션 함수 ---

function mousePressed() {
  if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    isDragging = true;
    prevMouseX = mouseX;
    prevMouseY = mouseY;
    cursor(HAND);
  }
}

function mouseDragged() {
  if (isDragging) {
    let dx = mouseX - prevMouseX;
    let dy = mouseY - prevMouseY;

    // --- 수평 이동 (dx) => Orbit (angleH 변경) ---
    angleH += dx * orbitSensitivity;

    // --- 수직 이동 (dy) => Tilt (angleV 변경) ---
    // 마우스를 아래로 내릴 때(dy 양수) 카메라가 아래를 보도록 angleV 감소
    angleV -= dy * tiltSensitivity;

    // 수직 각도 제한 (카메라가 완전히 뒤집히는 것 방지)
    // -PI/2 + 조금 ~ PI/2 - 조금
    angleV = constrain(angleV, -HALF_PI + 0.01, HALF_PI - 0.01);

    // 변경된 각도로 카메라 위치 재계산
    calculateCameraPosition();

    // 이전 마우스 위치 업데이트
    prevMouseX = mouseX;
    prevMouseY = mouseY;
  }
}

function mouseReleased() {
  if (isDragging) {
    isDragging = false;
    cursor(ARROW);
  }
}

// 마우스 휠 스크롤로 확대/축소 (Zoom) - 카메라 거리 조절
function mouseWheel(event) {
  // event.delta 양수: 휠 아래로 (축소 -> 거리 증가)
  // event.delta 음수: 휠 위로 (확대 -> 거리 감소)
  distance += event.delta * zoomSensitivity;

  // 거리 제한
  distance = constrain(distance, 50, 2000); // 최소/최대 거리 설정

  // 변경된 거리로 카메라 위치 재계산
  calculateCameraPosition();

  return false; // 페이지 스크롤 방지
}

// 브라우저 창 크기가 변경될 때 캔버스 크기 조절
function windowResized() {
  resizeCanvas(windowWidth, windowHeight * 0.9);
  // 창 크기 변경 시 카메라 위치 재계산 (화면 비율 달라질 때 필요할 수 있음)
  calculateCameraPosition();
}