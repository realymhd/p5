class RegularPolygons extends Visualization {
  constructor() {
    super();
    
    // 정다각형 속성
    this.maxSides = 8;     // 최대 다각형 변의 수
    this.minSides = 3;     // 최소 다각형 변의 수
    this.baseRadius = 150; // 기본 반지름 (조정될 값)
    this.baseSpacing = 30; // 기본 다각형 간의 간격
    this.radius = this.baseRadius; // 실제 적용될 반지름
    this.spacing = this.baseSpacing; // 실제 적용될 간격
    
    // 애니메이션 속성
    this.rotation = 0;
    this.rotationSpeed = 0.005;
    this.pulseAmount = 0;
    this.pulseSpeed = 0.05;
    
    // 정다각형 구성
    this.polygons = [];
    
    // 컬러 개인화
    this.colors.background = color(245);
    this.colors.primary = color(30, 100, 200, 150);
    this.colors.accent = color(200, 100, 30);
    this.colors.highlight = color(0, 150, 100);
  }
  
  setup() {
    super.setup();
    // 스케일에 따라 반지름 및 간격 조정
    this.radius = this.baseRadius * this.scale;
    this.spacing = this.baseSpacing * this.scale;
    // 여러 크기의 정다각형 생성
    this.generatePolygons();
  }
  
  reset() {
    super.reset();
    // 애니메이션 속성 초기화
    this.rotation = 0;
    this.pulseAmount = 0;
    
    // 스케일에 따라 크기 조정
    this.radius = this.baseRadius * this.scale;
    this.spacing = this.baseSpacing * this.scale;
    // 정다각형 재생성
    this.generatePolygons();
  }
  
  deactivate() {
    super.deactivate();
    // 추가적인 정리 작업이 필요하면 여기에 구현
  }
  
  update() {
    super.update();
    
    // 스케일에 따라 크기 업데이트
    const newRadius = this.baseRadius * this.scale;
    const newSpacing = this.baseSpacing * this.scale;
    
    // 크기가 변경되었다면 정다각형 재생성
    if (abs(this.radius - newRadius) > 0.1 || abs(this.spacing - newSpacing) > 0.1) {
      this.radius = newRadius;
      this.spacing = newSpacing;
      this.generatePolygons();
    }
    
    // 자동 회전 - 마우스 드래그가 없을 때만
    if (!this.isMouseDown) {
      this.rotation += this.rotationSpeed;
      if (this.rotation > TWO_PI) {
        this.rotation -= TWO_PI;
      }
    }
    
    // 맥동(펄스) 효과 업데이트
    this.pulseAmount = 0.1 * sin(frameCount * this.pulseSpeed);
  }
  
  draw() {
    // 배경 설정
    background(this.colors.background);
    
    // 중앙에 그리기
    push();
    translate(width / 2, height / 2);
    
    // 다각형 그리기 (큰 것부터 작은 것까지)
    for (let i = 0; i < this.polygons.length; i++) {
      this.drawPolygon(this.polygons[i]);
    }
    
    // 중앙 원 - 모든 다각형의 교집합을 표현
    fill(this.colors.highlight);
    noStroke();
    const centerRadius = 20 * (1 + this.pulseAmount);
    ellipse(0, 0, centerRadius * 2);
    
    pop();
  }
  
  // 정다각형 생성
  generatePolygons() {
    this.polygons = [];
    
    // 각 정다각형의 변의 수에 대해 (삼각형부터 octagon까지)
    for (let sides = this.minSides; sides <= this.maxSides; sides++) {
      // 다각형에 따라 다른 반지름 설정 (내부에 더 작은 다각형)
      const radius = this.radius - (sides - this.minSides) * this.spacing;
      
      const vertices = [];
      // 각 꼭지점에 대해
      for (let i = 0; i < sides; i++) {
        const angle = TWO_PI * i / sides;
        const x = radius * cos(angle);
        const y = radius * sin(angle);
        vertices.push({x, y});
      }
      
      // 다각형 데이터
      this.polygons.push({
        sides: sides,
        radius: radius,
        vertices: vertices,
        color: color(
          this.colors.primary.levels[0],
          this.colors.primary.levels[1],
          this.colors.primary.levels[2],
          map(sides, this.minSides, this.maxSides, 100, 220)
        ),
        strokeColor: color(
          this.colors.accent.levels[0],
          this.colors.accent.levels[1],
          this.colors.accent.levels[2], 
          map(sides, this.minSides, this.maxSides, 150, 250)
        ),
        rotationOffset: (sides - this.minSides) * PI / (2 * this.maxSides)
      });
    }
  }
  
  // 정다각형 그리기
  drawPolygon(polygon) {
    // 개별 회전 + 전체 회전 + 다각형별 오프셋 + 마우스 회전
    const totalRotation = this.rotation * (1 + (polygon.sides - this.minSides) * 0.1) + 
                          polygon.rotationOffset + this.mouseRotationY;
    
    // 맥동 효과를 반영한 반지름
    const pulsedRadius = polygon.radius * (1 + this.pulseAmount * 
                         (polygon.sides - this.minSides + 1) / (this.maxSides - this.minSides + 1) * 0.1);
    
    // 회전된 꼭지점 계산
    const rotatedVertices = polygon.vertices.map(v => {
      const angle = atan2(v.y, v.x) + totalRotation;
      const dist = pulsedRadius; // 원래 거리 대신 맥동 반지름 사용
      return {
        x: dist * cos(angle),
        y: dist * sin(angle)
      };
    });
    
    // 내부 채우기
    fill(polygon.color);
    stroke(polygon.strokeColor);
    strokeWeight(2);
    
    // 정다각형 그리기
    beginShape();
    for (const vertex of rotatedVertices) {
      vertex(vertex.x, vertex.y);
    }
    endShape(CLOSE);
    
    // 정다각형 변의 수 표시
    noStroke();
    fill(0, 180);
    const textSize = map(polygon.sides, this.minSides, this.maxSides, 16, 12);
    textAlign(CENTER, CENTER);
    textSize(textSize);
    
    // 다각형 중심에 변의 수 표시
    text(polygon.sides, 0, 0);
    
    // 꼭지점 표시
    for (const vertex of rotatedVertices) {
      // 작은 점으로 꼭지점 표시
      fill(this.colors.accent);
      noStroke();
      ellipse(vertex.x, vertex.y, 6);
    }
  }
} 