class RotatingSphere extends Visualization {
  constructor() {
    super();
    
    // 회전 변수
    this.rotation = 0;
    this.rotationSpeed = 0.01;
    
    // 원 속성
    this.baseRadius = 150;  // 기본 반지름
    this.radius = this.baseRadius;  // 실제 적용될 반지름
    this.centerX = 0;
    this.centerY = 0;
    
    // 3D 효과 변수
    this.numRings = 12;
    this.numPointsPerRing = 24;
    this.points = [];
    
    // 컬러 개인화
    this.colors.background = color(240);
    this.colors.primary = color(30, 30, 30);
    this.colors.accent = color(0, 120, 200);
  }
  
  setup() {
    super.setup();
    // 스케일에 따라 반지름 조정
    this.radius = this.baseRadius * this.scale;
    // 3D 점 생성
    this.generateSpherePoints();
  }
  
  reset() {
    super.reset();
    // 회전 초기화
    this.rotation = 0;
    // 스케일에 따라 반지름 조정
    this.radius = this.baseRadius * this.scale;
    // 구 점 재생성
    this.generateSpherePoints();
  }
  
  deactivate() {
    super.deactivate();
    // 추가적인 정리 작업이 필요하면 여기에 구현
  }
  
  // 구형 점들을 생성
  generateSpherePoints() {
    this.points = [];
    
    for (let i = 0; i < this.numRings; i++) {
      const ringPoints = [];
      const phi = PI * i / (this.numRings - 1);
      
      for (let j = 0; j < this.numPointsPerRing; j++) {
        const theta = TWO_PI * j / this.numPointsPerRing;
        
        // 구면 좌표계를 3D 데카르트 좌표로 변환
        const x = this.radius * sin(phi) * cos(theta);
        const y = this.radius * sin(phi) * sin(theta);
        const z = this.radius * cos(phi);
        
        ringPoints.push({x, y, z});
      }
      
      this.points.push(ringPoints);
    }
  }
  
  update() {
    // 스케일에 따라 반지름 업데이트
    this.radius = this.baseRadius * this.scale;
    
    // 자동 회전 - 마우스 드래그가 없을 때만
    if (!this.isMouseDown) {
      this.rotation += this.rotationSpeed;
      if (this.rotation > TWO_PI) {
        this.rotation -= TWO_PI;
      }
    }
    
    // 크기가 변경되었다면 점 재생성
    if (abs(this.radius - this.baseRadius * this.scale) > 0.1) {
      this.generateSpherePoints();
    }
  }
  
  draw() {
    // 배경 설정
    background(this.colors.background);
    
    // 캔버스 중앙에 그리기
    push();
    translate(width / 2, height / 2);
    
    // 구 그리기 - 마우스 회전 적용
    this.drawSphere();
    
    pop();
  }
  
  // 구 그리기
  drawSphere() {
    // 회전 행렬 계산 - 마우스 회전 적용
    const rotMatrix = this.getRotationMatrix(this.rotation, this.mouseRotationX, this.mouseRotationY);
    
    // 링 그리기
    for (const ring of this.points) {
      beginShape();
      noFill();
      strokeWeight(1);
      stroke(this.colors.primary);
      
      for (const point of ring) {
        // 회전 및 투영
        const rotatedPoint = this.rotatePoint(point, rotMatrix);
        
        // 깊이에 따른 투명도 계산
        const alpha = map(rotatedPoint.z, -this.radius, this.radius, 50, 255);
        stroke(this.colors.primary.levels[0], 
              this.colors.primary.levels[1], 
              this.colors.primary.levels[2], 
              alpha);
        
        vertex(rotatedPoint.x, rotatedPoint.y);
      }
      
      // 첫 점을 다시 추가하여 링 닫기
      const firstPoint = this.rotatePoint(ring[0], rotMatrix);
      vertex(firstPoint.x, firstPoint.y);
      
      endShape();
    }
    
    // 특별한 방향 그리기 (자오선)
    for (let i = 0; i < this.numPointsPerRing; i += 2) {
      beginShape();
      noFill();
      strokeWeight(1);
      
      for (const ring of this.points) {
        const point = ring[i];
        const rotatedPoint = this.rotatePoint(point, rotMatrix);
        
        // 깊이에 따른 투명도 계산
        const alpha = map(rotatedPoint.z, -this.radius, this.radius, 50, 255);
        stroke(this.colors.accent.levels[0], 
              this.colors.accent.levels[1], 
              this.colors.accent.levels[2], 
              alpha);
        
        vertex(rotatedPoint.x, rotatedPoint.y);
      }
      
      endShape();
    }
  }
  
  // 회전 행렬 생성 - 마우스 회전 포함
  getRotationMatrix(angle, rotX, rotY) {
    // X축 회전 행렬
    const cosX = cos(rotX);
    const sinX = sin(rotX);
    
    // Y축 회전 행렬
    const cosY = cos(angle + rotY);
    const sinY = sin(angle + rotY);
    
    return {
      xx: cosY,
      xy: 0,
      xz: sinY,
      yx: sinY * sinX,
      yy: cosX,
      yz: -cosY * sinX,
      zx: -sinY * cosX,
      zy: sinX,
      zz: cosY * cosX
    };
  }
  
  // 점 회전
  rotatePoint(point, matrix) {
    return {
      x: point.x * matrix.xx + point.y * matrix.xy + point.z * matrix.xz,
      y: point.x * matrix.yx + point.y * matrix.yy + point.z * matrix.yz,
      z: point.x * matrix.zx + point.y * matrix.zy + point.z * matrix.zz
    };
  }
} 