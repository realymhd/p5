// Sketch variables
let angle = PI / 4;            // 가지 각도
let branchRatio = 0.67;        // 가지 길이 비율
let initialLength = 200;       // 초기 가지 길이
let depth = 9;                 // 재귀 깊이
let colorMode = 0;             // 색상 모드 (0: 깊이 기준, 1: 각도 기준, 2: 무지개)
let strokeMode = 0;            // 선 모드 (0: 굵기 감소, 1: 일정한 굵기)
let animationSpeed = 0.01;     // 애니메이션 속도
let windEffect = 0;            // 바람 효과
let leafSize = 15;             // 잎 크기
let showLeaves = true;         // 잎 표시 여부
let showInfo = true;           // 정보 표시 여부
let autoAnimate = true;        // 자동 애니메이션
let showControls = true;       // 컨트롤 표시 여부

// 프랙탈 트리 설정
let branches = [];             // 생성된 가지 저장 배열
let leaves = [];               // 생성된 잎 저장 배열
let baseHue = 0;               // 기본 색상 (무지개 모드에서 사용)

// 나뭇잎 클래스
class Leaf {
    constructor(x, y, size, angle, depth) {
        this.position = createVector(x, y);
        this.size = size;
        this.angle = angle;
        this.depth = depth;
        this.swayOffset = random(TWO_PI);
        this.fallSpeed = random(0.5, 2);
        this.fallen = false;
        this.groundY = height - 50 + random(-20, 20);
        this.opacity = 255;
        this.rotSpeed = random(-0.05, 0.05);
        
        // 잎 색상 - 깊이에 따라 초록색~붉은색 변화
        this.hue = map(depth, 0, 9, 90, 30);
        this.color = color(this.hue, 100, 70, this.opacity);
    }
    
    update() {
        // 바람 효과 적용
        if (!this.fallen) {
            let swayAmount = sin(frameCount * 0.05 + this.swayOffset) * windEffect;
            this.angle += swayAmount * 0.02;
            
            // 일정 확률로 잎이 떨어짐
            if (random(1) < 0.0005 * (1 + abs(windEffect))) {
                this.fallen = true;
            }
        } else {
            // 잎이 떨어지는 애니메이션
            this.position.y += this.fallSpeed;
            this.position.x += sin(frameCount * 0.1) * windEffect * 0.5;
            this.angle += this.rotSpeed;
            
            // 바닥에 닿으면 멈춤
            if (this.position.y >= this.groundY) {
                this.position.y = this.groundY;
                this.opacity = max(0, this.opacity - 0.5); // 서서히 사라짐
            }
        }
        
        // 색상 업데이트
        this.color = color(this.hue, 100, 70, this.opacity);
    }
    
    display() {
        push();
        translate(this.position.x, this.position.y);
        rotate(this.angle);
        
        fill(this.color);
        noStroke();
        
        // 잎 모양 그리기 (타원형)
        ellipse(0, 0, this.size, this.size * 1.5);
        
        pop();
    }
}

// Branch 클래스
class Branch {
    constructor(start, end, depth, angle) {
        this.start = start.copy();
        this.end = end.copy();
        this.depth = depth;
        this.angle = angle;
        this.originalEnd = end.copy();
        this.swayOffset = random(TWO_PI);
        this.thickness = map(depth, 0, 10, 12, 1);
    }
    
    update() {
        // 바람 효과로 가지 움직임 업데이트
        if (this.depth > 0) {
            let swayAmount = sin(frameCount * 0.05 + this.swayOffset + this.depth * 0.3) * windEffect;
            swayAmount *= map(this.depth, 0, 10, 0.1, 1); // 깊이에 따라 움직임 정도 조절
            
            // 원래 위치를 기준으로 회전
            let offset = p5.Vector.sub(this.originalEnd, this.start);
            offset.rotate(swayAmount * 0.05);
            
            this.end = p5.Vector.add(this.start, offset);
        }
    }
    
    display() {
        // 가지 색상 설정 (색상 모드에 따라)
        if (colorMode === 0) {
            // 깊이 기준 색상
            let col = map(this.depth, 0, depth, 30, 80);
            stroke(col, 70, 40);
        } else if (colorMode === 1) {
            // 각도 기준 색상
            let col = map(this.angle, -PI, PI, 0, 360) % 360;
            stroke(col, 70, 50);
        } else {
            // 무지개 색상
            let col = (baseHue + this.depth * 30) % 360;
            stroke(col, 80, 50);
        }
        
        // 가지 굵기 (모드에 따라)
        if (strokeMode === 0) {
            strokeWeight(this.thickness);
        } else {
            strokeWeight(2);
        }
        
        // 가지 그리기
        line(this.start.x, this.start.y, this.end.x, this.end.y);
    }
}

function setup() {
    createCanvas(800, 600);
    
    // 색상 모드 설정
    colorMode = HSB, 360, 100, 100, 255;
    
    // 초기 트리 생성
    generateTree();
}

function generateTree() {
    // 배열 초기화
    branches = [];
    leaves = [];
    
    // 트리 시작점 (화면 하단 중앙)
    let start = createVector(width / 2, height - 50);
    let end = createVector(width / 2, height - 50 - initialLength);
    
    // 첫 가지 생성
    let root = new Branch(start, end, 0, 0);
    branches.push(root);
    
    // 재귀적으로 가지 생성
    generateBranches(root, depth);
}

function generateBranches(parent, remainingDepth) {
    if (remainingDepth <= 0) return;
    
    // 부모 가지의 방향 벡터
    let dir = p5.Vector.sub(parent.end, parent.start);
    dir.mult(branchRatio);
    
    // 왼쪽 가지
    let leftAngle = parent.angle - angle;
    let leftDir = dir.copy().rotate(leftAngle);
    let leftEnd = p5.Vector.add(parent.end, leftDir);
    let leftBranch = new Branch(parent.end, leftEnd, parent.depth + 1, leftAngle);
    branches.push(leftBranch);
    
    // 오른쪽 가지
    let rightAngle = parent.angle + angle;
    let rightDir = dir.copy().rotate(rightAngle);
    let rightEnd = p5.Vector.add(parent.end, rightDir);
    let rightBranch = new Branch(parent.end, rightEnd, parent.depth + 1, rightAngle);
    branches.push(rightBranch);
    
    // 잎 생성 (끝 가지에만)
    if (remainingDepth === 1) {
        // 왼쪽 끝에 잎 추가
        leaves.push(new Leaf(leftEnd.x, leftEnd.y, leafSize, leftAngle, parent.depth + 1));
        
        // 오른쪽 끝에 잎 추가
        leaves.push(new Leaf(rightEnd.x, rightEnd.y, leafSize, rightAngle, parent.depth + 1));
    }
    
    // 재귀 호출
    generateBranches(leftBranch, remainingDepth - 1);
    generateBranches(rightBranch, remainingDepth - 1);
}

function draw() {
    background(220, 30, 95);
    
    // 땅 그리기
    noStroke();
    fill(30, 60, 40);
    rect(0, height - 50, width, 50);
    
    // 자동 각도 애니메이션
    if (autoAnimate) {
        angle = noise(frameCount * animationSpeed) * PI/2 + PI/6;
        generateTree();
    }
    
    // 무지개 색상 모드일 때 색상 순환
    if (colorMode === 2) {
        baseHue = (baseHue + 0.5) % 360;
    }
    
    // 가지 업데이트 및 표시
    for (let branch of branches) {
        branch.update();
        branch.display();
    }
    
    // 잎 업데이트 및 표시
    if (showLeaves) {
        for (let i = leaves.length - 1; i >= 0; i--) {
            leaves[i].update();
            leaves[i].display();
            
            // 투명해진 잎 제거
            if (leaves[i].opacity <= 0) {
                leaves.splice(i, 1);
            }
        }
    }
    
    // UI 표시
    drawUI();
}

function drawUI() {
    // 정보 패널
    if (showInfo) {
        push();
        fill(220, 30, 95, 200);
        rect(20, 20, 220, 200, 5);
        
        fill(0);
        textSize(16);
        text("프랙탈 트리", 30, 40);
        text("각도: " + nf(degrees(angle), 1, 1) + "°", 30, 65);
        text("가지 비율: " + nf(branchRatio, 1, 2), 30, 90);
        text("초기 길이: " + nf(initialLength, 1, 0), 30, 115);
        text("재귀 깊이: " + depth, 30, 140);
        text("잎 크기: " + leafSize, 30, 165);
        text("바람 세기: " + nf(windEffect, 1, 2), 30, 190);
        
        let modeTexts = ["깊이 기준", "각도 기준", "무지개"];
        text("색상 모드: " + modeTexts[colorMode], 30, 215);
        pop();
    }
    
    // 조작 방법 안내
    if (showControls) {
        push();
        fill(220, 30, 95, 200);
        rect(width - 250, 10, 240, 220, 5);
        
        fill(0);
        textSize(14);
        text("조작 방법:", width - 240, 30);
        text("마우스 좌우: 각도 조절", width - 240, 50);
        text("마우스 상하: 길이 비율 조절", width - 240, 70);
        text("'a' 키: 자동 애니메이션 켜기/끄기", width - 240, 90);
        text("'c' 키: 색상 모드 변경", width - 240, 110);
        text("'s' 키: 선 모드 변경", width - 240, 130);
        text("'l' 키: 잎 표시/숨기기", width - 240, 150);
        text("'i' 키: 정보 표시/숨기기", width - 240, 170);
        text("'+/-' 키: 재귀 깊이 조절", width - 240, 190);
        text("방향키: 바람 효과 조절", width - 240, 210);
        text("스페이스: 새 트리 생성", width - 240, 230);
        pop();
    }
}

function mouseMoved() {
    if (!autoAnimate) {
        // 마우스 X 위치로 각도 조절
        angle = map(mouseX, 0, width, 0, PI/2);
        
        // 마우스 Y 위치로 가지 비율 조절
        branchRatio = map(mouseY, 0, height, 0.8, 0.5);
        
        // 트리 재생성
        generateTree();
    }
}

function keyPressed() {
    if (key === ' ') {
        // 새 트리 생성
        generateTree();
    } else if (key === 'a' || key === 'A') {
        // 자동 애니메이션 토글
        autoAnimate = !autoAnimate;
    } else if (key === 'c' || key === 'C') {
        // 색상 모드 변경
        colorMode = (colorMode + 1) % 3;
    } else if (key === 's' || key === 'S') {
        // 선 모드 변경
        strokeMode = (strokeMode + 1) % 2;
    } else if (key === 'l' || key === 'L') {
        // 잎 표시/숨기기
        showLeaves = !showLeaves;
    } else if (key === 'i' || key === 'I') {
        // 정보 표시/숨기기
        showInfo = !showInfo;
    } else if (key === '+' || key === '=') {
        // 재귀 깊이 증가
        depth = min(depth + 1, 10);
        generateTree();
    } else if (key === '-' || key === '_') {
        // 재귀 깊이 감소
        depth = max(depth - 1, 1);
        generateTree();
    } else if (keyCode === UP_ARROW) {
        // 바람 세기 증가
        windEffect = min(windEffect + 0.5, 5);
    } else if (keyCode === DOWN_ARROW) {
        // 바람 세기 감소
        windEffect = max(windEffect - 0.5, 0);
    } else if (keyCode === LEFT_ARROW) {
        // 잎 크기 감소
        leafSize = max(leafSize - 1, 5);
        generateTree();
    } else if (keyCode === RIGHT_ARROW) {
        // 잎 크기 증가
        leafSize = min(leafSize + 1, 30);
        generateTree();
    }
} 