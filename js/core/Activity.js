class Activity {
  constructor(title, description) {
    this.title = title;
    this.description = description;
    this.isActive = false;
    this.controls = [];
    this.colors = {
      primary: color(58, 134, 255),     // #3a86ff
      secondary: color(255, 110, 49),   // #ff6e31
      highlight: color(249, 218, 71),   // #f9da47
      background: color(240, 245, 255), // #f0f5ff
      white: color(255),
      black: color(51, 51, 51)          // #333333
    };
  }

  // 활동이 활성화될 때 호출
  activate() {
    this.isActive = true;
    this.createControls();
    this.setup();
    
    // 활동 제목과 설명 업데이트
    document.getElementById('current-activity-title').innerText = this.title;
    document.getElementById('current-activity-desc').innerText = this.description;
    
    // 활동 버튼 스타일 업데이트
    const buttons = document.querySelectorAll('.activity-btn');
    buttons.forEach((btn, index) => {
      if (index === currentActivity) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // 활동이 비활성화될 때 호출
  deactivate() {
    this.isActive = false;
    this.removeControls();
  }

  // 컨트롤 요소 생성 메서드
  createControls() {
    const container = document.getElementById('controls-container');
    container.innerHTML = ''; // 기존 컨트롤 제거
    
    this.controls.forEach(control => {
      const group = document.createElement('div');
      group.className = 'control-group';
      
      // 레이블 생성
      const label = document.createElement('label');
      label.innerText = control.label;
      label.htmlFor = control.id;
      group.appendChild(label);
      
      // 컨트롤 타입에 따라 요소 생성
      switch(control.type) {
        case 'slider':
          const slider = document.createElement('input');
          slider.type = 'range';
          slider.id = control.id;
          slider.min = control.min || 0;
          slider.max = control.max || 100;
          slider.value = control.value || 0;
          slider.step = control.step || 1;
          slider.addEventListener('input', control.onChange);
          group.appendChild(slider);
          break;
          
        case 'button':
          const button = document.createElement('button');
          button.id = control.id;
          button.innerText = control.text || 'Button';
          button.addEventListener('click', control.onClick);
          group.appendChild(button);
          break;
          
        case 'select':
          const select = document.createElement('select');
          select.id = control.id;
          control.options.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option.value;
            opt.innerText = option.text;
            select.appendChild(opt);
          });
          select.value = control.value || control.options[0].value;
          select.addEventListener('change', control.onChange);
          group.appendChild(select);
          break;
      }
      
      container.appendChild(group);
    });
  }

  // 컨트롤 요소 제거 메서드
  removeControls() {
    const container = document.getElementById('controls-container');
    container.innerHTML = '';
  }

  // 기본 메서드들 (하위 클래스에서 오버라이드)
  setup() {}
  update() {}
  draw() {}
  
  // 이벤트 핸들러 (하위 클래스에서 오버라이드)
  mousePressed() {}
  mouseDragged() {}
  mouseReleased() {}
  keyPressed() {}
}