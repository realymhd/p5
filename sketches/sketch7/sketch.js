// Sketch variables
let grid;                // 현재 그리드
let nextGrid;           // 다음 그리드
let cols;               // 열 수
let rows;               // 행 수
let cellSize = 10;      // 셀 크기
let frameRate = 10;     // 프레임 속도
let playing = true;     // 시뮬레이션 재생 여부
let generation = 0;     // 세대 카운터

// 다양한 규칙 세트
let rulesets = [
    { name: "Conway의 생명 게임", birth: [3], survival: [2, 3], color: [0, 255, 0] },
    { name: "HighLife", birth: [3, 6], survival: [2, 3], color: [0, 150, 255] },
    { name: "Day & Night", birth: [3, 6, 7, 8], survival: [3, 4, 6, 7, 8], color: [150, 0, 255] },
    { name: "Seeds", birth: [2], survival: [], color: [255, 0, 150] },
    { name: "B25/S4", birth: [2, 5], survival: [4], color: [255, 150, 0] },
    { name: "Maze", birth: [3], survival: [1, 2, 3, 4, 5], color: [255, 255, 0] }
];

// 현재 선택된 규칙 세트 인덱스
let currentRuleset = 0;

// 셀 상태 색상
let cellColors = [];

// 시뮬레이션 설정
let showGrid = true;         // 그리드 표시 여부
let showInfo = true;         // 정보 표시 여부
let brushSize = 1;           // 브러시 크기
let mouseDrawMode = 1;       // 0: 지우기, 1: 그리기
let colorMode = 0;           // 0: 단일 색상, 1: 나이 기준 색상, 2: 이웃 수 기준 색상
let drawMode = false;        // 마우스 그리기 모드
let fadeMode = false;        // 페이드 효과 모드

// 셀 나이 추적
let cellAges = [];

function setup() {
    createCanvas(800, 600);
    
    // 그리드 크기 계산
    cols = floor(width / cellSize);
    rows = floor(height / cellSize);
    
    // 초기 그리드 생성
    initializeGrids();
    resetSimulation();
    
    // 셀 색상 초기화
    initializeCellColors();
    
    // 프레임 속도 설정
    frameRate(frameRate);
}

function initializeGrids() {
    // 그리드 배열 초기화
    grid = new Array(cols);
    nextGrid = new Array(cols);
    cellAges = new Array(cols);
    
    for (let i = 0; i < cols; i++) {
        grid[i] = new Array(rows);
        nextGrid[i] = new Array(rows);
        cellAges[i] = new Array(rows);
        
        for (let j = 0; j < rows; j++) {
            grid[i][j] = 0;
            nextGrid[i][j] = 0;
            cellAges[i][j] = 0;
        }
    }
}

function initializeCellColors() {
    // 색상 그라데이션 생성
    cellColors = [];
    let steps = 50;
    
    for (let i = 0; i < steps; i++) {
        let r = map(i, 0, steps - 1, 50, 255);
        let g = map(i, 0, steps - 1, 100, 50);
        let b = map(i, 0, steps - 1, 200, 100);
        cellColors.push([r, g, b]);
    }
}

function resetSimulation() {
    // 그리드 초기화 (모든 셀 죽음)
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            grid[i][j] = 0;
            cellAges[i][j] = 0;
        }
    }
    
    generation = 0;
}

function randomizeGrid() {
    // 그리드를 랜덤하게 채움
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            if (random(1) < 0.2) {
                grid[i][j] = 1;
                cellAges[i][j] = 0;
            } else {
                grid[i][j] = 0;
                cellAges[i][j] = 0;
            }
        }
    }
    
    generation = 0;
}

function draw() {
    background(20);
    
    // 그리드 업데이트
    if (playing) {
        updateGrid();
    }
    
    // 그리드 그리기
    drawGrid();
    
    // 브러시 표시
    if (mouseX >= 0 && mouseX < width && mouseY >= 0 && mouseY < height) {
        drawBrush();
    }
    
    // UI 그리기
    drawUI();
}

function updateGrid() {
    // 생명 게임 규칙에 따라 다음 세대 계산
    let birthArray = rulesets[currentRuleset].birth;
    let survivalArray = rulesets[currentRuleset].survival;
    
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            let neighbors = countNeighbors(i, j);
            let state = grid[i][j];
            
            // 다음 세대 상태 결정
            if (state === 0 && birthArray.includes(neighbors)) {
                // 죽은 셀이 살아남
                nextGrid[i][j] = 1;
                cellAges[i][j] = 0;
            } else if (state === 1 && survivalArray.includes(neighbors)) {
                // 살아있는 셀이 계속 살아남
                nextGrid[i][j] = 1;
                cellAges[i][j]++;
            } else {
                // 셀이 죽음
                nextGrid[i][j] = 0;
                
                // 페이드 모드에서는 천천히 사라짐
                if (fadeMode && cellAges[i][j] > 0) {
                    cellAges[i][j] = max(0, cellAges[i][j] - 5);
                } else {
                    cellAges[i][j] = 0;
                }
            }
        }
    }
    
    // 그리드 업데이트
    let temp = grid;
    grid = nextGrid;
    nextGrid = temp;
    
    // 세대 카운터 증가
    generation++;
}

function countNeighbors(x, y) {
    // 이웃 수 계산 (무어 이웃)
    let sum = 0;
    
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            // 자신은 제외
            if (i === 0 && j === 0) continue;
            
            // 경계를 넘어가면 반대편으로 (Toroidal)
            let col = (x + i + cols) % cols;
            let row = (y + j + rows) % rows;
            
            sum += grid[col][row];
        }
    }
    
    return sum;
}

function drawGrid() {
    // 셀 그리기
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            let x = i * cellSize;
            let y = j * cellSize;
            
            // 셀 상태에 따라 색상 결정
            if (grid[i][j] === 1 || (fadeMode && cellAges[i][j] > 0)) {
                // 살아있는 셀
                let cellColor;
                
                if (colorMode === 0) {
                    // 단일 색상 모드
                    cellColor = rulesets[currentRuleset].color;
                } else if (colorMode === 1) {
                    // 나이 기준 색상
                    let ageIndex = min(cellAges[i][j], cellColors.length - 1);
                    cellColor = cellColors[ageIndex];
                } else {
                    // 이웃 수 기준 색상
                    let neighbors = countNeighbors(i, j);
                    let hue = map(neighbors, 0, 8, 0, 240);
                    colorMode = HSB, 360, 100, 100;
                    cellColor = [hue, 80, 100];
                    colorMode = RGB, 255, 255, 255;
                }
                
                // 페이드 모드일 때 알파값 조정
                let alpha = 255;
                if (fadeMode && grid[i][j] === 0) {
                    alpha = map(cellAges[i][j], 0, 50, 0, 255);
                }
                
                fill(cellColor[0], cellColor[1], cellColor[2], alpha);
                noStroke();
                rect(x, y, cellSize, cellSize);
            } else {
                // 죽은 셀
                if (showGrid) {
                    fill(30);
                    stroke(40);
                    strokeWeight(0.5);
                    rect(x, y, cellSize, cellSize);
                }
            }
        }
    }
}

function drawBrush() {
    // 브러시 미리보기 표시
    let mouseGridX = floor(mouseX / cellSize);
    let mouseGridY = floor(mouseY / cellSize);
    
    fill(rulesets[currentRuleset].color[0], 
         rulesets[currentRuleset].color[1], 
         rulesets[currentRuleset].color[2], 
         100);
    noStroke();
    
    // 브러시 크기에 따라 그리기
    for (let i = -floor(brushSize/2); i <= floor(brushSize/2); i++) {
        for (let j = -floor(brushSize/2); j <= floor(brushSize/2); j++) {
            let x = (mouseGridX + i) * cellSize;
            let y = (mouseGridY + j) * cellSize;
            
            // 그리드 내에 있는지 확인
            if (mouseGridX + i >= 0 && mouseGridX + i < cols &&
                mouseGridY + j >= 0 && mouseGridY + j < rows) {
                rect(x, y, cellSize, cellSize);
            }
        }
    }
    
    // 마우스 그리기 모드
    if (drawMode && mouseIsPressed) {
        for (let i = -floor(brushSize/2); i <= floor(brushSize/2); i++) {
            for (let j = -floor(brushSize/2); j <= floor(brushSize/2); j++) {
                let x = mouseGridX + i;
                let y = mouseGridY + j;
                
                // 그리드 내에 있는지 확인
                if (x >= 0 && x < cols && y >= 0 && y < rows) {
                    grid[x][y] = mouseDrawMode;
                    
                    if (mouseDrawMode === 0) {
                        cellAges[x][y] = 0;
                    }
                }
            }
        }
    }
}

function drawUI() {
    // 상단 정보 패널
    if (showInfo) {
        // 정보 패널 배경
        fill(0, 0, 30, 200);
        rect(10, 10, 250, 140, 5);
        
        // 정보 텍스트
        fill(255);
        textSize(14);
        text("세포 자동화 시뮬레이션", 20, 30);
        text("규칙: " + rulesets[currentRuleset].name, 20, 50);
        text("세대: " + generation, 20, 70);
        text("프레임 속도: " + frameRate + "fps", 20, 90);
        text("브러시 크기: " + brushSize, 20, 110);
        text("색상 모드: " + ["단일 색상", "나이 기준", "이웃 수 기준"][colorMode], 20, 130);
        text("페이드 효과: " + (fadeMode ? "켜짐" : "꺼짐"), 20, 150);
    }
    
    // 조작 방법 안내
    fill(0, 0, 30, 200);
    rect(width - 250, 10, 240, 170, 5);
    fill(255);
    textSize(14);
    text("조작 방법:", width - 240, 30);
    text("클릭/드래그: 셀 그리기/지우기", width - 240, 50);
    text("스페이스: 재생/일시정지", width - 240, 70);
    text("R: 초기화", width - 240, 90);
    text("A: 랜덤 생성", width - 240, 110);
    text("G: 그리드 표시/숨기기", width - 240, 130);
    text("I: 정보 표시/숨기기", width - 240, 150);
    text("1-6: 규칙 변경", width - 240, 170);
    
    // 상태 표시 (재생/일시정지)
    fill(playing ? [0, 255, 0, 150] : [255, 0, 0, 150]);
    noStroke();
    rect(width - 30, height - 30, 20, 20, 5);
}

function mousePressed() {
    // 마우스 버튼에 따라 그리기 모드 설정
    if (mouseButton === LEFT) {
        mouseDrawMode = 1;  // 그리기 (셀 활성화)
    } else if (mouseButton === RIGHT) {
        mouseDrawMode = 0;  // 지우기 (셀 비활성화)
    }
    
    drawMode = true;
    return false;  // 기본 동작 방지
}

function mouseReleased() {
    drawMode = false;
}

function keyPressed() {
    // 키보드 단축키
    if (key === ' ') {
        // 재생/일시정지 토글
        playing = !playing;
    } else if (key === 'r' || key === 'R') {
        // 초기화
        resetSimulation();
    } else if (key === 'a' || key === 'A') {
        // 랜덤 패턴 생성
        randomizeGrid();
    } else if (key === 'g' || key === 'G') {
        // 그리드 표시/숨기기
        showGrid = !showGrid;
    } else if (key === 'i' || key === 'I') {
        // 정보 표시/숨기기
        showInfo = !showInfo;
    } else if (key === 'c' || key === 'C') {
        // 색상 모드 변경
        colorMode = (colorMode + 1) % 3;
    } else if (key === 'f' || key === 'F') {
        // 페이드 효과 토글
        fadeMode = !fadeMode;
    } else if (key === 'b' || key === 'B') {
        // 브러시 크기 순환
        brushSize = (brushSize % 5) + 1;
    } else if (key === '+' || key === '=') {
        // 프레임 속도 증가
        frameRate = min(60, frameRate + 5);
        setFrameRate(frameRate);
    } else if (key === '-' || key === '_') {
        // 프레임 속도 감소
        frameRate = max(1, frameRate - 5);
        setFrameRate(frameRate);
    } else if (key >= '1' && key <= '6') {
        // 규칙 세트 변경
        let ruleIndex = parseInt(key) - 1;
        if (ruleIndex >= 0 && ruleIndex < rulesets.length) {
            currentRuleset = ruleIndex;
        }
    }
} 