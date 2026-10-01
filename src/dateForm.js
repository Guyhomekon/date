import confetti from "canvas-confetti";

export class DateFormManager {
  constructor() {
    this.formData = {
      types: [],
      date: "",
      dateLabel: "",
      time: "19:30",
      timeLabel: "19h30",
      message: ""
    };

    this.currentStep = 1;
    this.init();
  }

  init() {
    this.bindEvents();
    this.populateDefaultDates();
  }

  populateDefaultDates() {
    // Dynamically calculate date labels for quick buttons
    const today = new Date();
    const weekendLabel = document.getElementById("label-this-weekend");
    const fridayLabel = document.getElementById("label-next-friday");
    const saturdayLabel = document.getElementById("label-next-saturday");

    // Next Saturday
    const daysUntilSaturday = (6 - today.getDay() + 7) % 7 || 7;
    const nextSat = new Date(today);
    nextSat.setDate(today.getDate() + daysUntilSaturday);

    // Next Friday
    const daysUntilFriday = (5 - today.getDay() + 7) % 7 || 7;
    const nextFri = new Date(today);
    nextFri.setDate(today.getDate() + daysUntilFriday);

    const formatDateStr = (d) => d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });

    if (weekendLabel) weekendLabel.textContent = `Ce Sam. ${formatDateStr(nextSat)}`;
    if (fridayLabel) fridayLabel.textContent = `Ven. ${formatDateStr(nextFri)}`;
    if (saturdayLabel) saturdayLabel.textContent = `Sam. ${formatDateStr(nextSat)}`;

    // Default min date for custom date picker
    const customDateInput = document.getElementById("custom-date-input");
    if (customDateInput) {
      customDateInput.min = today.toISOString().split("T")[0];
      customDateInput.value = nextSat.toISOString().split("T")[0];
    }
  }

  bindEvents() {
    // STEP 1: Cards selection
    const cards = document.querySelectorAll("#date-type-grid .option-card");
    const btnStep1Next = document.getElementById("btn-step-1-next");

    cards.forEach((card) => {
      card.addEventListener("click", () => {
        const val = card.getAttribute("data-value");
        if (card.classList.contains("selected")) {
          card.classList.remove("selected");
          this.formData.types = this.formData.types.filter((t) => t !== val);
        } else {
          card.classList.add("selected");
          this.formData.types.push(val);
        }

        btnStep1Next.disabled = this.formData.types.length === 0;
      });
    });

    btnStep1Next.addEventListener("click", () => this.goToStep(2));

    // STEP 2: Quick Dates & Custom Date Picker
    const quickDateBtns = document.querySelectorAll("#quick-dates-grid .quick-date-btn");
    const customDateInput = document.getElementById("custom-date-input");
    const btnStep2Next = document.getElementById("btn-step-2-next");

    quickDateBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        quickDateBtns.forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
        const type = btn.getAttribute("data-date-type");

        const today = new Date();
        let targetDate = new Date();

        if (type === "this-weekend" || type === "next-saturday") {
          const days = (6 - today.getDay() + 7) % 7 || 7;
          targetDate.setDate(today.getDate() + days);
          this.formData.dateLabel = "Samedi prochain (" + targetDate.toLocaleDateString("fr-FR", { day: "numeric", month: "long" }) + ")";
        } else if (type === "next-friday") {
          const days = (5 - today.getDay() + 7) % 7 || 7;
          targetDate.setDate(today.getDate() + days);
          this.formData.dateLabel = "Vendredi prochain (" + targetDate.toLocaleDateString("fr-FR", { day: "numeric", month: "long" }) + ")";
        }

        this.formData.date = targetDate.toISOString().split("T")[0];
        if (customDateInput) customDateInput.value = this.formData.date;
        btnStep2Next.disabled = false;
      });
    });

    if (customDateInput) {
      customDateInput.addEventListener("change", (e) => {
        quickDateBtns.forEach((b) => b.classList.remove("selected"));
        this.formData.date = e.target.value;
        const d = new Date(e.target.value + "T00:00:00");
        this.formData.dateLabel = d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
        btnStep2Next.disabled = !e.target.value;
      });
    }

    btnStep2Next.addEventListener("click", () => this.goToStep(3));

    // STEP 3: Time Slots & Custom Time
    const timeSlotBtns = document.querySelectorAll("#time-slots-grid .time-slot-btn");
    const customTimeInput = document.getElementById("custom-time-input");
    const btnStep3Next = document.getElementById("btn-step-3-next");

    timeSlotBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        timeSlotBtns.forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");

        const timeVal = btn.getAttribute("data-time");
        this.formData.time = timeVal;
        this.formData.timeLabel = timeVal.replace(":", "h");

        if (customTimeInput) customTimeInput.value = timeVal;
        btnStep3Next.disabled = false;
      });
    });

    if (customTimeInput) {
      customTimeInput.addEventListener("change", (e) => {
        timeSlotBtns.forEach((b) => b.classList.remove("selected"));
        this.formData.time = e.target.value;
        this.formData.timeLabel = e.target.value.replace(":", "h");
        btnStep3Next.disabled = !e.target.value;
      });
    }

    btnStep3Next.addEventListener("click", () => this.goToStep(4));

    // STEP 4: Note Input & Next
    const noteInput = document.getElementById("note-input");
    const btnStep4Next = document.getElementById("btn-step-4-next");

    btnStep4Next.addEventListener("click", () => {
      this.formData.message = noteInput ? noteInput.value.trim() : "";
      this.goToStep(5);
    });

    // STEP BACK Buttons
    document.querySelectorAll(".btn-back, .recap-edit-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetStep = parseInt(btn.getAttribute("data-target-step"), 10);
        if (targetStep) this.goToStep(targetStep);
      });
    });

    // STEP 5: Final Submission
    const btnFinalSubmit = document.getElementById("btn-final-submit");
    if (btnFinalSubmit) {
      btnFinalSubmit.addEventListener("click", () => this.submitForm());
    }

    // STEP 6: Restart button
    const btnRestart = document.getElementById("btn-restart");
    if (btnRestart) {
      btnRestart.addEventListener("click", () => {
        this.goToStep(1);
      });
    }
  }

  goToStep(stepNumber) {
    this.currentStep = stepNumber;

    // Update Step Indicators & Progress bar
    const progressFill = document.getElementById("progress-fill");
    if (progressFill) {
      const pct = Math.min(Math.max(((stepNumber - 1) / 4) * 100, 0), 100);
      progressFill.style.width = `${pct}%`;
    }

    document.querySelectorAll(".step-dot").forEach((dot) => {
      const s = parseInt(dot.getAttribute("data-step"), 10);
      dot.classList.remove("active", "completed");
      if (s === stepNumber) dot.classList.add("active");
      else if (s < stepNumber) dot.classList.add("completed");
    });

    // Toggle step containers
    document.querySelectorAll(".form-step").forEach((stepEl) => {
      stepEl.classList.remove("active");
      stepEl.classList.add("hidden");
    });

    const activeStepEl = document.getElementById(`step-${stepNumber}`);
    if (activeStepEl) {
      activeStepEl.classList.remove("hidden");
      // Trigger smooth CSS animation
      setTimeout(() => activeStepEl.classList.add("active"), 10);
    }

    // If entering step 5 (recap), update recap text
    if (stepNumber === 5) {
      this.updateRecap();
    }
  }

  updateRecap() {
    const recapType = document.getElementById("recap-type");
    const recapDate = document.getElementById("recap-date");
    const recapTime = document.getElementById("recap-time");
    const recapMessage = document.getElementById("recap-message");

    if (recapType) recapType.textContent = this.formData.types.join(", ") || "Aucune sélection";
    if (recapDate) recapDate.textContent = this.formData.dateLabel || this.formData.date || "Date à définir";
    if (recapTime) recapTime.textContent = this.formData.timeLabel || this.formData.time;
    if (recapMessage) recapMessage.textContent = this.formData.message ? `"${this.formData.message}"` : "Aucun mot particulier";
  }

  async submitForm() {
    const btnFinalSubmit = document.getElementById("btn-final-submit");
    if (btnFinalSubmit) {
      btnFinalSubmit.disabled = true;
      btnFinalSubmit.textContent = "Validation en cours... 💖";
    }

    const payload = {
      recipient: "Emma 🤍",
      types: this.formData.types.join(", "),
      date: this.formData.date,
      dateLabel: this.formData.dateLabel,
      time: this.formData.time,
      timeLabel: this.formData.timeLabel,
      message: this.formData.message,
      timestamp: new Date().toISOString()
    };

    // Save locally to localStorage
    try {
      const existing = JSON.parse(localStorage.getItem("emma_dates") || "[]");
      existing.push(payload);
      localStorage.setItem("emma_dates", JSON.stringify(existing));
    } catch (err) {
      console.warn("LocalStorage error:", err);
    }

    // Send to Google Sheets Webhook via Hidden Form Submit (Single Path to prevent double entries)
    const webhookUrl = window.GOOGLE_SHEETS_WEBHOOK_URL;
    if (webhookUrl && webhookUrl.trim() !== "") {
      try {
        const form = document.getElementById("gscript_hidden_form");
        if (form) {
          form.action = webhookUrl;
          document.getElementById("gf_types").value = payload.types || "";
          document.getElementById("gf_date").value = payload.date || "";
          document.getElementById("gf_dateLabel").value = payload.dateLabel || "";
          document.getElementById("gf_time").value = payload.time || "";
          document.getElementById("gf_timeLabel").value = payload.timeLabel || "";
          document.getElementById("gf_message").value = payload.message || "";
          form.submit();
        }
        console.log("Successfully dispatched payload to Google Sheets:", payload);
      } catch (e) {
        console.warn("Google Sheets submission error:", e);
      }
    }

    // Launch celebratory confetti
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#ff4d6d", "#ff758f", "#ffb3c1", "#ffffff", "#ffd166"]
    });

    // Populate final ticket & calendar links
    this.populateFinalTicket(payload);

    // Go to step 6 (confirmation)
    this.goToStep(6);
  }

  populateFinalTicket(payload) {
    const ticketEl = document.getElementById("final-ticket");
    if (!ticketEl) return;

    ticketEl.innerHTML = `
      <div style="margin-bottom: 12px; border-bottom: 1px dashed rgba(255,77,109,0.3); padding-bottom: 12px;">
        <h4 style="color: var(--secondary); font-size: 1.2rem; font-weight: 800; margin-bottom: 4px;">
          💌 Pass Rendez-vous Officiel
        </h4>
        <p style="color: var(--primary-active); font-weight: 700; font-size: 0.95rem;">Pour : Emma 🤍</p>
      </div>

      <div style="display: flex; flex-direction: column; gap: 10px; font-size: 0.98rem;">
        <div><strong>🎈 Programme :</strong> ${payload.types}</div>
        <div><strong>📅 Date :</strong> ${payload.dateLabel || payload.date}</div>
        <div><strong>⏰ Heure :</strong> ${payload.timeLabel}</div>
        ${payload.message ? `<div><strong>💬 Note d'Emma :</strong> "${payload.message}"</div>` : ""}
      </div>
    `;

    // Google Calendar URL generator
    const googleCalBtn = document.getElementById("google-cal-link");
    if (googleCalBtn && payload.date) {
      const startTime = payload.date.replace(/-/g, "") + "T" + payload.time.replace(":", "") + "00";
      // Assume 3 hours date length
      const [h, m] = payload.time.split(":").map(Number);
      const endH = String((h + 3) % 24).padStart(2, "0");
      const endTime = payload.date.replace(/-/g, "") + "T" + endH + String(m).padStart(2, "0") + "00";

      const title = encodeURIComponent("Date avec Emma 🤍");
      const details = encodeURIComponent(`Programme : ${payload.types}\nNote : ${payload.message || "Aucune"}`);
      
      googleCalBtn.href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTime}/${endTime}&details=${details}`;
    }

    // ICS Download Generator
    const icsBtn = document.getElementById("btn-download-ics");
    if (icsBtn) {
      icsBtn.onclick = () => {
        const icsContent = [
          "BEGIN:VCALENDAR",
          "VERSION:2.0",
          "BEGIN:VEVENT",
          `SUMMARY:Date avec Emma 🤍`,
          `DESCRIPTION:Programme : ${payload.types}\\nNote : ${payload.message || "Aucune"}`,
          `DTSTART:${payload.date.replace(/-/g, "")}T${payload.time.replace(":", "")}00`,
          "END:VEVENT",
          "END:VCALENDAR"
        ].join("\r\n");

        const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute("download", "date-emma.ics");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
    }
  }
}
