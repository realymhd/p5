class Button {
    constructor(id, label, x, y, width, callback, callbackObj) {
        this.id = id;
        this.label = label;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = 30;
        this.callback = callback;
        this.callbackObj = callbackObj;
        this.isPressed = false;
    }
    
    draw() {
        push();
        // Button background
        fill(this.isPressed ? '#555' : '#333');
        stroke('#fff');
        rect(this.x, this.y, this.width, this.height, 5);
        
        // Button text
        fill('#fff');
        noStroke();
        textAlign(CENTER, CENTER);
        text(this.label, this.x + this.width/2, this.y + this.height/2);
        pop();
    }
    
    isHit(x, y) {
        return x >= this.x && x <= this.x + this.width &&
               y >= this.y && y <= this.y + this.height;
    }
    
    pressIfHit(x, y) {
        if (this.isHit(x, y)) {
            this.isPressed = true;
            return true;
        }
        return false;
    }
    
    releaseButton(x, y) {
        if (this.isPressed && this.isHit(x, y) && this.callback) {
            this.callback.call(this.callbackObj);
        }
        this.isPressed = false;
    }
} 