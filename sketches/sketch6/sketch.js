// Sketch variables
let mic;                // 마이크 객체
let fft;                // FFT (Fast Fourier Transform) 객체
let amplitude;          // 진폭 분석기
let spectrum = [];      // 주파수 스펙트럼
let waveform = [];      // 파형
let beatDetect;         // 비트 감지기
let energy = 0;         // 에너지 레벨
let smoothEnergy = 0;   // 부드러운 에너지 값
let bassEnergy = 0;     // 저음 에너지
let midEnergy = 0;      // 중음 에너지
let highEnergy = 0;     // 고음 에너지
let beatDetected = false; // 비트 감지 여부

// 시각화 설정
let visualizationMode = 0;  // 시각화 모드 (0: 주파수, 1: 파형, 2: 원형, 3: 파티클)
let useColor = true;        // 색상 사용 여부
let showInfo = true;        // 정보 표시 여부
let songLoaded = false;     // 노래 로드 여부
let song;                   // 노래 객체
let useMic = true;          // 마이크 사용 여부

// 파티클 시스템
let particles = [];         // 파티클 배열
let maxParticles = 100;     // 최대 파티클 수

// 시각화 색상
let colors = [
    [255, 50, 50],      // 빨강
    [255, 150, 50],     // 주황
    [255, 255, 50],     // 노랑
    [50, 255, 50],      // 초록
    [50, 150, 255],     // 파랑
    [200, 50, 255]      // 보라
];

function preload() {
    // 오디오 파일 로드 (기본 노래)
    soundFormats('mp3', 'ogg');
    try {
        song = loadSound('assets/sample.mp3');
        songLoaded = true;
    } catch (error) {
        console.log('오디오 파일을 로드할 수 없습니다: ', error);
        songLoaded = false;
    }
}

function setup() {
    createCanvas(800, 600);
    
    // 오디오 입력 설정
    userStartAudio(); // p5.sound에 필요한 오디오 컨텍스트 시작
    
    // 마이크 설정
    mic = new p5.AudioIn();
    mic.start();
    
    // FFT 분석기 설정
    fft = new p5.FFT(0.8, 512);
    if (useMic) {
        fft.setInput(mic);
    } else if (songLoaded) {
        fft.setInput(song);
    }
    
    // 진폭 분석기 설정
    amplitude = new p5.Amplitude();
    amplitude.setInput(mic);
    
    // 파티클 생성
    for (let i = 0; i < maxParticles; i++) {
        particles.push(new Particle());
    }
    
    // 노래 재생 여부 확인
    if (songLoaded && !useMic) {
        song.loop();
    }
    
    // 매끄러운 렌더링을 위한 설정
    smooth();
}

function draw() {
    // 배경 그리기 (에너지에 따라 살짝 변화)
    background(20 + smoothEnergy * 10, 10, 30 + smoothEnergy * 20);
    
    // 오디오 분석
    analyzeAudio();
    
    // 선택된 시각화 모드에 따라 그리기
    switch (visualizationMode) {
        case 0:
            drawFrequencyVisualization();
            break;
        case 1:
            drawWaveformVisualization();
            break;
        case 2:
            drawCircularVisualization();
            break;
        case 3:
            drawParticleVisualization();
            break;
    }
    
    // 비트 감지 및 시각 효과
    detectBeat();
    
    // 2D 레이어에 UI 그리기
    drawUI();
}

function analyzeAudio() {
    // 주파수 스펙트럼 분석
    spectrum = fft.analyze();
    
    // 파형 분석
    waveform = fft.waveform();
    
    // 전체 에너지 레벨
    energy = amplitude.getLevel();
    smoothEnergy = lerp(smoothEnergy, energy, 0.1);
    
    // 주파수 대역별 에너지 레벨
    bassEnergy = fft.getEnergy("bass");
    midEnergy = fft.getEnergy("mid");
    highEnergy = fft.getEnergy("treble");
}

function detectBeat() {
    // 간단한 비트 감지 (저음 영역의 급격한 증가)
    let threshold = 150;
    let decay = 0.98;
    
    if (bassEnergy > threshold && !beatDetected) {
        beatDetected = true;
        
        // 비트 감지시 화면 깜박임 효과
        push();
        noStroke();
        fill(255, 50);
        rect(0, 0, width, height);
        pop();
    }
    
    // 비트 감지 상태 업데이트
    if (bassEnergy < threshold * decay) {
        beatDetected = false;
    }
}

function drawFrequencyVisualization() {
    push();
    // 주파수 스펙트럼 그리기
    noStroke();
    
    let barWidth = width / (spectrum.length * 0.7);
    
    for (let i = 0; i < spectrum.length * 0.7; i++) {
        let x = i * barWidth;
        let h = map(spectrum[i], 0, 255, 0, height * 0.8);
        
        // 색상 설정 (주파수에 따라 변화)
        if (useColor) {
            let colorIndex = floor(map(i, 0, spectrum.length * 0.7, 0, colors.length - 1));
            let alpha = map(spectrum[i], 0, 255, 100, 255);
            fill(colors[colorIndex][0], colors[colorIndex][1], colors[colorIndex][2], alpha);
        } else {
            fill(200, map(spectrum[i], 0, 255, 100, 255));
        }
        
        // 막대 그리기
        rect(x, height, barWidth - 1, -h);
        
        // 비트 감지시 상단에 강조점 추가
        if (beatDetected && spectrum[i] > 200) {
            fill(255);
            ellipse(x + barWidth/2, height - h - 5, 4, 4);
        }
    }
    pop();
}

function drawWaveformVisualization() {
    push();
    // 파형 그리기
    noFill();
    strokeWeight(2);
    
    beginShape();
    for (let i = 0; i < waveform.length; i++) {
        let x = map(i, 0, waveform.length, 0, width);
        let y = map(waveform[i], -1, 1, height * 0.25, height * 0.75);
        
        // 색상 설정 (파형 위치에 따라 변화)
        if (useColor) {
            let colorIndex = floor(map(y, height * 0.25, height * 0.75, 0, colors.length - 1));
            stroke(colors[colorIndex][0], colors[colorIndex][1], colors[colorIndex][2], 200);
        } else {
            stroke(200, 200);
        }
        
        vertex(x, y);
        
        // 추가 효과: 점들도 그리기
        if (i % 20 === 0) {
            noStroke();
            if (useColor) {
                let colorIndex = floor(map(y, height * 0.25, height * 0.75, 0, colors.length - 1));
                fill(colors[colorIndex][0], colors[colorIndex][1], colors[colorIndex][2], 200);
            } else {
                fill(255, 200);
            }
            ellipse(x, y, 4, 4);
            stroke(200, 200);
        }
    }
    endShape();
    
    // 에너지 막대
    drawEnergyBars();
    pop();
}

function drawCircularVisualization() {
    push();
    // 원형 스펙트럼 그리기
    translate(width/2, height/2);
    
    // 원형 주파수 스펙트럼
    let radius = 150;
    let scale = 1.5;
    
    strokeWeight(2);
    for (let i = 0; i < 360; i += 3) {
        let angle = radians(i);
        let freq = floor(map(i, 0, 360, 0, spectrum.length - 1));
        let value = spectrum[freq];
        let r1 = radius;
        let r2 = radius + map(value, 0, 255, 0, 200) * scale;
        
        // 색상 설정
        if (useColor) {
            let colorIndex = floor(map(i, 0, 360, 0, colors.length - 1));
            stroke(colors[colorIndex][0], colors[colorIndex][1], colors[colorIndex][2], 150);
        } else {
            stroke(200, 150);
        }
        
        line(r1 * cos(angle), r1 * sin(angle), r2 * cos(angle), r2 * sin(angle));
    }
    
    // 중심 원
    noStroke();
    fill(255, 100);
    ellipse(0, 0, radius * 2 * smoothEnergy, radius * 2 * smoothEnergy);
    
    // 주파수 대역별 원
    noFill();
    strokeWeight(3);
    
    // 저음 원
    stroke(255, 50, 50, 100);
    let bassRadius = map(bassEnergy, 0, 255, radius * 0.8, radius * 1.2);
    ellipse(0, 0, bassRadius * 2, bassRadius * 2);
    
    // 중음 원
    stroke(50, 255, 50, 100);
    let midRadius = map(midEnergy, 0, 255, radius * 1.3, radius * 1.6);
    ellipse(0, 0, midRadius * 2, midRadius * 2);
    
    // 고음 원
    stroke(50, 50, 255, 100);
    let highRadius = map(highEnergy, 0, 255, radius * 1.7, radius * 2.0);
    ellipse(0, 0, highRadius * 2, highRadius * 2);
    
    pop();
}

function drawParticleVisualization() {
    push();
    // 파티클 시스템 업데이트 및 표시
    let particlesToShow = floor(map(energy * 10, 0, 1, 10, maxParticles));
    
    // 비트 감지 시 추가 파티클 생성
    if (beatDetected) {
        particlesToShow = maxParticles;
    }
    
    // 파티클 업데이트 및 표시
    for (let i = 0; i < particlesToShow; i++) {
        particles[i].update(bassEnergy, midEnergy, highEnergy);
        particles[i].display(useColor);
    }
    
    // 중앙 주파수 원
    drawCentralFrequencyCircle();
    pop();
}

function drawCentralFrequencyCircle() {
    // 중앙에 주파수를 표시하는 원 그리기
    push();
    translate(width/2, height/2);
    
    let count = 32;
    let radius = 100;
    
    beginShape();
    for (let i = 0; i <= count; i++) {
        let angle = map(i, 0, count, 0, TWO_PI);
        let freq = floor(map(i, 0, count, 0, 128));
        let r = radius + map(spectrum[freq], 0, 255, 0, 100);
        
        if (useColor) {
            let colorIndex = floor(map(i, 0, count, 0, colors.length - 1));
            stroke(colors[colorIndex][0], colors[colorIndex][1], colors[colorIndex][2], 200);
        } else {
            stroke(200, 200);
        }
        
        let x = r * cos(angle);
        let y = r * sin(angle);
        curveVertex(x, y);
        
        // 첫 점과 마지막 점을 추가로 반복해서 곡선을 부드럽게
        if (i === 0) {
            curveVertex(x, y);
        }
        if (i === count) {
            curveVertex(x, y);
        }
    }
    endShape(CLOSE);
    pop();
}

function drawEnergyBars() {
    // 주파수 대역별 에너지 막대 그리기
    push();
    translate(20, height - 80);
    
    // 레이블
    fill(255);
    textSize(12);
    text("저음", 0, 15);
    text("중음", 0, 35);
    text("고음", 0, 55);
    
    // 막대 그리기
    let barWidth = 150;
    
    // 저음
    fill(255, 50, 50, 200);
    rect(40, 5, map(bassEnergy, 0, 255, 0, barWidth), 10);
    
    // 중음
    fill(50, 255, 50, 200);
    rect(40, 25, map(midEnergy, 0, 255, 0, barWidth), 10);
    
    // 고음
    fill(50, 50, 255, 200);
    rect(40, 45, map(highEnergy, 0, 255, 0, barWidth), 10);
    
    pop();
}

function drawUI() {
    push();
    
    if (showInfo) {
        // 왼쪽 상단 정보 패널
        fill(0, 0, 30, 200);
        rect(20, 20, 200, 150, 5);
        
        fill(255);
        textSize(16);
        text("오디오 시각화", 30, 40);
        text("입력: " + (useMic ? "마이크" : "음악 파일"), 30, 65);
        text("시각화 모드: " + getVisualizationName(), 30, 90);
        text("색상: " + (useColor ? "켜짐" : "꺼짐"), 30, 115);
        text("전체 에너지: " + nf(energy, 1, 2), 30, 140);
        text("비트 감지: " + (beatDetected ? "감지됨" : "없음"), 30, 165);
    }
    
    // 조작 방법 안내
    fill(0, 0, 30, 200);
    rect(580, 10, 200, 150, 5);
    fill(255);
    textSize(14);
    text("조작 방법:", 590, 30);
    text("'v' 키: 시각화 모드 변경", 590, 50);
    text("'c' 키: 색상 켜기/끄기", 590, 70);
    text("'i' 키: 정보 표시/숨기기", 590, 90);
    text("'m' 키: 마이크/음악 전환", 590, 110);
    text("'p' 키: 음악 재생/일시정지", 590, 130);
    text("현재 모드: " + getVisualizationName(), 590, 150);
    
    pop();
}

function getVisualizationName() {
    switch (visualizationMode) {
        case 0: return "주파수 스펙트럼";
        case 1: return "파형";
        case 2: return "원형";
        case 3: return "파티클";
        default: return "알 수 없음";
    }
}

function toggleAudioSource() {
    // 오디오 소스 전환 (마이크 <-> 음악)
    useMic = !useMic;
    
    if (useMic) {
        // 마이크로 전환
        fft.setInput(mic);
        amplitude.setInput(mic);
        if (songLoaded && song.isPlaying()) {
            song.pause();
        }
    } else if (songLoaded) {
        // 음악으로 전환
        fft.setInput(song);
        amplitude.setInput(song);
        song.loop();
    }
}

function togglePlayPause() {
    // 음악 재생/일시정지 토글
    if (!useMic && songLoaded) {
        if (song.isPlaying()) {
            song.pause();
        } else {
            song.play();
        }
    }
}

function keyPressed() {
    if (key === 'v' || key === 'V') {
        // 시각화 모드 변경
        visualizationMode = (visualizationMode + 1) % 4;
    } else if (key === 'c' || key === 'C') {
        // 색상 켜기/끄기
        useColor = !useColor;
    } else if (key === 'i' || key === 'I') {
        // 정보 표시/숨기기
        showInfo = !showInfo;
    } else if (key === 'm' || key === 'M') {
        // 오디오 소스 전환
        toggleAudioSource();
    } else if (key === 'p' || key === 'P') {
        // 음악 재생/일시정지
        togglePlayPause();
    }
}

// 파티클 클래스
class Particle {
    constructor() {
        this.resetPosition();
        this.vel = createVector(random(-1, 1), random(-1, 1));
        this.acc = createVector(0, 0);
        this.size = random(3, 10);
        this.color = colors[floor(random(colors.length))];
        this.alpha = random(100, 200);
        this.lifespan = 255;
        this.decay = random(0.5, 2);
    }
    
    resetPosition() {
        // 화면 중앙에서 시작
        this.pos = createVector(
            width/2 + random(-50, 50),
            height/2 + random(-50, 50)
        );
    }
    
    update(bassEnergy, midEnergy, highEnergy) {
        // 주파수 에너지에 따른 움직임 패턴
        let noiseScale = 0.01;
        let noiseVal = noise(this.pos.x * noiseScale, this.pos.y * noiseScale, frameCount * 0.01);
        
        // 힘 적용
        let angle = noiseVal * TWO_PI * 2;
        let strength = map(noiseVal, 0, 1, 0, 2);
        
        // 주파수 대역별 영향
        let bassFactor = map(bassEnergy, 0, 255, 0, 0.3);
        let midFactor = map(midEnergy, 0, 255, 0, 0.2);
        let highFactor = map(highEnergy, 0, 255, 0, 0.1);
        
        // 최종 힘 계산
        let force = p5.Vector.fromAngle(angle);
        force.mult(strength);
        this.acc.add(force);
        
        // 중앙으로 약한 인력 추가
        let center = createVector(width/2, height/2);
        let dir = p5.Vector.sub(center, this.pos);
        dir.normalize();
        dir.mult(0.2);
        this.acc.add(dir);
        
        // 주파수 대역별 영향 적용
        this.vel.add(this.acc);
        this.vel.mult(0.95); // 감쇠
        this.vel.add(createVector(random(-bassFactor, bassFactor), random(-bassFactor, bassFactor)));
        
        // 크기 변화
        this.size = 3 + bassEnergy * 0.05 + midEnergy * 0.02;
        
        // 위치 업데이트
        this.pos.add(this.vel);
        this.acc.mult(0);
        
        // 생명 주기 감소
        this.lifespan -= this.decay;
        
        // 화면 경계 확인 및 재설정
        if (this.lifespan < 0 || 
            this.pos.x < 0 || this.pos.x > width || 
            this.pos.y < 0 || this.pos.y > height) {
            this.resetPosition();
            this.lifespan = 255;
        }
    }
    
    display(useColor) {
        push();
        noStroke();
        
        // 색상 설정
        if (useColor) {
            fill(this.color[0], this.color[1], this.color[2], this.lifespan);
        } else {
            fill(200, this.lifespan);
        }
        
        // 파티클 그리기
        ellipse(this.pos.x, this.pos.y, this.size, this.size);
        
        // 잔상 효과 (속도 방향으로)
        let tailLength = this.vel.mag() * 5;
        if (tailLength > 1) {
            let tailDir = this.vel.copy().normalize();
            
            for (let i = 1; i <= 3; i++) {
                let tailPos = p5.Vector.sub(this.pos, p5.Vector.mult(tailDir, i * tailLength/3));
                let tailSize = this.size * (1 - i/3);
                let tailAlpha = this.lifespan * (1 - i/3);
                
                if (useColor) {
                    fill(this.color[0], this.color[1], this.color[2], tailAlpha);
                } else {
                    fill(200, tailAlpha);
                }
                
                ellipse(tailPos.x, tailPos.y, tailSize, tailSize);
            }
        }
        
        pop();
    }
} 