class Visualization {
  constructor() {
    // 기본 색상 설정
    this.colors = {
      background: color(255),
      primary: color(50, 50, 50),
      accent: color(0, 100, 200),
      highlight: color(255, 150, 0)
    };
    
    // 마우스 회전 관련 속성
    this.mouseState = {
      isDown: false,
      rotationX: 0,
      rotationY: 0,
      lastX: 0,
      lastY: 0,
      sensitivity: 0.01
    };
    
    // 시각화 상태
    this.state = {
      isActive: false,
      scale: 1.0,
      baseSize: 600,
      width: 800,
      height: 600
    };
  }
  
  // 크기에 따른 스케일 계산 (모든 시각화 객체에서 사용)
  updateScale() {
    // 현재 캔버스 크기에 맞게 스케일 계산
    // 정사각형이 아닐 경우 작은 쪽에 맞춤
    const minDimension = min(width, height);
    this.state.scale = minDimension / this.state.baseSize;
  }
  
  // 시각화 객체를 초기화하는 메서드
  setup() {
    // 하위 클래스에서 오버라이드
    this.state.isActive = true;
    this.updateScale();
  }
  
  // 시각화 객체를 초기 상태로 되돌리는 메서드
  reset() {
    // 기본 속성 초기화
    this.mouseState.rotationX = 0;
    this.mouseState.rotationY = 0;
    this.mouseState.isDown = false;
    this.updateScale();
    
    // 하위 클래스에서 추가 초기화를 위해 오버라이드할 수 있음
  }
  
  // 시각화가 비활성화될 때 호출되는 메서드
  deactivate() {
    this.state.isActive = false;
    // 하위 클래스에서 추가 정리 작업을 위해 오버라이드할 수 있음
  }

  // 시각화 상태를 업데이트하는 메서드
  update() {
    // 캔버스 크기가 변경되었을 때 스케일 업데이트
    this.updateScale();
    
    // 하위 클래스에서 오버라이드
  }

  // 시각화를 그리는 메서드
  draw() {
    // 단색 배경 설정
    background(this.colors.background);
    // 하위 클래스에서 오버라이드
  }
  
  // 마우스 이벤트 핸들러
  mousePressed() {
    this.mouseState.isDown = true;
    this.mouseState.lastX = mouseX;
    this.mouseState.lastY = mouseY;
  }
  
  mouseDragged() {
    if (!this.mouseState.isDown) return;
    
    const dx = mouseX - this.mouseState.lastX;
    const dy = mouseY - this.mouseState.lastY;
    
    this.mouseState.rotationY += dx * this.mouseState.sensitivity;
    this.mouseState.rotationX += dy * this.mouseState.sensitivity;
    
    this.mouseState.lastX = mouseX;
    this.mouseState.lastY = mouseY;
  }
  
  mouseReleased() {
    this.mouseState.isDown = false;
  }

  updateSize(width, height) {
    this.state.width = width;
    this.state.height = height;
    this.reset();
  }

  // 유틸리티 메서드들
  getScale() {
    return this.state.scale;
  }

  isActive() {
    return this.state.isActive;
  }

  getRotation() {
    return {
      x: this.mouseState.rotationX,
      y: this.mouseState.rotationY
    };
  }
} 