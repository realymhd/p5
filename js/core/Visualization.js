// Visualization.js : 시각화 객체를 정의하는 클래스

class Visualization {
  constructor() {
    // 기본 색상 설정
    this.colors = {
      background: color(255),
      primary: color(50, 50, 50),
      accent: color(0, 100, 200)
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
    
    // 호환성을 위한 별칭 추가 (RotatingSphere.js에서 참조)
    this.mouseRotationX = 0;
    this.mouseRotationY = 0;
    this.isMouseDown = false;
    
    // 시각화 상태
    this.state = {
      isActive: false,
      scale: 1.0,
      width: 800,
      height: 600
    };
    
    console.log(`Visualization base class constructed`);
  }
  
  // 시각화 객체를 초기화하는 메서드
  setup() {
    this.state.isActive = true;
    console.log(`Base visualization setup completed`);
  }
  
  // 시각화 객체를 초기 상태로 되돌리는 메서드
  reset() {
    this.mouseState.rotationX = 0;
    this.mouseState.rotationY = 0;
    this.mouseState.isDown = false;
    
    // 별칭도 초기화
    this.mouseRotationX = 0;
    this.mouseRotationY = 0;
    this.isMouseDown = false;
  }
  
  // 시각화가 비활성화될 때 호출되는 메서드
  deactivate() {
    this.state.isActive = false;
    console.log(`Visualization deactivated`);
  }

  // 시각화 상태를 업데이트하는 메서드
  update() {
    // 상태 동기화
    this.mouseRotationX = this.mouseState.rotationX;
    this.mouseRotationY = this.mouseState.rotationY;
    this.isMouseDown = this.mouseState.isDown;
    
    // 하위 클래스에서 오버라이드
  }

  // 시각화를 그리는 메서드
  draw() {
    try {
      // 단색 배경 설정
      background(this.colors.background);
      
      // 하위 클래스에서 오버라이드
    } catch (error) {
      console.error("Error in visualization draw method:", error);
    }
  }
  
  // 마우스 이벤트 핸들러
  mousePressed() {
    try {
      this.mouseState.isDown = true;
      this.isMouseDown = true;
      this.mouseState.lastX = mouseX;
      this.mouseState.lastY = mouseY;
    } catch (error) {
      console.error("Error in mousePressed:", error);
    }
  }
  
  mouseDragged() {
    try {
      if (!this.mouseState.isDown) return;
      
      const dx = mouseX - this.mouseState.lastX;
      const dy = mouseY - this.mouseState.lastY;
      
      this.mouseState.rotationY += dx * this.mouseState.sensitivity;
      this.mouseState.rotationX += dy * this.mouseState.sensitivity;
      
      // 별칭 업데이트
      this.mouseRotationY = this.mouseState.rotationY;
      this.mouseRotationX = this.mouseState.rotationX;
      
      this.mouseState.lastX = mouseX;
      this.mouseState.lastY = mouseY;
    } catch (error) {
      console.error("Error in mouseDragged:", error);
    }
  }
  
  mouseReleased() {
    try {
      this.mouseState.isDown = false;
      this.isMouseDown = false;
    } catch (error) {
      console.error("Error in mouseReleased:", error);
    }
  }
  
  updateSize(width, height) {
    this.state.width = width;
    this.state.height = height;
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