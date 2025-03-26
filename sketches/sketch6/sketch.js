// Sketch variables
let navigation;
let centerX, centerY;
let radius = 150;
let sides = 6;
let rotation = 0;
let showAngles = true;
let showSides = true;
let showArea = true;
let showPerimeter = true;

function setup() {
    createCanvas(800, 600);
    
    // Initialize navigation with back button
    navigation = new Navigation();
    navigation.setup();
    
    // Sketch-specific setup
    centerX = width/2;
    centerY = height/2;
    background(220);
}

function draw() {
    background(220);
    
    // Draw polygon
    push();
    translate(centerX, centerY);
    rotate(rotation);
    
    // Draw sides
    if (showSides) {
        stroke(0, 0, 255);
        strokeWeight(2);
        beginShape();
        for (let i = 0; i < sides; i++) {
            let angle = (i * TWO_PI) / sides;
            let x = cos(angle) * radius;
            let y = sin(angle) * radius;
            vertex(x, y);
        }
        endShape(CLOSE);
    }
    
    // Draw angles
    if (showAngles) {
        for (let i = 0; i < sides; i++) {
            let angle = (i * TWO_PI) / sides;
            let x = cos(angle) * radius;
            let y = sin(angle) * radius;
            
            // Draw angle arc
            push();
            translate(x, y);
            noFill();
            stroke(255, 0, 0);
            strokeWeight(2);
            let arcRadius = 30;
            let startAngle = angle + PI/2;
            let endAngle = angle + TWO_PI/sides + PI/2;
            arc(0, 0, arcRadius * 2, arcRadius * 2, startAngle, endAngle);
            
            // Draw angle text
            textAlign(CENTER, CENTER);
            textSize(16);
            fill(255, 0, 0);
            let textAngle = (startAngle + endAngle) / 2;
            let textX = cos(textAngle) * (arcRadius + 20);
            let textY = sin(textAngle) * (arcRadius + 20);
            text(nf(degrees(TWO_PI/sides), 0, 1) + '°', textX, textY);
            pop();
        }
    }
    
    // Draw side lengths
    if (showSides) {
        for (let i = 0; i < sides; i++) {
            let angle = (i * TWO_PI) / sides;
            let x1 = cos(angle) * radius;
            let y1 = sin(angle) * radius;
            let x2 = cos(angle + TWO_PI/sides) * radius;
            let y2 = sin(angle + TWO_PI/sides) * radius;
            
            let midX = (x1 + x2) / 2;
            let midY = (y1 + y2) / 2;
            
            textAlign(CENTER, CENTER);
            textSize(16);
            fill(0, 0, 255);
            let sideLength = 2 * radius * sin(PI/sides);
            text(nf(sideLength, 0, 1), midX, midY);
        }
    }
    pop();
    
    // Draw area and perimeter
    if (showArea) {
        textAlign(LEFT, TOP);
        textSize(16);
        fill(0, 0, 255);
        let area = (sides * radius * radius * sin(TWO_PI/sides)) / 2;
        text('넓이: ' + nf(area, 0, 1), 20, 20);
    }
    
    if (showPerimeter) {
        textAlign(LEFT, TOP);
        textSize(16);
        fill(0, 0, 255);
        let perimeter = sides * 2 * radius * sin(PI/sides);
        text('둘레: ' + nf(perimeter, 0, 1), 20, 40);
    }
    
    // Draw navigation elements on top
    navigation.draw();
}

function mousePressed() {
    // First check if navigation handles the click
    if (navigation.handleMousePressed()) {
        return false;
    }
    
    return false;
}

function mouseReleased() {
    navigation.handleMouseReleased();
}

function keyPressed() {
    switch(key) {
        case ' ':
            rotation = 0; // Reset rotation
            break;
        case 'a':
            showAngles = !showAngles; // Toggle angles
            break;
        case 's':
            showSides = !showSides; // Toggle sides
            break;
        case 'p':
            showPerimeter = !showPerimeter; // Toggle perimeter
            break;
        case 'r':
            showArea = !showArea; // Toggle area
            break;
        case 'ArrowLeft':
            sides = max(3, sides - 1); // Decrease sides
            break;
        case 'ArrowRight':
            sides = min(12, sides + 1); // Increase sides
            break;
        case 'ArrowUp':
            radius = min(radius + 10, 250); // Increase radius
            break;
        case 'ArrowDown':
            radius = max(radius - 10, 50); // Decrease radius
            break;
        case 'q':
            rotation -= 0.1; // Rotate counterclockwise
            break;
        case 'e':
            rotation += 0.1; // Rotate clockwise
            break;
    }
} 