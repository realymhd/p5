// Visualization.js : 모든 시각화의 기본 클래스

class Visualization {
  constructor() {
    // 기본 속성
    this.colors = {
      background: color(240),
      primary: color(0, 120, 255),
      secondary: color(255, 120, 0),
      text: color(50)
    };
    
    // 필요한 경우 여기서 초기화
    this.isActive = false;
  }
  
  // 캔버스 크기가 변경될 때 호출
  updateScale() {
    // 자식 클래스에서 오버라이드
  }
  
  // 시각화 초기화
  setup() {
    this.isActive = true;
    this.updateScale();
  }
  
  // 매 프레임 업데이트
  update() {
    // 자식 클래스에서 오버라이드
  }
  
  // 매 프레임 그리기
  draw() {
    // 자식 클래스에서 오버라이드
  }
  
  // 시각화 초기화 
  reset() {
    // 자식 클래스에서 오버라이드
  }
  
  // 시각화 비활성화
  deactivate() {
    this.isActive = false;
  }
  
  // 마우스 이벤트
  mousePressed() {
    // 자식 클래스에서 오버라이드
  }
  
  mouseDragged() {
    // 자식 클래스에서 오버라이드
  }
  
  mouseReleased() {
    // 자식 클래스에서 오버라이드
  }
  
  // 키보드 이벤트
  keyPressed() {
    // 자식 클래스에서 오버라이드
  }
  
  keyReleased() {
    // 자식 클래스에서 오버라이드
  }
  
  // 윈도우 크기 변경 시
  windowResized() {
    this.updateScale();
  }
}