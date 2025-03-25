class FunctionGrapher extends Visualization {
  constructor() {
    super();
    
    // 그래프 속성
    this.xMin = -5;
    this.xMax = 5;
    this.yMin = -5;
    this.yMax = 5;
    this.resolution = 0.5; // 그리드 간격
    
    // 현재 선택된 함수 인덱스
    this.currentFunctionIndex = 0;
    
    // 그래프에 표시할 함수 목록
    this.functions = [
      {
        name: "z = sin(x) * cos(y)",
        fn: (x, y) => sin(x) * cos(y),
        color: color(50, 150, 250)
      },
      {
        name: "z = (x^2 + y^2) / 4",
        fn: (x, y) => (x*x + y*y) / 4,
        color: color(250, 100, 100)
      },
      {
        name: "z = sin(sqrt(x^2 + y^2))",
        fn: (x, y) => sin(sqrt(x*x + y*y)),
        color: color(100, 250, 100)
      }
    ];
    
    // 3D 그래프 점 저장 배열
    this.points = [];
    
    // 컬러 개인화
    this.colors.background = color(245);
    this.colors.grid = color(180, 180, 180, 100);
    this.colors.axes = color(0, 0, 0);
  }
  
  setup() {
    // 그래프 점 생성
    this.generateGraphPoints();
  }
  
  update() {
    // 자동 회전 - 마우스 드래그가 없을 때만
    if (!this.isMouseDown) {
      this.mouseRotationY += 0.01;
    }
  }
  
  draw() {
    // 배경 설정
    background(this.colors.background);
    
    // 중앙에 그리기
    push();
    translate(width / 2, height / 2);
    
    // 현재 함수 이름 표시
    textAlign(CENTER, TOP);
    textSize(16);
    fill(this.functions[this.currentFunctionIndex].color);
    text(this.functions[this.currentFunctionIndex].name, 0, -height/2 + 30);
    
    // 그래프 그리기
    this.drawGraph();
    
    pop();
  }
  
  // 키 입력 처리 - 함수 전환
  keyPressed() {
    if (key === 'f' || key === 'F') {
      this.nextFunction();
    }
  }
  
  // 다음 함수로 전환
  nextFunction() {
    this.currentFunctionIndex = (this.currentFunctionIndex + 1) % this.functions.length;
    this.generateGraphPoints();
  }
  
  // 3D 그래프 점 생성
  generateGraphPoints() {
    this.points = [];
    const fn = this.functions[this.currentFunctionIndex].fn;
    
    // X-Y 그리드 생성
    for (let x = this.xMin; x <= this.xMax; x += this.resolution) {
      const row = [];
      for (let y = this.yMin; y <= this.yMax; y += this.resolution) {
        // 함수에서 z값 계산
        const z = fn(x, y);
        row.push({x, y, z});
      }
      this.points.push(row);
    }
  }
  
  // 그래프 그리기
  drawGraph() {
    // 스케일 조정
    const scale = 40;
    
    // X축 회전 행렬
    const rotMatrixX = this.getRotationMatrixX(this.mouseRotationX);
    // Y축 회전 행렬
    const rotMatrixY = this.getRotationMatrixY(this.mouseRotationY);
    
    // 좌표축 그리기
    this.drawAxes(rotMatrixX, rotMatrixY, scale);
    
    // 그래프 표면 그리기
    const fnColor = this.functions[this.currentFunctionIndex].color;
    
    for (let i = 0; i < this.points.length - 1; i++) {
      for (let j = 0; j < this.points[i].length - 1; j++) {
        // 사각형의 네 꼭지점
        const p1 = this.points[i][j];
        const p2 = this.points[i+1][j];
        const p3 = this.points[i+1][j+1];
        const p4 = this.points[i][j+1];
        
        // 각 점 회전 및 투영
        const rp1 = this.projectPoint(p1, rotMatrixX, rotMatrixY, scale);
        const rp2 = this.projectPoint(p2, rotMatrixX, rotMatrixY, scale);
        const rp3 = this.projectPoint(p3, rotMatrixX, rotMatrixY, scale);
        const rp4 = this.projectPoint(p4, rotMatrixX, rotMatrixY, scale);
        
        // 면 그리기
        fill(fnColor.levels[0], fnColor.levels[1], fnColor.levels[2], 100);
        stroke(fnColor.levels[0], fnColor.levels[1], fnColor.levels[2], 200);
        strokeWeight(0.5);
        
        beginShape();
        vertex(rp1.x, rp1.y);
        vertex(rp2.x, rp2.y);
        vertex(rp3.x, rp3.y);
        vertex(rp4.x, rp4.y);
        endShape(CLOSE);
      }
    }
  }
  
  // 좌표축 그리기
  drawAxes(rotMatrixX, rotMatrixY, scale) {
    stroke(this.colors.axes);
    strokeWeight(2);
    
    // X축
    const xStart = this.projectPoint({x: this.xMin, y: 0, z: 0}, rotMatrixX, rotMatrixY, scale);
    const xEnd = this.projectPoint({x: this.xMax, y: 0, z: 0}, rotMatrixX, rotMatrixY, scale);
    line(xStart.x, xStart.y, xEnd.x, xEnd.y);
    
    // Y축
    const yStart = this.projectPoint({x: 0, y: this.yMin, z: 0}, rotMatrixX, rotMatrixY, scale);
    const yEnd = this.projectPoint({x: 0, y: this.yMax, z: 0}, rotMatrixX, rotMatrixY, scale);
    line(yStart.x, yStart.y, yEnd.x, yEnd.y);
    
    // Z축
    const zStart = this.projectPoint({x: 0, y: 0, z: -5}, rotMatrixX, rotMatrixY, scale);
    const zEnd = this.projectPoint({x: 0, y: 0, z: 5}, rotMatrixX, rotMatrixY, scale);
    line(zStart.x, zStart.y, zEnd.x, zEnd.y);
    
    // 축 레이블
    textSize(14);
    textAlign(CENTER, CENTER);
    
    // X 레이블
    fill(0);
    const xLabel = this.projectPoint({x: this.xMax + 0.5, y: 0, z: 0}, rotMatrixX, rotMatrixY, scale);
    text("X", xLabel.x, xLabel.y);
    
    // Y 레이블
    const yLabel = this.projectPoint({x: 0, y: this.yMax + 0.5, z: 0}, rotMatrixX, rotMatrixY, scale);
    text("Y", yLabel.x, yLabel.y);
    
    // Z 레이블
    const zLabel = this.projectPoint({x: 0, y: 0, z: 5.5}, rotMatrixX, rotMatrixY, scale);
    text("Z", zLabel.x, zLabel.y);
  }
  
  // 회전 및 투영 함수
  projectPoint(point, rotMatrixX, rotMatrixY, scale) {
    // X축 기준 회전
    const rotatedX = {
      x: point.x,
      y: point.y * rotMatrixX.yy + point.z * rotMatrixX.yz,
      z: point.y * rotMatrixX.zy + point.z * rotMatrixX.zz
    };
    
    // Y축 기준 회전
    const rotated = {
      x: rotatedX.x * rotMatrixY.xx + rotatedX.z * rotMatrixY.xz,
      y: rotatedX.y,
      z: rotatedX.x * rotMatrixY.zx + rotatedX.z * rotMatrixY.zz
    };
    
    // 스케일 적용
    return {
      x: rotated.x * scale,
      y: rotated.y * scale,
      z: rotated.z * scale
    };
  }
  
  // X축 기준 회전 행렬 생성
  getRotationMatrixX(angle) {
    return {
      xx: 1, xy: 0, xz: 0,
      yx: 0, yy: cos(angle), yz: -sin(angle),
      zx: 0, zy: sin(angle), zz: cos(angle)
    };
  }
  
  // Y축 기준 회전 행렬 생성
  getRotationMatrixY(angle) {
    return {
      xx: cos(angle), xy: 0, xz: sin(angle),
      yx: 0, yy: 1, yz: 0,
      zx: -sin(angle), zy: 0, zz: cos(angle)
    };
  }
} 