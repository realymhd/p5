class TrigonometryCircle extends Visualization {
  constructor() {
    super();
    
    // 단위원 속성
    this.radius = 150;        // 단위원 반지름
    this.angle = 0;           // 현재 각도
    this.angleSpeed = 0.01;   // 각도 변화 속성
    
    // 그래프 속성
    this.graphWidth = 300;    // 그래프 폭
    this.graphHeight = 150;   // 그래프 높이
    this.graphX = 200;        // 그래프 X 위치
    
    // 트레이스 히스토리 (그래프에 점 기록)
    this.sinHistory = [];
    this.cosHistory = [];
    this.historyLength = 100;
    
    // 컬러 개인화
    this.colors.background = color(250);
    this.colors.circle = color(200, 200, 200);
    this.colors.angle = color(100, 100, 100);
    this.colors.sin = color(255, 50, 50);    // 사인 - 빨간색
    this.colors.cos = color(50, 50, 255);    // 코사인 - 파란색
    this.colors.tan = color(50, 180, 50);    // 탄젠트 - 녹색
    this.colors.text = color(50, 50, 50);
    
    // 현재 표시 모드
    this.displayModes = ["sin/cos", "tan", "all"];
    this.currentModeIndex = 0;
    
    // 사용자 인터랙션
    this.draggingAngle = false;
  }
  
  setup() {
    super.setup();
    // 특별한 초기화 필요 없음
  }
  
  reset() {
    super.reset();
    // 상태 초기화
    this.angle = 0;
    this.sinHistory = [];
    this.cosHistory = [];
    this.currentModeIndex = 0;
    this.draggingAngle = false;
  }
  
  deactivate() {
    super.deactivate();
    // 드래그 상태 초기화
    this.draggingAngle = false;
  }
  
  update() {
    // 자동 회전 - 드래그하고 있지 않을 때만
    if (!this.draggingAngle) {
      this.angle += this.angleSpeed;
      if (this.angle > TWO_PI) {
        this.angle -= TWO_PI;
      }
    }
    
    // 히스토리 업데이트
    this.updateHistory();
  }
  
  // 히스토리 업데이트
  updateHistory() {
    // 사인값 히스토리 추가
    this.sinHistory.push({
      angle: this.angle,
      value: sin(this.angle)
    });
    
    // 코사인값 히스토리 추가
    this.cosHistory.push({
      angle: this.angle,
      value: cos(this.angle)
    });
    
    // 최대 길이 제한
    if (this.sinHistory.length > this.historyLength) {
      this.sinHistory.shift();
      this.cosHistory.shift();
    }
  }
  
  draw() {
    // 배경 설정
    background(this.colors.background);
    
    // 모드 이름 표시
    textAlign(RIGHT, TOP);
    textSize(14);
    fill(this.colors.text);
    text(this.displayModes[this.currentModeIndex] + " 모드", width - 20, 20);
    
    // 좌측에 단위원 그리기
    push();
    translate(width / 3, height / 2);
    
    // 단위원 그리기
    this.drawUnitCircle();
    
    // 현재 모드에 따라 해당 함수값 시각화
    switch (this.displayModes[this.currentModeIndex]) {
      case "sin/cos":
        this.drawSinCos();
        break;
      case "tan":
        this.drawTan();
        break;
      case "all":
        this.drawSinCos();
        this.drawTan();
        break;
    }
    
    pop();
    
    // 우측에 그래프 그리기
    push();
    translate(2 * width / 3, height / 2);
    this.drawGraph();
    pop();
    
    // 값 텍스트 표시
    this.drawValues();
  }
  
  // 단위원 그리기
  drawUnitCircle() {
    // 단위원
    stroke(this.colors.circle);
    strokeWeight(2);
    noFill();
    ellipse(0, 0, this.radius * 2, this.radius * 2);
    
    // 직교 좌표축
    stroke(this.colors.circle);
    strokeWeight(1);
    line(-this.radius - 10, 0, this.radius + 10, 0);  // x축
    line(0, -this.radius - 10, 0, this.radius + 10);  // y축
    
    // 각도 표시를 위한 작은 눈금
    for (let a = 0; a < TWO_PI; a += PI/6) {
      const x = cos(a) * this.radius;
      const y = sin(a) * this.radius;
      const x2 = cos(a) * (this.radius + 10);
      const y2 = sin(a) * (this.radius + 10);
      
      stroke(this.colors.circle);
      line(x, y, x2, y2);
      
      // 각도 레이블 (라디안)
      textAlign(CENTER, CENTER);
      textSize(12);
      fill(this.colors.text);
      let label;
      
      if (a === 0) label = "0";
      else if (a === PI/6) label = "π/6";
      else if (a === PI/4) label = "π/4";
      else if (a === PI/3) label = "π/3";
      else if (a === PI/2) label = "π/2";
      else if (a === 2*PI/3) label = "2π/3";
      else if (a === 3*PI/4) label = "3π/4";
      else if (a === 5*PI/6) label = "5π/6";
      else if (a === PI) label = "π";
      else if (a === 7*PI/6) label = "7π/6";
      else if (a === 5*PI/4) label = "5π/4";
      else if (a === 4*PI/3) label = "4π/3";
      else if (a === 3*PI/2) label = "3π/2";
      else if (a === 5*PI/3) label = "5π/3";
      else if (a === 7*PI/4) label = "7π/4";
      else if (a === 11*PI/6) label = "11π/6";
      
      text(label, x2 * 1.2, y2 * 1.2);
    }
    
    // 반지름 그리기
    stroke(this.colors.angle);
    strokeWeight(2);
    line(0, 0, cos(this.angle) * this.radius, sin(this.angle) * this.radius);
    
    // 각도 호 그리기
    noFill();
    stroke(this.colors.angle);
    strokeWeight(1);
    arc(0, 0, 60, 60, 0, this.angle);
    
    // 현재 각도 표시
    fill(this.colors.angle);
    textSize(14);
    textAlign(CENTER, CENTER);
    text(`θ = ${this.formatAngle(this.angle)}`, 0, -this.radius - 30);
  }
  
  // 사인과 코사인 표시
  drawSinCos() {
    const x = cos(this.angle) * this.radius;
    const y = sin(this.angle) * this.radius;
    
    // 코사인 선
    stroke(this.colors.cos);
    strokeWeight(2);
    line(x, 0, x, y);
    
    // 사인 선
    stroke(this.colors.sin);
    strokeWeight(2);
    line(0, y, x, y);
    
    // 점 표시
    fill(this.colors.angle);
    noStroke();
    ellipse(x, y, 8, 8);
    
    // 코사인 레이블
    textAlign(CENTER, CENTER);
    textSize(14);
    fill(this.colors.cos);
    text("cos(θ)", x/2, -15);
    
    // 사인 레이블
    fill(this.colors.sin);
    text("sin(θ)", -15, y/2);
  }
  
  // 탄젠트 표시
  drawTan() {
    const x = cos(this.angle) * this.radius;
    const y = sin(this.angle) * this.radius;
    
    // 탄젠트 값 계산 및 표시 (무한대 방지)
    if (cos(this.angle) !== 0) {
      const tanValue = tan(this.angle);
      const tanX = this.radius;
      const tanY = tanValue * tanX;
      
      // 탄젠트 선은 원의 오른쪽 경계에서 그림
      if (abs(tanY) < this.radius * 2) {
        stroke(this.colors.tan);
        strokeWeight(2);
        line(x, y, tanX, tanY);
        
        // 탄젠트 점
        fill(this.colors.tan);
        noStroke();
        ellipse(tanX, tanY, 6, 6);
        
        // 탄젠트 레이블
        textAlign(LEFT, CENTER);
        textSize(14);
        fill(this.colors.tan);
        text("tan(θ)", tanX + 10, tanY);
      }
    }
  }
  
  // 그래프 그리기
  drawGraph() {
    // 그래프 축
    stroke(this.colors.circle);
    strokeWeight(1);
    
    // X축 (각도)
    line(-this.graphWidth/2, 0, this.graphWidth/2, 0);
    
    // Y축 (값)
    line(-this.graphWidth/2, -this.graphHeight, -this.graphWidth/2, this.graphHeight);
    
    // 그래프 눈금
    // X축 눈금
    for (let x = 0; x <= TWO_PI; x += PI/2) {
      const gx = map(x, 0, TWO_PI, -this.graphWidth/2, this.graphWidth/2);
      
      stroke(this.colors.circle);
      line(gx, -5, gx, 5);
      
      textAlign(CENTER, TOP);
      textSize(12);
      fill(this.colors.text);
      let label;
      if (x === 0) label = "0";
      else if (x === PI/2) label = "π/2";
      else if (x === PI) label = "π";
      else if (x === 3*PI/2) label = "3π/2";
      else if (x === TWO_PI) label = "2π";
      text(label, gx, 10);
    }
    
    // Y축 눈금
    for (let y = -1; y <= 1; y += 0.5) {
      const gy = map(y, -1, 1, this.graphHeight, -this.graphHeight);
      
      stroke(this.colors.circle);
      line(-this.graphWidth/2 - 5, gy, -this.graphWidth/2 + 5, gy);
      
      textAlign(RIGHT, CENTER);
      textSize(12);
      fill(this.colors.text);
      text(y.toFixed(1), -this.graphWidth/2 - 10, gy);
    }
    
    // 현재 모드에 따라 그래프 그리기
    if (this.currentModeIndex === 0 || this.currentModeIndex === 2) {
      this.drawFunctionGraph(this.sinHistory, this.colors.sin);
      this.drawFunctionGraph(this.cosHistory, this.colors.cos);
    }
    
    if (this.currentModeIndex === 1 || this.currentModeIndex === 2) {
      this.drawTanGraph();
    }
  }
  
  // 함수 그래프 그리기 (사인, 코사인)
  drawFunctionGraph(history, color) {
    if (history.length < 2) return;
    
    // 선 그리기
    stroke(color);
    strokeWeight(2);
    noFill();
    
    beginShape();
    for (let i = 0; i < history.length; i++) {
      const point = history[i];
      const x = map(point.angle % TWO_PI, 0, TWO_PI, -this.graphWidth/2, this.graphWidth/2);
      const y = map(point.value, -1, 1, this.graphHeight, -this.graphHeight);
      vertex(x, y);
    }
    endShape();
    
    // 현재 값 표시
    const lastPoint = history[history.length - 1];
    const x = map(lastPoint.angle % TWO_PI, 0, TWO_PI, -this.graphWidth/2, this.graphWidth/2);
    const y = map(lastPoint.value, -1, 1, this.graphHeight, -this.graphHeight);
    
    fill(color);
    noStroke();
    ellipse(x, y, 6, 6);
  }
  
  // 탄젠트 그래프 그리기
  drawTanGraph() {
    // 점선으로 점근선 그리기 (x = π/2, x = 3π/2)
    stroke(this.colors.tan);
    strokeWeight(1);
    drawingContext.setLineDash([5, 5]);
    
    const x1 = map(PI/2, 0, TWO_PI, -this.graphWidth/2, this.graphWidth/2);
    const x2 = map(3*PI/2, 0, TWO_PI, -this.graphWidth/2, this.graphWidth/2);
    
    line(x1, -this.graphHeight, x1, this.graphHeight);
    line(x2, -this.graphHeight, x2, this.graphHeight);
    
    drawingContext.setLineDash([]);
    
    // 탄젠트 곡선 그리기
    strokeWeight(2);
    
    // 탄젠트는 분리된 구간으로 그려야 함
    for (let segment = 0; segment < 2; segment++) {
      beginShape();
      for (let x = 0; x < PI; x += 0.05) {
        // 각 구간의 시작점 설정
        const actualX = x + segment * PI;
        
        // 점근선 근처에서는 그리지 않음
        if (abs(actualX - PI/2) > 0.1 && abs(actualX - 3*PI/2) > 0.1) {
          const tanValue = tan(actualX);
          
          // 값 제한 (-3에서 3 사이로)
          const clampedTan = constrain(tanValue, -3, 3);
          
          const graphX = map(actualX, 0, TWO_PI, -this.graphWidth/2, this.graphWidth/2);
          const graphY = map(clampedTan, -3, 3, this.graphHeight, -this.graphHeight);
          
          vertex(graphX, graphY);
        }
      }
      endShape();
    }
    
    // 현재 탄젠트 값 표시
    if (abs(cos(this.angle)) > 0.1) { // 점근선에서 너무 가까우면 표시하지 않음
      const tanValue = tan(this.angle);
      
      // 값 제한
      const clampedTan = constrain(tanValue, -3, 3);
      
      const graphX = map(this.angle % TWO_PI, 0, TWO_PI, -this.graphWidth/2, this.graphWidth/2);
      const graphY = map(clampedTan, -3, 3, this.graphHeight, -this.graphHeight);
      
      fill(this.colors.tan);
      noStroke();
      ellipse(graphX, graphY, 6, 6);
    }
  }
  
  // 현재 값 텍스트로 표시
  drawValues() {
    // 화면 하단에 값 표시
    textAlign(CENTER, BOTTOM);
    textSize(16);
    
    const sinValue = sin(this.angle);
    const cosValue = cos(this.angle);
    const tanValue = tan(this.angle);
    
    // 사인 값
    fill(this.colors.sin);
    text(`sin(${this.formatAngle(this.angle)}) = ${sinValue.toFixed(3)}`, width/4, height - 20);
    
    // 코사인 값
    fill(this.colors.cos);
    text(`cos(${this.formatAngle(this.angle)}) = ${cosValue.toFixed(3)}`, width/2, height - 20);
    
    // 탄젠트 값
    fill(this.colors.tan);
    text(`tan(${this.formatAngle(this.angle)}) = ${tanValue.toFixed(3)}`, 3*width/4, height - 20);
  }
  
  // 각도를 예쁘게 표시
  formatAngle(angle) {
    const normalizedAngle = angle % TWO_PI;
    
    // 주요 각도들에 대한 특별 표시
    if (abs(normalizedAngle - 0) < 0.01 || abs(normalizedAngle - TWO_PI) < 0.01) return "0";
    if (abs(normalizedAngle - PI/6) < 0.01) return "π/6";
    if (abs(normalizedAngle - PI/4) < 0.01) return "π/4";
    if (abs(normalizedAngle - PI/3) < 0.01) return "π/3";
    if (abs(normalizedAngle - PI/2) < 0.01) return "π/2";
    if (abs(normalizedAngle - 2*PI/3) < 0.01) return "2π/3";
    if (abs(normalizedAngle - 3*PI/4) < 0.01) return "3π/4";
    if (abs(normalizedAngle - 5*PI/6) < 0.01) return "5π/6";
    if (abs(normalizedAngle - PI) < 0.01) return "π";
    if (abs(normalizedAngle - 7*PI/6) < 0.01) return "7π/6";
    if (abs(normalizedAngle - 5*PI/4) < 0.01) return "5π/4";
    if (abs(normalizedAngle - 4*PI/3) < 0.01) return "4π/3";
    if (abs(normalizedAngle - 3*PI/2) < 0.01) return "3π/2";
    if (abs(normalizedAngle - 5*PI/3) < 0.01) return "5π/3";
    if (abs(normalizedAngle - 7*PI/4) < 0.01) return "7π/4";
    if (abs(normalizedAngle - 11*PI/6) < 0.01) return "11π/6";
    
    // 그 외에는 라디안 값 표시
    return normalizedAngle.toFixed(2);
  }
  
  // 마우스 이벤트
  mousePressed() {
    super.mousePressed();
    
    // 단위원 내에서 클릭하는지 체크
    const dx = mouseX - width / 3;
    const dy = mouseY - height / 2;
    const distance = sqrt(dx*dx + dy*dy);
    
    if (distance <= this.radius) {
      this.draggingAngle = true;
      this.updateAngleFromMouse();
    }
  }
  
  mouseDragged() {
    super.mouseDragged();
    
    if (this.draggingAngle) {
      this.updateAngleFromMouse();
    }
  }
  
  mouseReleased() {
    super.mouseReleased();
    this.draggingAngle = false;
  }
  
  // 마우스 위치로부터 각도 업데이트
  updateAngleFromMouse() {
    const dx = mouseX - width / 3;
    const dy = mouseY - height / 2;
    this.angle = atan2(dy, dx);
    
    // 음수 각도 처리
    if (this.angle < 0) {
      this.angle += TWO_PI;
    }
  }
  
  // 키 이벤트 처리
  keyPressed() {
    if (key === 'm' || key === 'M') {
      this.currentModeIndex = (this.currentModeIndex + 1) % this.displayModes.length;
    }
  }
} 