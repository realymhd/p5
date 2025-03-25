class UIManager {
    constructor() {
      this.screenWidth = 800;
      this.screenHeight = 600;
      this.canvas = null;
      this.centerX = this.screenWidth / 2;
      this.centerY = this.screenHeight / 2;
      this.fonts = {
        regular: null,
        bold: null
      };
    }
  
    setup() {
      // 캔버스 생성 및 컨테이너에 추가
      this.canvas = createCanvas(this.screenWidth, this.screenHeight);
      this.canvas.parent('canvas-container');
      
      // 폰트 로드 (웹폰트 또는 사전 로드된 폰트 사용 가능)
      // 아래 코드는 웹폰트를 사용할 경우:
      // this.fonts.regular = loadFont('assets/fonts/NanumGothic-Regular.ttf');
      // this.fonts.bold = loadFont('assets/fonts/NanumGothic-Bold.ttf');
    }
  
    // 그리드 그리기 (디버깅/교육용)
    drawGrid(cellSize = 50, color = 'rgba(200, 200, 200, 0.2)') {
      push();
      stroke(color);
      strokeWeight(1);
      
      // 세로선
      for (let x = 0; x <= width; x += cellSize) {
        line(x, 0, x, height);
      }
      
      // 가로선
      for (let y = 0; y <= height; y += cellSize) {
        line(0, y, width, y);
      }
      pop();
    }
  
    // 버튼 그리기
    drawButton(x, y, w, h, text, active = false, onClick = null) {
      push();
      rectMode(CENTER);
      textAlign(CENTER, CENTER);
      
      // 버튼 배경
      if (active) {
        fill(58, 134, 255); // 활성화 상태일 때 파란색
      } else if (this.isMouseOver(x, y, w, h)) {
        fill(220, 230, 255); // 마우스 오버 시 밝은 파란색
      } else {
        fill(255);
      }
      
      // 버튼 테두리
      stroke(58, 134, 255);
      strokeWeight(2);
      rect(x, y, w, h, 10);
      
      // 버튼 텍스트
      fill(active ? 255 : 58, 134, 255);
      noStroke();
      textSize(16);
      text(text, x, y);
      
      // 클릭 이벤트 처리 (있는 경우)
      if (onClick && mouseIsPressed && this.isMouseOver(x, y, w, h)) {
        onClick();
      }
      
      pop();
    }
  
    // 마우스가 특정 영역 위에 있는지 확인
    isMouseOver(x, y, w, h) {
      return mouseX >= x - w/2 && mouseX <= x + w/2 && 
             mouseY >= y - h/2 && mouseY <= y + h/2;
    }
  
    // 메시지 표시
    showMessage(text, x = this.centerX, y = 100, size = 24, color = '#3a86ff') {
      push();
      textAlign(CENTER, CENTER);
      textSize(size);
      fill(color);
      text(text, x, y);
      pop();
    }
  
    // 결과 피드백 (정답/오답 등)
    showResult(isCorrect, x = this.centerX, y = this.centerY - 150) {
      push();
      textAlign(CENTER, CENTER);
      textSize(40);
      
      if (isCorrect) {
        fill(76, 175, 80); // 녹색
        text('정답입니다! 👍', x, y);
      } else {
        fill(244, 67, 54); // 빨간색
        text('다시 해보세요! 💪', x, y);
      }
      
      pop();
    }
  }