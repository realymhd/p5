class RotatingTetrahedron extends Visualization {
  constructor() {
    super();
    
    // 회전 변수
    this.rotation = 0;
    this.rotationSpeed = 0.01;
    
    // 정사면체 크기
    this.baseSize = 150;  // 기본 크기
    this.size = this.baseSize;  // 실제 적용될 크기
    
    // 정사면체 정점 (기본 정규 정사면체)
    this.vertices = [
      { x: 1, y: 1, z: 1 },
      { x: 1, y: -1, z: -1 },
      { x: -1, y: 1, z: -1 },
      { x: -1, y: -1, z: 1 }
    ];
    
    // 정사면체 면 (정점 인덱스)
    this.faces = [
      [0, 1, 2],
      [0, 2, 3],
      [0, 3, 1],
      [1, 3, 2]
    ];
    
    // 정사면체 모서리 (정점 인덱스 쌍)
    this.edges = [
      [0, 1], [0, 2], [0, 3],
      [1, 2], [1, 3], [2, 3]
    ];
    
    // 컬러 개인화
    this.colors.background = color(245);
    this.colors.primary = color(30, 30, 200, 100);
    this.colors.accent = color(200, 30, 30);
    this.colors.highlight = color(30, 30, 30);
  }
  
  setup() {
    super.setup();
    // 스케일에 따라 크기 조정
    this.size = this.baseSize * this.scale;
    // 사면체의 정점 생성
    this.generateTetrahedronVertices();
  }
  
  reset() {
    super.reset();
    // 회전 초기화
    this.rotation = 0;
    // 스케일에 따라 크기 조정
    this.size = this.baseSize * this.scale;
    // 사면체 정점 재생성
    this.generateTetrahedronVertices();
  }
  
  deactivate() {
    super.deactivate();
    // 추가적인 정리 작업이 필요하면 여기에 구현
  }
  
  // 정점 크기를 정규화
  normalizeVertices() {
    for (let i = 0; i < this.vertices.length; i++) {
      const vertex = this.vertices[i];
      this.vertices[i] = {
        x: vertex.x * this.size,
        y: vertex.y * this.size,
        z: vertex.z * this.size
      };
    }
  }
  
  update() {
    super.update();
    // 스케일에 따라 크기 업데이트
    this.size = this.baseSize * this.scale;
    
    // 자동 회전 - 마우스 드래그가 없을 때만
    if (!this.isMouseDown) {
      this.rotation += this.rotationSpeed;
      if (this.rotation > TWO_PI) {
        this.rotation -= TWO_PI;
      }
    }
    
    // 크기가 변경되었다면 정점 재생성
    if (abs(this.size - this.baseSize * this.scale) > 0.1) {
      this.generateTetrahedronVertices();
    }
  }
  
  draw() {
    // 배경 설정
    background(this.colors.background);
    
    // 중앙에 그리기
    push();
    translate(width / 2, height / 2);
    
    // 정사면체 그리기
    this.drawTetrahedron();
    
    pop();
  }
  
  // 정사면체 그리기
  drawTetrahedron() {
    // 회전 행렬 계산 - 마우스 회전 적용
    const rotMatrixX = this.getRotationMatrixX(this.rotation + this.mouseRotationX);
    const rotMatrixY = this.getRotationMatrixY(this.rotation * 0.7 + this.mouseRotationY);
    
    // 정점 회전 및 투영
    const projectedVertices = this.vertices.map(vertex => {
      // X축 기준 회전
      const rotatedX = this.rotatePointX(vertex, rotMatrixX);
      // Y축 기준 회전
      const rotated = this.rotatePointY(rotatedX, rotMatrixY);
      
      // Z 값에 따른 깊이 계산
      const depthFactor = map(rotated.z, -this.size, this.size, 0.3, 1);
      
      return {
        x: rotated.x,
        y: rotated.y,
        z: rotated.z,
        depthFactor: depthFactor
      };
    });
    
    // 면 정보와 깊이 계산 (렌더링 순서 결정)
    const facesWithDepth = [];
    
    for (let i = 0; i < this.faces.length; i++) {
      const face = this.faces[i];
      const v1 = projectedVertices[face[0]];
      const v2 = projectedVertices[face[1]];
      const v3 = projectedVertices[face[2]];
      
      // 면이 보이는지 체크 (간단한 컬링)
      const faceNormal = this.calculateNormal(v1, v2, v3);
      
      // 컬링 - 시청자에게 향하는 면만 렌더링
      if (faceNormal.z < 0) {
        // 평균 깊이 계산
        const avgDepth = (v1.z + v2.z + v3.z) / 3;
        const depthFactor = (v1.depthFactor + v2.depthFactor + v3.depthFactor) / 3;
        
        facesWithDepth.push({
          index: i,
          vertices: [v1, v2, v3],
          depth: avgDepth,
          depthFactor: depthFactor
        });
      }
    }
    
    // 깊이에 따라 정렬 (가장 먼 것부터 그리기)
    facesWithDepth.sort((a, b) => a.depth - b.depth);
    
    // 정렬된 면 그리기
    for (const face of facesWithDepth) {
      // 면 그리기
      fill(
        this.colors.primary.levels[0],
        this.colors.primary.levels[1],
        this.colors.primary.levels[2],
        255 * face.depthFactor
      );
      stroke(this.colors.highlight);
      strokeWeight(1.5);
      
      beginShape();
      for (const v of face.vertices) {
        vertex(v.x, v.y);
      }
      endShape(CLOSE);
    }
    
    // 모서리 그리기
    for (const edge of this.edges) {
      const v1 = projectedVertices[edge[0]];
      const v2 = projectedVertices[edge[1]];
      
      // 평균 깊이 계산
      const avgDepth = (v1.depthFactor + v2.depthFactor) / 2;
      
      // 모서리 그리기
      stroke(
        this.colors.accent.levels[0],
        this.colors.accent.levels[1],
        this.colors.accent.levels[2],
        255 * avgDepth
      );
      strokeWeight(2);
      line(v1.x, v1.y, v2.x, v2.y);
    }
    
    // 정점 그리기
    for (const vertex of projectedVertices) {
      fill(
        this.colors.highlight.levels[0],
        this.colors.highlight.levels[1],
        this.colors.highlight.levels[2],
        255 * vertex.depthFactor
      );
      noStroke();
      circle(vertex.x, vertex.y, 8 * vertex.depthFactor);
    }
  }
  
  // 법선 벡터 계산 (면 방향 결정용)
  calculateNormal(v1, v2, v3) {
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
  
  // 정사면체 정점 생성 및 초기화
  generateTetrahedronVertices() {
    // 정규 사면체 정점 기본값
    this.vertices = [
      { x: 1, y: 1, z: 1 },
      { x: 1, y: -1, z: -1 },
      { x: -1, y: 1, z: -1 },
      { x: -1, y: -1, z: 1 }
    ];
    
    // 크기에 맞게 정점 조정
    this.normalizeVertices();
    
    // 정점 기반으로 면과 모서리 계산
    this.calculateFacesAndEdges();
  }
  
  // 면과 모서리 계산
  calculateFacesAndEdges() {
    // 면 인덱스 (정점의 특정 순서로 정의)
    this.faces = [
      [0, 1, 2],  // 면 0
      [0, 2, 3],  // 면 1
      [0, 3, 1],  // 면 2
      [1, 3, 2]   // 면 3
    ];
    
    // 모서리 인덱스 (각 모서리는 정점 두 개로 구성)
    this.edges = [
      [0, 1], [0, 2], [0, 3],  // 정점 0에서 시작하는 모서리
      [1, 2], [1, 3], [2, 3]   // 나머지 모서리
    ];
  }
} 