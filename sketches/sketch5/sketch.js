// Sketch variables
let cubeSize = 150;         // 정육면체 크기
let rotationX = Math.PI / 5;
let rotationY = Math.PI / 4;
let rotationZ = 0;
let showFolded = true;      // 접힌 정육면체 표시
let showUnfolded = false;   // 펼쳐진 정육면체(전개도) 표시
let showLabels = true;      // 면 레이블 표시
let showDimensions = true;  // 치수 표시

// 정육면체 면 색상
let faceColors = [
    [255, 100, 100, 200],  // 앞면 (빨강)
    [100, 255, 100, 200],  // 뒷면 (초록)
    [100, 100, 255, 200],  // 상단 (파랑)
    [255, 255, 100, 200],  // 하단 (노랑)
    [255, 100, 255, 200],  // 왼쪽 (분홍)
    [100, 255, 255, 200]   // 오른쪽 (청록)
];

// 면 이름
let faceNames = ["앞면", "뒷면", "윗면", "아랫면", "왼쪽면", "오른쪽면"];

function setup() {
    createCanvas(800, 600, WEBGL);
    
    // 매끄러운 렌더링을 위한 설정
    smooth();
}

function draw() {
    // 배경 그리기
    background(240);
    
    // 라이팅 설정
    ambientLight(80, 80, 80);
    directionalLight(255, 255, 255, 0.5, 0.5, -1);
    
    // 자동 회전 (매우 느리게)
    rotationY += 0.005;
    
    // 분할된 화면 레이아웃
    if (showFolded && showUnfolded) {
        // 둘 다 표시할 경우 화면 분할
        
        // 왼쪽에 접힌 정육면체 그리기
        push();
        translate(-width/4, 0, 0);
        drawFoldedCube();
        pop();
        
        // 오른쪽에 전개도 그리기
        push();
        translate(width/4, 0, 0);
        drawUnfoldedCube();
        pop();
    } else if (showFolded) {
        // 접힌 정육면체만 표시
        drawFoldedCube();
    } else if (showUnfolded) {
        // 전개도만 표시
        drawUnfoldedCube();
    }
    
    // 2D 레이어에 UI 그리기
    drawUI();
}

function drawFoldedCube() {
    push();
    rotateX(rotationX);
    rotateY(rotationY);
    rotateZ(rotationZ);
    
    // 정육면체의 각 면 그리기 (직접 구현)
    let halfSize = cubeSize / 2;
    
    // 앞면 (Z+)
    push();
    fill(faceColors[0]);
    translate(0, 0, halfSize);
    if (showLabels) {
        drawFaceWithLabel(faceNames[0], 0);
    } else {
        plane(cubeSize, cubeSize);
    }
    pop();
    
    // 뒷면 (Z-)
    push();
    fill(faceColors[1]);
    translate(0, 0, -halfSize);
    rotateY(PI);
    if (showLabels) {
        drawFaceWithLabel(faceNames[1], 1);
    } else {
        plane(cubeSize, cubeSize);
    }
    pop();
    
    // 상단 (Y-)
    push();
    fill(faceColors[2]);
    translate(0, -halfSize, 0);
    rotateX(HALF_PI);
    if (showLabels) {
        drawFaceWithLabel(faceNames[2], 2);
    } else {
        plane(cubeSize, cubeSize);
    }
    pop();
    
    // 하단 (Y+)
    push();
    fill(faceColors[3]);
    translate(0, halfSize, 0);
    rotateX(-HALF_PI);
    if (showLabels) {
        drawFaceWithLabel(faceNames[3], 3);
    } else {
        plane(cubeSize, cubeSize);
    }
    pop();
    
    // 왼쪽 (X-)
    push();
    fill(faceColors[4]);
    translate(-halfSize, 0, 0);
    rotateY(-HALF_PI);
    if (showLabels) {
        drawFaceWithLabel(faceNames[4], 4);
    } else {
        plane(cubeSize, cubeSize);
    }
    pop();
    
    // 오른쪽 (X+)
    push();
    fill(faceColors[5]);
    translate(halfSize, 0, 0);
    rotateY(HALF_PI);
    if (showLabels) {
        drawFaceWithLabel(faceNames[5], 5);
    } else {
        plane(cubeSize, cubeSize);
    }
    pop();
    
    if (showDimensions) {
        // 치수 표시 (모서리 하나)
        stroke(0);
        strokeWeight(2);
        let dimOffset = halfSize + 20;
        line(halfSize, halfSize, halfSize, halfSize, halfSize, -halfSize);
        
        push();
        fill(0);
        translate(halfSize, halfSize, 0);
        rotateY(-HALF_PI);
        textSize(16);
        text(cubeSize, 0, -20);
        pop();
    }
    
    pop();
}

function drawFaceWithLabel(label, index) {
    // 라벨이 있는 면을 그림
    plane(cubeSize, cubeSize);
    push();
    fill(0);
    textSize(20);
    textAlign(CENTER, CENTER);
    text(label, 0, 0);
    pop();
}

function drawUnfoldedCube() {
    push();
    // 전개도는 회전하지 않고 정면에서만 봄
    rotateX(HALF_PI);
    
    let size = cubeSize * 0.8;  // 전개도는 약간 작게 표시
    let halfSize = size / 2;
    
    // T자 형태의 전개도 그리기
    
    // 중앙 면 (앞면)
    push();
    fill(faceColors[0]);
    translate(0, 0, 0);
    if (showLabels) {
        drawFaceWithLabel(faceNames[0], 0);
    } else {
        plane(size, size);
    }
    pop();
    
    // 상단 (윗면)
    push();
    fill(faceColors[2]);
    translate(0, -size, 0);
    if (showLabels) {
        drawFaceWithLabel(faceNames[2], 2);
    } else {
        plane(size, size);
    }
    pop();
    
    // 하단 (아랫면)
    push();
    fill(faceColors[3]);
    translate(0, size, 0);
    if (showLabels) {
        drawFaceWithLabel(faceNames[3], 3);
    } else {
        plane(size, size);
    }
    pop();
    
    // 왼쪽 (왼쪽면)
    push();
    fill(faceColors[4]);
    translate(-size, 0, 0);
    if (showLabels) {
        drawFaceWithLabel(faceNames[4], 4);
    } else {
        plane(size, size);
    }
    pop();
    
    // 오른쪽 (오른쪽면)
    push();
    fill(faceColors[5]);
    translate(size, 0, 0);
    if (showLabels) {
        drawFaceWithLabel(faceNames[5], 5);
    } else {
        plane(size, size);
    }
    pop();
    
    // 뒷면 (상단 뒤에 배치)
    push();
    fill(faceColors[1]);
    translate(0, -size*2, 0);
    if (showLabels) {
        drawFaceWithLabel(faceNames[1], 1);
    } else {
        plane(size, size);
    }
    pop();
    
    // 선 추가해서 접는 선 표시
    stroke(0);
    strokeWeight(2);
    
    // 수평선
    line(-halfSize*3, -size, halfSize*3, -size);
    line(-halfSize*3, 0, halfSize*3, 0);
    line(-halfSize*3, size, halfSize*3, size);
    
    // 수직선
    line(-size, -halfSize*3, -size, halfSize*3);
    line(0, -halfSize*3, 0, halfSize*3);
    line(size, -halfSize*3, size, halfSize*3);
    
    // 치수 표시
    if (showDimensions) {
        push();
        fill(0);
        textSize(16);
        text(cubeSize, size+halfSize, halfSize/2);
        text(cubeSize, halfSize/2, size+halfSize);
        pop();
    }
    
    pop();
}

function drawUI() {
    // WebGL에서는 일반적인 2D 그리기를 위해 resetMatrix 사용
    push();
    resetMatrix();
    
    // 왼쪽 상단 정보 패널
    fill(255, 255, 255, 200);
    rect(20, 20, 200, 180, 5);
    
    fill(0);
    textSize(16);
    text("정육면체 특성", 30, 40);
    text("한 변의 길이: " + cubeSize + " 단위", 30, 65);
    text("표면적: " + (6 * cubeSize * cubeSize) + " 단위²", 30, 90);
    text("부피: " + (cubeSize * cubeSize * cubeSize) + " 단위³", 30, 115);
    text("모서리 수: 12개", 30, 140);
    text("꼭짓점 수: 8개", 30, 165);
    
    // 조작 방법 안내
    fill(30, 30, 30, 200);
    rect(580, 10, 190, 150, 5);
    fill(255);
    textSize(14);
    text("조작 방법:", 590, 30);
    text("'f' 키: 정육면체 표시/숨기기", 590, 50);
    text("'u' 키: 전개도 표시/숨기기", 590, 70);
    text("'l' 키: 면 레이블 표시/숨기기", 590, 90);
    text("'d' 키: 치수 표시/숨기기", 590, 110);
    text("마우스 드래그: 회전", 590, 130);
    
    pop();
}

function mousePressed() {
    return false;
}

function mouseReleased() {
    // 마우스 놓기 처리
}

function mouseDragged() {
    // 마우스 드래그로 회전 조작
    rotationY += (mouseX - pmouseX) * 0.01;
    rotationX += (mouseY - pmouseY) * 0.01;
}

function keyPressed() {
    if (key === 'f' || key === 'F') {
        showFolded = !showFolded;
        
        // 둘 다 꺼진 경우 하나라도 켜기
        if (!showFolded && !showUnfolded) {
            showUnfolded = true;
        }
    } else if (key === 'u' || key === 'U') {
        showUnfolded = !showUnfolded;
        
        // 둘 다 꺼진 경우 하나라도 켜기
        if (!showFolded && !showUnfolded) {
            showFolded = true;
        }
    } else if (key === 'l' || key === 'L') {
        showLabels = !showLabels;
    } else if (key === 'd' || key === 'D') {
        showDimensions = !showDimensions;
    }
} 