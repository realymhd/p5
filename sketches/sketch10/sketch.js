// sketch13/sketch.js - 만델브로 집합 (반복 횟수 기반 점진적 생성)

let minX = -2.0; let maxX = 1.0;
let minY = -1.2; let maxY = 1.2;
let maxIterations = 100; // 최대 반복 횟수
let escapeRadiusSq = 4;

// --- 계산 결과 저장 ---
let escapeIterations; // 각 픽셀의 발산 반복 횟수 저장 (2D 배열)

// --- 시각화 제어 ---
let currentIterationLevel = 1; // 현재 화면에 보여줄 최대 반복 횟수
let calculationDone = false;   // 사전 계산 완료 여부

function setup() {
  createCanvas(800, 600);
  pixelDensity(1);
  colorMode(HSB, 360, 100, 100);
  background(0); // 초기 배경 검정

  console.log("만델브로 집합 시각화 시작 (반복 기반 점진적 생성)...");

  // 사전 계산 시작
  console.time("Mandelbrot Pre-calculation");
  escapeIterations = calculateAllIterations();
  calculationDone = true;
  console.timeEnd("Mandelbrot Pre-calculation");
  console.log("사전 계산 완료.");

  // loop()는 기본적으로 켜져 있음
}

function draw() {
  if (!calculationDone) {
    // 계산이 끝나지 않았으면 대기 메시지 표시 (선택적)
    fill(255); textAlign(CENTER, CENTER); textSize(16);
    text("만델브로트 데이터 계산 중...", width / 2, height / 2);
    return;
  }

  if (currentIterationLevel > maxIterations) {
    // 모든 반복 레벨 표시 완료
    console.log("모든 반복 레벨 시각화 완료.");
    noLoop(); // 애니메이션 멈춤
    // 최종 모습 한 번 더 확실히 그리기 (선택적)
    // visualizeUpToIteration(maxIterations);
    return;
  }

  // 현재 반복 레벨까지의 모습 시각화
  visualizeUpToIteration(currentIterationLevel);

  // 정보 표시 (현재 시각화 레벨)
  fill(255); noStroke(); textSize(14); textAlign(LEFT);
  text(`시각화 반복 레벨: ${currentIterationLevel} / ${maxIterations}`, 10, height - 10);

  // 다음 프레임을 위해 시각화 레벨 증가
  currentIterationLevel++;

  // 속도 조절 필요 시 frameRate() 사용
  // frameRate(10); // 예: 초당 10 레벨씩 증가
}

// 모든 픽셀에 대해 최대 반복 횟수까지 계산하고 발산 횟수 반환
function calculateAllIterations() {
  let iterations = Array(width).fill(null).map(() => Array(height).fill(0));

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let a = map(x, 0, width, minX, maxX);
      let b = map(y, 0, height, maxY, minY);
      let ca = a; let cb = b;
      let za = 0; let zb = 0;
      let n = 0;

      while (n < maxIterations) {
        let zaa = za * za - zb * zb;
        let zbb = 2 * za * zb;
        za = zaa + ca;
        zb = zbb + cb;
        if (za * za + zb * zb > escapeRadiusSq) {
          break; // 발산
        }
        n++;
      }
      iterations[x][y] = n; // 발산한 시점의 n 저장 (발산 안 하면 maxIterations)
    }
  }
  return iterations;
}

// 특정 반복 레벨(maxIterLevel)까지의 결과를 시각화하는 함수
function visualizeUpToIteration(maxIterLevel) {
  loadPixels();
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let n = escapeIterations[x][y]; // 사전 계산된 발산 횟수

      let hue, saturation, brightness;

      // 현재 시각화 레벨보다 이전에 발산했거나, 레벨과 같다면 색상 표시
      if (n < maxIterLevel) {
         brightness = 100; saturation = 100;
         // n 값에 따라 색상 매핑 (이전과 동일 또는 다른 방식)
         hue = map(sqrt(n), 0, sqrt(maxIterLevel), 180, 360); // 레벨 따라 범위 조절
      } else {
         // 아직 발산 안 함 (현재 레벨 기준) 또는 집합 내부
         brightness = 0; hue = 0; saturation = 0; // 검정색
      }

      let pixIndex = (x + y * width) * 4;
      let c = color(hue, saturation, brightness);
      pixels[pixIndex + 0] = red(c);
      pixels[pixIndex + 1] = green(c);
      pixels[pixIndex + 2] = blue(c);
      pixels[pixIndex + 3] = 255;
    }
  }
  updatePixels();
}

// (선택적) 마우스 클릭 시 리셋 및 재시작
function mousePressed() {
    if (!looping) { // 멈췄을 때만 리셋
        console.log("리셋 및 다시 그리기");
        currentIterationLevel = 1;
        background(0); // 배경 초기화
        loop(); // 루프 다시 시작
    }
}