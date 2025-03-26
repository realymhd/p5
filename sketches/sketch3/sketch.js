// Sketch variables
let dnaRadius = 100;       // DNA 반지름
let dnaLength = 500;       // DNA 길이
let nucleotides = 20;      // 뉴클레오티드 수
let rotationSpeed = 0.01;  // 회전 속도
let rotationY = 0;         // Y축 회전값
let basePairs = [];        // 염기쌍 정보
let showLabels = true;     // 레이블 표시 여부
let autoRotate = true;     // 자동 회전 여부

// 염기쌍 클래스
class BasePair {
    constructor(position, type) {
        this.position = position;  // DNA에서의 위치 (0 ~ 1)
        this.type = type;          // 염기쌍 타입 (0: A-T, 1: G-C)
        this.rotation = random(TWO_PI); // 초기 회전
        
        // 염기쌍의 색상
        if (this.type === 0) {
            this.color1 = color(255, 100, 100); // A (아데닌) - 빨강
            this.color2 = color(100, 255, 100); // T (티민) - 초록
        } else {
            this.color1 = color(100, 100, 255); // G (구아닌) - 파랑
            this.color2 = color(255, 255, 100); // C (시토신) - 노랑
        }
    }
    
    // 염기쌍 표시 함수
    display(yPos) {
        push();
        translate(0, yPos, 0);
        rotateY(this.rotation + rotationY);
        
        // 염기 1 (왼쪽)
        push();
        translate(-dnaRadius, 0, 0);
        fill(this.color1);
        noStroke();
        sphere(15);
        
        // 레이블 표시
        if (showLabels) {
            push();
            fill(255);
            textSize(14);
            textAlign(CENTER);
            text(this.type === 0 ? "A" : "G", 0, -20);
            pop();
        }
        pop();
        
        // 염기 2 (오른쪽)
        push();
        translate(dnaRadius, 0, 0);
        fill(this.color2);
        noStroke();
        sphere(15);
        
        // 레이블 표시
        if (showLabels) {
            push();
            fill(255);
            textSize(14);
            textAlign(CENTER);
            text(this.type === 0 ? "T" : "C", 0, -20);
            pop();
        }
        pop();
        
        // 염기쌍 연결 막대
        stroke(200);
        strokeWeight(5);
        line(-dnaRadius, 0, 0, dnaRadius, 0, 0);
        
        pop();
    }
}

function setup() {
    createCanvas(800, 600, WEBGL);
    
    // 염기쌍 생성
    for (let i = 0; i < nucleotides; i++) {
        let position = i / (nucleotides - 1);
        let type = random() > 0.5 ? 0 : 1;  // 랜덤하게 A-T 또는 G-C 염기쌍 생성
        basePairs.push(new BasePair(position, type));
    }
    
    // 매끄러운 렌더링을 위한 설정
    smooth();
    setAttributes('antialias', true);
}

function draw() {
    // 배경 그리기
    background(20);
    
    // 카메라 및 조명 설정
    orbitControl(3, 3, 0.1);
    ambientLight(60, 60, 60);
    pointLight(255, 255, 255, 300, -200, 500);
    
    // 자동 회전
    if (autoRotate) {
        rotationY += rotationSpeed;
    }
    
    // 이중 나선 DNA 구조 그리기
    drawDNA();
    
    // 2D 레이어에 UI 그리기
    drawUI();
}

function drawDNA() {
    push();
    
    // DNA 중심을 화면 중앙에 위치시키기
    translate(0, 0, 0);
    
    // DNA 가운데 위치해서 위아래로 그릴 수 있도록 회전
    rotateX(HALF_PI);
    
    // DNA 중심축에서 시작하는 위치 조정
    translate(0, -dnaLength/2, 0);
    
    // 두 가닥의 나선 구조 그리기
    drawHelixes();
    
    // 염기쌍 그리기
    for (let i = 0; i < basePairs.length; i++) {
        let yPos = i * (dnaLength / (nucleotides - 1));
        basePairs[i].display(yPos);
    }
    
    pop();
}

function drawHelixes() {
    push();
    // 첫 번째 나선 (빨간색)
    stroke(255, 150, 150);
    strokeWeight(8);
    noFill();
    beginShape();
    for (let i = 0; i <= 100; i++) {
        let angle = map(i, 0, 100, 0, TWO_PI * nucleotides / 2);
        let y = i * (dnaLength / 100);
        let x = sin(angle + rotationY) * dnaRadius;
        let z = cos(angle + rotationY) * dnaRadius;
        vertex(x, y, z);
    }
    endShape();
    
    // 두 번째 나선 (파란색)
    stroke(150, 150, 255);
    strokeWeight(8);
    beginShape();
    for (let i = 0; i <= 100; i++) {
        let angle = map(i, 0, 100, 0, TWO_PI * nucleotides / 2) + PI;
        let y = i * (dnaLength / 100);
        let x = sin(angle + rotationY) * dnaRadius;
        let z = cos(angle + rotationY) * dnaRadius;
        vertex(x, y, z);
    }
    endShape();
    pop();
}

function drawUI() {
    // WebGL에서는 일반적인 2D 그리기를 위해 resetMatrix 사용
    push();
    resetMatrix();
    
    // 왼쪽 상단 정보 패널
    fill(0, 0, 30, 200);
    rect(20, 20, 280, 160, 5);
    
    fill(255);
    textSize(16);
    text("DNA 분자 구조", 30, 40);
    text("염기쌍 수: " + nucleotides, 30, 65);
    text("A-T 염기쌍 수: " + basePairs.filter(bp => bp.type === 0).length, 30, 90);
    text("G-C 염기쌍 수: " + basePairs.filter(bp => bp.type === 1).length, 30, 115);
    text("이중 나선 반지름: " + dnaRadius + " 단위", 30, 140);
    text("염기쌍 간 거리: " + (dnaLength / (nucleotides - 1)) + " 단위", 30, 165);
    
    // 조작 방법 안내
    fill(0, 0, 30, 200);
    rect(580, 10, 190, 130, 5);
    fill(255);
    textSize(14);
    text("조작 방법:", 590, 30);
    text("'r' 키: 자동 회전 켜기/끄기", 590, 50);
    text("'l' 키: 레이블 표시/숨기기", 590, 70);
    text("'n' 키: 새로운 DNA 구조 생성", 590, 90);
    text("마우스 드래그: 회전", 590, 110);
    text("휠: 확대/축소", 590, 130);
    
    pop();
}

function mousePressed() {
    return false;
}

function mouseReleased() {
    // 마우스 놓기 처리
}

function mouseDragged() {
    // 마우스 드래그로 회전 조작 (자동 회전이 꺼진 경우만)
    if (!autoRotate) {
        rotationY += (mouseX - pmouseX) * 0.01;
    }
}

function keyPressed() {
    if (key === 'r' || key === 'R') {
        autoRotate = !autoRotate;
    } else if (key === 'l' || key === 'L') {
        showLabels = !showLabels;
    } else if (key === 'n' || key === 'N') {
        // 새로운 DNA 구조 생성
        basePairs = [];
        for (let i = 0; i < nucleotides; i++) {
            let position = i / (nucleotides - 1);
            let type = random() > 0.5 ? 0 : 1;
            basePairs.push(new BasePair(position, type));
        }
    }
} 