// TimeZoneBuddy JavaScript
class TimeZoneBuddy {
  constructor() {
    this.selectedZones = [];
    this.hourOffset = 0;
    this.theme = "dark";
    this.userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.currentTime = new Date();
    this.timeInterval = null;

    // User tracking properties
    this.userName = localStorage.getItem("timezoneBuddy-userName") || null;
    this.sessionStart = new Date();
    this.themeToggleCount =
      parseInt(localStorage.getItem("timezoneBuddy-themeToggles")) || 0;
    this.activityLog =
      JSON.parse(localStorage.getItem("timezoneBuddy-activity")) || [];

    this.init();
  }

  init() {
    this.loadState();

    // Check if user name exists, if not show name modal
    if (!this.userName) {
      this.showNameModal();
    }

    this.setupEventListeners();
    this.setupKeyboardShortcuts();
    this.startTimeUpdates();
    this.initializeUserZone();
    this.updateDisplay();

    // Always start in dark mode
    this.theme = "dark";
    this.applyTheme();

    // Log session start
    this.logActivity("Started session");
  }

  setupEventListeners() {
    // Dashboard modal
    document.getElementById("dashboardBtn").addEventListener("click", () => {
      this.showDashboard();
    });

    document.getElementById("closeDashboard").addEventListener("click", () => {
      this.hideDashboard();
    });

    document.getElementById("dashboardModal").addEventListener("click", (e) => {
      if (e.target.id === "dashboardModal") {
        this.hideDashboard();
      }
    });

    // Name modal
    document.getElementById("submitNameBtn").addEventListener("click", () => {
      this.submitUserName();
    });

    document
      .getElementById("userNameInput")
      .addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          this.submitUserName();
        }
      });

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
    this.logActivity(`Added city: ${timezone.city}`);
  }

  removeZone(zoneId) {
    const zone = this.selectedZones.find((z) => z.id === zoneId);
    this.selectedZones = this.selectedZones.filter(
      (zone) => zone.id !== zoneId
    );
    this.saveState();
    this.updateDisplay();
    if (zone) {
      this.logActivity(`Removed city: ${zone.city}`);
    }
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
    this.themeToggleCount++;
    localStorage.setItem("timezoneBuddy-themeToggles", this.themeToggleCount);
    this.applyTheme();
    this.saveState();
    this.logActivity(`Toggled theme to ${this.theme}`);
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

  // User tracking methods
  showNameModal() {
    document.getElementById("nameModal").classList.add("show");
    document.body.style.overflow = "hidden";
    document.getElementById("userNameInput").focus();
  }

  hideNameModal() {
    document.getElementById("nameModal").classList.remove("show");
    document.body.style.overflow = "";
  }

  submitUserName() {
    const nameInput = document.getElementById("userNameInput");
    const name = nameInput.value.trim();

    if (name) {
      this.userName = name;
      localStorage.setItem("timezoneBuddy-userName", name);
      this.hideNameModal();
      this.logActivity(`User "${name}" started using TimeZoneBuddy`);
      this.showToast(`Welcome, ${name}!`, "success");

      // Add user to global visitor list
      this.addVisitorToGlobalList(name);
    } else {
      this.showToast("Please enter your name", "error");
    }
  }

  async addVisitorToGlobalList(name) {
    // Store visitor in a simple JSON storage service
    const visitorData = {
      name: name,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString(),
    };

    try {
      // Get existing visitors
      const existingVisitors = await this.getAllVisitors();

      // Using jsonbin.io as a simple database (free service)
      const response = await fetch(
        "https://api.jsonbin.io/v3/b/68b67d20d0ea881f406efb25",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-Master-Key":
              "$2a$10$tpB9YeKmeLsxg.0JDwOrJuR0nJtpX1hE7Vx2N5FPf1p2lPcija7Oa",
          },
          body: JSON.stringify({
            visitors: [...existingVisitors, visitorData],
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save to API");
      }
    } catch (error) {
      console.log("Could not save visitor data:", error);
      // Fallback to localStorage
      this.saveVisitorLocally(visitorData);
    }
  }

  saveVisitorLocally(visitorData) {
    let localVisitors = JSON.parse(
      localStorage.getItem("timezonebuddy-all-visitors") || "[]"
    );
    // Check if user already exists
    if (!localVisitors.find((v) => v.name === visitorData.name)) {
      localVisitors.push(visitorData);
      localStorage.setItem(
        "timezonebuddy-all-visitors",
        JSON.stringify(localVisitors)
      );
    }
  }

  async getAllVisitors() {
    try {
      // Try to get from JSONBin API first
      const response = await fetch(
        "https://api.jsonbin.io/v3/b/68b67d20d0ea881f406efb25/latest",
        {
          method: "GET",
          headers: {
            "X-Master-Key":
              "$2a$10$tpB9YeKmeLsxg.0JDwOrJuR0nJtpX1hE7Vx2N5FPf1p2lPcija7Oa",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.record.visitors || [];
      }
    } catch (error) {
      console.log("Could not fetch from API, using localStorage:", error);
    }

    // Fallback to localStorage
    return JSON.parse(
      localStorage.getItem("timezonebuddy-all-visitors") || "[]"
    );
  }

  showDashboard() {
    this.updateDashboardData();
    document.getElementById("dashboardModal").classList.add("show");
    document.body.style.overflow = "hidden";
    this.logActivity("Opened dashboard");
  }

  hideDashboard() {
    document.getElementById("dashboardModal").classList.remove("show");
    document.body.style.overflow = "";
  }

  updateDashboardData() {
    const sessionMinutes = Math.floor(
      (new Date() - this.sessionStart) / 1000 / 60
    );

    document.getElementById("currentUserName").textContent =
      this.userName || "Unknown";
    document.getElementById(
      "sessionTime"
    ).textContent = `${sessionMinutes} minutes`;
    document.getElementById("citiesCount").textContent =
      this.selectedZones.length;
    document.getElementById("themeToggles").textContent = this.themeToggleCount;

    this.updateActivityLog();
    this.updateVisitorsList();
  }

  async updateVisitorsList() {
    try {
      const visitors = await this.getAllVisitors();
      const visitorsList = document.getElementById("visitorsList");
      const totalVisitorsElement = document.getElementById("totalVisitors");

      if (visitors && visitors.length > 0) {
        totalVisitorsElement.textContent = visitors.length;

        visitorsList.innerHTML = visitors
          .map(
            (visitor) => `
          <div class="visitor-item">
            <span class="visitor-name">${visitor.name}</span>
            <span class="visitor-time">${new Date(
              visitor.timestamp
            ).toLocaleDateString()}</span>
          </div>
        `
          )
          .join("");
      } else {
        totalVisitorsElement.textContent = "0";
        visitorsList.innerHTML =
          '<div class="visitor-item"><span class="visitor-name">No visitors yet</span></div>';
      }
    } catch (error) {
      console.error("Error updating visitors list:", error);
      document.getElementById("totalVisitors").textContent = "Error";
      document.getElementById("visitorsList").innerHTML =
        '<div class="visitor-item"><span class="visitor-name">Error loading visitors</span></div>';
    }
  }

  updateActivityLog() {
    const activityLog = document.getElementById("activityLog");
    const recentActivities = this.activityLog.slice(-10).reverse();

    if (recentActivities.length === 0) {
      activityLog.innerHTML =
        '<div class="activity-item">No activities yet</div>';
    } else {
      activityLog.innerHTML = recentActivities
        .map(
          (activity) =>
            `<div class="activity-item">${activity.time} - ${activity.action}</div>`
        )
        .join("");
    }
  }

  logActivity(action) {
    const activity = {
      time: new Date().toLocaleTimeString(),
      action: action,
      timestamp: new Date().toISOString(),
    };

    this.activityLog.push(activity);

    // Keep only last 50 activities
    if (this.activityLog.length > 50) {
      this.activityLog = this.activityLog.slice(-50);
    }

    localStorage.setItem(
      "timezoneBuddy-activity",
      JSON.stringify(this.activityLog)
    );
  }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new TimeZoneBuddy();
});
