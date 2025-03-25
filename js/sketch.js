// sketch.js : 시각화 관리자와 기본 함수들

// 모든 시각화 클래스 목록
const visualizationClasses = [
  RotatingSphere,
  RotatingTetrahedron, 
  RotatingTorus,
  RegularPolygons,
  NumberLineViz,
  VectorField,
  TrigonometryCircle,
  ComplexPlane,
  FractalExplorer,
  ProbabilityDistribution,
  EuclideanGeometry,
  NumberTheory,
  CoordinateSystem,
  FunctionGrapher
];

// 시각화 이름 목록
const visualizationNames = [
  "회전하는 구",
  "회전하는 사면체", 
  "회전하는 도넛",
  "정다각형",
  "수직선",
  "벡터장",
  "삼각함수 원",
  "복소평면",
  "프랙탈 탐색기",
  "확률 분포",
  "유클리드 기하학",
  "정수론",
  "좌표계",
  "함수 그래퍼"
];

// 3D 시각화 클래스 목록 (WebGL 필요)
const webglVisualizations = [RotatingSphere, RotatingTetrahedron, RotatingTorus];

// 전역 변수
let currentVizIndex = 0;
let currentViz = null;
let isWebGLActive = false;
let dropdown;

// 시각화 전환 함수
function switchVisualization(index) {
  // 현재 시각화 비활성화
  if (currentViz) {
    currentViz.deactivate();
  }
  
  // 인덱스 설정
  currentVizIndex = index;
  
  // WebGL 모드 확인
  const needsWebGL = webglVisualizations.includes(visualizationClasses[currentVizIndex]);
  
  // 모드가 변경되어야 하면 캔버스 다시 만들기
  if (needsWebGL !== isWebGLActive) {
    // 기존 캔버스 제거
    removeElements(); // p5.js 함수로 모든 p5 요소 제거
    
    // 새 캔버스 생성
    if (needsWebGL) {
      createCanvas(windowWidth, windowHeight, WEBGL);
    } else {
      createCanvas(windowWidth, windowHeight);
    }
    
    isWebGLActive = needsWebGL;
    
    // 드롭다운 다시 만들기
    setupDropdown();
  }
  
  // 새 시각화 인스턴스 생성
  currentViz = new visualizationClasses[currentVizIndex]();
  
  // 시각화 설정 및 초기화
  currentViz.setup();
  
  // 크기 설정
  currentViz.updateSize(width, height);
  
  // 드롭다운 값 업데이트
  dropdown.selected(currentVizIndex.toString());
}

// p5.js 기본 함수들
function setup() {
  // 최초 캔버스 생성 (WEBGL 모드로 시작)
  createCanvas(windowWidth, windowHeight, WEBGL);
  isWebGLActive = true;
  
  // 드롭다운 설정
  setupDropdown();
  
  // 첫 번째 시각화 설정
  switchVisualization(0);
}

// 드롭다운 초기화 (p5.js 방식)
function setupDropdown() {
  // 드롭다운 생성
  dropdown = createSelect();
  dropdown.position(10, 10);
  dropdown.id('viz-dropdown');
  
  // 옵션 추가
  for (let i = 0; i < visualizationNames.length; i++) {
    dropdown.option(visualizationNames[i], i);
  }
  
  // 이벤트 리스너 설정
  dropdown.changed(onDropdownChange);
  
  // 현재 선택 항목 설정
  dropdown.selected(currentVizIndex.toString());
}

// 드롭다운 변경 이벤트 핸들러
function onDropdownChange() {
  const index = parseInt(dropdown.value());
  switchVisualization(index);
}

function draw() {
  if (!currentViz) return;
  
  // 2D 모드에서는 좌표계 조정
  if (!isWebGLActive) {
    resetMatrix();
    translate(-width/2, -height/2, 0);
  }
  
  // 시각화 업데이트 및 그리기
  currentViz.update();
  currentViz.draw();
}

function windowResized() {
  // 창 크기 변경 시 캔버스 크기 조정
  resizeCanvas(windowWidth, windowHeight);
  
  if (currentViz) {
    currentViz.updateSize(width, height);
  }
}

// 마우스 이벤트 처리
function mousePressed() {
  if (currentViz && currentViz.mousePressed) {
    currentViz.mousePressed();
  }
}

function mouseDragged() {
  if (currentViz && currentViz.mouseDragged) {
    currentViz.mouseDragged();
  }
}

function mouseReleased() {
  if (currentViz && currentViz.mouseReleased) {
    currentViz.mouseReleased();
  }
}

// 키보드 이벤트 처리
function keyPressed() {
  // 스페이스바나 오른쪽 화살표 키로 다음 시각화 전환
  if (keyCode === 32 || keyCode === RIGHT_ARROW) {
    switchVisualization((currentVizIndex + 1) % visualizationClasses.length);
  }
}