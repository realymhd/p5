// // Sketch variables
// let circles = [];               // 원(집합) 배열
// let labels = ["A", "B", "C"];   // 집합 레이블
// let activeCircle = -1;          // 현재 선택된 원
// let dragMode = false;           // 드래그 모드
// let resizeMode = false;         // 크기 조절 모드
// let resizeCircle = -1;          // 크기 조절할 원

// // 화면 모드
// let displayMode = 0;            // 0: 영역 모드, 1: 색상 모드, 2: 채우기 모드
// let showLabels = true;          // 레이블 표시 여부
// let showRegions = true;         // 영역 레이블 표시 여부
// let showFormulas = true;        // 수식 표시 여부
// let showSetInfo = true;         // 집합 정보 표시 여부

// // 영역 색상
// let regionColors = {
//     "A∩B∩C": [255, 100, 100, 150],
//     "A∩B∩~C": [200, 100, 200, 150],
//     "A∩~B∩C": [100, 200, 200, 150],
//     "~A∩B∩C": [100, 255, 100, 150],
//     "A∩~B∩~C": [255, 200, 100, 150],
//     "~A∩B∩~C": [100, 200, 255, 150],
//     "~A∩~B∩C": [200, 100, 100, 150],
//     "~A∩~B∩~C": [200, 200, 200, 100]
// };

// // 지원하는 집합 연산
// let setOperations = [
//     { name: "A ∪ B", formula: "합집합", evaluate: (a, b) => a || b },
//     { name: "A ∩ B", formula: "교집합", evaluate: (a, b) => a && b },
//     { name: "A - B", formula: "차집합", evaluate: (a, b) => a && !b },
//     { name: "A △ B", formula: "대칭차", evaluate: (a, b) => (a || b) && !(a && b) },
//     { name: "A'", formula: "여집합", evaluate: a => !a }
// ];

// // 현재 선택된 연산
// let currentOperation = 0;

// // 데이터 포인트 (샘플 점)
// let dataPoints = [];
// let numDataPoints = 100;

// function setup() {
//     createCanvas(800, 600);
    
//     // 초기 원(집합) 생성
//     circles = [
//         { x: 300, y: 250, radius: 150, color: [255, 100, 100, 100], label: labels[0] },
//         { x: 450, y: 250, radius: 150, color: [100, 100, 255, 100], label: labels[1] },
//         { x: 375, y: 400, radius: 150, color: [100, 255, 100, 100], label: labels[2] }
//     ];
    
//     // 데이터 포인트 생성
//     generateDataPoints();
// }

// function generateDataPoints() {
//     // 데이터 포인트 초기화
//     dataPoints = [];
    
//     // 전체 영역에 랜덤하게 데이터 포인트 생성
//     for (let i = 0; i < numDataPoints; i++) {
//         let x = random(100, width - 100);
//         let y = random(100, height - 100);
        
//         // 각 원에 포함 여부 계산
//         let inCircles = [];
//         for (let circle of circles) {
//             let d = dist(x, y, circle.x, circle.y);
//             inCircles.push(d < circle.radius);
//         }
        
//         dataPoints.push({ x, y, inCircles });
//     }
// }

// function draw() {
//     background(240);
    
//     // 벤 다이어그램 그리기
//     drawVennDiagram();
    
//     // 데이터 포인트 그리기
//     drawDataPoints();
    
//     // 연산 결과 영역 그리기
//     drawOperationResult();
    
//     // UI 그리기
//     drawUI();
// }

// function drawVennDiagram() {
//     // 원(집합) 그리기
//     for (let i = 0; i < circles.length; i++) {
//         let circle = circles[i];
        
//         // 원 그리기
//         if (i === activeCircle) {
//             // 선택된 원은 밝게 표시
//             stroke(circle.color);
//             strokeWeight(3);
//         } else {
//             stroke(circle.color[0], circle.color[1], circle.color[2], 150);
//             strokeWeight(2);
//         }
        
//         // 채우기 모드에 따라 다르게 표시
//         if (displayMode === 2) {
//             // 채우기 모드
//             fill(circle.color);
//         } else {
//             // 영역 또는 색상 모드
//             noFill();
//         }
        
//         ellipse(circle.x, circle.y, circle.radius * 2, circle.radius * 2);
        
//         // 레이블 그리기
//         if (showLabels) {
//             textAlign(CENTER, CENTER);
//             textSize(24);
//             fill(circle.color[0], circle.color[1], circle.color[2], 200);
//             text(circle.label, circle.x, circle.y);
            
//             // 크기 조절 핸들
//             if (i === activeCircle || i === resizeCircle) {
//                 let handleX = circle.x + circle.radius * 0.7;
//                 let handleY = circle.y + circle.radius * 0.7;
                
//                 stroke(circle.color);
//                 strokeWeight(2);
//                 fill(255);
//                 ellipse(handleX, handleY, 20, 20);
                
//                 stroke(120);
//                 line(handleX - 5, handleY, handleX + 5, handleY);
//                 line(handleX, handleY - 5, handleX, handleY + 5);
//             }
//         }
//     }
    
//     // 영역 레이블 그리기
//     if (showRegions && displayMode === 0) {
//         drawRegionLabels();
//     }
// }

// function drawRegionLabels() {
//     // 각 영역에 레이블 표시
//     textAlign(CENTER, CENTER);
//     textSize(14);
    
//     // A∩B∩C (모든 원에 포함)
//     let centerX = (circles[0].x + circles[1].x + circles[2].x) / 3;
//     let centerY = (circles[0].y + circles[1].y + circles[2].y) / 3;
//     fill(0);
//     text("A∩B∩C", centerX, centerY);
    
//     // A∩B∩~C
//     centerX = (circles[0].x + circles[1].x) / 2;
//     centerY = (circles[0].y + circles[1].y) / 2;
//     if (isPointInCircle(centerX, centerY, circles[0]) && 
//         isPointInCircle(centerX, centerY, circles[1]) && 
//         !isPointInCircle(centerX, centerY, circles[2])) {
//         fill(0);
//         text("A∩B∩~C", centerX, centerY);
//     }
    
//     // A∩~B∩C
//     centerX = (circles[0].x + circles[2].x) / 2;
//     centerY = (circles[0].y + circles[2].y) / 2;
//     if (isPointInCircle(centerX, centerY, circles[0]) && 
//         !isPointInCircle(centerX, centerY, circles[1]) && 
//         isPointInCircle(centerX, centerY, circles[2])) {
//         fill(0);
//         text("A∩~B∩C", centerX, centerY);
//     }
    
//     // ~A∩B∩C
//     centerX = (circles[1].x + circles[2].x) / 2;
//     centerY = (circles[1].y + circles[2].y) / 2;
//     if (!isPointInCircle(centerX, centerY, circles[0]) && 
//         isPointInCircle(centerX, centerY, circles[1]) && 
//         isPointInCircle(centerX, centerY, circles[2])) {
//         fill(0);
//         text("~A∩B∩C", centerX, centerY);
//     }
// }

// function isPointInCircle(x, y, circle) {
//     let d = dist(x, y, circle.x, circle.y);
//     return d < circle.radius;
// }

// function drawDataPoints() {
//     // 영역에 따라 데이터 포인트 그리기
//     noStroke();
    
//     for (let point of dataPoints) {
//         // 포인트가 속한 영역에 따라 색상 결정
//         let regionName = getRegionName(point.inCircles);
//         let color = regionColors[regionName];
        
//         // 현재 연산 결과에 따라 강조
//         let isInResult = evaluateOperation(point.inCircles);
        
//         if (isInResult) {
//             // 연산 결과에 포함된 점은 채움
//             fill(color);
//             ellipse(point.x, point.y, 8, 8);
//         } else {
//             // 연산 결과에 포함되지 않은 점은 작게 비움
//             if (displayMode === 0) {
//                 fill(color[0], color[1], color[2], 60);
//                 ellipse(point.x, point.y, 6, 6);
//             } else {
//                 fill(200, 60);
//                 ellipse(point.x, point.y, 4, 4);
//             }
//         }
//     }
// }

// function getRegionName(inCircles) {
//     // 점이 속한 영역의 이름 반환
//     if (inCircles[0] && inCircles[1] && inCircles[2]) return "A∩B∩C";
//     if (inCircles[0] && inCircles[1] && !inCircles[2]) return "A∩B∩~C";
//     if (inCircles[0] && !inCircles[1] && inCircles[2]) return "A∩~B∩C";
//     if (!inCircles[0] && inCircles[1] && inCircles[2]) return "~A∩B∩C";
//     if (inCircles[0] && !inCircles[1] && !inCircles[2]) return "A∩~B∩~C";
//     if (!inCircles[0] && inCircles[1] && !inCircles[2]) return "~A∩B∩~C";
//     if (!inCircles[0] && !inCircles[1] && inCircles[2]) return "~A∩~B∩C";
//     return "~A∩~B∩~C";
// }

// function evaluateOperation(inCircles) {
//     // 현재 선택된 연산에 따라 결과 계산
//     let op = setOperations[currentOperation];
    
//     if (op.name === "A'") {
//         return op.evaluate(inCircles[0]);
//     } else if (op.name === "A ∪ B") {
//         return op.evaluate(inCircles[0], inCircles[1]);
//     } else if (op.name === "A ∩ B") {
//         return op.evaluate(inCircles[0], inCircles[1]);
//     } else if (op.name === "A - B") {
//         return op.evaluate(inCircles[0], inCircles[1]);
//     } else if (op.name === "A △ B") {
//         return op.evaluate(inCircles[0], inCircles[1]);
//     }
    
//     return false;
// }

// function drawOperationResult() {
//     // 연산 결과 영역 표시 (유니언 외곽선)
//     if (displayMode === 1) {
//         let op = setOperations[currentOperation];
//         let resultPoints = [];
        
//         // 그리드 만들어서 연산 결과에 포함된 점 수집
//         let gridSize = 5;
//         for (let x = 0; x < width; x += gridSize) {
//             for (let y = 0; y < height; y += gridSize) {
//                 let inCircles = [];
//                 for (let circle of circles) {
//                     let d = dist(x, y, circle.x, circle.y);
//                     inCircles.push(d < circle.radius);
//                 }
                
//                 if (evaluateOperation(inCircles)) {
//                     resultPoints.push({x, y});
//                 }
//             }
//         }
        
//         // 결과 영역 외곽선 그리기
//         stroke(50, 50, 200, 200);
//         strokeWeight(2);
//         noFill();
//         beginShape();
//         for (let point of resultPoints) {
//             vertex(point.x, point.y);
//         }
//         endShape(CLOSE);
//     }
// }

// function drawUI() {
//     // 상단 제목 및 현재 연산
//     fill(30, 30, 50);
//     textAlign(CENTER, TOP);
//     textSize(24);
//     text("벤 다이어그램 - 집합 연산", width/2, 20);
    
//     // 현재 연산 표시
//     textSize(18);
//     let op = setOperations[currentOperation];
//     text("현재 연산: " + op.name + " (" + op.formula + ")", width/2, 50);
    
//     // 조작 방법 안내 패널
//     fill(240, 240, 250, 220);
//     rect(10, 10, 220, 170, 5);
    
//     fill(30);
//     textAlign(LEFT, TOP);
//     textSize(14);
//     text("조작 방법:", 20, 20);
//     text("드래그: 원 이동", 20, 40);
//     text("+ 핸들: 크기 조절", 20, 60);
//     text("1-5: 연산 변경", 20, 80);
//     text("D: 디스플레이 모드 변경", 20, 100);
//     text("L: 레이블 표시/숨기기", 20, 120);
//     text("R: 영역 레이블 표시/숨기기", 20, 140);
//     text("I: 정보 패널 표시/숨기기", 20, 160);
    
//     // 정보 패널
//     if (showSetInfo) {
//         // 세트 정보 패널
//         fill(240, 240, 250, 220);
//         rect(width - 230, 10, 220, 170, 5);
        
//         fill(30);
//         textAlign(LEFT, TOP);
//         textSize(14);
//         text("집합 정보:", width - 220, 20);
        
//         let totalPoints = dataPoints.length;
//         let aCount = dataPoints.filter(p => p.inCircles[0]).length;
//         let bCount = dataPoints.filter(p => p.inCircles[1]).length;
//         let cCount = dataPoints.filter(p => p.inCircles[2]).length;
//         let abCount = dataPoints.filter(p => p.inCircles[0] && p.inCircles[1]).length;
//         let resultCount = dataPoints.filter(p => evaluateOperation(p.inCircles)).length;
        
//         text("A: " + aCount + " 요소", width - 220, 40);
//         text("B: " + bCount + " 요소", width - 220, 60);
//         text("C: " + cCount + " 요소", width - 220, 80);
//         text("A∩B: " + abCount + " 요소", width - 220, 100);
//         text("연산 결과: " + resultCount + " 요소", width - 220, 120);
//         text("전체: " + totalPoints + " 요소", width - 220, 140);
        
//         // 연산 결과 비율
//         let ratio = (resultCount / totalPoints) * 100;
//         text("비율: " + nf(ratio, 0, 1) + "%", width - 220, 160);
//     }
    
//     // 디스플레이 모드 표시기
//     let modeNames = ["영역 모드", "색상 모드", "채우기 모드"];
//     fill(0, 0, 100, 150);
//     rect(width/2 - 60, height - 40, 120, 30, 5);
//     fill(255);
//     textAlign(CENTER, CENTER);
//     text(modeNames[displayMode], width/2, height - 25);
// }

// function mousePressed() {
//     // 원 선택 및 크기 조절 모드 확인
//     for (let i = 0; i < circles.length; i++) {
//         let circle = circles[i];
        
//         // 크기 조절 핸들 확인
//         let handleX = circle.x + circle.radius * 0.7;
//         let handleY = circle.y + circle.radius * 0.7;
//         let d = dist(mouseX, mouseY, handleX, handleY);
        
//         if (d < 10) {
//             // 크기 조절 핸들 선택
//             resizeMode = true;
//             resizeCircle = i;
//             return false;
//         }
        
//         // 원 선택
//         d = dist(mouseX, mouseY, circle.x, circle.y);
//         if (d < circle.radius) {
//             activeCircle = i;
//             dragMode = true;
//             return false;
//         }
//     }
    
//     // 아무것도 선택되지 않음
//     activeCircle = -1;
    
//     return false;
// }

// function mouseReleased() {
//     dragMode = false;
//     resizeMode = false;
//     resizeCircle = -1;
// }

// function mouseDragged() {
//     if (dragMode && activeCircle >= 0) {
//         // 원 이동
//         circles[activeCircle].x = mouseX;
//         circles[activeCircle].y = mouseY;
//     } else if (resizeMode && resizeCircle >= 0) {
//         // 원 크기 조절
//         let circle = circles[resizeCircle];
//         let d = dist(mouseX, mouseY, circle.x, circle.y);
//         circle.radius = max(30, d);
//     }
    
//     // 데이터 포인트 위치 업데이트
//     updateDataPoints();
// }

// function updateDataPoints() {
//     // 데이터 포인트의 원 포함 여부 업데이트
//     for (let point of dataPoints) {
//         point.inCircles = [];
//         for (let circle of circles) {
//             let d = dist(point.x, point.y, circle.x, circle.y);
//             point.inCircles.push(d < circle.radius);
//         }
//     }
// }

// function keyPressed() {
//     // 모드 변경 키 처리
//     if (key === 'd' || key === 'D') {
//         // 디스플레이 모드 변경
//         displayMode = (displayMode + 1) % 3;
//     } else if (key === 'l' || key === 'L') {
//         // 레이블 표시/숨기기
//         showLabels = !showLabels;
//     } else if (key === 'r' || key === 'R') {
//         // 영역 레이블 표시/숨기기
//         showRegions = !showRegions;
//     } else if (key === 'i' || key === 'I') {
//         // 정보 패널 표시/숨기기
//         showSetInfo = !showSetInfo;
//     } else if (key === 'g' || key === 'G') {
//         // 새 데이터 포인트 생성
//         generateDataPoints();
//     } else if (key >= '1' && key <= '5') {
//         // 연산 변경
//         currentOperation = parseInt(key) - 1;
//         if (currentOperation < 0 || currentOperation >= setOperations.length) {
//             currentOperation = 0;
//         }
//     }
// } 