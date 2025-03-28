let mirrors = [];
let particles = [];
let particleCount = 2;
let tracePoints = [];
let isDragging = false;
let draggedMirror = null;
let dragOffset = { x: 0, y: 0 };

function setup() {
  createCanvas(800, 600);
  
  // 거울 배치
  mirrors.push({ x1: 200, y1: 200, x2: 400, y2: 200 });
  mirrors.push({ x1: 600, y1: 200, x2: 700, y2: 300 });
  mirrors.push({ x1: 500, y1: 400, x2: 600, y2: 450 });
  mirrors.push({ x1: 100, y1: 300, x2: 150, y2: 450 });
  
  // 광자 생성
  for (let i = 0; i < particleCount; i++) {
    createParticle();
  }
  
  // 첫 번째 광자 색상 파란색으로 변경
  if (particles[0]) {
    particles[0].color = { r: 0, g: 100, b: 255 };
    particles[0].id = 0; // 고유 ID 부여
  }
  
  // 두 번째 광자 색상 (기본값 노란색 유지)
  if (particles[1]) {
    particles[1].color = { r: 255, g: 255, b: 0 };
    particles[1].id = 1;
  }
  
  smooth();
}

function draw() {
  background(0);
  drawMirrors();
  drawTraces();
  updateParticles();
}

// 거울 그리기 (흰색)
function drawMirrors() {
  stroke(255);
  strokeWeight(3);
  for (let mirror of mirrors) {
    line(mirror.x1, mirror.y1, mirror.x2, mirror.y2);
  }
}

// 광자 업데이트
function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    
    p.x += p.vx;
    p.y += p.vy;

    // 경로 기록 (모든 광자)
    if (frameCount % 2 === 0) {
      tracePoints.push({
        x: p.x,
        y: p.y,
        life: 80,
        particleId: p.id,
        isCollision: false
      });
    }

    // 벽 충돌 처리
    handleWallCollision(p);

    // 광자 그리기 (개별 색상 적용)
    fill(p.color.r, p.color.g, p.color.b);
    noStroke();
    circle(p.x, p.y, 6);

    // 거울 충돌 처리
    checkMirrorCollisions(p);
  }
}

// 벽 충돌 처리
function handleWallCollision(p) {
  let bounced = false;
  
  if (p.x < 0) { p.x = 0; p.vx = -p.vx; bounced = true; }
  else if (p.x > width) { p.x = width; p.vx = -p.vx; bounced = true; }
  if (p.y < 0) { p.y = 0; p.vy = -p.vy; bounced = true; }
  else if (p.y > height) { p.y = height; p.vy = -p.vy; bounced = true; }

  if (bounced) {
    tracePoints.push({
      x: p.x,
      y: p.y,
      life: 120,
      particleId: p.id,
      isCollision: true
    });
  }
}

// 거울 충돌 처리
function checkMirrorCollisions(p) {
  for (let mirror of mirrors) {
    let prevX = p.x - p.vx;
    let prevY = p.y - p.vy;
    
    let intersection = rayLineIntersection(
      prevX, prevY, p.x, p.y,
      mirror.x1, mirror.y1, mirror.x2, mirror.y2
    );
    
    if (intersection) {
      // 반사 계산
      let mirrorVec = createVector(mirror.x2 - mirror.x1, mirror.y2 - mirror.y1);
      let normal = createVector(-mirrorVec.y, mirrorVec.x).normalize();
      let incident = createVector(p.vx, p.vy);
      let dot = incident.dot(normal);
      
      p.vx = p.vx - 2 * dot * normal.x;
      p.vy = p.vy - 2 * dot * normal.y;
      
      p.x = intersection.x + p.vx * 0.1;
      p.y = intersection.y + p.vy * 0.1;
      
      // 충돌 점 기록
      tracePoints.push({
        x: intersection.x,
        y: intersection.y,
        life: 120,
        particleId: p.id,
        isCollision: true
      });
      
      break;
    }
  }
}

// 경로 그리기
function drawTraces() {
  for (let i = tracePoints.length - 1; i >= 0; i--) {
    let point = tracePoints[i];
    point.life -= 1;
    
    if (point.life <= 0) {
      tracePoints.splice(i, 1);
      continue;
    }
    
    // 첫 번째 광자(파란색)의 경로는 청록색으로
    if (point.particleId === 0) {
      fill(0, 200, 255, point.life * 2); // 청록색
    } 
    // 두 번째 광자(노란색)의 경로는 주황색으로
    else {
      fill(255, 150, 0, point.life); // 주황색
    }
    
    noStroke();
    circle(point.x, point.y, point.isCollision ? 8 : 3);
  }
}

// 광자 생성
function createParticle() {
  let angle = random(TWO_PI);
  particles.push({
    x: width/2 + random(-100, 100),
    y: height/2 + random(-100, 100),
    vx: cos(angle) * 3,
    vy: sin(angle) * 3,
    color: { r: 255, g: 255, b: 0 }, // 기본값: 노란색
    id: particles.length
  });
}

// 선분 교차 계산
function rayLineIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
  let denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
  if (Math.abs(denom) < 0.0001) return null;
  
  let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
  let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;
  
  if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
    return {
      x: x1 + ua * (x2 - x1),
      y: y1 + ua * (y2 - y1)
    };
  }
  return null;
}

// 마우스 인터랙션 (거울 드래그)
function mousePressed() {
  let minDist = 20;
  for (let mirror of mirrors) {
    let d1 = dist(mouseX, mouseY, mirror.x1, mirror.y1);
    let d2 = dist(mouseX, mouseY, mirror.x2, mirror.y2);
    let d3 = distToLine(mouseX, mouseY, mirror.x1, mirror.y1, mirror.x2, mirror.y2);
    
    if (d1 < minDist) {
      isDragging = true;
      draggedMirror = mirror;
      dragOffset = { x: mouseX - mirror.x1, y: mouseY - mirror.y1 };
      mirror.dragPoint = 'start';
      break;
    } else if (d2 < minDist) {
      isDragging = true;
      draggedMirror = mirror;
      dragOffset = { x: mouseX - mirror.x2, y: mouseY - mirror.y2 };
      mirror.dragPoint = 'end';
      break;
    } else if (d3 < minDist) {
      isDragging = true;
      draggedMirror = mirror;
      dragOffset = { 
        x: mouseX - (mirror.x1 + mirror.x2)/2, 
        y: mouseY - (mirror.y1 + mirror.y2)/2 
      };
      mirror.dragPoint = 'middle';
      break;
    }
  }
}

function mouseDragged() {
  if (isDragging && draggedMirror) {
    if (draggedMirror.dragPoint === 'start') {
      draggedMirror.x1 = mouseX - dragOffset.x;
      draggedMirror.y1 = mouseY - dragOffset.y;
    } else if (draggedMirror.dragPoint === 'end') {
      draggedMirror.x2 = mouseX - dragOffset.x;
      draggedMirror.y2 = mouseY - dragOffset.y;
    } else {
      let dx = mouseX - dragOffset.x - (draggedMirror.x1 + draggedMirror.x2)/2;
      let dy = mouseY - dragOffset.y - (draggedMirror.y1 + draggedMirror.y2)/2;
      draggedMirror.x1 += dx;
      draggedMirror.y1 += dy;
      draggedMirror.x2 += dx;
      draggedMirror.y2 += dy;
    }
  }
}

function mouseReleased() {
  isDragging = false;
}

function distToLine(px, py, x1, y1, x2, y2) {
  let lineLen = dist(x1, y1, x2, y2);
  if (lineLen === 0) return dist(px, py, x1, y1);
  
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / (lineLen * lineLen);
  t = constrain(t, 0, 1);
  
  let projX = x1 + t * (x2 - x1);
  let projY = y1 + t * (y2 - y1);
  
  return dist(px, py, projX, projY);
}