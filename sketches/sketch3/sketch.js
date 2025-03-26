// Sketch variables
let navigation;
let torusRadius = 120;     // 토러스의 주요 반지름
let tubeRadius = 50;      // 토러스의 튜브 반지름
let rotationX = 0;
let rotationY = 0;
let rotationZ = 0;
let detailX = 24;        // 토러스의 세부 수준 X (원주 방향)
let detailY = 16;        // 토러스의 세부 수준 Y (튜브 방향)
let sliderTorusRadius, sliderTubeRadius;
let showFormulas = true;
let showCrossSection = false;
let wireframe = false;

function setup() {
    createCanvas(800, 600, WEBGL);
    
    // Initialize navigation with back button
    navigation = new Navigation();
    navigation.setup();
    
    // 슬라이더 생성
    sliderTorusRadius = createSlider(50, 200, torusRadius, 5);
    sliderTorusRadius.position(20, 20);
    sliderTorusRadius.style('width', '150px');
    
    sliderTubeRadius = createSlider(10, 80, tubeRadius, 2);
    sliderTubeRadius.position(20, 60);
    sliderTubeRadius.style('width', '150px');
    
    // 매끄러운 렌더링을 위한 설정
    smooth();
}

function draw() {
    // 배경 그리기
    background(240);
    
    // 라이팅 설정
    ambientLight(60, 60, 60);
    directionalLight(255, 255, 255, 0.5, 0.5, -1);
    pointLight(200, 150, 220, 100, -100, 200);
    
    // 슬라이더 값으로 토러스 크기 업데이트
    torusRadius = sliderTorusRadius.value();
    tubeRadius = sliderTubeRadius.value();
    
    // 자동 회전
    rotationX += 0.005;
    rotationY += 0.01;
    
    // 토러스 그리기
    push();
    rotateX(rotationX);
    rotateY(rotationY);
    
    // 토러스 렌더링
    drawTorus();
    
    // 좌표축 추가
    if (showCrossSection) {
        drawAxes();
        drawCrossSection();
    }
    
    pop();
    
    // 2D 레이어에 UI 그리기
    drawUI();
}

function drawTorus() {
    push();
    
    if (wireframe) {
        stroke(0);
        strokeWeight(1);
        noFill();
    } else {
        noStroke();
        specularMaterial(100, 150, 220);
    }
    
    // p5.js 내장 torus 함수 사용
    torus(torusRadius, tubeRadius, detailX, detailY);
    
    pop();
}

function drawCrossSection() {
    // 토러스의 단면도 그리기
    push();
    stroke(255, 0, 0);
    strokeWeight(2);
    noFill();
    
    // 주요 원 그리기
    push();
    rotateX(HALF_PI);
    noFill();
    stroke(255, 0, 0);
    circle(0, 0, torusRadius * 2);
    pop();
    
    // 튜브 단면 그리기
    push();
    translate(torusRadius, 0, 0);
    rotateY(HALF_PI);
    stroke(0, 255, 0);
    circle(0, 0, tubeRadius * 2);
    pop();
    
    pop();
}

function drawAxes() {
    // X축 (빨강)
    push();
    stroke(255, 0, 0);
    strokeWeight(2);
    line(0, 0, 0, 200, 0, 0);
    pop();
    
    // Y축 (초록)
    push();
    stroke(0, 255, 0);
    strokeWeight(2);
    line(0, 0, 0, 0, 200, 0);
    pop();
    
    // Z축 (파랑)
    push();
    stroke(0, 0, 255);
    strokeWeight(2);
    line(0, 0, 0, 0, 0, 200);
    pop();
}

function drawUI() {
    // WebGL에서는 일반적인 2D 그리기를 위해 resetMatrix 사용
    push();
    resetMatrix();
    
    // UI 텍스트
    fill(0);
    textSize(14);
    text("토러스 주요 반지름 (R):", 20, 15);
    text("토러스 튜브 반지름 (r):", 20, 55);
    
    // 왼쪽 상단 정보 패널
    fill(255, 255, 255, 200);
    rect(20, 100, 300, 180, 5);
    
    fill(0);
    textSize(16);
    text("토러스의 특성", 30, 120);
    text("주요 반지름(R): " + torusRadius + " 단위", 30, 145);
    text("튜브 반지름(r): " + tubeRadius + " 단위", 30, 170);
    
    // 공식 표시
    if (showFormulas) {
        let volume = 2 * PI * PI * torusRadius * tubeRadius * tubeRadius;
        let surfaceArea = 4 * PI * PI * torusRadius * tubeRadius;
        
        text("부피: V = 2π²Rr² = " + nf(volume, 0, 0) + " 단위³", 30, 195);
        text("표면적: S = 4π²Rr = " + nf(surfaceArea, 0, 0) + " 단위²", 30, 220);
        text("R: 주요 반지름, r: 튜브 반지름", 30, 245);
    }
    
    // 설명 텍스트
    fill(30, 30, 30, 200);
    textSize(14);
    text("'c' 키: 단면도 표시/숨기기", 580, 20);
    text("'w' 키: 와이어프레임 모드 전환", 580, 40);
    text("'f' 키: 공식 표시/숨기기", 580, 60);
    
    // Back to Gallery 버튼 그리기
    navigation.draw();
    pop();
}

function mousePressed() {
    // First check if navigation handles the click
    if (navigation.handleMousePressed()) {
        return false;
    }
    return false;
}

function mouseReleased() {
    navigation.handleMouseReleased();
}

function keyPressed() {
    if (key === 'c' || key === 'C') {
        showCrossSection = !showCrossSection;
    } else if (key === 'w' || key === 'W') {
        wireframe = !wireframe;
    } else if (key === 'f' || key === 'F') {
        showFormulas = !showFormulas;
    }
} 