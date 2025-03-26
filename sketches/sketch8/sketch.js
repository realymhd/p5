// Sketch variables
let navigation;
let points = [];
let isDragging = false;
let draggedPoint = -1;
let showGrid = true;
let showAngles = true;
let showSides = true;
let showArea = true;
let showHeight = true;
let showMedian = true;

function setup() {
    createCanvas(800, 600);
    
    // Initialize navigation with back button
    navigation = new Navigation();
    navigation.setup();
    
    // Sketch-specific setup
    background(220);
    
    // Initialize trapezoid points
    points = [
        {x: 200, y: 400}, // Bottom left
        {x: 400, y: 400}, // Bottom right
        {x: 350, y: 200}, // Top right
        {x: 250, y: 200}  // Top left
    ];
}

function draw() {
    background(220);
    
    // Draw grid
    if (showGrid) {
        drawGrid();
    }
    
    // Draw trapezoid
    drawTrapezoid();
    
    // Draw navigation elements on top
    navigation.draw();
}

function drawGrid() {
    stroke(200);
    strokeWeight(1);
    
    // Draw vertical lines
    for (let x = 0; x < width; x += 50) {
        line(x, 0, x, height);
    }
    
    // Draw horizontal lines
    for (let y = 0; y < height; y += 50) {
        line(0, y, width, y);
    }
}

function drawTrapezoid() {
    // Draw sides
    if (showSides) {
        stroke(0, 0, 255);
        strokeWeight(2);
        beginShape();
        for (let p of points) {
            vertex(p.x, p.y);
        }
        endShape(CLOSE);
    }
    
    // Draw angles
    if (showAngles) {
        for (let i = 0; i < points.length; i++) {
            let prev = points[(i - 1 + points.length) % points.length];
            let curr = points[i];
            let next = points[(i + 1) % points.length];
            
            let angle = calculateAngle(prev, curr, next);
            
            // Draw angle arc
            push();
            translate(curr.x, curr.y);
            noFill();
            stroke(255, 0, 0);
            strokeWeight(2);
            let radius = 30;
            let startAngle = atan2(prev.y - curr.y, prev.x - curr.x);
            let endAngle = atan2(next.y - curr.y, next.x - curr.x);
            arc(0, 0, radius * 2, radius * 2, startAngle, endAngle);
            
            // Draw angle text
            textAlign(CENTER, CENTER);
            textSize(16);
            fill(255, 0, 0);
            let textAngle = (startAngle + endAngle) / 2;
            let textX = cos(textAngle) * (radius + 20);
            let textY = sin(textAngle) * (radius + 20);
            text(nf(degrees(angle), 0, 1) + '°', textX, textY);
            pop();
        }
    }
    
    // Draw side lengths
    if (showSides) {
        for (let i = 0; i < points.length; i++) {
            let curr = points[i];
            let next = points[(i + 1) % points.length];
            
            let length = dist(curr.x, curr.y, next.x, next.y);
            let midX = (curr.x + next.x) / 2;
            let midY = (curr.y + next.y) / 2;
            
            textAlign(CENTER, CENTER);
            textSize(16);
            fill(0, 0, 255);
            text(nf(length, 0, 1), midX, midY);
        }
    }
    
    // Draw height
    if (showHeight) {
        let base1 = points[1].x - points[0].x;
        let base2 = points[2].x - points[3].x;
        let height = points[3].y - points[0].y;
        
        stroke(0, 255, 0);
        strokeWeight(2);
        line(points[0].x, points[0].y, points[0].x, points[3].y);
        
        textAlign(LEFT, TOP);
        textSize(16);
        fill(0, 255, 0);
        text('높이: ' + nf(height, 0, 1), points[0].x + 10, points[0].y + 10);
    }
    
    // Draw median
    if (showMedian) {
        let midLeft = {
            x: (points[0].x + points[3].x) / 2,
            y: (points[0].y + points[3].y) / 2
        };
        let midRight = {
            x: (points[1].x + points[2].x) / 2,
            y: (points[1].y + points[2].y) / 2
        };
        
        stroke(255, 165, 0);
        strokeWeight(2);
        line(midLeft.x, midLeft.y, midRight.x, midRight.y);
        
        let medianLength = dist(midLeft.x, midLeft.y, midRight.x, midRight.y);
        let midX = (midLeft.x + midRight.x) / 2;
        let midY = (midLeft.y + midRight.y) / 2;
        
        textAlign(CENTER, CENTER);
        textSize(16);
        fill(255, 165, 0);
        text('중선: ' + nf(medianLength, 0, 1), midX, midY - 20);
    }
    
    // Draw area
    if (showArea) {
        let base1 = points[1].x - points[0].x;
        let base2 = points[2].x - points[3].x;
        let height = points[3].y - points[0].y;
        let area = ((base1 + base2) * height) / 2;
        
        textAlign(LEFT, TOP);
        textSize(16);
        fill(0, 0, 255);
        text('넓이: ' + nf(area, 0, 1), 20, 20);
    }
    
    // Draw points
    for (let p of points) {
        fill(255, 0, 0);
        noStroke();
        circle(p.x, p.y, 10);
    }
}

function calculateAngle(p1, p2, p3) {
    let v1 = createVector(p1.x - p2.x, p1.y - p2.y);
    let v2 = createVector(p3.x - p2.x, p3.y - p2.y);
    let angle = v1.angleBetween(v2);
    return abs(angle);
}

function mousePressed() {
    // First check if navigation handles the click
    if (navigation.handleMousePressed()) {
        return false;
    }
    
    // Check if clicked on a point
    for (let i = 0; i < points.length; i++) {
        let p = points[i];
        let d = dist(mouseX, mouseY, p.x, p.y);
        if (d < 10) {
            isDragging = true;
            draggedPoint = i;
            return false;
        }
    }
    
    return false;
}

function mouseReleased() {
    navigation.handleMouseReleased();
    isDragging = false;
    draggedPoint = -1;
}

function mouseDragged() {
    if (isDragging && draggedPoint >= 0) {
        // Snap to grid
        points[draggedPoint].x = round(mouseX / 50) * 50;
        points[draggedPoint].y = round(mouseY / 50) * 50;
        
        // Maintain trapezoid properties
        if (draggedPoint === 0) {
            points[3].y = points[0].y - (points[2].y - points[1].y);
        } else if (draggedPoint === 1) {
            points[2].y = points[1].y - (points[3].y - points[0].y);
        } else if (draggedPoint === 2) {
            points[1].y = points[2].y + (points[3].y - points[0].y);
        } else if (draggedPoint === 3) {
            points[0].y = points[3].y + (points[2].y - points[1].y);
        }
    }
}

function keyPressed() {
    switch(key) {
        case ' ':
            // Reset points
            points = [
                {x: 200, y: 400},
                {x: 400, y: 400},
                {x: 350, y: 200},
                {x: 250, y: 200}
            ];
            break;
        case 'g':
            showGrid = !showGrid; // Toggle grid
            break;
        case 'a':
            showAngles = !showAngles; // Toggle angles
            break;
        case 's':
            showSides = !showSides; // Toggle sides
            break;
        case 'h':
            showHeight = !showHeight; // Toggle height
            break;
        case 'm':
            showMedian = !showMedian; // Toggle median
            break;
        case 'r':
            showArea = !showArea; // Toggle area
            break;
    }
} 