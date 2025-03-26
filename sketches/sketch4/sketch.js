// Sketch variables
let layers = 8;            // 만다라 레이어 수
let segments = 16;         // 각 레이어의 세그먼트 수
let maxRadius = 250;       // 최대 반지름
let rotationSpeed = 0.005; // 회전 속도
let t = 0;                 // 시간 변수
let colorOffset = 0;       // 색상 오프셋
let symmetry = 8;          // 대칭 수
let detail = 0.5;          // 세부 사항 수준 (0.1 ~ 1.0)

// 애니메이션 및 인터랙션 설정
let autoSpin = true;       // 자동 회전 여부
let showInfo = true;       // 정보 표시 여부
let mouseInteraction = true; // 마우스 인터랙션 허용 여부
let pulseEffect = true;    // 펄스 효과 여부
let colorMode = 0;         // 색상 모드 (0: 무지개, 1: 단일 색상, 2: 흑백)

// 만다라 레이어 설정
let layerConfigs = [];     // 레이어 구성

function setup() {
    createCanvas(800, 600);
    
    // 레이어 구성 초기화
    initializeLayerConfigs();
    
    // 매끄러운 렌더링을 위한 설정
    smooth();
    
    // 색상 모드 설정
    colorMode = HSB, 360, 100, 100, 1;
}

function initializeLayerConfigs() {
    layerConfigs = [];
    
    // 각 레이어별 설정 생성
    for (let i = 0; i < layers; i++) {
        let radius = map(i, 0, layers - 1, maxRadius * 0.1, maxRadius);
        let segmentCount = floor(segments * (i + 1) / layers) * symmetry;
        if (segmentCount < symmetry) segmentCount = symmetry;
        
        layerConfigs.push({
            radius: radius,
            segmentCount: segmentCount,
            rotation: random(TWO_PI),
            rotationSpeed: random(-0.02, 0.02),
            amplitude: random(0.1, 0.5) * detail,
            frequency: floor(random(2, 8)),
            thickness: map(i, 0, layers - 1, 15, 2)
        });
    }
}

function draw() {
    // 배경 그리기 (어두운 색상)
    background(230, 50, 10);
    
    // 시간 업데이트
    t += 0.01;
    
    // 중앙 정렬
    translate(width / 2, height / 2);
    
    // 자동 회전
    if (autoSpin) {
        rotate(t * rotationSpeed);
    }
    
    // 마우스 인터랙션
    if (mouseInteraction && mouseIsPressed) {
        // 마우스 위치에 따라 만다라 변형
        let mouseAngle = atan2(mouseY - height/2, mouseX - width/2);
        let mouseDist = dist(mouseX, mouseY, width/2, height/2);
        let mouseInfluence = constrain(map(mouseDist, 0, 200, 0, 1), 0, 1);
        
        rotate(mouseAngle * mouseInfluence * 0.2);
        scale(1 + mouseInfluence * 0.1 * sin(t));
    }
    
    // 레이어 순서대로 그리기 (안쪽부터 바깥쪽으로)
    for (let i = 0; i < layers; i++) {
        drawMandalaLayer(i);
    }
    
    // 2D 레이어에 UI 그리기
    drawUI();
    
    // 색상 오프셋 업데이트
    if (colorMode === 0) {  // 무지개 모드일 때만 색상 순환
        colorOffset = (colorOffset + 0.5) % 360;
    }
}

function drawMandalaLayer(layerIndex) {
    let config = layerConfigs[layerIndex];
    let radius = config.radius;
    
    // 펄스 효과
    if (pulseEffect) {
        radius += sin(t * 2 + layerIndex * 0.5) * 10 * detail;
    }
    
    push();
    // 각 레이어마다 다른 회전
    rotate(config.rotation + t * config.rotationSpeed);
    
    // 특정 레이어일 때 반전 회전
    if (layerIndex % 2 === 1) {
        rotate(t * -config.rotationSpeed * 2);
    }
    
    // 세그먼트 그리기
    for (let j = 0; j < config.segmentCount; j++) {
        let angle = TWO_PI * j / config.segmentCount;
        let nextAngle = TWO_PI * (j + 1) / config.segmentCount;
        
        // 색상 설정
        let hue, saturation, brightness;
        
        if (colorMode === 0) {
            // 무지개 모드
            hue = (colorOffset + map(j, 0, config.segmentCount, 0, 360)) % 360;
            saturation = 70 + 30 * sin(t + layerIndex);
            brightness = 90;
        } else if (colorMode === 1) {
            // 단일 색상 모드 (파란색/보라색 그라데이션)
            hue = 270; // 보라색 베이스
            saturation = 60 + 40 * (layerIndex / layers);
            brightness = 100 - 20 * (layerIndex / layers);
        } else {
            // 흑백 모드
            hue = 0;
            saturation = 0;
            brightness = 50 + 40 * sin(t + j * 0.1 + layerIndex * 0.5);
        }
        
        fill(hue, saturation, brightness, 0.7);
        
        // 윤곽선 설정
        if (layerIndex === 0 || layerIndex === layers - 1) {
            strokeWeight(2);
            stroke(hue, saturation, brightness - 30);
        } else {
            noStroke();
        }
        
        // 세그먼트 모양 그리기
        beginShape();
        
        // 원의 내부 점
        let innerRadius = radius * 0.6;
        let midRadius = radius * 0.8;
        
        // 파형 적용
        let wave1 = sin(angle * config.frequency + t) * config.amplitude;
        let wave2 = sin(nextAngle * config.frequency + t) * config.amplitude;
        
        // 내부 점
        vertex(cos(angle) * innerRadius * (1 + wave1), sin(angle) * innerRadius * (1 + wave1));
        
        // 중간 제어점
        let ctrlAngle = (angle + nextAngle) / 2;
        let ctrlRadius = midRadius * (1 + (wave1 + wave2) / 2);
        
        // 베지어 곡선으로 부드러운 형태 만들기
        bezierVertex(
            cos(ctrlAngle) * (ctrlRadius + config.thickness), 
            sin(ctrlAngle) * (ctrlRadius + config.thickness),
            cos(ctrlAngle) * (ctrlRadius + config.thickness), 
            sin(ctrlAngle) * (ctrlRadius + config.thickness),
            cos(nextAngle) * innerRadius * (1 + wave2), 
            sin(nextAngle) * innerRadius * (1 + wave2)
        );
        
        // 외부 점
        vertex(cos(nextAngle) * radius * (1 + wave2), sin(nextAngle) * radius * (1 + wave2));
        
        // 외부 제어점
        bezierVertex(
            cos(ctrlAngle) * (radius + config.thickness), 
            sin(ctrlAngle) * (radius + config.thickness),
            cos(ctrlAngle) * (radius + config.thickness), 
            sin(ctrlAngle) * (radius + config.thickness),
            cos(angle) * radius * (1 + wave1), 
            sin(angle) * radius * (1 + wave1)
        );
        
        endShape(CLOSE);
    }
    
    pop();
}

function drawUI() {
    push();
    // 다시 원점으로 리셋
    resetMatrix();
    
    if (showInfo) {
        // 왼쪽 상단 정보 패널
        fill(230, 20, 90, 0.7);
        rect(20, 20, 200, 180, 10);
        
        fill(0);
        textSize(16);
        text("만다라 패턴 생성기", 30, 40);
        text("레이어 수: " + layers, 30, 65);
        text("대칭 수: " + symmetry, 30, 90);
        text("세그먼트 수: " + segments, 30, 115);
        text("상세도: " + nf(detail, 1, 1), 30, 140);
        text("색상 모드: " + ["무지개", "그라데이션", "흑백"][colorMode], 30, 165);
        text("FPS: " + nf(frameRate(), 1, 1), 30, 190);
    }
    
    // 조작 방법 안내
    fill(230, 20, 90, 0.7);
    rect(580, 10, 190, 160, 10);
    fill(0);
    textSize(14);
    text("조작 방법:", 590, 30);
    text("'s' 키: 자동 회전 켜기/끄기", 590, 50);
    text("'i' 키: 정보 표시/숨기기", 590, 70);
    text("'m' 키: 마우스 인터랙션 켜기/끄기", 590, 90);
    text("'p' 키: 펄스 효과 켜기/끄기", 590, 110);
    text("'c' 키: 색상 모드 변경", 590, 130);
    text("'r' 키: 새 패턴 생성", 590, 150);
    
    pop();
}

function keyPressed() {
    if (key === 's' || key === 'S') {
        autoSpin = !autoSpin;
    } else if (key === 'i' || key === 'I') {
        showInfo = !showInfo;
    } else if (key === 'm' || key === 'M') {
        mouseInteraction = !mouseInteraction;
    } else if (key === 'p' || key === 'P') {
        pulseEffect = !pulseEffect;
    } else if (key === 'c' || key === 'C') {
        colorMode = (colorMode + 1) % 3;
    } else if (key === 'r' || key === 'R') {
        // 새로운 패턴 생성
        initializeLayerConfigs();
    } else if (key === '+' || keyCode === UP_ARROW) {
        // 복잡도 증가
        detail = constrain(detail + 0.1, 0.1, 1.0);
        initializeLayerConfigs();
    } else if (key === '-' || keyCode === DOWN_ARROW) {
        // 복잡도 감소
        detail = constrain(detail - 0.1, 0.1, 1.0);
        initializeLayerConfigs();
    } else if (keyCode === LEFT_ARROW) {
        // 대칭 감소
        symmetry = max(3, symmetry - 1);
        initializeLayerConfigs();
    } else if (keyCode === RIGHT_ARROW) {
        // 대칭 증가
        symmetry = min(16, symmetry + 1);
        initializeLayerConfigs();
    }
}

function mousePressed() {
    return false;
}

function mouseReleased() {
    // 마우스 놓기 처리
} 