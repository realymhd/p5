class CoordinateSystem extends Visualization {
  constructor() {
    super();
    
    // 좌표계 속성
    this.axisLength = 200;  // 축 길이
    this.gridSize = 10;     // 격자 크기
    this.gridCount = 5;     // 격자 수
    
    // 회전 및 마우스 속성은 부모 클래스에서 상속
    this.autoRotation = 0.01;
    
    // 컬러 개인화
    this.colors.background = color(245);
    this.colors.xAxis = color(220, 50, 50);    // x축 빨간색
    this.colors.yAxis = color(50, 180, 50);    // y축 녹색
    this.colors.zAxis = color(50, 100, 220);   // z축 파란색
    this.colors.grid = color(80, 80, 80, 50);  // 격자 회색
    this.colors.text = color(30, 30, 30);      // 텍스트 색상
  }
  
  setup() {
    // 특별한 초기화 없음
  }
  
  update() {
    // 자동 회전 - 마우스 드래그가 없을 때만
    if (!this.isMouseDown) {
      this.mouseRotationY += this.autoRotation;
    }
  }
  
  draw() {
    // 배경 설정
    background(this.colors.background);
    
    // 중앙에 그리기
    push();
    translate(width / 2, height / 2);
    
    // 좌표계 그리기
    this.drawCoordinateSystem();
    
    pop();
  }
  
  // 3D 좌표계 그리기
  drawCoordinateSystem() {
    // X축 회전 행렬
    const rotMatrixX = this.getRotationMatrixX(this.mouseRotationX);
    // Y축 회전 행렬
    const rotMatrixY = this.getRotationMatrixY(this.mouseRotationY);
    
    // 격자 그리기
    this.drawGrid(rotMatrixX, rotMatrixY);
    
    // 좌표축 그리기
    this.drawAxes(rotMatrixX, rotMatrixY);
    
    // 좌표 레이블 그리기
    this.drawLabels(rotMatrixX, rotMatrixY);
  }
  
  // 격자 그리기
  drawGrid(rotMatrixX, rotMatrixY) {
    stroke(this.colors.grid);
    strokeWeight(0.5);
    
    // XY 평면 격자
    for (let i = -this.gridCount; i <= this.gridCount; i++) {
      const spacing = this.axisLength / this.gridCount;
      // X축 방향 선
      let start = this.rotatePoint({
        x: -this.axisLength, 
        y: i * spacing, 
        z: 0
      }, rotMatrixX, rotMatrixY);
      
      let end = this.rotatePoint({
        x: this.axisLength, 
        y: i * spacing, 
        z: 0
      }, rotMatrixX, rotMatrixY);
      
      line(start.x, start.y, end.x, end.y);
      
      // Y축 방향 선
      start = this.rotatePoint({
        x: i * spacing, 
        y: -this.axisLength, 
        z: 0
      }, rotMatrixX, rotMatrixY);
      
      end = this.rotatePoint({
        x: i * spacing, 
        y: this.axisLength, 
        z: 0
      }, rotMatrixX, rotMatrixY);
      
      line(start.x, start.y, end.x, end.y);
    }
    
    // XZ 평면 격자
    for (let i = -this.gridCount; i <= this.gridCount; i++) {
      const spacing = this.axisLength / this.gridCount;
      // X축 방향 선
      let start = this.rotatePoint({
        x: -this.axisLength, 
        y: 0, 
        z: i * spacing
      }, rotMatrixX, rotMatrixY);
      
      let end = this.rotatePoint({
        x: this.axisLength, 
        y: 0, 
        z: i * spacing
      }, rotMatrixX, rotMatrixY);
      
      line(start.x, start.y, end.x, end.y);
      
      // Z축 방향 선
      start = this.rotatePoint({
        x: i * spacing, 
        y: 0, 
        z: -this.axisLength
      }, rotMatrixX, rotMatrixY);
      
      end = this.rotatePoint({
        x: i * spacing, 
        y: 0, 
        z: this.axisLength
      }, rotMatrixX, rotMatrixY);
      
      line(start.x, start.y, end.x, end.y);
    }
  }
  
  // 좌표축 그리기
  drawAxes(rotMatrixX, rotMatrixY) {
    // X축 (빨간색)
    const xStart = this.rotatePoint({x: 0, y: 0, z: 0}, rotMatrixX, rotMatrixY);
    const xEnd = this.rotatePoint({x: this.axisLength, y: 0, z: 0}, rotMatrixX, rotMatrixY);
    
    strokeWeight(3);
    stroke(this.colors.xAxis);
    line(xStart.x, xStart.y, xEnd.x, xEnd.y);
    
    // Y축 (녹색)
    const yStart = this.rotatePoint({x: 0, y: 0, z: 0}, rotMatrixX, rotMatrixY);
    const yEnd = this.rotatePoint({x: 0, y: this.axisLength, z: 0}, rotMatrixX, rotMatrixY);
    
    stroke(this.colors.yAxis);
    line(yStart.x, yStart.y, yEnd.x, yEnd.y);
    
    // Z축 (파란색)
    const zStart = this.rotatePoint({x: 0, y: 0, z: 0}, rotMatrixX, rotMatrixY);
    const zEnd = this.rotatePoint({x: 0, y: 0, z: this.axisLength}, rotMatrixX, rotMatrixY);
    
    stroke(this.colors.zAxis);
    line(zStart.x, zStart.y, zEnd.x, zEnd.y);
    
    // 원점 표시
    fill(0);
    noStroke();
    const origin = this.rotatePoint({x: 0, y: 0, z: 0}, rotMatrixX, rotMatrixY);
    ellipse(origin.x, origin.y, 8, 8);
  }
  
  // 좌표축 레이블 그리기
  drawLabels(rotMatrixX, rotMatrixY) {
    textSize(16);
    textAlign(CENTER, CENTER);
    
    // X축 레이블
    const xLabel = this.rotatePoint({x: this.axisLength + 20, y: 0, z: 0}, rotMatrixX, rotMatrixY);
    fill(this.colors.xAxis);
    text("X", xLabel.x, xLabel.y);
    
    // Y축 레이블
    const yLabel = this.rotatePoint({x: 0, y: this.axisLength + 20, z: 0}, rotMatrixX, rotMatrixY);
    fill(this.colors.yAxis);
    text("Y", yLabel.x, yLabel.y);
    
    // Z축 레이블
    const zLabel = this.rotatePoint({x: 0, y: 0, z: this.axisLength + 20}, rotMatrixX, rotMatrixY);
    fill(this.colors.zAxis);
    text("Z", zLabel.x, zLabel.y);
    
    // 각 축에 숫자 표시
    textSize(12);
    fill(this.colors.text);
    
    for (let i = 1; i <= this.gridCount; i++) {
      const spacing = this.axisLength / this.gridCount;
      
      // X축 숫자
      const xNum = this.rotatePoint({x: i * spacing, y: -10, z: 0}, rotMatrixX, rotMatrixY);
      text(i, xNum.x, xNum.y);
      
      // Y축 숫자
      const yNum = this.rotatePoint({x: -10, y: i * spacing, z: 0}, rotMatrixX, rotMatrixY);
      text(i, yNum.x, yNum.y);
      
      // Z축 숫자
      const zNum = this.rotatePoint({x: 0, y: -10, z: i * spacing}, rotMatrixX, rotMatrixY);
      text(i, zNum.x, zNum.y);
    }
  }
  
  // 회전 및 투영 함수
  rotatePoint(point, rotMatrixX, rotMatrixY) {
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
    
    return rotated;
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