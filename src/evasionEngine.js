/**
 * Evasion Engine for the "Non" button
 * Constrains the evasive button strictly within the bounds of the white card (.welcome-card).
 */

export class EvasionEngine {
  constructor(options) {
    this.btnNo = options.btnNo;
    this.btnNoText = options.btnNoText;
    this.btnYes = options.btnYes;
    this.questionEl = options.questionEl;
    this.hintEl = options.hintEl;
    this.welcomeCard = document.querySelector(".welcome-card");
    
    this.attemptCount = 0;
    this.padding = 16; // 16px padding inside the white card
    this.proximityThreshold = 100; // Distance threshold in px
    this.isEvading = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    
    this.mobileTexts = [
      "Non",
      "T'es sûre ? 👀",
      "Vraiment ?",
      "Emma… 😭",
      "Essaie encore 😌"
    ];

    this.init();
  }

  init() {
    if (!this.btnNo) return;

    // Completely block any click on "Non"
    this.btnNo.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.registerAttempt();
      this.evadeRepulsion(this.lastMouseX || window.innerWidth / 2, this.lastMouseY || window.innerHeight / 2);
      return false;
    });

    // Listen for mousemove for desktop cursor proximity
    window.addEventListener("mousemove", (e) => this.handleMouseMove(e));
    
    // Mouseenter / hover triggers immediate repulsion
    this.btnNo.addEventListener("mouseenter", (e) => {
      this.registerAttempt();
      this.evadeRepulsion(e.clientX, e.clientY);
    });
    
    // Touch handlers for mobile
    this.btnNo.addEventListener("touchstart", (e) => this.handleTouch(e), { passive: false });
    this.btnNo.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "touch") {
        this.handleTouch(e);
      }
    });

    // Keep within card on resize
    window.addEventListener("resize", () => {
      if (this.isEvading) {
        this.keepInBounds();
      }
    });
  }

  handleTouch(e) {
    e.preventDefault();
    e.stopPropagation();
    const touch = e.touches[0] || e;
    this.registerAttempt();
    this.evadeRepulsion(touch.clientX, touch.clientY);
  }

  handleMouseMove(e) {
    if (this.btnNo.disabled) return;

    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;

    const rect = this.btnNo.getBoundingClientRect();
    const btnCenterX = rect.left + rect.width / 2;
    const btnCenterY = rect.top + rect.height / 2;

    const distance = Math.hypot(this.lastMouseX - btnCenterX, this.lastMouseY - btnCenterY);

    if (distance < this.proximityThreshold) {
      this.registerAttempt();
      this.evadeRepulsion(this.lastMouseX, this.lastMouseY);
    }
  }

  registerAttempt() {
    this.attemptCount++;
    this.updateButtonText();
    this.updateHintMessage();
  }

  updateButtonText() {
    if (!this.btnNoText) return;
    const index = Math.min(this.attemptCount, this.mobileTexts.length - 1);
    this.btnNoText.textContent = this.mobileTexts[index];
  }

  updateHintMessage() {
    if (!this.hintEl) return;

    let hintText = "";
    if (this.attemptCount >= 6) {
      hintText = "Il reste une autre option juste à côté 🤍";
    } else if (this.attemptCount >= 4) {
      hintText = "Je crois que le bouton ne veut pas 😌";
    } else if (this.attemptCount >= 2) {
      hintText = "Mauvais bouton 👀";
    }

    if (hintText) {
      this.hintEl.textContent = hintText;
      this.hintEl.classList.add("visible");
    }
  }

  /**
   * Repulsion evasion constrained STRICTLY inside the white card (.welcome-card)
   */
  evadeRepulsion(mouseX, mouseY) {
    if (this.btnNo.disabled) return;

    this.isEvading = true;
    this.btnNo.classList.add("evading");

    const btnWidth = this.btnNo.offsetWidth || 90;
    const btnHeight = this.btnNo.offsetHeight || 44;

    const cardRect = this.welcomeCard ? this.welcomeCard.getBoundingClientRect() : {
      left: 20,
      right: window.innerWidth - 20,
      top: 20,
      bottom: window.innerHeight - 20
    };

    const minX = cardRect.left + this.padding;
    const maxX = cardRect.right - btnWidth - this.padding;
    const minY = cardRect.top + this.padding;
    const maxY = cardRect.bottom - btnHeight - this.padding;

    const rect = this.btnNo.getBoundingClientRect();
    const currentLeft = rect.left;
    const currentTop = rect.top;

    const btnCenterX = currentLeft + btnWidth / 2;
    const btnCenterY = currentTop + btnHeight / 2;

    // Repulsion vector away from mouse
    let dirX = btnCenterX - mouseX;
    let dirY = btnCenterY - mouseY;
    let dist = Math.hypot(dirX, dirY);

    if (dist < 1) {
      dirX = Math.random() - 0.5;
      dirY = Math.random() - 0.5;
      dist = Math.hypot(dirX, dirY) || 1;
    }

    const normX = dirX / dist;
    const normY = dirY / dist;

    const pushDistance = 90;

    let targetLeft = currentLeft + normX * pushDistance;
    let targetTop = currentTop + normY * pushDistance;

    // If target position goes outside white card boundaries, bounce inside card!
    if (targetLeft < minX || targetLeft > maxX || targetTop < minY || targetTop > maxY) {
      const randomAngle = Math.random() * Math.PI * 2;
      targetLeft = Math.min(Math.max(mouseX + Math.cos(randomAngle) * 80, minX), maxX);
      targetTop = Math.min(Math.max(mouseY + Math.sin(randomAngle) * 80, minY), maxY);
    } else {
      targetLeft = Math.min(Math.max(targetLeft, minX), maxX);
      targetTop = Math.min(Math.max(targetTop, minY), maxY);
    }

    this.btnNo.style.left = `${Math.round(targetLeft)}px`;
    this.btnNo.style.top = `${Math.round(targetTop)}px`;
  }

  keepInBounds() {
    if (!this.isEvading) return;
    const btnWidth = this.btnNo.offsetWidth || 90;
    const btnHeight = this.btnNo.offsetHeight || 44;
    
    const cardRect = this.welcomeCard ? this.welcomeCard.getBoundingClientRect() : {
      left: 20,
      right: window.innerWidth - 20,
      top: 20,
      bottom: window.innerHeight - 20
    };

    const minX = cardRect.left + this.padding;
    const maxX = cardRect.right - btnWidth - this.padding;
    const minY = cardRect.top + this.padding;
    const maxY = cardRect.bottom - btnHeight - this.padding;

    const rect = this.btnNo.getBoundingClientRect();
    const newLeft = Math.min(Math.max(rect.left, minX), maxX);
    const newTop = Math.min(Math.max(rect.top, minY), maxY);

    this.btnNo.style.left = `${newLeft}px`;
    this.btnNo.style.top = `${newTop}px`;
  }

  disable() {
    this.btnNo.disabled = true;
    this.btnNo.style.pointerEvents = "none";
    this.btnNo.style.opacity = "0.2";
  }
}
