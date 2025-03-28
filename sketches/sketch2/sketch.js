// Sketch variables
let sunRadius = 80;      // 태양 크기
let earthRadius = 20;    // 지구 크기
let moonRadius = 5;      // 달 크기

let earthOrbitRadius = 200;    // 지구의 공전 반경
let moonOrbitRadius = 50;      // 달의 공전 반경

let sunRotation = 0;
let earthRotation = 0;
let moonRotation = 0;

let time = 0;
let starPositions = [];  // 배경 별 위치
let starColors = [];     // 별 색상

let showOrbits = true;   // 공전 궤도 표시 여부
let isFirstFrame = true;
let zoom = 1.0;          // 줌 레벨

function setup() {
    createCanvas(800, 600, WEBGL);
    
    // 별 위치 생성
    for (let i = 0; i < 500; i++) {
        // 구면 좌표계에서 랜덤 위치 생성
        let theta = random(TWO_PI);
        let phi = random(TWO_PI);
        let r = random(1500, 2000);
        
        // 3D 좌표로 변환
        let x = r * sin(phi) * cos(theta);
        let y = r * sin(phi) * sin(theta);
        let z = r * cos(phi);
        
        starPositions.push([x, y, z]);
        
        // 별 색상 (약간의 파란색/하얀색/노란색 색조)
        let colorChoice = random(3);
        if (colorChoice < 1) {
            starColors.push([220, 220, 255]); // 약간 푸른 색
        } else if (colorChoice < 2) {
            starColors.push([255, 255, 255]); // 흰색
        } else {
            starColors.push([255, 255, 220]); // 약간 노란 색
        }
    }
    
    // 매끄러운 렌더링을 위한 설정
    smooth();
    setAttributes('antialias', true);
}

function draw() {
    // 배경 그리기
    background(0);
    
    // 시간 업데이트
    time += 0.005;
    
    // 초기 카메라 위치 설정 (위에서 45도 각도로 내려다보기)
    if (isFirstFrame) {
        camera(0, -300, 500, 0, 0, 0, 0, 1, 0); 
        isFirstFrame = false;
    }

    // 마우스로 3D 회전 제어 추가
    orbitControl();
    
    // 줌 적용
    scale(zoom);
    
    // 배경 별 그리기
    drawStars();
    
    // 태양계 그리기
    drawSolarSystem();
    
    // 빈 UI 함수 - 이걸 유지해야 마우스 드래그가 작동함
    drawUI();
}

function drawStars() {
    // 배경 별 그리기
    push();
    for (let i = 0; i < starPositions.length; i++) {
        let pos = starPositions[i];
        let col = starColors[i];
        
        push();
        translate(pos[0], pos[1], pos[2]);
        fill(col[0], col[1], col[2]);
        noStroke();
        sphere(random(0.5, 2));
        pop();
    }
    pop();
}

function drawSolarSystem() {
    // 광원 설정
    pointLight(255, 255, 200, 0, 0, 0);
    ambientLight(30, 30, 50);
    
    // 태양 그리기
    push();
    noStroke();
    emissiveMaterial(255, 200, 50);
    sunRotation += 0.001;
    rotateY(sunRotation);
    sphere(sunRadius);
    pop();
    
    // 지구 공전/자전
    earthRotation += 0.01;
    
    // 지구 공전 궤도 그리기
    if (showOrbits) {
        push();
        noFill();
        stroke(100, 100, 255, 100);
        rotateX(HALF_PI);
        circle(0, 0, earthOrbitRadius * 2);
        pop();
    }
    
    // 지구 그리기
    push();
    let earthX = sin(earthRotation) * earthOrbitRadius;
    let earthZ = cos(earthRotation) * earthOrbitRadius;
    translate(earthX, 0, earthZ);
    
    // 지구 자전
    rotateY(time * 5);
    
    // 지구 재질 및 그리기
    noStroke();
    specularMaterial(70, 130, 230);
    sphere(earthRadius);
    
    // 달 공전 궤도 그리기
    if (showOrbits) {
        push();
        noFill();
        stroke(200, 200, 200, 100);
        rotateX(HALF_PI);
        circle(0, 0, moonOrbitRadius * 2);
        pop();
    }
    
    // 달 공전/자전
    moonRotation += 0.03;
    
    // 달 그리기
    push();
    let moonX = sin(moonRotation) * moonOrbitRadius;
    let moonZ = cos(moonRotation) * moonOrbitRadius;
    translate(moonX, 0, moonZ);
    
    // 달 재질 및 그리기
    noStroke();
    specularMaterial(200, 200, 200);
    sphere(moonRadius);
    pop();
    
    pop();
    
    // 궤도 표시 (반투명 원판)
    push();
    if (showOrbits) {
        noStroke();
        rotateX(HALF_PI);
        fill(30, 30, 80, 30);
        circle(0, 0, earthOrbitRadius * 2);
    }
    pop();
}

function drawUI() {
}

// 마우스 휠 이벤트 처리
function mouseWheel(event) {
    // 음수면 줌인, 양수면 줌아웃
    zoom += event.delta * -0.001;
    
    // 줌 레벨 제한
    zoom = constrain(zoom, 0.1, 5.0);
    
    // 기본 스크롤 동작 방지
    return false;
}