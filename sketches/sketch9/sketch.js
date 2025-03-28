// // Sketch variables
// let particles = [];         // 입자 배열
// let numParticles = 50;      // 입자 개수
// let gravity = 0.1;          // 중력 가속도
// let friction = 0.99;        // 마찰 계수
// let windForce = 0;          // 바람 힘
// let showVectors = true;     // 벡터 표시 여부
// let showTrails = false;     // 궤적 표시 여부
// let showInfo = true;        // 정보 표시 여부
// let showControls = true;    // 컨트롤 표시 여부
// let attractionMode = false; // 마우스 인력 모드
// let repulsionMode = false;  // 마우스 척력 모드
// let trailsCanvas;           // 궤적을 그릴 캔버스

// // 물리 상수
// let elasticity = 0.7;       // 탄성 계수 (0-1)
// let mouseForceStrength = 5; // 마우스 힘 세기
// let colorMode = 0;          // 색상 모드 (0: 속도, 1: 크기, 2: 무작위)

// // Particle 클래스
// class Particle {
//     constructor() {
//         this.mass = random(5, 15);
//         this.position = createVector(random(width), random(height));
//         this.velocity = createVector(random(-2, 2), random(-2, 2));
//         this.acceleration = createVector(0, 0);
//         this.color = color(random(100, 255), random(100, 255), random(100, 255), 200);
//         this.trails = [];   // 궤적 저장
//         this.maxTrails = 30; // 최대 궤적 길이
//     }
    
//     applyForce(force) {
//         // F = ma, a = F/m
//         let f = p5.Vector.div(force, this.mass);
//         this.acceleration.add(f);
//     }
    
//     update() {
//         // 속도 업데이트 (v = v + a)
//         this.velocity.add(this.acceleration);
        
//         // 마찰력 적용
//         this.velocity.mult(friction);
        
//         // 궤적 저장
//         if (showTrails) {
//             this.trails.push(createVector(this.position.x, this.position.y));
//             if (this.trails.length > this.maxTrails) {
//                 this.trails.shift(); // 가장 오래된 위치 제거
//             }
//         } else {
//             this.trails = []; // 궤적 비우기
//         }
        
//         // 위치 업데이트 (x = x + v)
//         this.position.add(this.velocity);
        
//         // 가속도 초기화 (매 프레임마다 새로 계산)
//         this.acceleration.mult(0);
        
//         // 경계 확인 및 반사
//         this.checkEdges();
//     }
    
//     checkEdges() {
//         // 경계 벽과 충돌 시 반사
//         if (this.position.x > width - this.mass) {
//             this.position.x = width - this.mass;
//             this.velocity.x *= -elasticity;
//         } else if (this.position.x < this.mass) {
//             this.position.x = this.mass;
//             this.velocity.x *= -elasticity;
//         }
        
//         if (this.position.y > height - this.mass) {
//             this.position.y = height - this.mass;
//             this.velocity.y *= -elasticity;
//         } else if (this.position.y < this.mass) {
//             this.position.y = this.mass;
//             this.velocity.y *= -elasticity;
//         }
//     }
    
//     display() {
//         // 궤적 그리기
//         if (showTrails && this.trails.length > 1) {
//             let prevAlpha = 150;
//             trailsCanvas.stroke(red(this.color), green(this.color), blue(this.color), prevAlpha);
//             trailsCanvas.strokeWeight(this.mass * 0.5);
            
//             for (let i = 0; i < this.trails.length - 1; i++) {
//                 let alpha = map(i, 0, this.trails.length - 1, 20, 150);
//                 trailsCanvas.stroke(red(this.color), green(this.color), blue(this.color), alpha);
//                 trailsCanvas.line(this.trails[i].x, this.trails[i].y, 
//                              this.trails[i + 1].x, this.trails[i + 1].y);
//             }
//         }
        
//         // 입자 색상 (색상 모드에 따라)
//         let particleColor;
        
//         if (colorMode === 0) {
//             // 속도에 따른 색상
//             let speed = this.velocity.mag();
//             let mappedSpeed = map(speed, 0, 10, 0, 255);
//             particleColor = color(mappedSpeed, 100, 255 - mappedSpeed, 200);
//         } else if (colorMode === 1) {
//             // 크기에 따른 색상
//             let massColor = map(this.mass, 5, 15, 0, 255);
//             particleColor = color(100, massColor, 255 - massColor, 200);
//         } else {
//             // 기본 색상 사용
//             particleColor = this.color;
//         }
        
//         // 입자 그리기
//         fill(particleColor);
//         strokeWeight(1);
//         stroke(50, 200);
//         ellipse(this.position.x, this.position.y, this.mass * 2, this.mass * 2);
        
//         // 속도 벡터 표시
//         if (showVectors) {
//             this.displayVectors();
//         }
//     }
    
//     displayVectors() {
//         // 속도 벡터 (빨간색)
//         push();
//         stroke(255, 0, 0, 200);
//         strokeWeight(2);
//         let velocityVector = p5.Vector.mult(this.velocity, 5);
//         line(this.position.x, this.position.y, 
//              this.position.x + velocityVector.x, 
//              this.position.y + velocityVector.y);
//         // 화살표 그리기
//         let arrowSize = 6;
//         let angle = velocityVector.heading();
//         translate(this.position.x + velocityVector.x, this.position.y + velocityVector.y);
//         rotate(angle);
//         triangle(0, 0, -arrowSize, arrowSize/2, -arrowSize, -arrowSize/2);
//         pop();
//     }
// }

// function setup() {
//     createCanvas(800, 600);
    
//     // 궤적을 그릴 별도의 캔버스 생성
//     trailsCanvas = createGraphics(width, height);
//     trailsCanvas.clear();
    
//     // 입자 생성
//     for (let i = 0; i < numParticles; i++) {
//         particles.push(new Particle());
//     }
// }

// function draw() {
//     background(240);
    
//     // 궤적 캔버스 표시
//     if (showTrails) {
//         image(trailsCanvas, 0, 0);
        
//         // 특정 프레임마다 희미하게 만들기
//         if (frameCount % 5 === 0) {
//             trailsCanvas.fill(240, 30);
//             trailsCanvas.noStroke();
//             trailsCanvas.rect(0, 0, width, height);
//         }
//     } else {
//         trailsCanvas.clear();
//     }
    
//     // 마우스 위치에 따른 힘 적용
//     applyMouseForce();
    
//     // 물리 시뮬레이션 적용 및 입자 그리기
//     for (let particle of particles) {
//         // 중력 적용
//         let gravity_force = createVector(0, gravity * particle.mass);
//         particle.applyForce(gravity_force);
        
//         // 바람 적용
//         let wind = createVector(windForce, 0);
//         particle.applyForce(wind);
        
//         // 물리 업데이트
//         particle.update();
        
//         // 입자 그리기
//         particle.display();
//     }
    
//     // UI 그리기
//     drawUI();
// }

// function applyMouseForce() {
//     if (mouseIsPressed && (attractionMode || repulsionMode)) {
//         let mousePos = createVector(mouseX, mouseY);
        
//         for (let particle of particles) {
//             // 마우스와 입자 사이의 방향 벡터
//             let direction = p5.Vector.sub(mousePos, particle.position);
//             let distance = direction.mag();
            
//             // 최소 거리 제한 (0으로 나누기 방지)
//             if (distance < 5) distance = 5;
            
//             // 거리 제곱에 반비례하는 힘
//             let strength = mouseForceStrength / (distance * 0.5);
//             direction.normalize();
//             direction.mult(strength);
            
//             // 척력 모드면 방향 반전
//             if (repulsionMode) {
//                 direction.mult(-1);
//             }
            
//             // 힘 적용
//             particle.applyForce(direction);
            
//             // 힘 벡터 표시
//             if (showVectors) {
//                 push();
//                 stroke(0, 0, 255, 150);
//                 strokeWeight(1);
//                 line(particle.position.x, particle.position.y, 
//                      particle.position.x + direction.x * 50, 
//                      particle.position.y + direction.y * 50);
//                 pop();
//             }
//         }
//     }
// }

// function drawUI() {
//     // 물리 변수 정보 패널
//     if (showInfo) {
//         push();
//         fill(255, 255, 255, 200);
//         rect(20, 20, 220, 150, 5);
        
//         fill(0);
//         textSize(16);
//         text("물리 시뮬레이션", 30, 40);
//         text("입자 수: " + numParticles, 30, 65);
//         text("중력: " + nf(gravity, 1, 2), 30, 90);
//         text("마찰 계수: " + nf(friction, 1, 3), 30, 115);
//         text("바람 세기: " + nf(windForce, 1, 2), 30, 140);
//         text("탄성 계수: " + nf(elasticity, 1, 2), 30, 165);
//         pop();
//     }
    
//     // 조작 방법 안내
//     if (showControls) {
//         push();
//         fill(30, 30, 30, 200);
//         rect(width - 230, 10, 220, 200, 5);
        
//         fill(255);
//         textSize(14);
//         text("조작 방법:", width - 220, 30);
//         text("'v' 키: 벡터 표시/숨기기", width - 220, 50);
//         text("'t' 키: 궤적 표시/숨기기", width - 220, 70);
//         text("'i' 키: 정보 표시/숨기기", width - 220, 90);
//         text("'r' 키: 초기화", width - 220, 110);
//         text("'g' 키: 중력 켜기/끄기", width - 220, 130);
//         text("'c' 키: 색상 모드 변경", width - 220, 150);
//         text("'a' 키: 인력 모드 토글", width - 220, 170);
//         text("'s' 키: 척력 모드 토글", width - 220, 190);
//         text("마우스 휠: 바람 세기 조절", width - 220, 210);
//         pop();
//     }
    
//     // 현재 모드 표시
//     push();
//     textSize(14);
//     textAlign(CENTER);
//     if (attractionMode) {
//         fill(0, 0, 255, 200);
//         text("인력 모드", width/2, height - 20);
//     } else if (repulsionMode) {
//         fill(255, 0, 0, 200);
//         text("척력 모드", width/2, height - 20);
//     }
//     pop();
// }

// function mouseWheel(event) {
//     // 마우스 휠로 바람 세기 조절
//     windForce += event.delta * 0.01;
//     windForce = constrain(windForce, -2, 2);
//     return false;
// }

// function keyPressed() {
//     if (key === 'v' || key === 'V') {
//         showVectors = !showVectors;
//     } else if (key === 't' || key === 'T') {
//         showTrails = !showTrails;
//         trailsCanvas.clear();
//     } else if (key === 'i' || key === 'I') {
//         showInfo = !showInfo;
//     } else if (key === 'h' || key === 'H') {
//         showControls = !showControls;
//     } else if (key === 'r' || key === 'R') {
//         // 리셋
//         particles = [];
//         for (let i = 0; i < numParticles; i++) {
//             particles.push(new Particle());
//         }
//         trailsCanvas.clear();
//     } else if (key === 'g' || key === 'G') {
//         // 중력 토글
//         gravity = gravity === 0 ? 0.1 : 0;
//     } else if (key === 'c' || key === 'C') {
//         // 색상 모드 변경
//         colorMode = (colorMode + 1) % 3;
//     } else if (key === 'a' || key === 'A') {
//         // 인력 모드 토글
//         attractionMode = !attractionMode;
//         if (attractionMode) repulsionMode = false;
//     } else if (key === 's' || key === 'S') {
//         // 척력 모드 토글
//         repulsionMode = !repulsionMode;
//         if (repulsionMode) attractionMode = false;
//     } else if (key === '+' || key === '=') {
//         // 입자 수 증가
//         for (let i = 0; i < 5; i++) {
//             if (particles.length < 200) {
//                 particles.push(new Particle());
//                 numParticles++;
//             }
//         }
//     } else if (key === '-' || key === '_') {
//         // 입자 수 감소
//         for (let i = 0; i < 5; i++) {
//             if (particles.length > 5) {
//                 particles.pop();
//                 numParticles--;
//             }
//         }
//     }
// } 