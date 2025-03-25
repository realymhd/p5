// sketch.js : 시각화 관리자 클래스와 기본 함수들을 정의하는 파일

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

// 3D 시각화 클래스 목록 (WebGL 필요)
const webglVisualizations = [RotatingSphere, RotatingTetrahedron, RotatingTorus];

// 전역 변수
let currentVizIndex = 0;
let currentViz = null;
let isWebGLActive = false;

// 버튼 활성화 상태 업데이트
function updateButtonStates() {
  const buttons = document.querySelectorAll('.viz-button');
  buttons.forEach((button) => {
    const index = parseInt(button.getAttribute('data-index'));
    if (index === currentVizIndex) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });
}

// 특정 시각화로 이동하는 함수
function switchVisualization(index) {
  // 현재 시각화 비활성화
  if (currentViz) {
    currentViz.deactivate();
  }
  
  // 인덱스 설정
  currentVizIndex = index;
  
  // 새 시각화 생성 및 초기화
  setupVisualization();
  
  // 버튼 상태 업데이트
  updateButtonStates();
}

// 시각화 설정 함수
function setupVisualization() {
  console.log(`Setting up visualization: ${currentVizIndex}`);
  const VizClass = visualizationClasses[currentVizIndex];
  
  try {
    // 새 시각화 인스턴스 생성
    currentViz = new VizClass();
    console.log(`Created instance of ${VizClass.name}`);
    
    // WebGL 모드 확인 및 전환
    const needsWebGL = webglVisualizations.includes(VizClass);
    console.log(`Needs WebGL: ${needsWebGL}, Current WebGL state: ${isWebGLActive}`);
    
    if (needsWebGL !== isWebGLActive) {
      console.log(`Toggling WebGL mode from ${isWebGLActive} to ${needsWebGL}`);
      // 캔버스 요소 제거
      const container = document.getElementById('canvas-container');
      if (container) {
        console.log(`Removing canvas children: ${container.childNodes.length}`);
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
      }
      
      // 새 캔버스 생성
      let canvas;
      if (needsWebGL) {
        console.log('Creating WebGL canvas');
        canvas = createCanvas(windowWidth, windowHeight, WEBGL);
      } else {
        console.log('Creating 2D canvas');
        canvas = createCanvas(windowWidth, windowHeight);
      }
      
      console.log('Appending canvas to container');
      canvas.parent('canvas-container');
      isWebGLActive = needsWebGL;
    }
    
    // 시각화 설정 및 초기화
    console.log('Setting up visualization');
    currentViz.setup();
    
    // 창 크기에 맞게 조정
    console.log(`Updating size: ${width} x ${height}`);
    currentViz.updateSize(width, height);
    
    console.log('Visualization setup complete');
  } catch (error) {
    console.error(`Failed to initialize ${VizClass ? VizClass.name : 'unknown visualization'}:`, error);
    console.error('Stack trace:', error.stack);
  }
}

// 버튼 이벤트 리스너 설정
function setupButtonListeners() {
  const buttons = document.querySelectorAll('.viz-button');
  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const index = parseInt(button.getAttribute('data-index'));
      console.log(`Button clicked: index ${index}`);
      switchVisualization(index);
    });
  });
}

// p5.js 기본 함수들
function setup() {
  console.log('Setup called');
  
  // 버튼 이벤트 리스너 설정
  setupButtonListeners();
  
  // 최초 캔버스 생성 (WEBGL 모드로 시작)
  console.log('Creating initial canvas');
  createCanvas(windowWidth, windowHeight, WEBGL);
  isWebGLActive = true;
  
  // 첫 번째 시각화 설정
  console.log('Setting up initial visualization');
  setupVisualization();
  
  // 초기 버튼 상태 설정
  updateButtonStates();
  
  console.log('Setup complete');
}

function draw() {
  if (!currentViz) {
    console.log('No current visualization');
    return;
  }
  
  try {
    const needsWebGL = webglVisualizations.includes(visualizationClasses[currentVizIndex]);
    
    // 2D 모드에서는 원점을 좌상단으로 이동
    if (!needsWebGL) {
      resetMatrix();
      translate(-width/2, -height/2, 0);
    }
    
    // 배경 및 시각화 그리기
    background(255);
    currentViz.update();
    currentViz.draw();
  } catch (error) {
    console.error('Error in draw:', error);
  }
}

function windowResized() {
  // 창 크기 변경 시 캔버스 크기 조정
  console.log(`Window resized: ${windowWidth} x ${windowHeight}`);
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

// p5.js가 로드되었는지 확인
if (typeof p5 === 'undefined') {
  console.error('p5.js is not loaded!');
}

// 시각화 클래스가 로드되었는지 확인
visualizationClasses.forEach((VizClass, index) => {
  if (!VizClass) {
    console.error(`Visualization class at index ${index} is not loaded!`);
  } else {
    console.log(`Visualization loaded: ${VizClass.name}`);
  }
});