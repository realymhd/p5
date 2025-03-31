// sketch11/sketch.js - 푸리에 에피사이클 (루프 및 페이드아웃)

let font;
let points = [];
let fourierCoefficients = [];
let time = 0;
let path = []; // 최종 경로
let drawingText = "MATAMATH";
let fontSize = 150;
let sampleFactor = 0.25;
let pathColor; // 노란색 (setup에서 설정)
let center;

// --- 상태 및 타이머 변수 ---
let appState = 'DRAWING'; // 'DRAWING', 'PAUSED', 'FADING_OUT'
let pauseDuration = 10000; // 10초 (밀리초 단위)
let fadeDuration = 1000;   // 1초 페이드아웃
let pauseStartTime = 0;
let fadeStartTime = 0;
let currentAlpha = 255; // 현재 경로 투명도

// --- DFT 함수 (이전과 동일) ---
function dftComplex(complexPoints) { /* ... 이전 코드 ... */
    const N = complexPoints.length; if (N === 0) return []; const coefficients = [];
    for (let k = 0; k < N; k++) { let sum_re = 0; let sum_im = 0;
        for (let n = 0; n < N; n++) { const phi = (TWO_PI * k * n) / N; const cosPhi = cos(phi); const sinPhi = sin(phi); sum_re += complexPoints[n].x * cosPhi + complexPoints[n].y * sinPhi; sum_im += complexPoints[n].y * cosPhi - complexPoints[n].x * sinPhi; }
        let re = sum_re / N; let im = sum_im / N; let freq = k; let amp = sqrt(re * re + im * im); let phase = atan2(im, re);
        if (isNaN(re) || isNaN(im) || isNaN(amp) || isNaN(phase)) { re = 0; im = 0; amp = 0; phase = 0; }
        coefficients[k] = { re, im, freq, amp, phase };
    } return coefficients;
}

// --- p5.js 함수 ---
function preload() {
    try {
        font = loadFont('NanumGothic.ttf'); // <<-- 실제 폰트 경로!
    } catch (error) { console.error("loadFont 에러:", error); font = undefined; }
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    center = createVector(width / 2, height / 2);
    angleMode(RADIANS);
    pathColor = color(255, 255, 0); // 노란색

    if (!font) { textFont('sans-serif'); } else { textFont(font); }
    textSize(fontSize);

    // 1. 텍스트 포인트 생성
    let textPointsRaw = [];
    if (font && typeof font.textToPoints === 'function') {
        try {
            let bounds = font.textBounds(drawingText, 0, 0, fontSize);
            let startX = center.x - bounds.w / 2;
            let startY = center.y + bounds.h / 2;
            textPointsRaw = font.textToPoints(drawingText, startX, startY, fontSize, { sampleFactor: sampleFactor });
        } catch (error) { console.error("font.textToPoints 오류:", error); }
    }
    if (textPointsRaw.length === 0) { /* 대체 경로 (원) */
        console.warn("텍스트 포인트 생성 실패. 대체 원 사용.");
        let radius = 100; for (let a = 0; a < TWO_PI; a += 0.1) points.push({x: radius*cos(a), y: radius*sin(a)});
    } else { /* 포인트 변환 */
        console.log(`${textPointsRaw.length}개 텍스트 포인트 생성.`);
        for(let i=0; i<textPointsRaw.length; i++) points.push({x:textPointsRaw[i].x-center.x, y:textPointsRaw[i].y-center.y});
    }

    // 2. DFT 수행 및 정렬
    fourierCoefficients = dftComplex(points);
    if (fourierCoefficients.length > 0) fourierCoefficients.sort((a, b) => b.amp - a.amp);
    else fourierCoefficients.push({ re: 0, im: 0, freq: 0, amp: 0, phase: 0 });

    // 3. 초기화
    resetAnimation(); // 상태, 시간, 경로 초기화
    console.log("Setup 완료. 애니메이션 시작.");
}

function draw() {
    background(0);

    // --- 상태별 로직 처리 ---
    if (appState === 'DRAWING') {
        drawDrawingState();
    } else if (appState === 'PAUSED') {
        drawPausedState();
    } else if (appState === 'FADING_OUT') {
        drawFadingState();
    }
}

// DRAWING 상태 처리 및 그리기
function drawDrawingState() {
    // 1. 에피사이클 계산 및 그리기 -> 최종 위치 반환
    let finalPos = calculateAndDrawEpicycles(center.x, center.y, fourierCoefficients);

    // 2. 최종 위치를 경로에 추가
    if (finalPos) { path.push(finalPos); }

    // 3. 현재까지의 경로 그리기 (완전 불투명)
    drawPath(255); // 알파값 255

    // 4. 시간 업데이트
    const N = fourierCoefficients.length;
    const dt = TWO_PI / N;
    time += dt;

    // 5. 그리기 완료 체크
    if (time >= TWO_PI) {
        console.log("그리기 완료. PAUSED 상태 진입.");
        appState = 'PAUSED';
        pauseStartTime = millis(); // 일시정지 시작 시간 기록
        time = TWO_PI; // 정확히 마지막 지점 그리도록 보정 (선택적)
        // path에는 이미 완성된 경로가 들어있음
    }
}

// PAUSED 상태 처리 및 그리기
function drawPausedState() {
    // 완성된 경로만 그리기 (에피사이클은 그리지 않음)
    drawPath(255); // 완전 불투명

    // 시간 체크
    if (millis() - pauseStartTime > pauseDuration) {
        console.log("10초 경과. FADING_OUT 상태 진입.");
        appState = 'FADING_OUT';
        fadeStartTime = millis(); // 페이드 시작 시간 기록
        currentAlpha = 255; // 알파값 초기화
    }
}

// FADING_OUT 상태 처리 및 그리기
function drawFadingState() {
    // 페이드 진행률 계산 (0 ~ 1)
    let elapsedTime = millis() - fadeStartTime;
    let fadeRatio = constrain(elapsedTime / fadeDuration, 0, 1);

    // 알파값 계산 (255 -> 0)
    currentAlpha = map(fadeRatio, 0, 1, 255, 0);

    // 계산된 알파값으로 경로 그리기
    drawPath(currentAlpha);

    // 페이드 완료 체크
    if (fadeRatio >= 1 || currentAlpha <= 0) {
        console.log("페이드 아웃 완료. 애니메이션 리셋.");
        resetAnimation(); // 리셋 후 다음 프레임부터 DRAWING 시작
    }
}

// 에피사이클 계산 및 그리기 함수 (DRAWING 상태에서만 호출됨)
function calculateAndDrawEpicycles(startX, startY, coefficients) {
    let currentX = startX; let currentY = startY;
    if (!coefficients || coefficients.length === 0) return createVector(startX, startY);
    for (let i = 0; i < coefficients.length; i++) { /* ... 에피사이클 계산 및 그리기 (이전과 동일) ... */
         let prevX = currentX; let prevY = currentY;
         let freq = coefficients[i].freq || 0; let radius = coefficients[i].amp || 0; let phase = coefficients[i].phase || 0;
         let angle = freq * time + phase;
         currentX += radius * cos(angle); currentY += radius * sin(angle);
         if (isNaN(currentX) || isNaN(currentY)) { currentX = prevX; currentY = prevY; continue; }
         stroke(255, 100); noFill(); strokeWeight(1);
         ellipse(prevX, prevY, radius * 2); line(prevX, prevY, currentX, currentY);
    } return createVector(currentX, currentY);
}

// 경로를 그리는 함수 (알파값 조절 가능)
function drawPath(alphaValue) {
    if (path.length > 1) { // 점이 2개 이상 있어야 선을 그림
        beginShape();
        // stroke() 함수는 RGB와 Alpha를 함께 받음
        stroke(red(pathColor), green(pathColor), blue(pathColor), alphaValue);
        noFill();
        strokeWeight(2);
        for (let p of path) {
            vertex(p.x, p.y);
        }
        endShape();
    }
     // 마지막 점 강조 (선택적) - 페이드 아웃 시에는 안보이게 할 수도 있음
     if (path.length > 0 && alphaValue > 10) {
         let lastP = path[path.length - 1];
         fill(red(pathColor), green(pathColor), blue(pathColor), alphaValue);
         noStroke();
         ellipse(lastP.x, lastP.y, 8, 8);
     }
}

// 애니메이션 상태를 초기화하는 함수
function resetAnimation() {
    appState = 'DRAWING';
    time = 0;
    path = []; // 경로 초기화
    currentAlpha = 255;
}