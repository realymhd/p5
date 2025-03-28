let mirrors = [];
let photons = [];
let maxPhotons = 15; // Reduced number for cleaner visualization
let traces = [];
let isDragging = false;
let draggedMirror = null;
let dragOffset = { x: 0, y: 0 };

function setup() {
  createCanvas(800, 600);
  colorMode(HSB, 360, 100, 100, 100);
  
  // Initialize mirrors
  mirrors = [
    { x1: 200, y1: 200, x2: 400, y2: 200 },
    { x1: 600, y1: 200, x2: 700, y2: 300 },
    { x1: 500, y1: 400, x2: 600, y2: 450 },
    { x1: 200, y1: 500, x2: 400, y2: 450 },
    { x1: 100, y1: 300, x2: 150, y2: 450 }
  ];
  
  // Create initial photons
  for (let i = 0; i < maxPhotons; i++) {
    createPhoton();
  }
}

function draw() {
  background(0, 0, 10); // Dark gray background
  
  // Draw traces first (behind everything)
  drawTraces();
  
  // Update and draw photons
  updatePhotons();
  
  // Draw mirrors on top
  drawMirrors();
}

function createPhoton() {
  // Create from random edge
  let edge = floor(random(4));
  let pos = createVector();
  let vel = createVector();
  let hue = random(360);
  
  switch (edge) {
    case 0: // Top
      pos.set(random(width), 0);
      vel.set(random(-1, 1), random(1, 3));
      break;
    case 1: // Right
      pos.set(width, random(height));
      vel.set(random(-3, -1), random(-1, 1));
      break;
    case 2: // Bottom
      pos.set(random(width), height);
      vel.set(random(-1, 1), random(-3, -1));
      break;
    case 3: // Left
      pos.set(0, random(height));
      vel.set(random(1, 3), random(-1, 1));
      break;
  }
  
  photons.push({
    pos: pos,
    vel: vel,
    hue: hue,
    brightness: 100,
    size: random(2, 4)
  });
}

function updatePhotons() {
  for (let i = photons.length - 1; i >= 0; i--) {
    let p = photons[i];
    
    // Store previous position for trail
    let prevPos = p.pos.copy();
    
    // Update position
    p.pos.add(p.vel);
    
    // Add to trace (with fading)
    traces.push({
      x: p.pos.x,
      y: p.pos.y,
      hue: p.hue,
      alpha: 100,
      size: p.size * 0.7
    });
    
    // Check mirror collisions
    checkMirrorCollision(p, prevPos);
    
    // Remove if out of bounds
    if (p.pos.x < 0 || p.pos.x > width || p.pos.y < 0 || p.pos.y > height) {
      photons.splice(i, 1);
      createPhoton();
      continue;
    }
    
    // Draw photon
    noStroke();
    fill(p.hue, 80, p.brightness);
    circle(p.pos.x, p.pos.y, p.size);
    
    // Make it pulse slightly
    p.size = 2 + sin(frameCount * 0.1) * 1.5;
  }
}

function checkMirrorCollision(photon, prevPos) {
  for (let mirror of mirrors) {
    let intersection = lineIntersection(
      prevPos.x, prevPos.y, photon.pos.x, photon.pos.y,
      mirror.x1, mirror.y1, mirror.x2, mirror.y2
    );
    
    if (intersection) {
      // Calculate reflection
      let mirrorAngle = atan2(mirror.y2 - mirror.y1, mirror.x2 - mirror.x1);
      let incidentAngle = atan2(photon.vel.y, photon.vel.x);
      let reflectedAngle = 2 * mirrorAngle - incidentAngle + PI;
      
      // Update velocity
      photon.vel.set(cos(reflectedAngle) * photon.vel.mag(), 
                    sin(reflectedAngle) * photon.vel.mag());
      
      // Adjust position to avoid sticking
      photon.pos.set(intersection.x + photon.vel.x * 0.1, 
                    intersection.y + photon.vel.y * 0.1);
      
      // Change hue slightly on bounce
      photon.hue = (photon.hue + 20) % 360;
      
      // Add bright spot at collision point
      traces.push({
        x: intersection.x,
        y: intersection.y,
        hue: photon.hue,
        alpha: 150,
        size: 8
      });
      
      break;
    }
  }
}

function drawTraces() {
  for (let i = traces.length - 1; i >= 0; i--) {
    let t = traces[i];
    
    noStroke();
    fill(t.hue, 60, 100, t.alpha);
    circle(t.x, t.y, t.size);
    
    t.alpha -= 1.5;
    if (t.alpha <= 0) {
      traces.splice(i, 1);
    }
  }
}

function drawMirrors() {
  stroke(200, 80);
  strokeWeight(2);
  
  for (let mirror of mirrors) {
    line(mirror.x1, mirror.y1, mirror.x2, mirror.y2);
    
    // Draw handles
    if (isDragging && (mirror === draggedMirror)) {
      fill(200, 100, 100);
      circle(mirror.x1, mirror.y1, 8);
      circle(mirror.x2, mirror.y2, 8);
    }
  }
}

// Line intersection helper function
function lineIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
  let denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
  if (denom === 0) return null;
  
  let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
  let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;
  
  if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
    return {
      x: x1 + ua * (x2 - x1),
      y: y1 + ua * (y2 - y1)
    };
  }
  return null;
}

// Mouse interaction functions (same as before)
function mousePressed() {
  let minDist = 20;
  let closestMirror = null;
  let closestPoint = null;
  let closestDistance = minDist;

  for (let mirror of mirrors) {
    let d1 = dist(mouseX, mouseY, mirror.x1, mirror.y1);
    if (d1 < closestDistance) {
      closestDistance = d1;
      closestMirror = mirror;
      closestPoint = 'start';
    }
    
    let d2 = dist(mouseX, mouseY, mirror.x2, mirror.y2);
    if (d2 < closestDistance) {
      closestDistance = d2;
      closestMirror = mirror;
      closestPoint = 'end';
    }
    
    let d3 = distToLine(mouseX, mouseY, mirror.x1, mirror.y1, mirror.x2, mirror.y2);
    if (d3 < closestDistance) {
      closestDistance = d3;
      closestMirror = mirror;
      closestPoint = 'middle';
      dragOffset.x = mouseX - (mirror.x1 + mirror.x2) / 2;
      dragOffset.y = mouseY - (mirror.y1 + mirror.y2) / 2;
    }
  }
  
  if (closestMirror) {
    isDragging = true;
    draggedMirror = closestMirror;
    draggedMirror.dragPoint = closestPoint;
    
    if (closestPoint === 'start') {
      dragOffset.x = mouseX - draggedMirror.x1;
      dragOffset.y = mouseY - draggedMirror.y1;
    } else if (closestPoint === 'end') {
      dragOffset.x = mouseX - draggedMirror.x2;
      dragOffset.y = mouseY - draggedMirror.y2;
    }
  }
}

function mouseDragged() {
  if (isDragging && draggedMirror) {
    if (draggedMirror.dragPoint === 'start') {
      draggedMirror.x1 = mouseX - dragOffset.x;
      draggedMirror.y1 = mouseY - dragOffset.y;
    } else if (draggedMirror.dragPoint === 'end') {
      draggedMirror.x2 = mouseX - dragOffset.x;
      draggedMirror.y2 = mouseY - dragOffset.y;
    } else if (draggedMirror.dragPoint === 'middle') {
      let dx = mouseX - dragOffset.x - (draggedMirror.x1 + draggedMirror.x2) / 2;
      let dy = mouseY - dragOffset.y - (draggedMirror.y1 + draggedMirror.y2) / 2;
      draggedMirror.x1 += dx;
      draggedMirror.y1 += dy;
      draggedMirror.x2 += dx;
      draggedMirror.y2 += dy;
    }
  }
}

function mouseReleased() {
  isDragging = false;
  draggedMirror = null;
}

function distToLine(px, py, x1, y1, x2, y2) {
  let lineLength = dist(x1, y1, x2, y2);
  if (lineLength === 0) return dist(px, py, x1, y1);
  
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / (lineLength * lineLength);
  t = constrain(t, 0, 1);
  
  let projX = x1 + t * (x2 - x1);
  let projY = y1 + t * (y2 - y1);
  
  return dist(px, py, projX, projY);
}