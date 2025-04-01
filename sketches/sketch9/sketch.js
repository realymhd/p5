// sketch11/sketch.js - 푸리에 에피사이클 (루프 및 페이드아웃 순서 변경)

let font;
let points = [];
let fourierCoefficients = [];
let time = 0;
let path = []; // 최종 경로
let drawingTextLines = [
    "This Is Fourier Epicycles"
];
let fontSize = 100;
let lineSpacingFactor = 1.2;
let sampleFactor = 0.25; // <<-- 이 값을 조절하여 글자 부드러움 제어 (작을수록 부드러움)
let pathColor; // 노란색 (setup에서 설정)
let center;

// --- 상태 및 타이머 변수 ---
// 상태: DRAWING -> EPICYCLES_FADING -> PATH_VISIBLE -> PATH_FADING -> (reset) -> DRAWING
let appState = 'DRAWING';
let epicycleFadeDuration = 1000; // 1초 에피사이클 페이드아웃
let pathVisibleDuration = 10000; // 10초 경로 유지 (밀리초 단위)
let pathFadeDuration = 1000;   // 1초 경로 페이드아웃

let epicycleFadeStartTime = 0;
let pathVisibleStartTime = 0;
let pathFadeStartTime = 0;

let currentEpicycleAlpha = 100; // 에피사이클 그릴 때 기본 투명도 (0-255 아님, 보통 100정도)
let currentPathAlpha = 255; // 경로 투명도 (0-255)

// --- DFT 함수 (이전과 동일) ---
function dftComplex(complexPoints) {
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
        font = loadFont('NanumGothic.ttf'); // <<-- 실제 폰트 경로 확인!
    } catch (error) { console.error("loadFont 에러:", error); font = undefined; }
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    center = createVector(width / 2, height / 2);
    angleMode(RADIANS);
    pathColor = color(255, 255, 0); // 노란색

    if (!font) { textFont('sans-serif'); console.warn("폰트 로드 실패. 기본 폰트 사용"); }
    else { textFont(font); }
    textSize(fontSize);

    points = []; // 포인트 배열 초기화

    // 1. 여러 줄 텍스트 포인트 생성 (이전 코드와 동일)
    let totalBounds = { w: 0, h: 0, yMin: Infinity, yMax: -Infinity };
    let linesBounds = [];

    if (font && typeof font.textBounds === 'function') {
        let currentY = 0;
        for (let i = 0; i < drawingTextLines.length; i++) {
            let line = drawingTextLines[i];
            let bounds = font.textBounds(line, 0, 0, fontSize);
            let lineStartY = currentY - bounds.h;
            let lineEndY = currentY;
            linesBounds.push({ ...bounds, lineStartY: lineStartY, lineEndY: lineEndY, originalY: currentY });
            totalBounds.w = max(totalBounds.w, bounds.w);
            totalBounds.yMin = min(totalBounds.yMin, lineStartY);
            totalBounds.yMax = max(totalBounds.yMax, lineEndY);
            currentY += fontSize * lineSpacingFactor;
        }
        totalBounds.h = totalBounds.yMax - totalBounds.yMin;
        let startOffsetX = center.x - totalBounds.w / 2;
        let startOffsetY = center.y - totalBounds.h / 2 - totalBounds.yMin;

        for (let i = 0; i < drawingTextLines.length; i++) {
             let line = drawingTextLines[i];
             let bounds = linesBounds[i];
             let lineStartX = startOffsetX + (totalBounds.w - bounds.w) / 2;
             let lineStartY = startOffsetY + bounds.originalY;
             try {
                 let linePointsRaw = font.textToPoints(line, lineStartX, lineStartY, fontSize, { sampleFactor: sampleFactor });
                 console.log(`'${line}' 포인트 ${linePointsRaw.length}개 생성 (sampleFactor=${sampleFactor}).`);
                 for(let pt of linePointsRaw) {
                     points.push({x: pt.x - center.x, y: pt.y - center.y});
                 }
             } catch (error) {
                 console.error(`'${line}' textToPoints 오류:`, error);
             }
        }
    }

    if (points.length === 0) {
        console.warn("텍스트 포인트 생성 실패. 대체 원 사용.");
        points = [];
        let radius = min(width, height) * 0.2;
        for (let a = 0; a < TWO_PI; a += 0.05) {
            points.push({x: radius * cos(a), y: radius * sin(a)});
        }
    } else {
         console.log(`총 ${points.length}개 포인트 생성 완료.`);
    }

    // 2. DFT 수행 및 정렬
    console.log("DFT 계산 시작...");
    fourierCoefficients = dftComplex(points);
     if (fourierCoefficients.length > 0) {
        fourierCoefficients.sort((a, b) => b.amp - a.amp);
    } else {
        fourierCoefficients.push({ re: 0, im: 0, freq: 0, amp: 0, phase: 0 });
    }
    console.log(`DFT 계산 완료. ${fourierCoefficients.length}개 푸리에 계수 생성.`);

    // 3. 초기화
    resetAnimation(); // 상태, 시간, 경로 초기화
    console.log("Setup 완료. 애니메이션 시작.");
}

function draw() {
    background(0);

    // --- 상태별 로직 처리 ---
    if (appState === 'DRAWING') {
        drawDrawingState();
    } else if (appState === 'EPICYCLES_FADING') {
        drawEpicyclesFadingState();
    } else if (appState === 'PATH_VISIBLE') {
        drawPathVisibleState();
    } else if (appState === 'PATH_FADING') {
        drawPathFadingState();
    }
}

// DRAWING 상태 처리 및 그리기
function drawDrawingState() {
    // 1. 에피사이클 계산 및 그리기 (기본 투명도)
    let finalPos = calculateAndDrawEpicycles(center.x, center.y, fourierCoefficients, time, 100); // 기본 alpha 100

    // 2. 최종 위치를 경로에 추가
    if (finalPos) { path.push(finalPos); }

    // 3. 현재까지의 경로 그리기 (완전 불투명)
    drawPath(255);

    // 4. 시간 업데이트 (dt는 N에 따라 자동 결정)
    const N = max(1, points.length); // 원본 포인트 수 기준 N 사용
    const dt = TWO_PI / N;
    time += dt;

    // 5. 그리기 완료 체크
    if (time >= TWO_PI) {
        console.log("그리기 완료. EPICYCLES_FADING 상태 진입.");
        time = TWO_PI; // 정확히 마지막 지점 그리도록 고정
        // 마지막 위치 한 번 더 추가 (정확도 향상)
        let lastPos = calculateAndDrawEpicycles(center.x, center.y, fourierCoefficients, time, 100);
        if (lastPos && path.length > 0 && dist(lastPos.x, lastPos.y, path[path.length-1].x, path[path.length-1].y) > 0.1) {
           path.push(lastPos);
        }

        appState = 'EPICYCLES_FADING';
        epicycleFadeStartTime = millis(); // 에피사이클 페이드 시작 시간 기록
        currentEpicycleAlpha = 100; // 에피사이클 알파값 초기화 (페이드 시작 값)
    }
}

// EPICYCLES_FADING 상태 처리 및 그리기
function drawEpicyclesFadingState() {
    // 1. 에피사이클 페이드 진행률 계산 (0 ~ 1)
    let elapsedTime = millis() - epicycleFadeStartTime;
    let fadeRatio = constrain(elapsedTime / epicycleFadeDuration, 0, 1);

    // 2. 에피사이클 알파값 계산 (100 -> 0)
    currentEpicycleAlpha = map(fadeRatio, 0, 1, 100, 0);

    // 3. 에피사이클 그리기 (마지막 상태, 페이드 아웃 알파 적용)
    calculateAndDrawEpicycles(center.x, center.y, fourierCoefficients, TWO_PI, currentEpicycleAlpha); // time=TWO_PI 고정

    // 4. 완성된 경로 그리기 (완전 불투명)
    drawPath(255);

    // 5. 에피사이클 페이드 완료 체크
    if (fadeRatio >= 1) {
        console.log("에피사이클 페이드 아웃 완료. PATH_VISIBLE 상태 진입.");
        appState = 'PATH_VISIBLE';
        pathVisibleStartTime = millis(); // 경로 유지 시작 시간 기록
    }
}

// PATH_VISIBLE 상태 처리 및 그리기 (10초 유지)
function drawPathVisibleState() {
    // 에피사이클은 그리지 않음

    // 완성된 경로만 그리기 (완전 불투명)
    drawPath(255);

    // 시간 체크
    if (millis() - pathVisibleStartTime > pathVisibleDuration) {
        console.log(`${pathVisibleDuration / 1000}초 경로 유지 완료. PATH_FADING 상태 진입.`);
        appState = 'PATH_FADING';
        pathFadeStartTime = millis(); // 경로 페이드 시작 시간 기록
        currentPathAlpha = 255; // 경로 알파값 초기화 (페이드 시작 값)
    }
}

// PATH_FADING 상태 처리 및 그리기
function drawPathFadingState() {
    // 에피사이클은 그리지 않음

    // 1. 경로 페이드 진행률 계산 (0 ~ 1)
    let elapsedTime = millis() - pathFadeStartTime;
    let fadeRatio = constrain(elapsedTime / pathFadeDuration, 0, 1);

    // 2. 경로 알파값 계산 (255 -> 0)
    currentPathAlpha = map(fadeRatio, 0, 1, 255, 0);

    // 3. 계산된 알파값으로 경로 그리기
    drawPath(currentPathAlpha);

    // 4. 경로 페이드 완료 체크
    if (fadeRatio >= 1) {
        console.log("경로 페이드 아웃 완료. 애니메이션 리셋.");
        resetAnimation(); // 리셋 후 다음 프레임부터 DRAWING 시작
    }
}

// 에피사이클 계산 및 그리기 함수 (alpha 값 받음)
function calculateAndDrawEpicycles(startX, startY, coefficients, timeValue, baseAlpha) {
    let currentX = startX;
    let currentY = startY;
    if (!coefficients || coefficients.length === 0 || baseAlpha <= 0) { // 알파 0 이하면 그릴 필요 없음
         // 마지막 위치만 계산해서 반환 (DRAWING 상태에서 path 추가용)
        for (let i = 0; i < coefficients.length; i++) {
             let freq = coefficients[i].freq || 0; let radius = coefficients[i].amp || 0; let phase = coefficients[i].phase || 0;
             if (radius < 0.1) continue;
             let angle = freq * timeValue + phase;
             currentX += radius * cos(angle); currentY += radius * sin(angle);
             if (isNaN(currentX) || isNaN(currentY)) { /* 에러 처리 */ }
         }
        return createVector(currentX, currentY);
    }

    // 에피사이클 그리기 (원과 선)
    noFill();
    strokeWeight(1);

    for (let i = 0; i < coefficients.length; i++) {
         let prevX = currentX; let prevY = currentY;
         let freq = coefficients[i].freq || 0; let radius = coefficients[i].amp || 0; let phase = coefficients[i].phase || 0;
         if (radius < 0.1) continue; // 작은 원 건너뛰기

         let angle = freq * timeValue + phase;
         currentX += radius * cos(angle); currentY += radius * sin(angle);

         if (isNaN(currentX) || isNaN(currentY)) { /* 에러 처리 */ currentX = prevX; currentY = prevY; continue; }

         // 원 그리기 (투명도 적용)
         stroke(255, 255, 255, baseAlpha); // 흰색, 주어진 알파값
         ellipse(prevX, prevY, radius * 2);

         // 선 그리기 (투명도 적용)
         line(prevX, prevY, currentX, currentY);
    }
    // 최종 위치 반환
    return createVector(currentX, currentY);
}

// 경로를 그리는 함수 (알파값 조절 가능)
function drawPath(alphaValue) {
    if (path.length > 1 && alphaValue > 0) { // 알파 0 이상일 때만 그림
        beginShape();
        stroke(red(pathColor), green(pathColor), blue(pathColor), alphaValue);
        noFill();
        strokeWeight(2);
        for (let p of path) {
            vertex(p.x, p.y);
        }
        endShape();
    }
     // 마지막 점 강조 (선택적) - 경로가 보일 때만
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
    currentEpicycleAlpha = 100; // 에피사이클 알파 초기화
    currentPathAlpha = 255; // 경로 알파 초기화
    console.log("애니메이션 리셋 완료. 드로잉 시작.");
}

// 창 크기 변경 시 캔버스 크기 조정 및 재설정 (선택적)
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    center = createVector(width / 2, height / 2);
    console.log("창 크기 변경됨. 캔버스 리사이즈.");
    // setup(); // 주석 해제 시 애니메이션 완전 재시작 (DFT 재계산 포함)
    resetAnimation(); // 현재 상태만 리셋하고 드로잉부터 다시 시작
}