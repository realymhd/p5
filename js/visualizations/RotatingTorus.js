class RotatingTorus extends Visualization {
  constructor() {
    super();
    
    // 회전 변수
    this.rotation = 0;
    this.rotationSpeed = 0.01;
    
    // 토러스 속성
    this.baseR = 120; // 기본 큰 반지름 (중심에서 도넛 중심까지의 거리)
    this.baseSmallR = 50;  // 기본 작은 반지름 (도넛 관의 굵기)
    
    this.R = this.baseR; // 적용될 큰 반지름
    this.r = this.baseSmallR;  // 적용될 작은 반지름
    
    // 토러스 메시 세부 정보
    this.numTubes = 24;     // 도넛 단면 메시 세부 정도
    this.numRadials = 36;   // 도넛 원주 메시 세부 정도
    
    // 포인트 저장용 배열
    this.points = [];
    
    // 컬러 개인화
    this.colors.background = color(240);
    this.colors.primary = color(30, 100, 200, 80);
    this.colors.accent = color(200, 100, 30);
    this.colors.highlight = color(20, 20, 20, 200);
  }
  
  setup() {
    super.setup();
    // 스케일에 따라 크기 조정
    this.R = this.baseR * this.scale;
    this.r = this.baseSmallR * this.scale;
    // 토러스 점 생성
    this.generateTorusPoints();
  }
  
  reset() {
    super.reset();
    // 회전 초기화
    this.rotation = 0;
    // 스케일에 따라 크기 조정
    this.R = this.baseR * this.scale;
    this.r = this.baseSmallR * this.scale;
    // 토러스 점 재생성
    this.generateTorusPoints();
  }
  
  deactivate() {
    super.deactivate();
    // 추가적인 정리 작업이 필요하면 여기에 구현
  }
  
  // 토러스 점 생성
  generateTorusPoints() {
    this.points = [];
    
    // 단면 원에 대한 각도
    for (let i = 0; i < this.numRadials; i++) {
      const radialPoints = [];
      const theta = (i / this.numRadials) * TWO_PI;
      
      // 도넛 원형 단면에 대한 각도
      for (let j = 0; j < this.numTubes; j++) {
        const phi = (j / this.numTubes) * TWO_PI;
        
        // 토러스 좌표 계산
        const x = (this.R + this.r * cos(phi)) * cos(theta);
        const y = (this.R + this.r * cos(phi)) * sin(theta);
        const z = this.r * sin(phi);
        
        radialPoints.push({x, y, z});
      }
      
      this.points.push(radialPoints);
    }
  }
  
  update() {
    super.update();
    // 스케일에 따라 크기 업데이트
    this.R = this.baseR * this.scale;
    this.r = this.baseSmallR * this.scale;
    
    // 자동 회전 - 마우스 드래그가 없을 때만
    if (!this.isMouseDown) {
      this.rotation += this.rotationSpeed;
      if (this.rotation > TWO_PI) {
        this.rotation -= TWO_PI;
      }
    }
    
    // 크기가 변경되었다면 점 재생성
    if (abs(this.R - this.baseR * this.scale) > 0.1 || 
        abs(this.r - this.baseSmallR * this.scale) > 0.1) {
      this.generateTorusPoints();
    }
  }
  
  draw() {
    // 배경 설정
    background(this.colors.background);
    
    // 중앙에 그리기
    push();
    translate(width / 2, height / 2);
    
    // 토러스 그리기
    this.drawTorus();
    
    pop();
  }
  
  // 토러스 그리기
  drawTorus() {
    // X축 기준 회전 행렬
    const rotMatrixX = this.getRotationMatrixX(this.rotation * 0.5 + this.mouseRotationX);
    // Y축 기준 회전 행렬
    const rotMatrixY = this.getRotationMatrixY(this.rotation + this.mouseRotationY);
    
    // 메시 렌더링 - 각 면에 대해 깊이 정렬
    const faces = [];
    
    // 메시 면 생성 및 깊이 정보 계산
    for (let i = 0; i < this.numRadials; i++) {
      const nextI = (i + 1) % this.numRadials;
      
      for (let j = 0; j < this.numTubes; j++) {
        const nextJ = (j + 1) % this.numTubes;
        
        // 쿼드의 네 점 가져오기
        const p1 = this.points[i][j];
        const p2 = this.points[nextI][j];
        const p3 = this.points[nextI][nextJ];
        const p4 = this.points[i][nextJ];
        
        // 회전 및 투영
        const rotP1 = this.projectPoint(p1, rotMatrixX, rotMatrixY);
        const rotP2 = this.projectPoint(p2, rotMatrixX, rotMatrixY);
        const rotP3 = this.projectPoint(p3, rotMatrixX, rotMatrixY);
        const rotP4 = this.projectPoint(p4, rotMatrixX, rotMatrixY);
        
        // 법선 계산 (간단히 중심을 향하도록)
        const normal = this.calculateFaceNormal(rotP1, rotP2, rotP3);
        
        // 시청자에게 향하는 면만 표시 (컬링)
        if (normal.z < 0) {
          const avgDepth = (rotP1.z + rotP2.z + rotP3.z + rotP4.z) / 4;
          
          // 면 정보 저장
          faces.push({
            points: [rotP1, rotP2, rotP3, rotP4],
            depth: avgDepth,
            depthFactor: (rotP1.depthFactor + rotP2.depthFactor + rotP3.depthFactor + rotP4.depthFactor) / 4
          });
        }
      }
    }
    
    // 깊이에 따라 정렬 (가장 먼 것부터 그리기)
    faces.sort((a, b) => a.depth - b.depth);
    
    // 정렬된 순서로 면 그리기
    for (const face of faces) {
      fill(
        this.colors.primary.levels[0],
        this.colors.primary.levels[1],
        this.colors.primary.levels[2],
        255 * face.depthFactor * 0.7
      );
      
      strokeWeight(0.5);
      stroke(
        this.colors.highlight.levels[0],
        this.colors.highlight.levels[1], 
        this.colors.highlight.levels[2],
        255 * face.depthFactor
      );
      
      beginShape();
      for (const point of face.points) {
        vertex(point.x, point.y);
      }
      endShape(CLOSE);
    }
    
    // 특징 선 그리기 (토러스의 안쪽 및 바깥쪽 윤곽)
    this.drawFeatureLines(rotMatrixX, rotMatrixY);
  }
  
  // 회전 및 투영된 점 계산
  projectPoint(point, rotMatrixX, rotMatrixY) {
    // X축 기준 회전
    const rotatedX = this.rotatePointX(point, rotMatrixX);
    // Y축 기준 회전
    const rotated = this.rotatePointY(rotatedX, rotMatrixY);
    
    // Z에 따른 깊이 인자 계산
    const depthFactor = map(
      rotated.z, -(this.R + this.r), (this.R + this.r), 0.4, 1
    );
    
    return {
      x: rotated.x,
      y: rotated.y,
      z: rotated.z,
      depthFactor: depthFactor
    };
  }
  
  // 토러스의 특징적인 선 그리기 (안쪽/바깥쪽 윤곽)
  drawFeatureLines(rotMatrixX, rotMatrixY) {
    // 강조용 특징선 그리기
    // 도넛의 안쪽/바깥쪽 윤곽 그리기
    const outerRingIndex = 0;  // 바깥쪽 (단면 원의 바깥 지점)
    const innerRingIndex = Math.floor(this.numTubes / 2);  // 안쪽 (단면 원의 안쪽 지점)
    
    // 바깥쪽 윤곽선
    this.drawRing(outerRingIndex, rotMatrixX, rotMatrixY, 2, this.colors.accent);
    
    // 안쪽 윤곽선
    this.drawRing(innerRingIndex, rotMatrixX, rotMatrixY, 1.5, this.colors.highlight);
  }
  
  // 토러스 링 그리기 (특정 원환)
  drawRing(tubeIndex, rotMatrixX, rotMatrixY, strokeW, strokeColor) {
    beginShape();
    noFill();
    strokeWeight(strokeW);
    
    for (let i = 0; i < this.numRadials; i++) {
      const point = this.points[i][tubeIndex];
      const projected = this.projectPoint(point, rotMatrixX, rotMatrixY);
      
      // 변형된 투명도로 스트로크 설정
      stroke(
        strokeColor.levels[0],
        strokeColor.levels[1],
        strokeColor.levels[2],
        255 * projected.depthFactor
      );
      
      vertex(projected.x, projected.y);
    }
    
    // 첫 점을 다시 그려서 연결 (원환 닫기)
    const firstPoint = this.points[0][tubeIndex];
    const projectedFirst = this.projectPoint(firstPoint, rotMatrixX, rotMatrixY);
    vertex(projectedFirst.x, projectedFirst.y);
    
    endShape();
  }
  
  // 법선 벡터 계산 (면 방향 결정용)
  calculateFaceNormal(v1, v2, v3) {
    // 두 변 벡터 계산
    const ax = v2.x - v1.x;
    const ay = v2.y - v1.y;
    const az = v2.z - v1.z;
    
    const bx = v3.x - v1.x;
    const by = v3.y - v1.y;
    const bz = v3.z - v1.z;
    
    // 외적 계산 (법선 벡터)
    return {
      x: ay * bz - az * by,
      y: az * bx - ax * bz,
      z: ax * by - ay * bx
    };
  }
  
  // X축 기준 회전 행렬 생성
  getRotationMatrixX(angle) {
    return {
      xx: 1,
      xy: 0,
      xz: 0,
      yx: 0,
      yy: cos(angle),
      yz: -sin(angle),
      zx: 0,
      zy: sin(angle),
      zz: cos(angle)
    };
  }
  
  // Y축 기준 회전 행렬 생성
  getRotationMatrixY(angle) {
    return {
      xx: cos(angle),
      xy: 0,
      xz: sin(angle),
      yx: 0,
      yy: 1,
      yz: 0,
      zx: -sin(angle),
      zy: 0,
      zz: cos(angle)
    };
  }
  
  // X축 기준 점 회전
  rotatePointX(point, matrix) {
    return {
      x: point.x * matrix.xx + point.y * matrix.xy + point.z * matrix.xz,
      y: point.x * matrix.yx + point.y * matrix.yy + point.z * matrix.yz,
      z: point.x * matrix.zx + point.y * matrix.zy + point.z * matrix.zz
    };
  }
  
  // Y축 기준 점 회전
  rotatePointY(point, matrix) {
    return {
      x: point.x * matrix.xx + point.y * matrix.xy + point.z * matrix.xz,
      y: point.x * matrix.yx + point.y * matrix.yy + point.z * matrix.yz,
      z: point.x * matrix.zx + point.y * matrix.zy + point.z * matrix.zz
    };
  }
} 