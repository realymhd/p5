class EuclideanGeometry extends Visualization {
  constructor() {
    super();
    
    // 기하학 속성
    this.gridSize = 400;
    this.gridStep = 40;
    
    // 그릴 도형 목록
    this.shapes = [
      { name: "삼각형과 내심/외심", draw: this.drawTriangleAndCenters.bind(this) },
      { name: "원과 접선", draw: this.drawCircleAndTangents.bind(this) },
      { name: "피타고라스 정리", draw: this.drawPythagorean.bind(this) },
      { name: "각도와 부채꼴", draw: this.drawAnglesAndSectors.bind(this) }
    ];
    
    // 현재 선택된 도형
    this.currentShapeIndex = 0;
    
    // 인터랙션 속성
    this.dragPoints = [];
    this.selectedPointIndex = -1;
    this.isDragging = false;
    
    // 컬러 개인화
    this.colors.background = color(250);
    this.colors.grid = color(230);
    this.colors.axes = color(180);
    this.colors.points = color(50, 100, 200);
    this.colors.lines = color(60, 60, 60);
    this.colors.highlight = color(255, 100, 100);
    this.colors.circle = color(100, 180, 100);
    this.colors.text = color(40, 40, 40);
  }
  
  setup() {
    super.setup();
    // 초기 드래그 가능 점 설정
    this.resetPoints();
  }
  
  reset() {
    super.reset();
    // 인터랙션 상태 초기화
    this.selectedPointIndex = -1;
    this.isDragging = false;
    
    // 포인트 재설정
    this.resetPoints();
  }
  
  deactivate() {
    super.deactivate();
    // 드래그 중지
    this.isDragging = false;
    this.selectedPointIndex = -1;
  }
  
  resetPoints() {
    // 도형별 초기 포인트 설정
    switch (this.currentShapeIndex) {
      case 0: // 삼각형
        this.dragPoints = [
          { x: -100, y: -80 },
          { x: 100, y: -80 },
          { x: 0, y: 120 }
        ];
        break;
      case 1: // 원과 접선
        this.dragPoints = [
          { x: 0, y: 0 },     // 원의 중심
          { x: 80, y: 0 },    // 원 위의 점
          { x: 200, y: 120 }   // 외부 점
        ];
        break;
      case 2: // 피타고라스 정리
        this.dragPoints = [
          { x: -100, y: -80 },
          { x: 100, y: -80 },
          { x: 100, y: 120 }
        ];
        break;
      case 3: // 각도와 부채꼴
        this.dragPoints = [
          { x: 0, y: 0 },     // 중심점
          { x: 100, y: 0 },   // 첫 번째 반지름 끝점
          { x: 70, y: 70 }    // 두 번째 반지름 끝점
        ];
        break;
    }
  }
  
  update() {
    // 업데이트 필요 없음
  }
  
  draw() {
    // 배경 설정
    background(this.colors.background);
    
    // 중앙에 그리기
    push();
    translate(width / 2, height / 2);
    
    // 격자 그리기
    this.drawGrid();
    
    // 현재 도형 이름 표시
    textAlign(CENTER, TOP);
    textSize(18);
    fill(this.colors.text);
    text(this.shapes[this.currentShapeIndex].name, 0, -height/2 + 30);
    
    // 조작 설명
    textAlign(CENTER, BOTTOM);
    textSize(14);
    fill(this.colors.text);
    text("'g' 키: 도형 변경, 포인트를 드래그하여 도형 변형", 0, height/2 - 20);
    
    // 선택된 도형 그리기
    this.shapes[this.currentShapeIndex].draw();
    
    // 드래그 가능한 점 그리기
    this.drawDragPoints();
    
    pop();
  }
  
  // 격자 그리기
  drawGrid() {
    // 격자선
    stroke(this.colors.grid);
    strokeWeight(1);
    
    // 가로선
    for (let y = -this.gridSize; y <= this.gridSize; y += this.gridStep) {
      line(-this.gridSize, y, this.gridSize, y);
    }
    
    // 세로선
    for (let x = -this.gridSize; x <= this.gridSize; x += this.gridStep) {
      line(x, -this.gridSize, x, this.gridSize);
    }
    
    // 주 축
    stroke(this.colors.axes);
    strokeWeight(2);
    line(-this.gridSize, 0, this.gridSize, 0);
    line(0, -this.gridSize, 0, this.gridSize);
  }
  
  // 드래그 가능한 점 그리기
  drawDragPoints() {
    for (let i = 0; i < this.dragPoints.length; i++) {
      const p = this.dragPoints[i];
      
      // 선택된 점은 강조 표시
      if (i === this.selectedPointIndex) {
        fill(this.colors.highlight);
        stroke(this.colors.highlight);
        ellipse(p.x, p.y, 14, 14);
      }
      
      // 모든 점 그리기
      fill(this.colors.points);
      noStroke();
      ellipse(p.x, p.y, 10, 10);
    }
  }
  
  // 삼각형과 내심/외심 그리기
  drawTriangleAndCenters() {
    const points = this.dragPoints;
    
    // 삼각형 그리기
    stroke(this.colors.lines);
    strokeWeight(2);
    noFill();
    beginShape();
    for (const p of points) {
      vertex(p.x, p.y);
    }
    endShape(CLOSE);
    
    // 변의 중점 계산
    const midpoints = [
      { x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 },
      { x: (points[1].x + points[2].x) / 2, y: (points[1].y + points[2].y) / 2 },
      { x: (points[2].x + points[0].x) / 2, y: (points[2].y + points[0].y) / 2 }
    ];
    
    // 변의 길이 계산
    const sides = [
      this.distance(points[0], points[1]),
      this.distance(points[1], points[2]),
      this.distance(points[2], points[0])
    ];
    
    // 외심 계산
    const circumcenter = this.findCircumcenter(points);
    
    // 내심 계산
    const incenter = this.findIncenter(points, sides);
    
    // 수직이등분선 그리기
    stroke(this.colors.circle);
    strokeWeight(1);
    for (let i = 0; i < 3; i++) {
      line(midpoints[i].x, midpoints[i].y, circumcenter.x, circumcenter.y);
    }
    
    // 각 이등분선 그리기
    stroke(this.colors.highlight);
    strokeWeight(1);
    for (let i = 0; i < 3; i++) {
      line(points[i].x, points[i].y, incenter.x, incenter.y);
    }
    
    // 외접원 그리기
    const circumradius = this.distance(circumcenter, points[0]);
    stroke(this.colors.circle);
    strokeWeight(1.5);
    noFill();
    ellipse(circumcenter.x, circumcenter.y, circumradius * 2, circumradius * 2);
    
    // 내접원 그리기
    const inradius = this.distanceToLine(incenter, points[0], points[1]);
    stroke(this.colors.highlight);
    strokeWeight(1.5);
    noFill();
    ellipse(incenter.x, incenter.y, inradius * 2, inradius * 2);
    
    // 중심점 표시
    fill(this.colors.circle);
    noStroke();
    ellipse(circumcenter.x, circumcenter.y, 6, 6);
    
    fill(this.colors.highlight);
    noStroke();
    ellipse(incenter.x, incenter.y, 6, 6);
    
    // 레이블 표시
    textAlign(CENTER, CENTER);
    textSize(14);
    
    // 외심 레이블
    fill(this.colors.circle);
    text("외심", circumcenter.x, circumcenter.y - 15);
    
    // 내심 레이블
    fill(this.colors.highlight);
    text("내심", incenter.x, incenter.y - 15);
    
    // 꼭지점 레이블
    fill(this.colors.text);
    text("A", points[0].x - 15, points[0].y - 15);
    text("B", points[1].x + 15, points[1].y - 15);
    text("C", points[2].x, points[2].y + 15);
  }
  
  // 원과 접선 그리기
  drawCircleAndTangents() {
    const center = this.dragPoints[0];
    const radiusPoint = this.dragPoints[1];
    const externalPoint = this.dragPoints[2];
    
    // 반지름 계산
    const radius = this.distance(center, radiusPoint);
    
    // 원 그리기
    stroke(this.colors.circle);
    strokeWeight(2);
    noFill();
    ellipse(center.x, center.y, radius * 2, radius * 2);
    
    // 반지름 그리기
    stroke(this.colors.lines);
    strokeWeight(1);
    line(center.x, center.y, radiusPoint.x, radiusPoint.y);
    
    // 외부 점과 중심을 연결
    line(center.x, center.y, externalPoint.x, externalPoint.y);
    
    // 접점 계산
    const d = this.distance(center, externalPoint);
    
    // 외부 점이 원 안에 있으면 접선을 그릴 수 없음
    if (d < radius) {
      fill(this.colors.text);
      text("외부 점이 원 내부에 있음", externalPoint.x, externalPoint.y - 20);
      return;
    }
    
    // 접점까지의 거리 계산 (피타고라스 정리 사용)
    const a = (radius * radius) / d;
    const h = sqrt(radius * radius - a * a);
    
    // 단위 벡터 계산
    const ux = (externalPoint.x - center.x) / d;
    const uy = (externalPoint.y - center.y) / d;
    
    // 수직 단위 벡터
    const vx = -uy;
    const vy = ux;
    
    // 접점 계산
    const p1 = {
      x: center.x + ux * a + vx * h,
      y: center.y + uy * a + vy * h
    };
    
    const p2 = {
      x: center.x + ux * a - vx * h,
      y: center.y + uy * a - vy * h
    };
    
    // 접선 그리기
    stroke(this.colors.highlight);
    strokeWeight(2);
    line(externalPoint.x, externalPoint.y, p1.x, p1.y);
    line(externalPoint.x, externalPoint.y, p2.x, p2.y);
    
    // 접점 표시
    fill(this.colors.highlight);
    noStroke();
    ellipse(p1.x, p1.y, 6, 6);
    ellipse(p2.x, p2.y, 6, 6);
    
    // 레이블
    textAlign(CENTER, CENTER);
    textSize(14);
    fill(this.colors.text);
    text("O", center.x - 15, center.y - 15);
    text("P", externalPoint.x + 15, externalPoint.y - 15);
    text("T₁", p1.x, p1.y - 15);
    text("T₂", p2.x, p2.y - 15);
  }
  
  // 피타고라스 정리 그리기
  drawPythagorean() {
    const points = this.dragPoints;
    
    // 삼각형의 세 점을 직각삼각형으로 강제 변환
    const p1 = points[0];
    const p2 = points[1];
    const p3 = { x: p2.x, y: points[2].y };
    points[2] = p3;
    
    // 직각삼각형 그리기
    stroke(this.colors.lines);
    strokeWeight(2);
    noFill();
    beginShape();
    vertex(p1.x, p1.y);
    vertex(p2.x, p2.y);
    vertex(p3.x, p3.y);
    endShape(CLOSE);
    
    // 직각 표시
    const size = 15;
    stroke(this.colors.text);
    line(p2.x, p2.y, p2.x - size, p2.y);
    line(p2.x, p2.y, p2.x, p2.y + size);
    
    // 변의 길이 계산
    const a = this.distance(p1, p2);
    const b = this.distance(p2, p3);
    const c = this.distance(p3, p1);
    
    // 각 변 위에 정사각형 그리기
    this.drawSquare(p1, p2, this.colors.circle, a * a);
    this.drawSquare(p2, p3, this.colors.highlight, b * b);
    this.drawSquare(p3, p1, this.colors.points, c * c);
    
    // 레이블 표시
    textAlign(CENTER, CENTER);
    textSize(16);
    
    // 변 레이블
    fill(this.colors.text);
    text("a = " + a.toFixed(1), (p1.x + p2.x) / 2, (p1.y + p2.y) / 2 - 20);
    text("b = " + b.toFixed(1), (p2.x + p3.x) / 2 + 20, (p2.y + p3.y) / 2);
    text("c = " + c.toFixed(1), (p3.x + p1.x) / 2 - 20, (p3.y + p1.y) / 2);
    
    // 공식 및 검증
    textSize(18);
    fill(this.colors.text);
    text(`a² + b² = c²`, 0, -height/2 + 60);
    text(`${a.toFixed(1)}² + ${b.toFixed(1)}² = ${c.toFixed(1)}²`, 0, -height/2 + 85);
    text(`${(a*a).toFixed(1)} + ${(b*b).toFixed(1)} = ${(c*c).toFixed(1)}`, 0, -height/2 + 110);
  }
  
  // 정사각형 그리기
  drawSquare(p1, p2, fillColor, area) {
    // 변 벡터 계산
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    
    // 수직 벡터 (-dy, dx)
    const nx = -dy;
    const ny = dx;
    
    // 정사각형의 나머지 두 점
    const p3 = { x: p2.x + nx, y: p2.y + ny };
    const p4 = { x: p1.x + nx, y: p1.y + ny };
    
    // 정사각형 그리기
    fill(fillColor);
    stroke(this.colors.lines);
    strokeWeight(1);
    
    beginShape();
    vertex(p1.x, p1.y);
    vertex(p2.x, p2.y);
    vertex(p3.x, p3.y);
    vertex(p4.x, p4.y);
    endShape(CLOSE);
    
    // 넓이 표시
    textAlign(CENTER, CENTER);
    textSize(14);
    fill(this.colors.text);
    const centerX = (p1.x + p2.x + p3.x + p4.x) / 4;
    const centerY = (p1.y + p2.y + p3.y + p4.y) / 4;
    text(area.toFixed(0), centerX, centerY);
  }
  
  // 각도와 부채꼴 그리기
  drawAnglesAndSectors() {
    const center = this.dragPoints[0];
    const p1 = this.dragPoints[1];
    const p2 = this.dragPoints[2];
    
    // 반지름
    const r1 = this.distance(center, p1);
    const r2 = this.distance(center, p2);
    const radius = min(r1, r2);
    
    // 각도 계산
    const angle1 = atan2(p1.y - center.y, p1.x - center.x);
    const angle2 = atan2(p2.y - center.y, p2.x - center.x);
    
    // 반지름 그리기
    stroke(this.colors.lines);
    strokeWeight(1.5);
    line(center.x, center.y, p1.x, p1.y);
    line(center.x, center.y, p2.x, p2.y);
    
    // 부채꼴 그리기
    fill(this.colors.circle);
    stroke(this.colors.lines);
    strokeWeight(1);
    beginShape();
    vertex(center.x, center.y);
    
    let startAngle = angle1;
    let endAngle = angle2;
    
    // 항상 작은 쪽에서 큰 쪽으로 호 그리기
    if (startAngle > endAngle) {
      const temp = startAngle;
      startAngle = endAngle;
      endAngle = temp;
    }
    
    // 각도가 180도 이상 차이나면 반대 방향으로 호 그리기
    if (endAngle - startAngle > PI) {
      const temp = startAngle;
      startAngle = endAngle;
      endAngle = temp + TWO_PI;
    }
    
    // 호 그리기
    for (let a = startAngle; a <= endAngle; a += 0.1) {
      const x = center.x + radius * cos(a);
      const y = center.y + radius * sin(a);
      vertex(x, y);
    }
    vertex(center.x, center.y);
    endShape(CLOSE);
    
    // 각도 표시 호
    noFill();
    stroke(this.colors.highlight);
    strokeWeight(2);
    const angleRadius = 30;
    arc(center.x, center.y, angleRadius * 2, angleRadius * 2, startAngle, endAngle);
    
    // 각도 값 계산 (라디안에서 도 단위로 변환)
    let angleDeg = degrees(abs(endAngle - startAngle));
    if (angleDeg > 180) angleDeg = 360 - angleDeg;
    
    // 각도 표시
    const midAngle = (startAngle + endAngle) / 2;
    const labelX = center.x + angleRadius * 1.5 * cos(midAngle);
    const labelY = center.y + angleRadius * 1.5 * sin(midAngle);
    
    textAlign(CENTER, CENTER);
    textSize(14);
    fill(this.colors.highlight);
    text(angleDeg.toFixed(1) + "°", labelX, labelY);
    
    // 레이블
    fill(this.colors.text);
    text("O", center.x - 15, center.y - 15);
    text("A", p1.x + 15, p1.y - 15);
    text("B", p2.x + 15, p2.y - 15);
    
    // 부채꼴 계산식
    const area = (angleDeg / 360) * PI * radius * radius;
    const arcLength = (angleDeg / 180) * PI * radius;
    
    textSize(14);
    textAlign(LEFT, TOP);
    fill(this.colors.text);
    text(`반지름 = ${radius.toFixed(1)}`, -this.gridSize + 20, -this.gridSize + 20);
    text(`호의 길이 = ${arcLength.toFixed(1)}`, -this.gridSize + 20, -this.gridSize + 45);
    text(`부채꼴 넓이 = ${area.toFixed(1)}`, -this.gridSize + 20, -this.gridSize + 70);
  }
  
  // 거리 계산
  distance(p1, p2) {
    return sqrt((p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y));
  }
  
  // 점과 직선 사이의 거리 계산
  distanceToLine(p, lineP1, lineP2) {
    const A = p.x - lineP1.x;
    const B = p.y - lineP1.y;
    const C = lineP2.x - lineP1.x;
    const D = lineP2.y - lineP1.y;
    
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    
    if (lenSq !== 0) param = dot / lenSq;
    
    let xx, yy;
    
    if (param < 0) {
      xx = lineP1.x;
      yy = lineP1.y;
    } else if (param > 1) {
      xx = lineP2.x;
      yy = lineP2.y;
    } else {
      xx = lineP1.x + param * C;
      yy = lineP1.y + param * D;
    }
    
    const dx = p.x - xx;
    const dy = p.y - yy;
    
    return sqrt(dx * dx + dy * dy);
  }
  
  // 외심 좌표 계산
  findCircumcenter(points) {
    const [a, b, c] = points;
    
    // 각 선분의 중점
    const abMidX = (a.x + b.x) / 2;
    const abMidY = (a.y + b.y) / 2;
    
    const bcMidX = (b.x + c.x) / 2;
    const bcMidY = (b.y + c.y) / 2;
    
    // 각 선분의 기울기 (수직)
    let abSlopePerp, bcSlopePerp;
    
    if (b.x - a.x === 0) {
      abSlopePerp = 0;
    } else {
      const abSlope = (b.y - a.y) / (b.x - a.x);
      abSlopePerp = -1 / abSlope;
    }
    
    if (c.x - b.x === 0) {
      bcSlopePerp = 0;
    } else {
      const bcSlope = (c.y - b.y) / (c.x - b.x);
      bcSlopePerp = -1 / bcSlope;
    }
    
    // 두 수직이등분선의 교점 계산
    let circumX, circumY;
    
    if (abSlopePerp === bcSlopePerp) {
      // 삼각형이 일직선 상에 있는 경우
      circumX = (a.x + b.x + c.x) / 3;
      circumY = (a.y + b.y + c.y) / 3;
    } else {
      // 수직이등분선의 y절편
      const abIntercept = abMidY - abSlopePerp * abMidX;
      const bcIntercept = bcMidY - bcSlopePerp * bcMidX;
      
      // 교점 계산
      circumX = (bcIntercept - abIntercept) / (abSlopePerp - bcSlopePerp);
      circumY = abSlopePerp * circumX + abIntercept;
    }
    
    return { x: circumX, y: circumY };
  }
  
  // 내심 좌표 계산
  findIncenter(points, sides) {
    const [a, b, c] = points;
    const [sideBC, sideAC, sideAB] = sides;
    
    // 가중 평균으로 내심 계산
    const incenterX = (sideBC * a.x + sideAC * b.x + sideAB * c.x) / (sideBC + sideAC + sideAB);
    const incenterY = (sideBC * a.y + sideAC * b.y + sideAB * c.y) / (sideBC + sideAC + sideAB);
    
    return { x: incenterX, y: incenterY };
  }
  
  // 마우스 이벤트
  mousePressed() {
    super.mousePressed();
    
    // 드래그 가능한 점 선택
    const mouseXRel = mouseX - width/2;
    const mouseYRel = mouseY - height/2;
    
    for (let i = 0; i < this.dragPoints.length; i++) {
      const p = this.dragPoints[i];
      const d = this.distance({x: mouseXRel, y: mouseYRel}, p);
      
      if (d < 15) {
        this.selectedPointIndex = i;
        this.isDragging = true;
        break;
      }
    }
  }
  
  mouseDragged() {
    super.mouseDragged();
    
    if (this.isDragging && this.selectedPointIndex !== -1) {
      const mouseXRel = mouseX - width/2;
      const mouseYRel = mouseY - height/2;
      
      // 점 위치 업데이트
      this.dragPoints[this.selectedPointIndex].x = mouseXRel;
      this.dragPoints[this.selectedPointIndex].y = mouseYRel;
    }
  }
  
  mouseReleased() {
    super.mouseReleased();
    this.isDragging = false;
  }
  
  // 키 이벤트 처리
  keyPressed() {
    if (key === 'g' || key === 'G') {
      // 다음 도형으로 변경
      this.currentShapeIndex = (this.currentShapeIndex + 1) % this.shapes.length;
      this.resetPoints();
    }
  }
} 