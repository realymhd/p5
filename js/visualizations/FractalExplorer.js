class FractalExplorer extends Visualization {
  constructor() {
    super();
    
    // 프랙탈 속성
    this.maxIterations = 100;
    this.zoom = 1;
    this.centerX = 0;
    this.centerY = 0;
    
    // 프랙탈 유형 목록
    this.fractalTypes = [
      { name: "만델브로트 집합", fn: this.mandelbrot.bind(this) },
      { name: "줄리아 집합 (c = -0.7 + 0.27i)", fn: this.julia.bind(this) }
    ];
    
    this.currentFractalIndex = 0;
    
    // 색상 팔레트
    this.palette = [];
    for (let i = 0; i < 100; i++) {
      this.palette.push(color(
        127.5 * (1 + sin(i * 0.1)),
        127.5 * (1 + sin(i * 0.1 + 2)),
        127.5 * (1 + sin(i * 0.1 + 4))
      ));
    }
    
    // 미리 계산된 프랙탈 이미지
    this.fractalImage = null;
    
    // 색상 맵
    this.colors.background = color(0);
  }
  
  setup() {
    super.setup();
    // 초기 프랙탈 계산
    this.calculateFractal();
  }
  
  update() {
    // 프랙탈은 상호작용에만 업데이트됨
  }
  
  draw() {
    // 배경 설정
    background(this.colors.background);
    
    // 중앙에 그리기
    push();
    translate(width / 2, height / 2);
    
    // 프랙탈 그리기
    if (this.fractalImage) {
      imageMode(CENTER);
      image(this.fractalImage, 0, 0);
    }
    
    // 현재 프랙탈 이름 표시
    textAlign(CENTER, TOP);
    textSize(16);
    fill(255);
    text(this.fractalTypes[this.currentFractalIndex].name, 0, -height/2 + 30);
    
    // 조작 안내
    textAlign(CENTER, BOTTOM);
    textSize(14);
    fill(255);
    text("클릭: 줌 인, 우클릭: 줌 아웃, 'f': 프랙탈 변경", 0, height/2 - 20);
    
    pop();
  }
  
  // 프랙탈 계산
  calculateFractal() {
    // 계산을 위한 이미지 생성
    if (!this.fractalImage) {
      this.fractalImage = createGraphics(width, height);
    }
    
    this.fractalImage.background(0);
    
    // 현재 프랙탈 함수
    const fractalFn = this.fractalTypes[this.currentFractalIndex].fn;
    
    // 각 픽셀에 대해 계산
    const w = this.fractalImage.width;
    const h = this.fractalImage.height;
    
    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        // 픽셀 좌표를 복소수 좌표로 변환
        const zx = this.centerX + (x - w/2) / (0.5 * this.zoom * w);
        const zy = this.centerY + (y - h/2) / (0.5 * this.zoom * h);
        
        // 프랙탈 계산
        const iterations = fractalFn(zx, zy);
        
        // 컬러 매핑
        if (iterations < this.maxIterations) {
          const colorIndex = iterations % this.palette.length;
          this.fractalImage.set(x, y, this.palette[colorIndex]);
        } else {
          this.fractalImage.set(x, y, color(0));
        }
      }
    }
    
    this.fractalImage.updatePixels();
  }
  
  // 만델브로트 집합 계산
  mandelbrot(x0, y0) {
    let x = 0;
    let y = 0;
    let iteration = 0;
    
    while (x*x + y*y <= 4 && iteration < this.maxIterations) {
      const xtemp = x*x - y*y + x0;
      y = 2*x*y + y0;
      x = xtemp;
      iteration++;
    }
    
    return iteration;
  }
  
  // 줄리아 집합 계산
  julia(x, y) {
    // c = -0.7 + 0.27i
    const cx = -0.7;
    const cy = 0.27;
    let iteration = 0;
    
    while (x*x + y*y <= 4 && iteration < this.maxIterations) {
      const xtemp = x*x - y*y + cx;
      y = 2*x*y + cy;
      x = xtemp;
      iteration++;
    }
    
    return iteration;
  }
  
  // 마우스 이벤트
  mousePressed() {
    if (mouseButton === LEFT) {
      // 확대
      this.zoom *= 1.5;
      
      // 중심점 이동
      this.centerX += (mouseX - width/2) / (0.5 * this.zoom * width);
      this.centerY += (mouseY - height/2) / (0.5 * this.zoom * height);
      
      // 프랙탈 재계산
      this.calculateFractal();
    } else if (mouseButton === RIGHT) {
      // 축소
      this.zoom /= 1.5;
      this.calculateFractal();
    }
    
    return false;  // 기본 동작 방지
  }
  
  // 키 이벤트 처리
  keyPressed() {
    if (key === 'f' || key === 'F') {
      // 프랙탈 변경
      this.currentFractalIndex = (this.currentFractalIndex + 1) % this.fractalTypes.length;
      this.calculateFractal();
    } else if (key === 'r' || key === 'R') {
      // 리셋
      this.zoom = 1;
      this.centerX = 0;
      this.centerY = 0;
      this.calculateFractal();
    }
  }
  
  reset() {
    super.reset();
    // 프랙탈 속성 초기화
    this.zoom = 1;
    this.centerX = 0;
    this.centerY = 0;
    this.currentFractalIndex = 0;
    
    // 프랙탈 재계산
    this.calculateFractal();
  }
  
  deactivate() {
    super.deactivate();
    // 추가적인 정리 작업이 필요하면 여기에 구현
  }
} 