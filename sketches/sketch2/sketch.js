// Sketch variables
let navigation;
let cylinderHeight = 200;
let cylinderRadius = 100;
let rotationY = 0;
let rotationX = Math.PI / 6;
let detailLevel = 24;
let colorTop, colorBottom, colorSide;
let sliderHeight, sliderRadius;
let showLabels = true;

function setup() {
    createCanvas(800, 600, WEBGL);
    
    // Initialize navigation with back button
    navigation = new Navigation();
    navigation.setup();
    
    // 슬라이더 생성
    sliderHeight = createSlider(50, 300, cylinderHeight, 5);
    sliderHeight.position(20, 20);
    sliderHeight.style('width', '150px');
    
    sliderRadius = createSlider(20, 150, cylinderRadius, 5);
    sliderRadius.position(20, 60);
    sliderRadius.style('width', '150px');
    
    // 색상 설정
    colorTop = color(100, 200, 255, 220);
    colorBottom = color(100, 200, 255, 220);
    colorSide = color(100, 150, 255, 200);
    
    // 매끄러운 렌더링을 위한 설정
    smooth();
}

function draw() {
    // 배경 그리기
    background(240);
    
    // 원점을 캔버스 중앙으로 이동 (WebGL 모드에서 기본값)
    // 라이팅 설정
    ambientLight(60, 60, 80);
    directionalLight(255, 255, 255, 0.5, 0.5, -1);
    
    // 슬라이더 값으로 원기둥 크기 업데이트
    cylinderHeight = sliderHeight.value();
    cylinderRadius = sliderRadius.value();
    
    // 자동 회전
    rotationY += 0.01;
    
    // 원기둥 그리기
    push();
    rotateX(rotationX);
    rotateY(rotationY);
    
    // 원기둥 측면
    drawCylinder();
    
    // 원기둥 수치 표시
    if (showLabels) {
        push();
        rotateX(PI/2);
        translate(0, 0, cylinderHeight/2 + 10);
        fill(0);
        textSize(16);
        text("r = " + cylinderRadius, cylinderRadius/2, 0);
        pop();
        
        push();
        translate(0, 0, cylinderHeight/2);
        rotateX(PI/2);
        fill(0);
        textSize(16);
        text("h = " + cylinderHeight, cylinderRadius + 20, 0);
        pop();
    }
    
    pop();
    
    // 2D 레이어에 UI 그리기
    drawUI();
}

function drawCylinder() {
    // 원기둥 상단 면
    push();
    translate(0, -cylinderHeight/2, 0);
    fill(colorTop);
    stroke(0);
    strokeWeight(1);
    circle(0, 0, cylinderRadius * 2);
    pop();
    
    // 원기둥 하단 면
    push();
    translate(0, cylinderHeight/2, 0);
    fill(colorBottom);
    stroke(0);
    strokeWeight(1);
    circle(0, 0, cylinderRadius * 2);
    pop();
    
    // 원기둥 측면
    push();
    fill(colorSide);
    stroke(0);
    strokeWeight(1);
    
    // 측면 그리기
    beginShape(TRIANGLE_STRIP);
    for (let i = 0; i <= detailLevel; i++) {
        let angle = TWO_PI * i / detailLevel;
        let x = sin(angle) * cylinderRadius;
        let z = cos(angle) * cylinderRadius;
        
        // 상단 정점
        vertex(x, -cylinderHeight/2, z);
        // 하단 정점
        vertex(x, cylinderHeight/2, z);
    }
    endShape();
    pop();
    
    // 표면적과 부피 공식 표시
    push();
    translate(0, cylinderHeight/2 + 30, 0);
    rotateX(PI/2);
    rotateY(PI);
    fill(0);
    textSize(16);
    text("부피 V = πr²h = " + nf(PI * cylinderRadius * cylinderRadius * cylinderHeight, 0, 0), 0, 0);
    text("표면적 S = 2πr² + 2πrh = " + nf(2 * PI * cylinderRadius * cylinderRadius + 2 * PI * cylinderRadius * cylinderHeight, 0, 0), 0, 30);
    pop();
}

function drawUI() {
    // WebGL에서는 일반적인 2D 그리기를 위해 resetMatrix 사용
    push();
    resetMatrix();
    
    // UI 텍스트
    fill(0);
    textSize(14);
    text("원기둥 높이 (h):", 20, 15);
    text("원기둥 반지름 (r):", 20, 55);
    
    // 왼쪽 상단 정보 패널
    fill(255, 255, 255, 200);
    rect(20, 100, 250, 150, 5);
    
    fill(0);
    textSize(16);
    text("원기둥의 특성", 30, 120);
    text("반지름: " + cylinderRadius + " 단위", 30, 145);
    text("높이: " + cylinderHeight + " 단위", 30, 170);
    text("부피: " + nf(PI * cylinderRadius * cylinderRadius * cylinderHeight, 0, 0) + " 단위³", 30, 195);
    text("표면적: " + nf(2 * PI * cylinderRadius * cylinderRadius + 2 * PI * cylinderRadius * cylinderHeight, 0, 0) + " 단위²", 30, 220);
    
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
    if (key === 'l' || key === 'L') {
        showLabels = !showLabels;
    }
}

function mouseDragged() {
    if (isDragging) {
        let dx = mouseX - centerX;
        let dy = mouseY - centerY;
        angle = atan2(dy, dx);
        
        // Keep angle between 0 and PI
        if (angle < 0) angle = 0;
        if (angle > PI) angle = PI;
    }
} 