// TimeZoneBuddy JavaScript
class TimeZoneBuddy {
  constructor() {
    this.selectedZones = [];
    this.hourOffset = 0;
    this.theme = "light";
    this.userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.currentTime = new Date();
    this.timeInterval = null;

    this.init();
  }

  init() {
    this.loadState();
    this.setupEventListeners();
    this.setupKeyboardShortcuts();
    this.startTimeUpdates();
    this.initializeUserZone();
    this.updateDisplay();

    // Auto-detect theme if not set
    if (!localStorage.getItem("timezoneBuddy-theme")) {
      this.autoDetectTheme();
    }
  }

  setupEventListeners() {
    // Theme toggle
    document.getElementById("themeToggle").addEventListener("click", () => {
      this.toggleTheme();
    });

    // About modal
    document.getElementById("aboutBtn").addEventListener("click", () => {
      this.showModal();
    });

    document.getElementById("closeModal").addEventListener("click", () => {
      this.hideModal();
    });

    document.getElementById("aboutModal").addEventListener("click", (e) => {
      if (e.target.id === "aboutModal") {
        this.hideModal();
      }
    });

    // Search functionality
    const searchInput = document.getElementById("citySearch");
    const searchDropdown = document.getElementById("searchDropdown");

    searchInput.addEventListener("input", (e) => {
      this.handleSearch(e.target.value);
    });

    searchInput.addEventListener("focus", () => {
      if (searchInput.value) {
        this.handleSearch(searchInput.value);
      }
    });

    document.addEventListener("click", (e) => {
      if (!e.target.closest(".search-container")) {
        searchDropdown.classList.remove("show");
      }
    });

    // Hour offset slider
    const offsetSlider = document.getElementById("hourOffset");
    offsetSlider.addEventListener("input", (e) => {
      this.setHourOffset(parseInt(e.target.value));
    });

    // Copy link
    document.getElementById("copyLinkBtn").addEventListener("click", () => {
      this.copyShareableLink();
    });
  }

  setupKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
        return;
      }

      switch (e.key.toLowerCase()) {
        case "a":
          e.preventDefault();
          document.getElementById("citySearch").focus();
          break;
        case "t":
          e.preventDefault();
          this.toggleTheme();
          break;
        case "s":
          e.preventDefault();
          this.copyShareableLink();
          break;
        case "escape":
          e.preventDefault();
          this.hideModal();
          break;
      }
    });
  }

  startTimeUpdates() {
    this.updateTime();
    this.timeInterval = setInterval(() => {
      this.updateTime();
    }, 1000);
  }

  updateTime() {
    this.currentTime = new Date();
    this.updateTimezoneCards();
  }

  initializeUserZone() {
    if (this.selectedZones.length === 0) {
      const userZoneInfo = timezones.find(
        (tz) => tz.timezone === this.userTimezone
      ) || {
        id: "user-timezone",
        city: "Your Location",
        country: "Local",
        timezone: this.userTimezone,
      };
      this.addZone(userZoneInfo);
    }
  }

  autoDetectTheme() {
    const hour = new Date().getHours();
    this.theme = hour >= 6 && hour < 18 ? "light" : "dark";
    this.applyTheme();
  }

  handleSearch(query) {
    const dropdown = document.getElementById("searchDropdown");

    if (!query) {
      dropdown.classList.remove("show");
      return;
    }

    const filteredZones = timezones.filter(
      (tz) =>
        !this.selectedZones.find((zone) => zone.id === tz.id) &&
        (tz.city.toLowerCase().includes(query.toLowerCase()) ||
          tz.country.toLowerCase().includes(query.toLowerCase()))
    );

    if (filteredZones.length === 0) {
      dropdown.innerHTML = '<div class="dropdown-item">No cities found</div>';
    } else {
      dropdown.innerHTML = filteredZones
        .slice(0, 8)
        .map(
          (tz) => `
                <div class="dropdown-item" data-zone-id="${tz.id}">
                    <div class="dropdown-item-city">${tz.city}</div>
                    <div class="dropdown-item-country">${tz.country}</div>
                </div>
            `
        )
        .join("");

      // Add click listeners to dropdown items
      dropdown
        .querySelectorAll(".dropdown-item[data-zone-id]")
        .forEach((item) => {
          item.addEventListener("click", () => {
            const zoneId = item.dataset.zoneId;
            const timezone = timezones.find((tz) => tz.id === zoneId);
            if (timezone) {
              this.addZone(timezone);
              document.getElementById("citySearch").value = "";
              dropdown.classList.remove("show");
            }
          });
        });
    }

    dropdown.classList.add("show");
  }

  addZone(timezone) {
    if (this.selectedZones.find((zone) => zone.id === timezone.id)) {
      return;
    }

    this.selectedZones.push(timezone);
    this.saveState();
    this.updateDisplay();
    this.showToast(`Added ${timezone.city}`, "success");
  }

  removeZone(zoneId) {
    this.selectedZones = this.selectedZones.filter(
      (zone) => zone.id !== zoneId
    );
    this.saveState();
    this.updateDisplay();
  }

  setHourOffset(offset) {
    this.hourOffset = offset;
    document.getElementById("offsetValue").textContent = offset;

    const offsetInfo = document.getElementById("offsetInfo");
    if (offset > 0) {
      offsetInfo.textContent = `⏰ Times shown with +${offset}h offset`;
      offsetInfo.style.display = "block";
    } else {
      offsetInfo.style.display = "none";
    }

    this.saveState();
    this.updateTimezoneCards();
  }

  toggleTheme() {
    this.theme = this.theme === "light" ? "dark" : "light";
    this.applyTheme();
    this.saveState();
  }

  applyTheme() {
    document.documentElement.setAttribute("data-theme", this.theme);
    const themeIcon = document.querySelector(".theme-icon");
    themeIcon.textContent = this.theme === "light" ? "🌙" : "";
  }

  showModal() {
    document.getElementById("aboutModal").classList.add("show");
    document.body.style.overflow = "hidden";
  }

  hideModal() {
    document.getElementById("aboutModal").classList.remove("show");
    document.body.style.overflow = "";
  }

  copyShareableLink() {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        this.showToast("Link copied to clipboard!", "success");
      })
      .catch(() => {
        this.showToast("Failed to copy link", "error");
      });
  }

  showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;

    document.getElementById("toastContainer").appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  updateDisplay() {
    const welcomeScreen = document.getElementById("welcomeScreen");
    const timezoneGrid = document.getElementById("timezoneGrid");
    const gridInfo = document.getElementById("gridInfo");

    if (this.selectedZones.length === 0) {
      welcomeScreen.style.display = "block";
      timezoneGrid.style.display = "none";
      gridInfo.style.display = "none";
    } else {
      welcomeScreen.style.display = "none";
      timezoneGrid.style.display = "grid";
      gridInfo.style.display = "block";
      this.renderTimezoneCards();
    }
  }

  renderTimezoneCards() {
    const grid = document.getElementById("timezoneGrid");
    grid.innerHTML = this.selectedZones
      .map((zone) => this.createTimezoneCard(zone))
      .join("");

    // Setup drag and drop
    this.setupDragAndDrop();

    // Setup remove buttons
    grid.querySelectorAll(".remove-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const zoneId = btn.dataset.zoneId;
        this.removeZone(zoneId);
      });
    });
  }

  createTimezoneCard(zone) {
    const adjustedTime = new Date(
      this.currentTime.getTime() + this.hourOffset * 60 * 60 * 1000
    );

    // Format time without seconds for cleaner display
    const timeFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: zone.timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const dateFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: zone.timezone,
      weekday: "short",
      month: "short",
      day: "numeric",
    });

    const time = timeFormatter.format(adjustedTime);
    const date = dateFormatter.format(adjustedTime);

    // Get seconds for subtle indicator
    const seconds = new Date(
      adjustedTime.toLocaleString("en-US", { timeZone: zone.timezone })
    ).getSeconds();

    // Get hour for day/night emoji and working hours
    const zoneTime = new Date(
      adjustedTime.toLocaleString("en-US", { timeZone: zone.timezone })
    );
    const hour = zoneTime.getHours();
    const isDaytime = hour >= 6 && hour < 20;
    const isWorkingHours = hour >= 9 && hour <= 18;

    // Enhanced emoji based on time of day
    let emoji;
    if (hour >= 6 && hour < 12) emoji = "🌅"; // Morning
    else if (hour >= 12 && hour < 17) emoji = "☀️"; // Afternoon
    else if (hour >= 17 && hour < 20) emoji = "🌇"; // Evening
    else if (hour >= 20 || hour < 2) emoji = "🌙"; // Night
    else emoji = "🌌"; // Late night

    const isUserZone = zone.timezone === this.userTimezone;

    const cardClasses = [
      "timezone-card",
      isWorkingHours ? "working-hours" : "",
      isUserZone ? "user-zone" : "",
    ]
      .filter(Boolean)
      .join(" ");

    return `
            <div class="${cardClasses}" data-zone-id="${
      zone.id
    }" draggable="true">
                <div class="card-header">
                    <div class="card-info">
                        <h3>${zone.city}</h3>
                        <p>${zone.country}</p>
                    </div>
                    ${
                      !isUserZone
                        ? `<button class="remove-btn" data-zone-id="${zone.id}">×</button>`
                        : ""
                    }
                </div>
                
                <div class="time-display">
                    <div class="time-emoji">${emoji}</div>
                    <div class="time-info">
                        <div class="time" data-zone-id="${zone.id}">
                            ${time}
                            <span class="seconds-indicator" style="animation-delay: ${
                              seconds * 16.67
                            }ms;"></span>
                        </div>
                        <div class="date">${date}</div>
                    </div>
                </div>
                
                <div class="status-badges">
                    ${
                      isWorkingHours
                        ? '<span class="badge badge-working">Working Hours</span>'
                        : ""
                    }
                    ${
                      isUserZone
                        ? '<span class="badge badge-user">Your Timezone</span>'
                        : ""
                    }
                </div>
            </div>
        `;
  }

  updateTimezoneCards() {
    const cards = document.querySelectorAll(".timezone-card");
    cards.forEach((card) => {
      const zoneId = card.dataset.zoneId;
      const zone = this.selectedZones.find((z) => z.id === zoneId);
      if (zone) {
        this.updateSingleCard(card, zone);
      }
    });
  }

  updateSingleCard(cardElement, zone) {
    const adjustedTime = new Date(
      this.currentTime.getTime() + this.hourOffset * 60 * 60 * 1000
    );

    // Format time without seconds for cleaner display
    const timeFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: zone.timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const dateFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: zone.timezone,
      weekday: "short",
      month: "short",
      day: "numeric",
    });

    const time = timeFormatter.format(adjustedTime);
    const date = dateFormatter.format(adjustedTime);

    // Get seconds for indicator timing
    const zoneTime = new Date(
      adjustedTime.toLocaleString("en-US", { timeZone: zone.timezone })
    );
    const seconds = zoneTime.getSeconds();
    const hour = zoneTime.getHours();

    // Enhanced emoji based on time of day
    let emoji;
    if (hour >= 6 && hour < 12) emoji = "🌅"; // Morning
    else if (hour >= 12 && hour < 17) emoji = "☀️"; // Afternoon
    else if (hour >= 17 && hour < 20) emoji = "🌇"; // Evening
    else if (hour >= 20 || hour < 2) emoji = "🌙"; // Night
    else emoji = "🌌"; // Late night

    // Update elements smoothly
    const timeElement = cardElement.querySelector(".time");
    const dateElement = cardElement.querySelector(".date");
    const emojiElement = cardElement.querySelector(".time-emoji");
    const secondsIndicator = cardElement.querySelector(".seconds-indicator");

    if (timeElement && timeElement.textContent.trim() !== time) {
      // Add updating class for smooth animation
      timeElement.classList.add("updating");
      timeElement.innerHTML = `${time}<span class="seconds-indicator" style="animation-delay: ${
        seconds * 16.67
      }ms;"></span>`;

      // Remove updating class after animation
      setTimeout(() => {
        timeElement.classList.remove("updating");
      }, 300);
    } else if (secondsIndicator) {
      // Just update the seconds indicator timing
      secondsIndicator.style.animationDelay = `${seconds * 16.67}ms`;
    }

    if (dateElement) {
      dateElement.textContent = date;
    }

    if (emojiElement && emojiElement.textContent !== emoji) {
      emojiElement.style.transform = "scale(0.8)";
      setTimeout(() => {
        emojiElement.textContent = emoji;
        emojiElement.style.transform = "";
      }, 150);
    }

    // Update working hours badge
    const isWorkingHours = hour >= 9 && hour <= 18;
    const workingBadge = cardElement.querySelector(".badge-working");
    const statusBadges = cardElement.querySelector(".status-badges");

    if (isWorkingHours && !workingBadge) {
      const badge = document.createElement("span");
      badge.className = "badge badge-working";
      badge.textContent = "Working Hours";
      statusBadges.insertBefore(badge, statusBadges.firstChild);
    } else if (!isWorkingHours && workingBadge) {
      workingBadge.remove();
    }
  }

  setupCardEventListeners() {
    const grid = document.getElementById("timezoneGrid");
    grid.querySelectorAll(".remove-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const zoneId = btn.dataset.zoneId;
        this.removeZone(zoneId);
      });
    });
  }

  setupDragAndDrop() {
    const cards = document.querySelectorAll(".timezone-card");

    cards.forEach((card) => {
      card.addEventListener("dragstart", (e) => {
        card.classList.add("dragging");
        e.dataTransfer.setData("text/plain", card.dataset.zoneId);
        e.dataTransfer.effectAllowed = "move";
      });

      card.addEventListener("dragend", () => {
        card.classList.remove("dragging");
      });

      card.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      });

      card.addEventListener("drop", (e) => {
        e.preventDefault();
        const draggedZoneId = e.dataTransfer.getData("text/plain");
        const targetZoneId = card.dataset.zoneId;

        if (draggedZoneId !== targetZoneId) {
          this.reorderZones(draggedZoneId, targetZoneId);
        }
      });
    });
  }

  reorderZones(draggedZoneId, targetZoneId) {
    const draggedIndex = this.selectedZones.findIndex(
      (z) => z.id === draggedZoneId
    );
    const targetIndex = this.selectedZones.findIndex(
      (z) => z.id === targetZoneId
    );

    if (draggedIndex === -1 || targetIndex === -1) return;

    const draggedZone = this.selectedZones[draggedIndex];
    this.selectedZones.splice(draggedIndex, 1);
    this.selectedZones.splice(targetIndex, 0, draggedZone);

    this.saveState();
    this.renderTimezoneCards();
  }

  saveState() {
    const state = {
      selectedZones: this.selectedZones,
      hourOffset: this.hourOffset,
      theme: this.theme,
    };

    // Save to localStorage
    localStorage.setItem("timezoneBuddy", JSON.stringify(state));
    localStorage.setItem("timezoneBuddy-theme", this.theme);

    // Save to URL hash
    const urlData = {
      zones: this.selectedZones.map((zone) => zone.id),
      offset: this.hourOffset,
    };

    try {
      const hashData = btoa(JSON.stringify(urlData));
      window.history.replaceState(null, null, `#${hashData}`);
    } catch (error) {
      console.error("Failed to save to URL hash:", error);
    }
  }

  loadState() {
    // Load from localStorage
    const saved = localStorage.getItem("timezoneBuddy");
    const savedTheme = localStorage.getItem("timezoneBuddy-theme");

    if (saved) {
      try {
        const state = JSON.parse(saved);
        this.selectedZones = state.selectedZones || [];
        this.hourOffset = state.hourOffset || 0;
      } catch (error) {
        console.error("Failed to load from localStorage:", error);
      }
    }

    if (savedTheme) {
      this.theme = savedTheme;
    }

    // Load from URL hash (takes precedence)
    const hash = window.location.hash.slice(1);
    if (hash) {
      try {
        const urlData = JSON.parse(atob(hash));
        if (urlData.zones) {
          this.selectedZones = urlData.zones
            .map((zoneId) => timezones.find((tz) => tz.id === zoneId))
            .filter(Boolean);
        }
        if (typeof urlData.offset === "number") {
          this.hourOffset = urlData.offset;
        }
      } catch (error) {
        console.error("Failed to load from URL hash:", error);
      }
    }

    // Apply loaded state
    document.getElementById("hourOffset").value = this.hourOffset;
    document.getElementById("offsetValue").textContent = this.hourOffset;
    this.applyTheme();

    if (this.hourOffset > 0) {
      const offsetInfo = document.getElementById("offsetInfo");
      offsetInfo.textContent = `⏰ Times shown with +${this.hourOffset}h offset`;
      offsetInfo.style.display = "block";
    }
  }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new TimeZoneBuddy();
});
