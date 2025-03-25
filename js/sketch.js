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
  NumberTheory
];

// 3D 시각화 클래스 목록 (WebGL 필요)
const webglVisualizations = [RotatingSphere, RotatingTetrahedron, RotatingTorus];

// 시각화 관리자 클래스
class VisualizationManager {
  constructor() {
    this.visualizations = {};
    this.currentIndex = 0;
    this.webglIsActive = false;
    this.zoomLevel = 1;
    this.ZOOM_STEP = 0.1;
    this.MIN_ZOOM = 0.5;
    this.MAX_ZOOM = 2;
  }

  initialize() {
    // DOM이 로드되었는지 확인
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initializeAfterDOM());
    } else {
      this.initializeAfterDOM();
    }
  }

  initializeAfterDOM() {
    this.createCanvas();
    this.setupZoomControls();
    this.initializeVisualizations();
    this.createButtons();
    this.switchVisualization(0);
  }

  createCanvas() {
    const container = document.getElementById('canvas-container');
    if (!container) {
      console.error('Canvas container not found');
      return;
    }

    const canvas = createCanvas(800, 600, WEBGL);
    canvas.parent('canvas-container');
    
    // 캔버스 초기 설정
    this.updateCanvasSize();
  }

  setupZoomControls() {
    document.getElementById('zoom-in').addEventListener('click', () => {
      this.zoomLevel = min(this.zoomLevel + this.ZOOM_STEP, this.MAX_ZOOM);
      this.updateCanvasSize();
    });
    
    document.getElementById('zoom-out').addEventListener('click', () => {
      this.zoomLevel = max(this.zoomLevel - this.ZOOM_STEP, this.MIN_ZOOM);
      this.updateCanvasSize();
    });
  }

  initializeVisualizations() {
    console.log('Available classes:', visualizationClasses);
    
    visualizationClasses.forEach((VizClass, index) => {
      console.log(`Initializing ${VizClass.name}`);
      if (!VizClass) {
        console.error(`Visualization class at index ${index} is undefined`);
        return;
      }
      
      try {
        const viz = new VizClass();
        viz.setup();
        this.visualizations[index] = viz;
        console.log(`Successfully initialized ${VizClass.name}`);
      } catch (error) {
        console.error(`Failed to initialize ${VizClass.name}:`, error);
      }
    });
    
    console.log('Initialized visualizations:', this.visualizations);
  }

  createButtons() {
    const controlsDiv = document.querySelector('.controls');
    
    visualizationClasses.forEach((VizClass, index) => {
      const viz = this.visualizations[index];
      const button = document.createElement('button');
      button.classList.add('visualization-button');
      button.setAttribute('data-index', index);
      button.textContent = this.getDisplayName(VizClass.name, viz);
      
      if (index === this.currentIndex) {
        button.classList.add('active');
      }
      
      button.addEventListener('click', () => this.switchVisualization(index));
      controlsDiv.appendChild(button);
    });
  }

  getDisplayName(className, viz) {
    if (viz.displayName) return viz.displayName;
    
    const nameMap = {
      'RotatingSphere': '회전하는 구',
      'RotatingTetrahedron': '회전하는 사면체',
      'RotatingTorus': '회전하는 도넛',
      'RegularPolygons': '정다각형',
      'NumberLineViz': '수직선',
      'VectorField': '벡터장',
      'TrigonometryCircle': '삼각함수 원',
      'ComplexPlane': '복소평면',
      'FractalExplorer': '프랙탈 탐색기',
      'ProbabilityDistribution': '확률 분포',
      'EuclideanGeometry': '유클리드 기하학',
      'NumberTheory': '정수론'
    };
    
    return nameMap[className] || className;
  }

  updateCanvasSize() {
    const baseWidth = 800;
    const baseHeight = 600;
    const newWidth = baseWidth * this.zoomLevel;
    const newHeight = baseHeight * this.zoomLevel;
    
    resizeCanvas(newWidth, newHeight);
    
    const container = document.getElementById('canvas-container');
    if (container) {
      container.style.width = `${newWidth}px`;
      container.style.height = `${newHeight}px`;
    }
  }

  switchVisualization(index) {
    if (typeof index === 'string') {
      index = visualizationClasses.findIndex(cls => cls.name === index);
      if (index === -1) {
        console.error('Invalid visualization name:', index);
        return;
      }
    }

    if (this.visualizations[this.currentIndex]) {
      this.visualizations[this.currentIndex].deactivate();
    }
    
    this.updateButtonStates(index);
    this.currentIndex = index;
    
    const currentViz = this.visualizations[this.currentIndex];
    const needsWebGL = webglVisualizations.some(cls => currentViz instanceof cls);
    
    if (needsWebGL !== this.webglIsActive) {
      this.toggleWebGLMode(needsWebGL);
    }
    
    currentViz.reset();
    currentViz.setup();
  }

  updateButtonStates(index) {
    document.querySelectorAll('.visualization-button').forEach(button => {
      button.classList.remove('active');
      if (parseInt(button.getAttribute('data-index')) === index) {
        button.classList.add('active');
      }
    });
  }

  toggleWebGLMode(needsWebGL) {
    try {
      const currentWidth = width || 800;
      const currentHeight = height || 600;
      
      console.log('Toggling WebGL mode:', { needsWebGL, currentWidth, currentHeight });
      
      let canvas;
      if (needsWebGL) {
        canvas = createCanvas(currentWidth, currentHeight, WEBGL);
      } else {
        canvas = createCanvas(currentWidth, currentHeight);
      }
      
      canvas.parent('canvas-container');
      this.webglIsActive = needsWebGL;
      this.updateCanvasSize();
      
      console.log('WebGL mode toggled successfully');
    } catch (error) {
      console.error('Error toggling WebGL mode:', error);
    }
  }

  draw() {
    const viz = this.visualizations[this.currentIndex];
    if (!viz) {
      console.error('No visualization at index:', this.currentIndex);
      return;
    }

    try {
      const needsWebGL = webglVisualizations.some(cls => viz instanceof cls);
      
      if (needsWebGL !== this.webglIsActive) {
        console.log('Switching WebGL mode:', needsWebGL);
        this.toggleWebGLMode(needsWebGL);
      }
      
      background(255);  // 흰색 배경 추가
      viz.update();
      viz.draw();
    } catch (error) {
      console.error('Error in draw:', error);
    }
  }

  handleKeyPressed(keyCode) {
    const key = parseInt(keyCode - 49);
    if (key >= 0 && key < visualizationClasses.length) {
      this.switchVisualization(key);
      return;
    }
    
    const viz = this.visualizations[this.currentIndex];
    if (viz.keyPressed) {
      viz.keyPressed();
    }
  }

  handleMousePressed() {
    const viz = this.visualizations[this.currentIndex];
    if (viz.mousePressed) {
      viz.mousePressed();
    }
  }

  handleMouseDragged() {
    const viz = this.visualizations[this.currentIndex];
    if (viz.mouseDragged) {
      viz.mouseDragged();
    }
  }

  handleMouseReleased() {
    const viz = this.visualizations[this.currentIndex];
    if (viz.mouseReleased) {
      viz.mouseReleased();
    }
  }

  handleMouseWheel(event) {
    const viz = this.visualizations[this.currentIndex];
    if (viz.mouseWheel) {
      viz.mouseWheel(event);
    }
    return false;
  }
}

// 전역 변수
let vizManager;

// DOM이 완전히 로드된 후 초기화
document.addEventListener('DOMContentLoaded', () => {
  vizManager = new VisualizationManager();
  vizManager.initialize();

  // p5.js 전역 함수들을 window 객체에 할당
  window.setup = () => vizManager.initialize();
  window.draw = () => vizManager.draw();
  window.keyPressed = () => vizManager.handleKeyPressed(keyCode);
  window.mousePressed = () => vizManager.handleMousePressed();
  window.mouseDragged = () => vizManager.handleMouseDragged();
  window.mouseReleased = () => vizManager.handleMouseReleased();
  window.mouseWheel = (event) => vizManager.handleMouseWheel(event);
  window.windowResized = () => vizManager.updateCanvasSize();
});