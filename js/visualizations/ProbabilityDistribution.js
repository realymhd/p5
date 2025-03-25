class ProbabilityDistribution extends Visualization {
  constructor() {
    super();
    
    // 분포 속성
    this.graphWidth = 600;
    this.graphHeight = 300;
    this.samples = 1000;
    this.barWidth = 20;
    
    // 분포 목록
    this.distributions = [
      {
        name: "정규 분포 (Normal)",
        generator: () => this.normalRandom(),
        color: color(50, 150, 255),
        mean: 0,
        stdDev: 1
      },
      {
        name: "균등 분포 (Uniform)",
        generator: () => random(-3, 3),
        color: color(255, 150, 50),
        min: -3,
        max: 3
      },
      {
        name: "지수 분포 (Exponential)",
        generator: () => this.exponentialRandom(1),
        color: color(50, 200, 100),
        lambda: 1
      },
      {
        name: "이항 분포 (Binomial)",
        generator: () => this.binomialRandom(10, 0.5),
        color: color(200, 100, 200),
        n: 10,
        p: 0.5
      }
    ];
    
    // 현재 선택된 분포
    this.currentDistIndex = 0;
    
    // 생성된 샘플
    this.samples = [];
    this.histogram = {};
    this.maxCount = 0;
    
    // 애니메이션 속성
    this.isAnimating = false;
    this.animationStep = 0;
    this.animationDelay = 5;
    
    // 컬러 개인화
    this.colors.background = color(250);
    this.colors.axes = color(100);
    this.colors.text = color(50);
  }
  
  setup() {
    super.setup();
    // 초기 샘플 생성
    this.generateSamples();
  }
  
  reset() {
    super.reset();
    // 분포 선택 및 샘플 초기화
    this.currentDistIndex = 0;
    this.samples = [];
    this.histogram = {};
    this.maxCount = 0;
    
    // 샘플 재생성
    this.generateSamples();
  }
  
  deactivate() {
    super.deactivate();
    // 애니메이션 중지
    this.isAnimating = false;
  }
  
  update() {
    // 애니메이션 업데이트
    if (this.isAnimating) {
      if (frameCount % this.animationDelay === 0) {
        // 새 샘플 하나 추가
        this.animationStep++;
        
        if (this.animationStep < 500) {
          const value = this.distributions[this.currentDistIndex].generator();
          this.addSample(value);
        } else {
          this.isAnimating = false;
        }
      }
    }
  }
  
  draw() {
    // 배경 설정
    background(this.colors.background);
    
    // 중앙에 그리기
    push();
    translate(width / 2, height / 2);
    
    // 현재 분포 이름 표시
    textAlign(CENTER, TOP);
    textSize(18);
    fill(this.colors.text);
    text(this.distributions[this.currentDistIndex].name, 0, -height/2 + 30);
    
    // 설명 표시
    textAlign(CENTER, BOTTOM);
    textSize(14);
    text("Press 'd' to change distribution, 'r' to regenerate samples", 0, height/2 - 20);
    
    // 분포 그래프 그리기
    this.drawDistribution();
    
    // 이론적 확률밀도함수 곡선 그리기
    this.drawPDF();
    
    pop();
  }
  
  // 확률 분포 그래프 그리기
  drawDistribution() {
    // 축 그리기
    stroke(this.colors.axes);
    strokeWeight(2);
    
    // X축
    line(-this.graphWidth/2, this.graphHeight/2, 
         this.graphWidth/2, this.graphHeight/2);
    
    // Y축
    line(-this.graphWidth/2, this.graphHeight/2, 
         -this.graphWidth/2, -this.graphHeight/2);
    
    // X축 레이블
    textAlign(CENTER, TOP);
    textSize(14);
    fill(this.colors.text);
    text("Value", 0, this.graphHeight/2 + 20);
    
    // Y축 레이블
    textAlign(CENTER, CENTER);
    push();
    translate(-this.graphWidth/2 - 40, 0);
    rotate(-PI/2);
    text("Frequency", 0, 0);
    pop();
    
    // 히스토그램 그리기
    noStroke();
    const dist = this.distributions[this.currentDistIndex];
    fill(dist.color);
    
    // 각 막대 그리기
    for (const key in this.histogram) {
      const value = parseFloat(key);
      const count = this.histogram[key];
      const barHeight = (count / this.maxCount) * this.graphHeight;
      
      // 위치 계산
      const x = map(value, -4, 4, -this.graphWidth/2, this.graphWidth/2) - this.barWidth/2;
      const y = this.graphHeight/2 - barHeight;
      
      // 막대 그리기
      rect(x, y, this.barWidth, barHeight);
    }
    
    // 통계 정보 표시
    textAlign(LEFT, TOP);
    textSize(14);
    fill(this.colors.text);
    
    const stats = this.calculateStats();
    let infoText = "";
    
    if ("mean" in dist) {
      infoText += `이론적 평균: ${dist.mean.toFixed(2)}, `;
    } else if ("min" in dist && "max" in dist) {
      infoText += `범위: [${dist.min}, ${dist.max}], `;
    }
    
    if ("stdDev" in dist) {
      infoText += `이론적 표준편차: ${dist.stdDev.toFixed(2)}, `;
    } else if ("lambda" in dist) {
      infoText += `Lambda: ${dist.lambda.toFixed(2)}, `;
    } else if ("n" in dist && "p" in dist) {
      infoText += `n: ${dist.n}, p: ${dist.p}, `;
    }
    
    infoText += `\n샘플 평균: ${stats.mean.toFixed(2)}, 샘플 표준편차: ${stats.stdDev.toFixed(2)}`;
    infoText += `\n샘플 수: ${stats.count}`;
    
    text(infoText, -this.graphWidth/2 + 10, -this.graphHeight/2 + 10);
  }
  
  // 이론적 확률밀도함수 그리기
  drawPDF() {
    const dist = this.distributions[this.currentDistIndex];
    
    // PDF 그래프 그리기
    stroke(dist.color);
    strokeWeight(2);
    noFill();
    
    beginShape();
    for (let x = -4; x <= 4; x += 0.1) {
      let y;
      
      // 각 분포 유형별 PDF 계산
      if (dist.name.includes("Normal")) {
        y = this.normalPDF(x, dist.mean, dist.stdDev);
      } else if (dist.name.includes("Uniform")) {
        y = (x >= dist.min && x <= dist.max) ? 1 / (dist.max - dist.min) : 0;
      } else if (dist.name.includes("Exponential")) {
        y = (x >= 0) ? dist.lambda * Math.exp(-dist.lambda * x) : 0;
      } else if (dist.name.includes("Binomial")) {
        // 이항 분포는 이산적이므로 점으로 표시
        continue;
      }
      
      // PDF 값 스케일링
      const scaledY = map(y, 0, this.getPDFMax(), 0, this.graphHeight);
      const graphX = map(x, -4, 4, -this.graphWidth/2, this.graphWidth/2);
      const graphY = this.graphHeight/2 - scaledY;
      
      vertex(graphX, graphY);
    }
    endShape();
    
    // 이항 분포는 별도 처리
    if (dist.name.includes("Binomial")) {
      for (let k = 0; k <= dist.n; k++) {
        const prob = this.binomialPMF(k, dist.n, dist.p);
        const scaledY = map(prob, 0, this.getPDFMax(), 0, this.graphHeight);
        const graphX = map(k, -4, 14, -this.graphWidth/2, this.graphWidth/2);
        const graphY = this.graphHeight/2 - scaledY;
        
        fill(dist.color);
        noStroke();
        ellipse(graphX, graphY, 6, 6);
      }
    }
  }
  
  // 최대 PDF 값 반환
  getPDFMax() {
    const dist = this.distributions[this.currentDistIndex];
    
    if (dist.name.includes("Normal")) {
      return this.normalPDF(dist.mean, dist.mean, dist.stdDev);
    } else if (dist.name.includes("Uniform")) {
      return 1 / (dist.max - dist.min);
    } else if (dist.name.includes("Exponential")) {
      return dist.lambda;
    } else if (dist.name.includes("Binomial")) {
      let max = 0;
      for (let k = 0; k <= dist.n; k++) {
        const prob = this.binomialPMF(k, dist.n, dist.p);
        if (prob > max) max = prob;
      }
      return max;
    }
    
    return 1;
  }
  
  // 정규 분포 PDF
  normalPDF(x, mean, stdDev) {
    return (1 / (stdDev * sqrt(2 * PI))) * 
           exp(-0.5 * pow((x - mean) / stdDev, 2));
  }
  
  // 이항 분포 PMF
  binomialPMF(k, n, p) {
    return this.combinations(n, k) * pow(p, k) * pow(1 - p, n - k);
  }
  
  // 조합 계산 (nCk)
  combinations(n, k) {
    let result = 1;
    for (let i = 1; i <= k; i++) {
      result *= (n - (k - i));
      result /= i;
    }
    return result;
  }
  
  // 샘플 생성
  generateSamples() {
    this.samples = [];
    this.histogram = {};
    this.maxCount = 0;
    
    // 애니메이션 시작
    this.isAnimating = true;
    this.animationStep = 0;
  }
  
  // 샘플 추가 및 히스토그램 업데이트
  addSample(value) {
    this.samples.push(value);
    
    // 히스토그램 빈 결정 (반올림)
    const bin = Math.round(value * 2) / 2; // 0.5 단위로 반올림
    
    if (!this.histogram[bin]) {
      this.histogram[bin] = 0;
    }
    
    this.histogram[bin]++;
    
    if (this.histogram[bin] > this.maxCount) {
      this.maxCount = this.histogram[bin];
    }
  }
  
  // 통계 계산
  calculateStats() {
    if (this.samples.length === 0) {
      return { mean: 0, stdDev: 0, count: 0 };
    }
    
    const mean = this.samples.reduce((sum, val) => sum + val, 0) / this.samples.length;
    
    const variance = this.samples.reduce((sum, val) => {
      return sum + Math.pow(val - mean, 2);
    }, 0) / this.samples.length;
    
    return {
      mean: mean,
      stdDev: Math.sqrt(variance),
      count: this.samples.length
    };
  }
  
  // 정규 분포 난수 생성 (Box-Muller 변환)
  normalRandom() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return z;
  }
  
  // 지수 분포 난수 생성
  exponentialRandom(lambda) {
    return -Math.log(Math.random()) / lambda;
  }
  
  // 이항 분포 난수 생성
  binomialRandom(n, p) {
    let count = 0;
    for (let i = 0; i < n; i++) {
      if (Math.random() < p) {
        count++;
      }
    }
    return count;
  }
  
  // 키 이벤트 처리
  keyPressed() {
    if (key === 'd' || key === 'D') {
      // 분포 변경
      this.currentDistIndex = (this.currentDistIndex + 1) % this.distributions.length;
      this.generateSamples();
    } else if (key === 'r' || key === 'R') {
      // 새 샘플 생성
      this.generateSamples();
    }
  }
} 