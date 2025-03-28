// -------------------------
// Planche de Galton (핀 반지름 수정 가능 버전)
// -------------------------

// [1] 전역 변수 설정
let balls = [];           // 공 배열
let gridSize = 20;        // 격자 간격
let pinRadius = 2;        // ★ 원하는 반지름으로 수정 ★
let counts = [];          // 각 열별 공 개수
let maxBalls = 10000;      // 생성할 공 개수 제한
let deadBalls = [];       // 제거될 공들

// 보드와 영역 설정
let boardWidth = 600;
let boardHeight = 800;
let topRegionHeight = 600; // 핀(위쪽) 영역의 높이

function setup() {
  createCanvas(boardWidth, boardHeight);
  
  // 컬럼 개수에 맞춰 counts 배열 초기화
  for (let i = 0; i < boardWidth / gridSize - 1; i++) {
    counts[i] = 0;
  }
}

function draw() {
  background(237, 221, 183);
  
  // 전체 보드(핀 영역 + 수집통 영역) 그리기
  displayBoard();
  
  // 새로운 공 생성
  if (frameCount < maxBalls * 2 && frameCount % 2 === 0) {
    balls.push(new Ball());
  }
  
  // 공 이동·표시
  for (let ball of balls) {
    ball.move();
    ball.display();
  }
  
  // 수집통 막대 표시
  displayBars();
  
  // 제거할 공 제거
  for (let ball of deadBalls) {
    let idx = balls.indexOf(ball);
    if (idx !== -1) {
      balls.splice(idx, 1);
    }
  }
  deadBalls = [];
}

// -------------------------
// 보드 그리기
// -------------------------
function displayBoard() {
  push();
  noStroke();
  fill(100);
  
  // [A] 핀(격자 점) 표시: y=0 ~ topRegionHeight(600)까지만
  for (let x = 0; x <= width; x += gridSize) {
    for (let y = gridSize; y < topRegionHeight; y += gridSize) {
      // 짝수 행에서는 약간 왼쪽으로 핀을 이동 (지그재그 느낌)
      let xo = (y % (gridSize * 2) === 0) ? x - gridSize / 2 : x;
      
      // ★ pinRadius를 사용하여 핀을 그린다 (지름 = pinRadius * 2)
      circle(xo, y, pinRadius * 2);
    }
  }
  
  // [B] 수집통 구분선: y=topRegionHeight ~ height
  stroke(100);
  for (let x = gridSize / 2; x < width; x += gridSize) {
    line(x, topRegionHeight, x, height);
  }
  
  pop();
}

// -------------------------
// 막대 그래프(수집통) 표시
// -------------------------
function displayBars() {
  push();
  strokeCap(ROUND);
  stroke('blue');
  strokeWeight(gridSize / 3 + 1);
  
  // 수집통 영역: y=600 ~ 800
  //   - 바닥(y=800)에서 위로 쌓이도록 line()을 그림
  for (let i = 0; i < counts.length; i++) {
    let x = (i + 1) * gridSize;
    
    // 누적된 공 개수에 따라 높이 증가
    let barHeight = counts[i] / 2;  
    let topY = height - barHeight;  
    line(x, height, x, topY);
  }
  
  pop();
}

// -------------------------
// Ball 클래스
// -------------------------
class Ball {
  constructor() {
    // 공은 위에서 시작
    this.x = width / 2;
    this.y = 0;
    this.jig = true; // 핀 영역에서만 좌우로 흔들리는 플래그
  }

  move() {
    // 아래로 이동
    this.y += gridSize / 2;
    
    // [1] 핀 영역(위쪽)에서의 '흔들림' 처리
    if (this.jig) {
      // gridSize 간격마다 좌우로 random 이동
      if (this.y % gridSize === 0) {
        this.x += random([-gridSize / 2, gridSize / 2]);
      }
    }
    
    // [2] y가 topRegionHeight(=600) 넘어가면 흔들림 중지
    //     → 수집통 영역에서는 straight down
    if (this.y > topRegionHeight) {
      this.jig = false;
      
      // [3] 바닥에 닿았는지 체크
      let column = int((this.x - gridSize / 2) / gridSize);
      if (column >= 0 && column < counts.length) {
        if (this.y >= height - counts[column] / 2) {
          deadBalls.push(this);
          counts[column]++;
        }
      } else {
        // 범위 벗어나면 제거
        deadBalls.push(this);
      }
    }
  }
  
  display() {
    push();
    noStroke();
    fill("blue");
    circle(this.x, this.y, gridSize / 3 + 1);
    pop();
  }
}
