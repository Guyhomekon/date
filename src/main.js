import confetti from "canvas-confetti";
import { EvasionEngine } from "./evasionEngine.js";
import { DateFormManager } from "./dateForm.js";

document.addEventListener("DOMContentLoaded", () => {
  // Initialize background floating hearts
  createFloatingHearts();

  // Elements
  const welcomeScreen = document.getElementById("welcome-screen");
  const dateFormScreen = document.getElementById("date-form-screen");
  const btnYes = document.getElementById("btn-yes");
  const btnNo = document.getElementById("btn-no");
  const btnNoText = document.getElementById("btn-no-text");
  const questionEl = document.getElementById("main-question");
  const hintEl = document.getElementById("hint-message");
  const celebrationBox = document.getElementById("yes-celebration-box");
  const celebrationText = document.getElementById("celebration-text");

  // Initialize Evasion Engine for "Non" button
  const evasionEngine = new EvasionEngine({
    btnNo,
    btnNoText,
    btnYes,
    questionEl,
    hintEl
  });

  // Initialize Date Form Manager
  const dateFormManager = new DateFormManager();

  // Handle "Oui 🤍" Click Flow
  if (btnYes) {
    btnYes.addEventListener("click", () => {
      // 1. Disable evasion engine and "Non" button
      evasionEngine.disable();
      btnYes.disabled = true;

      // 2. Launch gentle sparkle confetti
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#ff4d6d", "#ff758f", "#ffffff"]
      });

      // 3. Show celebration sequence
      if (celebrationBox) {
        celebrationBox.classList.remove("hidden");
      }

      // Animated text sequence:
      // "Je savais que tu dirais oui 🤍" -> "Parfait 🤍" -> "Maintenant, choisis notre date."
      setTimeout(() => {
        if (celebrationText) celebrationText.textContent = "Parfait 🤍";
      }, 1200);

      setTimeout(() => {
        if (celebrationText) celebrationText.textContent = "Maintenant, choisis notre date ✨";
      }, 2400);

      // 4. Smooth transition to date selection form
      setTimeout(() => {
        welcomeScreen.style.opacity = "0";
        welcomeScreen.style.transform = "translateY(-20px)";

        setTimeout(() => {
          welcomeScreen.classList.remove("active");
          welcomeScreen.classList.add("hidden");

          dateFormScreen.classList.remove("hidden");
          // Trigger smooth fade in + slide up
          setTimeout(() => {
            dateFormScreen.classList.add("active");
          }, 30);
        }, 500);
      }, 3400);
    });
  }
});

/**
 * Creates ambient floating background hearts
 */
function createFloatingHearts() {
  const container = document.getElementById("heart-bg");
  if (!container) return;

  const heartIcons = ["🤍", "💖", "✨", "🌸", "💕"];
  const count = 16;

  for (let i = 0; i < count; i++) {
    const heart = document.createElement("div");
    heart.className = "floating-heart";
    heart.textContent = heartIcons[Math.floor(Math.random() * heartIcons.length)];
    heart.style.left = `${Math.random() * 100}vw`;
    heart.style.animationDuration = `${6 + Math.random() * 6}s`;
    heart.style.animationDelay = `${Math.random() * 5}s`;
    heart.style.fontSize = `${0.9 + Math.random() * 0.8}rem`;
    container.appendChild(heart);
  }
}
