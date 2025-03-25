class ComplexPlane extends Visualization {
  constructor() {
    super();
    
    // 복소평면 속성
    this.gridSize = 10;
    this.baseUnitSize = 50; // 기본 단위 크기
    this.unitSize = this.baseUnitSize; // 실제 적용될 단위 크기
    
    // 복소수 목록
    this.numbers = [
      { re: 3, im: 2, color: color(220, 50, 50), label: "3+2i" },
      { re: -1, im: 2, color: color(50, 150, 50), label: "-1+2i" },
      { re: 2, im: -3, color: color(50, 50, 220), label: "2-3i" },
      { re: -2, im: -2, color: color(200, 50, 200), label: "-2-2i" }
    ];
    
    // 선택된 연산
    this.operations = [
      { name: "Identity", fn: (z) => z },
      { name: "Add 1+i", fn: (z) => ({ re: z.re + 1, im: z.im + 1 }) },
      { name: "Multiply by i", fn: (z) => ({ re: -z.im, im: z.re }) },
      { name: "Multiply by 2", fn: (z) => ({ re: z.re * 2, im: z.im * 2 }) },
      { name: "Square", fn: (z) => ({ re: z.re * z.re - z.im * z.im, im: 2 * z.re * z.im }) },
      { name: "Conjugate", fn: (z) => ({ re: z.re, im: -z.im }) }
    ];
    
    this.currentOperationIndex = 0;
    
    // 애니메이션 속성
    this.animationProgress = 0;
    this.animationSpeed = 0.02;
    this.isAnimating = false;
    this.originalNumbers = JSON.parse(JSON.stringify(this.numbers));
    this.targetNumbers = JSON.parse(JSON.stringify(this.numbers));
    
    // 사용자 인터랙션
    this.selectedNumberIndex = -1;
    this.isDragging = false;
    
    // 컬러 개인화
    this.colors.background = color(250);
    this.colors.grid = color(220);
    this.colors.axes = color(80, 80, 80);
    this.colors.text = color(50, 50, 50);
  }
  
  updateScale() {
    super.updateScale();
    
    // 캔버스의 더 짧은 쪽 기준으로 스케일 조정
    const dim = min(width, height);
    
    // gridSize가 10이면, 실제로 -10 ~ +10까지 20칸
    // 전체를 dim 픽셀 안에 넣으려면 한 칸 = dim/20
    // 여백을 위해 90%만 사용
    this.unitSize = (dim * 0.9) / (2 * this.gridSize);
  }
  
  setup() {
    super.setup();
    // 초기 복소수 복원
    this.originalNumbers = JSON.parse(JSON.stringify(this.numbers));
    this.targetNumbers = JSON.parse(JSON.stringify(this.numbers));
    
    // 초기 스케일 설정
    this.updateScale();
  }
  
  update() {
    // 애니메이션 진행
    if (this.isAnimating) {
      this.animationProgress += this.animationSpeed;
      
      if (this.animationProgress >= 1) {
        this.animationProgress = 1;
        this.isAnimating = false;
        
        // 애니메이션 완료 시 현재 상태를 원본으로 설정
        this.numbers = JSON.parse(JSON.stringify(this.targetNumbers));
        this.originalNumbers = JSON.parse(JSON.stringify(this.numbers));
      }
      
      // 보간된 값 계산
      for (let i = 0; i < this.numbers.length; i++) {
        this.numbers[i].re = lerp(this.originalNumbers[i].re, this.targetNumbers[i].re, this.animationProgress);
        this.numbers[i].im = lerp(this.originalNumbers[i].im, this.targetNumbers[i].im, this.animationProgress);
      }
    }
  }
  
  draw() {
    // 배경 설정
    background(this.colors.background);
    
    // 중앙에 그리기
    push();
    translate(width / 2, height / 2);
    
    // 현재 연산 표시
    textAlign(CENTER, TOP);
    textSize(18);
    fill(this.colors.text);
    text(this.operations[this.currentOperationIndex].name, 0, -height/2 + 30);
    
    // 설명 텍스트
    textAlign(CENTER, BOTTOM);
    textSize(14);
    fill(this.colors.text);
    text("키 'c': 연산 변경, 'a': 연산 적용, 클릭 또는 드래그: 복소수 이동", 0, height/2 - 20);
    
    // 격자 그리기
    this.drawGrid();
    
    // 복소수 그리기
    this.drawComplexNumbers();
    
    pop();
  }
  
  // 격자 그리기
  drawGrid() {
    // 격자선
    stroke(this.colors.grid);
    strokeWeight(1);
    
    // 가로선
    for (let y = -this.gridSize; y <= this.gridSize; y++) {
      line(-this.gridSize * this.unitSize, y * this.unitSize, 
           this.gridSize * this.unitSize, y * this.unitSize);
    }
    
    // 세로선
    for (let x = -this.gridSize; x <= this.gridSize; x++) {
      line(x * this.unitSize, -this.gridSize * this.unitSize, 
           x * this.unitSize, this.gridSize * this.unitSize);
    }
    
    // 축
    stroke(this.colors.axes);
    strokeWeight(2);
    
    // 실수축 (x축)
    line(-this.gridSize * this.unitSize, 0, this.gridSize * this.unitSize, 0);
    
    // 허수축 (y축)
    line(0, -this.gridSize * this.unitSize, 0, this.gridSize * this.unitSize);
    
    // 축 레이블
    textAlign(CENTER, CENTER);
    textSize(16);
    fill(this.colors.axes);
    
    // 실수축 레이블
    text("Re(z)", this.gridSize * this.unitSize - 20, -20);
    
    // 허수축 레이블
    text("Im(z)", 20, -this.gridSize * this.unitSize + 20);
    
    // 눈금 표시
    textSize(12);
    for (let i = -this.gridSize; i <= this.gridSize; i++) {
      if (i !== 0) {
        // 실수축 눈금
        fill(this.colors.axes);
        text(i, i * this.unitSize, 20);
        
        // 허수축 눈금
        if (i !== 0) {
          text(i + "i", 20, i * this.unitSize);
        }
      }
    }
    
    // 원점 레이블
    text("0", 20, 20);
  }
  
  // 복소수 그리기
  drawComplexNumbers() {
    for (let i = 0; i < this.numbers.length; i++) {
      const z = this.numbers[i];
      const x = z.re * this.unitSize;
      const y = z.im * this.unitSize;
      
      // 원점에서 복소수까지 벡터 그리기
      stroke(z.color);
      strokeWeight(2);
      line(0, 0, x, y);
      
      // 복소수 점 그리기
      fill(z.color);
      noStroke();
      ellipse(x, y, 12, 12);
      
      // 선택된 복소수 강조
      if (i === this.selectedNumberIndex) {
        noFill();
        stroke(z.color);
        strokeWeight(2);
        ellipse(x, y, 20, 20);
      }
      
      // 레이블 표시
      fill(z.color);
      textAlign(CENTER, BOTTOM);
      textSize(14);
      
      // 복소수 좌표 및 극형식 계산
      const magnitude = sqrt(z.re * z.re + z.im * z.im);
      let angle = atan2(z.im, z.re);
      if (angle < 0) angle += TWO_PI;
      
      // 직교 좌표 표시
      text(z.label, x, y - 15);
      
      // 극좌표 표시
      textSize(12);
      text(`|z| = ${magnitude.toFixed(2)}, arg(z) = ${this.formatAngle(angle)}`, x, y - 30);
    }
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
  
  // 연산 적용
  applyOperation() {
    if (this.isAnimating) return;
    
    // 애니메이션 초기화
    this.isAnimating = true;
    this.animationProgress = 0;
    this.originalNumbers = JSON.parse(JSON.stringify(this.numbers));
    
    // 연산 적용하여 목표 값 계산
    const operation = this.operations[this.currentOperationIndex].fn;
    
    this.targetNumbers = this.originalNumbers.map(z => {
      const result = operation({re: z.re, im: z.im});
      
      // 라벨 업데이트
      let label = "";
      if (result.re !== 0) {
        label += result.re;
      }
      if (result.im > 0) {
        if (label !== "") label += "+";
        if (result.im === 1) label += "i";
        else label += result.im + "i";
      } else if (result.im < 0) {
        if (result.im === -1) label += "-i";
        else label += result.im + "i";
      }
      
      if (label === "") label = "0";
      
      return {
        re: result.re,
        im: result.im,
        color: z.color,
        label: label
      };
    });
  }
  
  // 다음 연산으로 전환
  nextOperation() {
    this.currentOperationIndex = (this.currentOperationIndex + 1) % this.operations.length;
  }
  
  // 마우스 이벤트
  mousePressed() {
    // 복소수 선택
    const dx = mouseX - width / 2;
    const dy = mouseY - height / 2;
    
    // 선택된 복소수 찾기
    let minDist = Infinity;
    let selectedIndex = -1;
    
    for (let i = 0; i < this.numbers.length; i++) {
      const z = this.numbers[i];
      const zx = z.re * this.unitSize;
      const zy = z.im * this.unitSize;
      
      const dist = sqrt((dx - zx) * (dx - zx) + (dy - zy) * (dy - zy));
      
      if (dist < 20 && dist < minDist) {
        minDist = dist;
        selectedIndex = i;
      }
    }
    
    this.selectedNumberIndex = selectedIndex;
    
    if (selectedIndex !== -1) {
      this.isDragging = true;
      super.mousePressed(); // 기본 마우스 이벤트 처리
    }
  }
  
  mouseDragged() {
    super.mouseDragged(); // 기본 마우스 드래그 이벤트 처리
    
    if (this.isDragging && this.selectedNumberIndex !== -1) {
      // 마우스 위치를 복소수 좌표로 변환
      const dx = mouseX - width / 2;
      const dy = mouseY - height / 2;
      
      // 단위 크기에 맞춰 변환
      this.numbers[this.selectedNumberIndex].re = dx / this.unitSize;
      this.numbers[this.selectedNumberIndex].im = dy / this.unitSize;
      
      // 레이블 업데이트
      const z = this.numbers[this.selectedNumberIndex];
      
      let label = "";
      if (z.re !== 0) {
        label += z.re.toFixed(1);
      }
      if (z.im > 0) {
        if (label !== "") label += "+";
        if (z.im === 1) label += "i";
        else label += z.im.toFixed(1) + "i";
      } else if (z.im < 0) {
        if (z.im === -1) label += "-i";
        else label += z.im.toFixed(1) + "i";
      }
      
      if (label === "") label = "0";
      
      this.numbers[this.selectedNumberIndex].label = label;
    }
  }
  
  mouseReleased() {
    super.mouseReleased(); // 기본 마우스 릴리즈 이벤트 처리
    this.isDragging = false;
  }
  
  // 키 이벤트
  keyPressed() {
    if (key === 'c' || key === 'C') {
      // 연산 변경
      this.nextOperation();
    } else if (key === 'a' || key === 'A') {
      // 연산 적용
      this.applyOperation();
    }
  }
  
  reset() {
    super.reset();
    // 애니메이션 및 상태 초기화
    this.animationProgress = 0;
    this.isAnimating = false;
    this.currentOperationIndex = 0;
    this.selectedNumberIndex = -1;
    this.isDragging = false;
    
    // 복소수 초기화
    this.numbers = JSON.parse(JSON.stringify(this.originalNumbers));
    this.targetNumbers = JSON.parse(JSON.stringify(this.numbers));
    
    // 스케일 재설정
    this.updateScale();
  }
  
  deactivate() {
    super.deactivate();
    // 애니메이션 중지
    this.isAnimating = false;
    this.isDragging = false;
  }
} 