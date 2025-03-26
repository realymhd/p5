// Sketch variables
let navigation;
let radius = 150;          // 구의 반지름
let rotationX = 0;
let rotationY = 0;
let detailLevel = 32;      // 구의 디테일 레벨
let icosaDetail = 0;       // 정이십면체 디테일 레벨 (0: 기본 정이십면체)
let showIcosahedron = true;
let showSphere = false;
let wireframe = false;
let toggleAnimation = true;
let showLabels = true;

// 정이십면체 정보
let phi = (1 + sqrt(5)) / 2;  // 황금비

function setup() {
    createCanvas(800, 600, WEBGL);
    
    // Initialize navigation with back button
    navigation = new Navigation();
    navigation.setup();
    
    // 매끄러운 렌더링을 위한 설정
    smooth();
    
    // Slider for radius
    radiusSlider = createSlider(50, 250, radius, 5);
    radiusSlider.position(20, 20);
    radiusSlider.style('width', '150px');
}

function draw() {
    // 배경 그리기
    background(240);
    
    // 라이팅 설정
    ambientLight(60, 60, 60);
    directionalLight(255, 255, 255, 0.5, 0.5, -1);
    pointLight(200, 150, 220, 100, -100, 200);
    
    // 반지름 업데이트
    radius = radiusSlider.value();
    
    // 자동 회전
    if (toggleAnimation) {
        rotationX += 0.01;
        rotationY += 0.01;
    }
    
    // 3D 객체 그리기
    push();
    rotateX(rotationX);
    rotateY(rotationY);
    
    if (wireframe) {
        stroke(20);
        strokeWeight(1);
        noFill();
    } else {
        noStroke();
    }
    
    // 정이십면체 그리기
    if (showIcosahedron) {
        if (!wireframe) {
            specularMaterial(100, 180, 220);
        }
        drawIcosahedron();
    }
    
    // 구 그리기
    if (showSphere) {
        if (!wireframe) {
            specularMaterial(220, 180, 100, 150);
        }
        sphere(radius, detailLevel, detailLevel);
    }
    
    // 좌표축 그리기 (옵션)
    if (showLabels) {
        drawAxes();
    }
    
    pop();
    
    // 2D 레이어에 UI 그리기
    drawUI();
}

function drawIcosahedron() {
    // 정이십면체 정점 (기본)
    let vertices = [
        [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
        [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
        [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1]
    ];
    
    // 정이십면체 삼각형 면 인덱스 (총 20면)
    let faces = [
        [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
        [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
        [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
        [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]
    ];
    
    // 정점을 구면 위로 투영 (구의 반지름에 맞게 정규화)
    for (let i = 0; i < vertices.length; i++) {
        let v = vertices[i];
        let mag = sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
        vertices[i] = [
            (v[0] / mag) * radius,
            (v[1] / mag) * radius,
            (v[2] / mag) * radius
        ];
    }
    
    // 정이십면체 그리기
    beginShape(TRIANGLES);
    for (let i = 0; i < faces.length; i++) {
        let face = faces[i];
        
        // 각 면의 꼭지점 추가
        for (let j = 0; j < 3; j++) {
            let v = vertices[face[j]];
            vertex(v[0], v[1], v[2]);
        }
    }
    endShape();
}

function drawAxes() {
    // X축 (빨강)
    push();
    stroke(255, 0, 0);
    strokeWeight(2);
    line(0, 0, 0, radius + 50, 0, 0);
    pop();
    
    // Y축 (초록)
    push();
    stroke(0, 255, 0);
    strokeWeight(2);
    line(0, 0, 0, 0, radius + 50, 0);
    pop();
    
    // Z축 (파랑)
    push();
    stroke(0, 0, 255);
    strokeWeight(2);
    line(0, 0, 0, 0, 0, radius + 50);
    pop();
}

function drawUI() {
    // WebGL에서는 일반적인 2D 그리기를 위해 resetMatrix 사용
    push();
    resetMatrix();
    
    // UI 텍스트
    fill(0);
    textSize(14);
    text("반지름:", 20, 15);
    
    // 왼쪽 상단 정보 패널
    fill(255, 255, 255, 200);
    rect(20, 60, 270, 170, 5);
    
    fill(0);
    textSize(16);
    text("정이십면체 및 구의 특성", 30, 80);
    text("반지름: " + radius + " 단위", 30, 105);
    
    // 정이십면체 정보
    text("정이십면체 특성:", 30, 135);
    text("- 정점 수: 12", 40, 155);
    text("- 모서리 수: 30", 40, 175);
    text("- 면 수: 20 (정삼각형)", 40, 195);
    
    // 조작 방법 안내
    fill(30, 30, 30, 200);
    rect(580, 10, 190, 130, 5);
    fill(255);
    textSize(14);
    text("조작 방법:", 590, 30);
    text("'i' 키: 정이십면체 표시/숨기기", 590, 50);
    text("'s' 키: 구 표시/숨기기", 590, 70);
    text("'w' 키: 와이어프레임 모드", 590, 90);
    text("'a' 키: 애니메이션 켜기/끄기", 590, 110);
    text("'l' 키: 좌표축 표시/숨기기", 590, 130);
    
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

function mouseDragged() {
    // 마우스 드래그로 회전 조작 (애니메이션 꺼진 경우)
    if (!toggleAnimation) {
        rotationY += (mouseX - pmouseX) * 0.01;
        rotationX += (mouseY - pmouseY) * 0.01;
    }
}

function keyPressed() {
    if (key === 'i' || key === 'I') {
        showIcosahedron = !showIcosahedron;
    } else if (key === 's' || key === 'S') {
        showSphere = !showSphere;
    } else if (key === 'w' || key === 'W') {
        wireframe = !wireframe;
    } else if (key === 'a' || key === 'A') {
        toggleAnimation = !toggleAnimation;
    } else if (key === 'l' || key === 'L') {
        showLabels = !showLabels;
    }
} 