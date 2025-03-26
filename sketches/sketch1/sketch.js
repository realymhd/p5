// Sketch variables
let sphereSize = 200;
let rotationX = 0;
let rotationY = 0;
let rotationSpeed = 0.01;
let detailLevel = 24;
let colorPhase = 0;
let defaultCanvas;
let uiLayer;
let particles = [];
let mouseInteraction = false;

function setup() {
  // 메인 3D 캔버스 생성
  defaultCanvas = createCanvas(800, 600, WEBGL);
  
  // UI용 별도 2D 캔버스 생성
  uiLayer = createGraphics(width, height);
  
  // 초기 파티클 생성
  for (let i = 0; i < 100; i++) {
    particles.push(new Particle());
  }
}

function draw() {
  // 메인 캔버스 그리기
  background(20);
  
  // 조명 설정
  ambientLight(60, 60, 80);
  directionalLight(255, 255, 255, 0.5, 0.5, -1);
  pointLight(200, 150, 255, sin(frameCount * 0.01) * 300, cos(frameCount * 0.02) * 300, 200);
  
  // 회전 업데이트
  if (mouseInteraction) {
    // 마우스 위치에 따른 인터랙션
    let targetRotationX = map(mouseY, 0, height, -PI/2, PI/2);
    let targetRotationY = map(mouseX, 0, width, -PI/2, PI/2);
    rotationX = lerp(rotationX, targetRotationX, 0.05);
    rotationY = lerp(rotationY, targetRotationY, 0.05);
  } else {
    rotationX += rotationSpeed;
    rotationY += rotationSpeed * 0.7;
  }
  
  colorPhase += 0.01;
  
  // 파티클 업데이트 및 표시
  for (let p of particles) {
    p.update();
    p.display();
  }
  
  // 중앙 구체 그리기
  push();
  noStroke();
  
  // 컬러풀한 머티리얼
  let r = 150 + 105 * sin(colorPhase);
  let g = 150 + 105 * sin(colorPhase + PI/3);
  let b = 150 + 105 * sin(colorPhase + 2*PI/3);
  specularMaterial(r, g, b);
  
  rotateX(rotationX);
  rotateY(rotationY);
  sphere(sphereSize, detailLevel, detailLevel);
  pop();
  
  // UI 레이어 업데이트
  uiLayer.clear();
  
  // navigation을 UI 레이어에 그림
  uiLayer.push();
  uiLayer.fill('#333');
  uiLayer.stroke('#fff');
  uiLayer.rect(10, 10, 150, 30, 5);
  uiLayer.fill('#fff');
  uiLayer.noStroke();
  uiLayer.textAlign(CENTER, CENTER);
  uiLayer.text('Back to Gallery', 10 + 150/2, 10 + 30/2);
  
  // 마우스 인터랙션 설명
  if (mouseInteraction) {
    uiLayer.fill(255, 200, 100, 200);
    uiLayer.text('마우스로 구체를 조작 중', width/2, height - 30);
  } else {
    uiLayer.fill(200, 200, 255, 150);
    uiLayer.textSize(14);
    uiLayer.text('클릭하여 마우스로 조작 가능', width/2, height - 30);
  }
  uiLayer.pop();
  
  // 메인 캔버스에 UI 레이어 오버레이
  push();
  resetMatrix();
  imageMode(CORNER);
  image(uiLayer, -width/2, -height/2, width, height);
  pop();
}

function mouseReleased() {
  // No action needed
}

// 파티클 클래스
class Particle {
  constructor() {
    this.reset();
    // 초기화 시 랜덤 위치에서 시작
    this.life = random(0, this.maxLife);
  }
  
  reset() {
    this.pos = p5.Vector.random3D().mult(random(300, 400));
    this.vel = p5.Vector.random3D().mult(random(0.2, 1.0));
    this.size = random(2, 8);
    this.maxLife = random(80, 200);
    this.life = 0;
    this.hue = random(0, 360);
  }
  
  update() {
    // 중력 효과 (중앙으로 약하게 당김)
    let gravity = createVector(0, 0, 0).sub(this.pos);
    gravity.normalize();
    gravity.mult(0.05);
    this.vel.add(gravity);
    
    // 위치 업데이트
    this.pos.add(this.vel);
    
    // 수명 증가
    this.life++;
    
    // 수명이 다하면 리셋
    if (this.life >= this.maxLife) {
      this.reset();
    }
  }
  
  display() {
    push();
    // 파티클 위치로 이동
    translate(this.pos.x, this.pos.y, this.pos.z);
    
    // 포인트 라이트 효과
    pointLight(
      128 + 127 * sin(radians(this.hue)), 
      128 + 127 * sin(radians(this.hue + 120)), 
      128 + 127 * sin(radians(this.hue + 240)), 
      0, 0, 0
    );
    
    // 투명도 계산 (생성 및 소멸 시 페이드 효과)
    let alpha = 255;
    if (this.life < 20) {
      alpha = map(this.life, 0, 20, 0, 255);
    } else if (this.life > this.maxLife - 20) {
      alpha = map(this.life, this.maxLife - 20, this.maxLife, 255, 0);
    }
    
    // 파티클 그리기
    noStroke();
    emissiveMaterial(
      128 + 127 * sin(radians(this.hue)), 
      128 + 127 * sin(radians(this.hue + 120)), 
      128 + 127 * sin(radians(this.hue + 240)), 
      alpha
    );
    sphere(this.size, 8, 8);
    pop();
  }
}