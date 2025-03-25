class VectorField extends Visualization {
  constructor() {
    super();
    
    // 벡터장 속성
    this.gridSize = 7;           // 격자 크기
    this.spacing = 60;           // 벡터 간 간격
    this.maxVectorLength = 25;   // 최대 벡터 길이
    this.arrowSize = 5;          // 화살표 크기
    
    // 벡터장 타입 목록
    this.fieldTypes = [
      {
        name: "회전장 (Rotational Field)",
        fn: (x, y) => {
          return {
            vx: -y,
            vy: x
          };
        },
        color: color(200, 0, 100)
      },
      {
        name: "중심장 (Radial Field)",
        fn: (x, y) => {
          const r = sqrt(x*x + y*y);
          if (r === 0) return {vx: 0, vy: 0};
          return {
            vx: x / r,
            vy: y / r
          };
        },
        color: color(0, 150, 150)
      },
      {
        name: "사인 파동 (Sine Wave)",
        fn: (x, y) => {
          return {
            vx: sin(y * 0.2),
            vy: sin(x * 0.2)
          };
        },
        color: color(150, 100, 0)
      },
      {
        name: "안장점 (Saddle Point)",
        fn: (x, y) => {
          return {
            vx: x,
            vy: -y
          };
        },
        color: color(100, 0, 200)
      }
    ];
    
    // 현재 선택된 벡터장 인덱스
    this.currentFieldIndex = 0;
    
    // 애니메이션 파티클 배열
    this.particles = [];
    this.particleCount = 20;
    this.particleSpeed = 0.5;
    
    // 컬러 개인화
    this.colors.background = color(240);
    this.colors.grid = color(220);
    this.colors.axes = color(50);
  }
  
  setup() {
    super.setup();
    this.resetParticles();
  }
  
  reset() {
    super.reset();
    this.currentFieldIndex = 0;
    this.resetParticles();
  }
  
  deactivate() {
    super.deactivate();
    // 추가적인 정리 작업이 필요하면 여기에 구현
  }
  
  // 파티클 재설정
  resetParticles() {
    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: random(-this.gridSize * this.spacing / 2, this.gridSize * this.spacing / 2),
        y: random(-this.gridSize * this.spacing / 2, this.gridSize * this.spacing / 2),
        age: random(0, 100)
      });
    }
  }
  
  update() {
    // 파티클 업데이트
    for (let p of this.particles) {
      const field = this.fieldTypes[this.currentFieldIndex];
      
      // 현재 위치의 벡터 계산
      const nx = p.x / this.spacing;
      const ny = p.y / this.spacing;
      const vector = field.fn(nx, ny);
      
      // 파티클 이동
      p.x += vector.vx * this.particleSpeed;
      p.y += vector.vy * this.particleSpeed;
      p.age += 0.5;
      
      // 화면 경계를 벗어나면 재배치
      const bound = this.gridSize * this.spacing / 2 + 20;
      if (p.x < -bound || p.x > bound || p.y < -bound || p.y > bound || p.age > 100) {
        p.x = random(-bound/2, bound/2);
        p.y = random(-bound/2, bound/2);
        p.age = 0;
      }
    }
  }
  
  draw() {
    // 배경 설정
    background(this.colors.background);
    
    // 중앙에 그리기
    push();
    translate(width / 2, height / 2);
    
    // 격자 그리기
    this.drawGrid();
    
    // 현재 벡터장 이름 표시
    textAlign(CENTER, TOP);
    textSize(16);
    fill(this.fieldTypes[this.currentFieldIndex].color);
    text(this.fieldTypes[this.currentFieldIndex].name, 0, -height/2 + 30);
    
    // 벡터장 그리기
    this.drawVectorField();
    
    // 파티클 그리기
    this.drawParticles();
    
    pop();
  }
  
  // 격자 그리기
  drawGrid() {
    stroke(this.colors.grid);
    strokeWeight(1);
    
    // 수직선
    for (let i = -this.gridSize; i <= this.gridSize; i++) {
      const x = i * this.spacing;
      line(x, -this.gridSize * this.spacing, x, this.gridSize * this.spacing);
    }
    
    // 수평선
    for (let i = -this.gridSize; i <= this.gridSize; i++) {
      const y = i * this.spacing;
      line(-this.gridSize * this.spacing, y, this.gridSize * this.spacing, y);
    }
    
    // 좌표축 강조
    stroke(this.colors.axes);
    strokeWeight(2);
    line(-this.gridSize * this.spacing, 0, this.gridSize * this.spacing, 0);
    line(0, -this.gridSize * this.spacing, 0, this.gridSize * this.spacing);
  }
  
  // 벡터장 그리기
  drawVectorField() {
    const field = this.fieldTypes[this.currentFieldIndex];
    
    for (let i = -this.gridSize; i <= this.gridSize; i++) {
      for (let j = -this.gridSize; j <= this.gridSize; j++) {
        const x = i * this.spacing;
        const y = j * this.spacing;
        
        // 벡터 계산
        const vector = field.fn(i, j);
        
        // 벡터 크기 정규화
        const magnitude = sqrt(vector.vx * vector.vx + vector.vy * vector.vy);
        let dx, dy;
        
        if (magnitude === 0) {
          dx = 0;
          dy = 0;
        } else {
          dx = vector.vx / magnitude * this.maxVectorLength;
          dy = vector.vy / magnitude * this.maxVectorLength;
        }
        
        // 벡터 그리기
        stroke(field.color);
        strokeWeight(2);
        this.drawArrow(x, y, x + dx, y + dy);
      }
    }
  }
  
  // 파티클 그리기
  drawParticles() {
    const field = this.fieldTypes[this.currentFieldIndex];
    
    for (let p of this.particles) {
      // 투명도를 나이에 따라 조정
      const alpha = map(sin(p.age * 0.1), -1, 1, 100, 200);
      
      // 크기를 나이에 따라 조정
      const size = map(sin(p.age * 0.1), -1, 1, 3, 6);
      
      // 파티클 그리기
      fill(field.color.levels[0], field.color.levels[1], field.color.levels[2], alpha);
      noStroke();
      ellipse(p.x, p.y, size, size);
    }
  }
  
  // 화살표 그리기
  drawArrow(x1, y1, x2, y2) {
    // 선 그리기
    line(x1, y1, x2, y2);
    
    // 화살표 머리 그리기
    push();
    translate(x2, y2);
    const angle = atan2(y2 - y1, x2 - x1);
    rotate(angle);
    
    // 화살표 머리
    beginShape();
    vertex(0, 0);
    vertex(-this.arrowSize, -this.arrowSize/2);
    vertex(-this.arrowSize, this.arrowSize/2);
    endShape(CLOSE);
    pop();
  }
  
  // 키 입력 처리
  keyPressed() {
    if (key === 'v' || key === 'V') {
      this.nextField();
    }
  }
  
  // 다음 벡터장으로 전환
  nextField() {
    this.currentFieldIndex = (this.currentFieldIndex + 1) % this.fieldTypes.length;
    this.resetParticles();
  }
} 