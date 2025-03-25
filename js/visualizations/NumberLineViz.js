class NumberLineViz extends Visualization {
  constructor() {
    super();
    
    // 숫자선 속성
    this.minValue = -10;
    this.maxValue = 10;
    this.tickSpacing = 1;
    this.lineLength = 600;
    this.lineWidth = 3;
    this.tickHeight = 10;
    this.textSize = 14;
    
    // 강조할 숫자 및 구간 (나중에 업데이트할 수 있음)
    this.highlightedNumbers = [-5, 0, 5];
    this.highlightedRanges = [
      { start: -8, end: -6, color: color(200, 100, 100, 150) },
      { start: -3, end: 2, color: color(100, 200, 100, 150) },
      { start: 6, end: 9, color: color(100, 100, 200, 150) }
    ];
    
    // 애니메이션 효과
    this.markers = [
      { value: -7, targetValue: 7, speed: 0.05, size: 15, color: color(200, 50, 50) },
      { value: 4, targetValue: -4, speed: 0.03, size: 18, color: color(50, 200, 50) }
    ];
    
    // 컬러 개인화
    this.colors.background = color(250);
    this.colors.primary = color(30, 30, 30);
    this.colors.accent = color(50, 50, 200);
    this.colors.highlight = color(200, 50, 50);
    
    // 실행 중인 애니메이션
    this.animationTime = 0;
    this.animationSpeed = 0.01;
    
    // 줌/이동 속성
    this.panOffset = 0;
    this.zoomLevel = 1;
  }
  
  setup() {
    super.setup();
    // 초기화 추가 코드가 필요하면 여기에 추가
  }
  
  reset() {
    super.reset();
    // 패닝 및 줌 초기화
    this.panOffset = 0;
    this.zoomLevel = 1;
  }
  
  deactivate() {
    super.deactivate();
    // 추가적인 정리 작업이 필요하면 여기에 구현
  }
  
  update() {
    // 애니메이션 타임 업데이트
    this.animationTime += this.animationSpeed;
    if (this.animationTime > 1) {
      this.animationTime -= 1;
    }
    
    // 마커 업데이트
    for (let marker of this.markers) {
      // 현재 값과 목표 값 사이의 보간
      marker.value += (marker.targetValue - marker.value) * marker.speed;
      
      // 목표에 도달하면 대상 변경
      if (abs(marker.value - marker.targetValue) < 0.05) {
        marker.targetValue = -marker.targetValue; // 반대 방향으로 이동
      }
    }
  }
  
  draw() {
    // 배경 설정
    background(this.colors.background);
    
    // 중앙에 그리기
    push();
    translate(width / 2, height / 2);
    
    // 숫자선 그리기
    this.drawNumberLine();
    
    pop();
  }
  
  // 마우스 드래그 오버라이드
  mouseDragged() {
    if (this.isMouseDown) {
      // X축 드래그는 패닝
      const dx = mouseX - this.lastMouseX;
      this.panOffset += dx * 0.05;
      
      // Y축 드래그는 줌
      const dy = mouseY - this.lastMouseY;
      this.zoomLevel = constrain(this.zoomLevel - dy * 0.01, 0.5, 3);
      
      // 마지막 마우스 위치 업데이트
      this.lastMouseX = mouseX;
      this.lastMouseY = mouseY;
    }
  }
  
  // 숫자선 그리기
  drawNumberLine() {
    // 줌 적용
    const effectiveLineLength = this.lineLength * this.zoomLevel;
    
    // 단위 픽셀 길이 계산
    const unitLength = effectiveLineLength / (this.maxValue - this.minValue);
    
    // 강조 구간 그리기
    for (const range of this.highlightedRanges) {
      const startX = (range.start - this.minValue) * unitLength - effectiveLineLength / 2 + this.panOffset;
      const endX = (range.end - this.minValue) * unitLength - effectiveLineLength / 2 + this.panOffset;
      const rangeWidth = endX - startX;
      
      fill(range.color);
      noStroke();
      rectMode(CORNER);
      rect(startX, -this.tickHeight * 2, rangeWidth, this.tickHeight * 4);
    }
    
    // 메인 숫자선 그리기
    stroke(this.colors.primary);
    strokeWeight(this.lineWidth);
    line(-effectiveLineLength / 2 + this.panOffset, 0, effectiveLineLength / 2 + this.panOffset, 0);
    
    // 눈금 그리기
    const tickCount = Math.floor((this.maxValue - this.minValue) / this.tickSpacing) + 1;
    textAlign(CENTER, TOP);
    textSize(this.textSize);
    
    for (let i = 0; i < tickCount; i++) {
      const value = this.minValue + i * this.tickSpacing;
      const x = (value - this.minValue) * unitLength - effectiveLineLength / 2 + this.panOffset;
      
      // 큰 눈금과 작은 눈금 구분
      const isMajorTick = value % 5 === 0 || value === this.minValue || value === this.maxValue;
      const tickSize = isMajorTick ? this.tickHeight * 1.5 : this.tickHeight;
      
      // 눈금 그리기
      stroke(this.colors.primary);
      strokeWeight(isMajorTick ? 2 : 1);
      line(x, -tickSize / 2, x, tickSize / 2);
      
      // 숫자 레이블 (큰 눈금에만)
      if (isMajorTick) {
        noStroke();
        fill(this.colors.primary);
        text(value, x, tickSize / 2 + 5);
      }
    }
    
    // 강조된 숫자 그리기
    for (const num of this.highlightedNumbers) {
      if (num >= this.minValue && num <= this.maxValue) {
        const x = (num - this.minValue) * unitLength - effectiveLineLength / 2 + this.panOffset;
        
        // 강조된 눈금
        stroke(this.colors.highlight);
        strokeWeight(3);
        line(x, -this.tickHeight * 1.5, x, this.tickHeight * 1.5);
        
        // 숫자 위에 원
        fill(this.colors.highlight);
        noStroke();
        ellipse(x, 0, 12, 12);
        
        // 숫자 레이블 (눈금보다 조금 더 위에)
        fill(this.colors.highlight);
        textSize(this.textSize * 1.2);
        text(num, x, -this.tickHeight * 1.5 - 10);
      }
    }
    
    // 이동 마커 그리기
    for (const marker of this.markers) {
      if (marker.value >= this.minValue && marker.value <= this.maxValue) {
        const x = (marker.value - this.minValue) * unitLength - effectiveLineLength / 2 + this.panOffset;
        
        // 마커 그리기 (애니메이션 효과 포함)
        const pulseSize = marker.size * (1 + 0.2 * sin(this.animationTime * TWO_PI * 2));
        
        fill(marker.color);
        noStroke();
        ellipse(x, 0, pulseSize, pulseSize);
        
        // 값 표시
        textSize(this.textSize);
        fill(marker.color);
        text(nf(marker.value, 0, 1), x, pulseSize + 5);
      }
    }
    
    // 영점(0) 특별 표시
    if (this.minValue <= 0 && this.maxValue >= 0) {
      const zeroX = (0 - this.minValue) * unitLength - effectiveLineLength / 2 + this.panOffset;
      
      stroke(this.colors.accent);
      strokeWeight(2);
      line(zeroX, -this.tickHeight * 2, zeroX, this.tickHeight * 2);
      
      fill(this.colors.accent);
      noStroke();
      textSize(this.textSize * 1.3);
      text("0", zeroX, this.tickHeight * 2 + 10);
    }
  }
  
  // 새로운 강조 구간 설정
  setHighlightedRanges(ranges) {
    this.highlightedRanges = ranges;
  }
  
  // 강조할 숫자 설정
  setHighlightedNumbers(numbers) {
    this.highlightedNumbers = numbers;
  }
  
  // 마커 설정
  setMarkers(markers) {
    this.markers = markers;
  }
  
  // 범위 설정
  setRange(min, max) {
    this.minValue = min;
    this.maxValue = max;
  }
} 