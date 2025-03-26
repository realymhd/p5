class Navigation {
    constructor() {
        this.backButton = null;
    }
    
    setup() {
        // Create back button in top-left
        this.backButton = new Button('back', 'Back to Gallery', 10, 10, 150, this.goToGallery, this);
    }
    
    goToGallery() {
        window.location.href = '../../index.html';
    }
    
    draw() {
        // Draw the back button
        if (this.backButton) {
            this.backButton.draw();
        }
    }
    
    handleMousePressed() {
        if (this.backButton && this.backButton.isHit(mouseX, mouseY)) {
            this.backButton.pressIfHit(mouseX, mouseY);
            return true;
        }
        return false;
    }
    
    handleMouseReleased() {
        if (this.backButton) {
            this.backButton.releaseButton(mouseX, mouseY);
        }
    }
} 