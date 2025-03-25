class NumberTheory extends Visualization {
  constructor() {
    super();
    
    // 시각화 모드
    this.modes = [
      { name: "소수", draw: this.drawPrimes.bind(this) },
      { name: "유클리드 호제법", draw: this.drawGCD.bind(this) },
      { name: "모듈러 연산", draw: this.drawModular.bind(this) },
      { name: "디오판토스 방정식", draw: this.drawDiophantine.bind(this) }
    ];
    
    this.currentMode = 0;
    
    // 시각화 파라미터
    this.gridSize = 400;
    this.numberRange = 100;
    this.animationStep = 0;
    
    // GCD 계산용 파라미터
    this.gcdNumbers = { a: 252, b: 105 };
    this.gcdSteps = [];
    this.gcdAnimationStep = 0;
    
    // 모듈러 연산용 파라미터
    this.modulo = 12;
    this.modularValue = 5;
    
    // 디오판토스 방정식 파라미터
    this.dioA = 3;
    this.dioB = 5;
    this.dioC = 1;
    this.dioSolutions = [];
    this.dioRange = 10;
    
    // 컬러 개인화
    this.colors.background = color(250);
    this.colors.grid = color(230);
    this.colors.prime = color(255, 100, 100);
    this.colors.nonPrime = color(200, 200, 200);
    this.colors.highlight = color(100, 180, 100);
    this.colors.lines = color(80, 120, 200);
    this.colors.text = color(50, 50, 50);
  }
  
  setup() {
    super.setup();
    // GCD 계산 수행
    this.calculateGCDSteps();
    
    // 디오판토스 방정식 해 계산
    this.findDiophantineSolutions();
  }
  
  reset() {
    super.reset();
    // 애니메이션 상태 초기화
    this.animationStep = 0;
    this.gcdAnimationStep = 0;
    
    // GCD 계산 다시 수행
    this.calculateGCDSteps();
    
    // 디오판토스 방정식 해 다시 계산
    this.findDiophantineSolutions();
  }
  
  deactivate() {
    super.deactivate();
    // 추가적인 정리 작업이 필요하면 여기에 구현
  }
  
  update() {
    // 애니메이션 단계 업데이트
    this.animationStep += 0.5;
    if (this.animationStep >= 60) {
      this.animationStep = 0;
    }
    
    // GCD 애니메이션 단계
    if (frameCount % 60 === 0) {
      this.gcdAnimationStep = (this.gcdAnimationStep + 1) % (this.gcdSteps.length + 3);
    }
  }
  
  draw() {
    // 배경 설정
    background(this.colors.background);
    
    // 중앙에 그리기
    push();
    translate(width / 2, height / 2);
    
    // 현재 모드 이름 표시
    textAlign(CENTER, TOP);
    textSize(18);
    fill(this.colors.text);
    text(this.modes[this.currentMode].name, 0, -height/2 + 30);
    
    // 설명
    textAlign(CENTER, BOTTOM);
    textSize(14);
    fill(this.colors.text);
    text("'n' 키: 모드 변경, 화살표 키: 파라미터 조정", 0, height/2 - 20);
    
    // 선택된 모드 그리기
    this.modes[this.currentMode].draw();
    
    pop();
  }
  
  // 소수 그리기
  drawPrimes() {
    // 그리드 크기와 숫자 표시
    const cellSize = 35;
    const cols = Math.floor(this.gridSize / cellSize);
    const rows = Math.floor(this.gridSize / cellSize);
    
    // 정보 표시
    textAlign(LEFT, TOP);
    textSize(14);
    fill(this.colors.text);
    text(`1 ~ ${this.numberRange} 범위의 소수`, -this.gridSize + 20, -this.gridSize + 20);
    
    // 에라토스테네스의 체 단계 계산
    const sieveStep = Math.floor(this.animationStep / 10) + 2;
    
    // 소수 여부 표시
    let count = 0;
    const maxNum = min(this.numberRange, rows * cols);
    
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const num = i * cols + j + 1;
        if (num > maxNum) continue;
        
        const x = j * cellSize - this.gridSize/2 + cellSize/2;
        const y = i * cellSize - this.gridSize/2 + cellSize/2;
        
        // 숫자가 1인 경우 특별 처리
        if (num === 1) {
          fill(this.colors.nonPrime);
          strokeWeight(1);
          stroke(this.colors.text);
          rect(x - cellSize/2 + 5, y - cellSize/2 + 5, cellSize - 10, cellSize - 10, 5);
          
          fill(this.colors.text);
          noStroke();
          textAlign(CENTER, CENTER);
          textSize(16);
          text(num, x, y);
          continue;
        }
        
        // 애니메이션 단계에 따라 숫자가 소수인지 판별
        let isPrime = true;
        let isCurrentSieveStep = false;
        
        for (let k = 2; k <= Math.sqrt(num); k++) {
          if (num % k === 0) {
            isPrime = false;
            if (k === sieveStep) {
              isCurrentSieveStep = true;
            }
            break;
          }
        }
        
        // 시각화 위치 계산
        if (isPrime) {
          fill(this.colors.prime);
          count++;
        } else if (isCurrentSieveStep) {
          fill(this.colors.highlight);
        } else {
          fill(this.colors.nonPrime);
        }
        
        strokeWeight(1);
        stroke(this.colors.text);
        rect(x - cellSize/2 + 5, y - cellSize/2 + 5, cellSize - 10, cellSize - 10, 5);
        
        fill(this.colors.text);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(16);
        text(num, x, y);
      }
    }
    
    // 현재 소수 선별 단계
    textAlign(LEFT, TOP);
    textSize(14);
    fill(this.colors.text);
    text(`현재 나눗셈 검사: ${sieveStep}`, -this.gridSize + 20, -this.gridSize + 45);
    text(`발견된 소수 개수: ${count}`, -this.gridSize + 20, -this.gridSize + 70);
    
    // 소수 정리 설명
    textAlign(RIGHT, TOP);
    textSize(14);
    fill(this.colors.text);
    text(`소수 정리: n까지의 소수 개수 ≈ n/ln(n)`, this.gridSize - 20, -this.gridSize + 20);
    text(`예상 개수: ${Math.floor(this.numberRange / Math.log(this.numberRange))}`, this.gridSize - 20, -this.gridSize + 45);
  }
  
  // 유클리드 호제법 그리기
  drawGCD() {
    // 정보 표시
    textAlign(CENTER, TOP);
    textSize(16);
    fill(this.colors.text);
    text(`최대공약수(GCD) 계산: ${this.gcdNumbers.a} 와 ${this.gcdNumbers.b}`, 0, -this.gridSize + 50);
    
    // GCD 단계 표시
    const boxWidth = 300;
    const boxHeight = 40;
    const startY = -150;
    
    // GCD 알고리즘 단계
    for (let i = 0; i < this.gcdSteps.length; i++) {
      const step = this.gcdSteps[i];
      const y = startY + i * boxHeight;
      
      // 애니메이션 단계에 따라 강조 여부 결정
      if (i <= this.gcdAnimationStep - 1) {
        // 단계 박스 그리기
        fill(i === this.gcdSteps.length - 1 ? this.colors.highlight : 255);
        stroke(this.colors.text);
        strokeWeight(1);
        rect(-boxWidth/2, y, boxWidth, boxHeight);
        
        // 단계 텍스트 표시
        fill(this.colors.text);
        noStroke();
        textAlign(LEFT, CENTER);
        textSize(14);
        
        if (i === 0) {
          text(`초기값: a = ${step.a}, b = ${step.b}`, -boxWidth/2 + 20, y + boxHeight/2);
        } else {
          text(`${step.a} = ${step.b} × ${step.quotient} + ${step.remainder}`, -boxWidth/2 + 20, y + boxHeight/2);
        }
      }
    }
    
    // 최종 결과 표시
    if (this.gcdAnimationStep >= this.gcdSteps.length) {
      const y = startY + this.gcdSteps.length * boxHeight;
      
      fill(this.colors.highlight);
      stroke(this.colors.text);
      strokeWeight(1);
      rect(-boxWidth/2, y, boxWidth, boxHeight);
      
      fill(this.colors.text);
      noStroke();
      textAlign(LEFT, CENTER);
      textSize(16);
      const gcd = this.gcdSteps[this.gcdSteps.length - 1].b;
      text(`GCD(${this.gcdNumbers.a}, ${this.gcdNumbers.b}) = ${gcd}`, -boxWidth/2 + 20, y + boxHeight/2);
    }
    
    // 시각적 표현 (직사각형)
    if (this.gcdAnimationStep >= this.gcdSteps.length + 1) {
      const rectSize = 200;
      const x = -rectSize/2 - 50;
      const y = startY + (this.gcdSteps.length + 1) * boxHeight;
      
      fill(255);
      stroke(this.colors.text);
      strokeWeight(1);
      rect(x, y, rectSize, rectSize);
      
      // 초기 두 숫자를 사용한 그리드 표시
      const gcd = this.gcdSteps[this.gcdSteps.length - 1].b;
      const cellWidth = rectSize / (this.gcdNumbers.a / gcd);
      const cellHeight = rectSize / (this.gcdNumbers.b / gcd);
      
      // 그리드 선
      stroke(this.colors.grid);
      strokeWeight(0.5);
      
      // 세로선
      for (let i = 0; i <= this.gcdNumbers.a / gcd; i++) {
        line(x + i * cellWidth, y, x + i * cellWidth, y + rectSize);
      }
      
      // 가로선
      for (let i = 0; i <= this.gcdNumbers.b / gcd; i++) {
        line(x, y + i * cellHeight, x + rectSize, y + i * cellHeight);
      }
      
      // GCD 크기의 정사각형 강조
      fill(this.colors.highlight + '80'); // 알파값 추가
      noStroke();
      rect(x, y, cellWidth, cellHeight);
      
      // 설명 텍스트
      fill(this.colors.text);
      noStroke();
      textAlign(LEFT, TOP);
      textSize(14);
      text(`${this.gcdNumbers.a}×${this.gcdNumbers.b} 격자에서`, x + rectSize + 20, y);
      text(`GCD(${gcd}) 크기의 정사각형을`, x + rectSize + 20, y + 20);
      text(`${this.gcdNumbers.a/gcd}×${this.gcdNumbers.b/gcd}개 배치 가능`, x + rectSize + 20, y + 40);
    }
  }
  
  // 모듈러 연산 그리기
  drawModular() {
    // 시계 형태로 mod 표현
    const radius = 150;
    const centerX = 0;
    const centerY = 0;
    
    // 시계 배경
    fill(255);
    stroke(this.colors.text);
    strokeWeight(2);
    ellipse(centerX, centerY, radius * 2, radius * 2);
    
    // 시계 중심
    fill(this.colors.text);
    noStroke();
    ellipse(centerX, centerY, 6, 6);
    
    // 시계 숫자
    textAlign(CENTER, CENTER);
    textSize(16);
    fill(this.colors.text);
    
    for (let i = 0; i < this.modulo; i++) {
      const angle = map(i, 0, this.modulo, -PI/2, 3*PI/2);
      const x = centerX + radius * 0.85 * cos(angle);
      const y = centerY + radius * 0.85 * sin(angle);
      
      text(i, x, y);
    }
    
    // 현재 값 표시
    const currentAngle = map(this.animationStep % this.modulo, 0, this.modulo, -PI/2, 3*PI/2);
    const handLength = radius * 0.7;
    
    stroke(this.colors.lines);
    strokeWeight(3);
    line(centerX, centerY, 
         centerX + handLength * cos(currentAngle), 
         centerY + handLength * sin(currentAngle));
    
    // 모듈러 계산 결과
    for (let i = 0; i < 5; i++) {
      const value = this.modularValue + i * this.modulo;
      const angle = map(this.modularValue, 0, this.modulo, -PI/2, 3*PI/2);
      
      if (i === 0) {
        // 기본값 강조
        stroke(this.colors.highlight);
        strokeWeight(3);
        line(centerX, centerY, 
             centerX + handLength * cos(angle), 
             centerY + handLength * sin(angle));
      }
      
      // 같은 모듈러 값을 갖는 숫자들 표시
      const xPos = -this.gridSize + 150;
      const yPos = -this.gridSize + 100 + i * 30;
      
      textAlign(LEFT, CENTER);
      textSize(16);
      fill(i === 0 ? this.colors.highlight : this.colors.text);
      text(`${value} ≡ ${this.modularValue} (mod ${this.modulo})`, xPos, yPos);
    }
    
    // 모듈러 연산 설명
    textAlign(LEFT, TOP);
    textSize(16);
    fill(this.colors.text);
    text(`모듈러 연산 (mod ${this.modulo})`, -this.gridSize + 150, -this.gridSize + 50);
    text(`기준값: ${this.modularValue}`, -this.gridSize + 150, -this.gridSize + 75);
    
    // 모듈러 연산 예시
    const exampleX = 150;
    const exampleY = -100;
    textSize(16);
    fill(this.colors.text);
    text(`모듈러 연산 예시:`, exampleX, exampleY);
    
    // 덧셈
    text(`(${this.modularValue} + ${this.modulo - this.modularValue}) mod ${this.modulo} = ${(this.modularValue + (this.modulo - this.modularValue)) % this.modulo}`, 
         exampleX, exampleY + 30);
    
    // 뺄셈
    const subtraction = (this.modularValue - 1) % this.modulo;
    text(`(${this.modularValue} - 1) mod ${this.modulo} = ${subtraction < 0 ? subtraction + this.modulo : subtraction}`, 
         exampleX, exampleY + 60);
    
    // 곱셈
    text(`(${this.modularValue} × 2) mod ${this.modulo} = ${(this.modularValue * 2) % this.modulo}`, 
         exampleX, exampleY + 90);
    
    // 거듭제곱
    text(`(${this.modularValue}^2) mod ${this.modulo} = ${(this.modularValue * this.modularValue) % this.modulo}`, 
         exampleX, exampleY + 120);
  }
  
  // 디오판토스 방정식 그리기
  drawDiophantine() {
    // 방정식 표시
    textAlign(CENTER, TOP);
    textSize(20);
    fill(this.colors.text);
    text(`${this.dioA}x + ${this.dioB}y = ${this.dioC}`, 0, -this.gridSize + 50);
    
    // 계수 설명
    textAlign(LEFT, TOP);
    textSize(16);
    fill(this.colors.text);
    text(`방정식 계수:`, -this.gridSize + 50, -this.gridSize + 90);
    text(`a = ${this.dioA}, b = ${this.dioB}, c = ${this.dioC}`, -this.gridSize + 70, -this.gridSize + 115);
    
    // 해 존재 여부 검사
    const gcd = this.gcd(this.dioA, this.dioB);
    const hasSolution = this.dioC % gcd === 0;
    
    if (!hasSolution) {
      textAlign(CENTER, CENTER);
      textSize(18);
      fill(this.colors.prime);
      text(`해 없음: ${this.dioC}는 gcd(${this.dioA}, ${this.dioB}) = ${gcd}의 배수가 아님`, 0, 0);
      return;
    }
    
    // 그래프 그리기
    const graphSize = 350;
    const centerX = 0;
    const centerY = 50;
    
    // 그래프 배경
    fill(255);
    stroke(this.colors.text);
    strokeWeight(1);
    rect(centerX - graphSize/2, centerY - graphSize/2, graphSize, graphSize);
    
    // 축 그리기
    stroke(this.colors.text);
    strokeWeight(1);
    line(centerX - graphSize/2, centerY, centerX + graphSize/2, centerY); // x축
    line(centerX, centerY - graphSize/2, centerX, centerY + graphSize/2); // y축
    
    // 눈금 그리기
    const gridStep = graphSize / (this.dioRange * 2);
    
    // 격자 그리기
    stroke(this.colors.grid);
    strokeWeight(0.5);
    
    for (let i = -this.dioRange; i <= this.dioRange; i++) {
      // 수직선
      line(centerX + i * gridStep, centerY - graphSize/2, 
           centerX + i * gridStep, centerY + graphSize/2);
      
      // 수평선
      line(centerX - graphSize/2, centerY + i * gridStep, 
           centerX + graphSize/2, centerY + i * gridStep);
      
      // 눈금 레이블
      fill(this.colors.text);
      noStroke();
      textAlign(CENTER, TOP);
      textSize(10);
      text(i, centerX + i * gridStep, centerY + 5);
      
      textAlign(RIGHT, CENTER);
      text(i, centerX - 5, centerY - i * gridStep);
    }
    
    // 직선 그리기
    if (this.dioC !== 0) {
      stroke(this.colors.lines);
      strokeWeight(2);
      
      // 직선의 두 점 계산 (x = 0일 때와 y = 0일 때)
      const xZeroY = this.dioC / this.dioB;
      const yZeroX = this.dioC / this.dioA;
      
      // 직선 좌표 변환
      const x1 = centerX;
      const y1 = centerY - xZeroY * gridStep;
      const x2 = centerX + yZeroX * gridStep;
      const y2 = centerY;
      
      line(x1, y1, x2, y2);
    }
    
    // 해 그리기
    noStroke();
    for (const sol of this.dioSolutions) {
      if (sol.x >= -this.dioRange && sol.x <= this.dioRange && 
          sol.y >= -this.dioRange && sol.y <= this.dioRange) {
        
        // 해 위치 좌표 변환
        const x = centerX + sol.x * gridStep;
        const y = centerY - sol.y * gridStep;
        
        fill(this.colors.highlight);
        ellipse(x, y, 8, 8);
      }
    }
    
    // 기본해 설명
    textAlign(LEFT, BOTTOM);
    textSize(14);
    fill(this.colors.text);
    
    if (this.dioSolutions.length > 0) {
      const baseSol = this.dioSolutions[0];
      
      text(`기본해: x₀ = ${baseSol.x}, y₀ = ${baseSol.y}`, -graphSize/2, centerY + graphSize/2 + 20);
      text(`일반해: x = x₀ + ${this.dioB/gcd}t, y = y₀ - ${this.dioA/gcd}t (t는 정수)`, -graphSize/2, centerY + graphSize/2 + 40);
    }
  }
  
  // 유클리드 호제법으로 GCD 단계 계산
  calculateGCDSteps() {
    this.gcdSteps = [];
    let a = this.gcdNumbers.a;
    let b = this.gcdNumbers.b;
    
    // 항상 a > b가 되도록 함
    if (a < b) {
      [a, b] = [b, a];
      this.gcdNumbers = { a, b };
    }
    
    // 초기 단계 추가
    this.gcdSteps.push({ a, b });
    
    // 유클리드 알고리즘 실행
    while (b !== 0) {
      const quotient = Math.floor(a / b);
      const remainder = a % b;
      
      this.gcdSteps.push({
        a,
        b,
        quotient,
        remainder
      });
      
      a = b;
      b = remainder;
    }
  }
  
  // GCD 계산 함수
  gcd(a, b) {
    if (b === 0) return a;
    return this.gcd(b, a % b);
  }
  
  // 확장 유클리드 알고리즘
  extendedGCD(a, b) {
    if (b === 0) {
      return { gcd: a, x: 1, y: 0 };
    }
    
    const result = this.extendedGCD(b, a % b);
    return {
      gcd: result.gcd,
      x: result.y,
      y: result.x - Math.floor(a / b) * result.y
    };
  }
  
  // 디오판토스 방정식 해 찾기
  findDiophantineSolutions() {
    this.dioSolutions = [];
    
    const a = this.dioA;
    const b = this.dioB;
    const c = this.dioC;
    
    // 최대공약수 계산
    const gcdResult = this.extendedGCD(Math.abs(a), Math.abs(b));
    const gcd = gcdResult.gcd;
    
    // 해가 존재하지 않는 경우
    if (c % gcd !== 0) {
      return;
    }
    
    // 기본해 계산
    let x0 = gcdResult.x * (c / gcd);
    let y0 = gcdResult.y * (c / gcd);
    
    // a나 b가 음수인 경우 부호 조정
    if (a < 0) x0 = -x0;
    if (b < 0) y0 = -y0;
    
    // 해 범위 내의 모든 해 저장
    const step_x = b / gcd;
    const step_y = a / gcd;
    
    for (let t = -20; t <= 20; t++) {
      const x = x0 + t * step_x;
      const y = y0 - t * step_y;
      this.dioSolutions.push({ x, y });
    }
  }
  
  // 키 이벤트 처리
  keyPressed() {
    // 모드 변경
    if (key === 'n' || key === 'N') {
      this.currentMode = (this.currentMode + 1) % this.modes.length;
    }
    
    // 파라미터 조정
    switch (this.currentMode) {
      case 0: // 소수
        if (keyCode === UP_ARROW) {
          this.numberRange = min(200, this.numberRange + 10);
        } else if (keyCode === DOWN_ARROW) {
          this.numberRange = max(10, this.numberRange - 10);
        }
        break;
        
      case 1: // 유클리드 호제법
        if (keyCode === LEFT_ARROW) {
          this.gcdNumbers.a = max(1, this.gcdNumbers.a - 21);
          this.calculateGCDSteps();
          this.gcdAnimationStep = 0;
        } else if (keyCode === RIGHT_ARROW) {
          this.gcdNumbers.a = min(999, this.gcdNumbers.a + 21);
          this.calculateGCDSteps();
          this.gcdAnimationStep = 0;
        } else if (keyCode === UP_ARROW) {
          this.gcdNumbers.b = min(999, this.gcdNumbers.b + 21);
          this.calculateGCDSteps();
          this.gcdAnimationStep = 0;
        } else if (keyCode === DOWN_ARROW) {
          this.gcdNumbers.b = max(1, this.gcdNumbers.b - 21);
          this.calculateGCDSteps();
          this.gcdAnimationStep = 0;
        }
        break;
        
      case 2: // 모듈러 연산
        if (keyCode === LEFT_ARROW) {
          this.modularValue = (this.modularValue - 1 + this.modulo) % this.modulo;
        } else if (keyCode === RIGHT_ARROW) {
          this.modularValue = (this.modularValue + 1) % this.modulo;
        } else if (keyCode === UP_ARROW) {
          this.modulo = min(24, this.modulo + 1);
          this.modularValue = min(this.modularValue, this.modulo - 1);
        } else if (keyCode === DOWN_ARROW) {
          this.modulo = max(2, this.modulo - 1);
          this.modularValue = min(this.modularValue, this.modulo - 1);
        }
        break;
        
      case 3: // 디오판토스 방정식
        if (keyCode === LEFT_ARROW) {
          this.dioA = max(-10, this.dioA - 1);
          this.findDiophantineSolutions();
        } else if (keyCode === RIGHT_ARROW) {
          this.dioA = min(10, this.dioA + 1);
          this.findDiophantineSolutions();
        } else if (keyCode === UP_ARROW) {
          this.dioB = min(10, this.dioB + 1);
          this.findDiophantineSolutions();
        } else if (keyCode === DOWN_ARROW) {
          this.dioB = max(-10, this.dioB - 1);
          this.findDiophantineSolutions();
        } else if (key === '+') {
          this.dioC = min(20, this.dioC + 1);
          this.findDiophantineSolutions();
        } else if (key === '-') {
          this.dioC = max(-20, this.dioC - 1);
          this.findDiophantineSolutions();
        }
        break;
    }
  }
} 