const UIHandler = {
  getResultContainer() {
    return document.getElementById("result");
  },

  showLoading(message = "Processing...") {
    const container = this.getResultContainer();
    if (!container) return;
    container.innerHTML = `
      <div class="loading-container">
        <div class="spinner"></div>
        <p class="loading-text">${this.escapeHtml(message)}</p>
      </div>
    `;
    container.className = "result-container loading";
  },

  showError(message) {
    const container = this.getResultContainer();
    if (!container) { alert(message); return; }
    container.innerHTML = `
      <div class="message-container error">
        <span class="icon">❌</span>
        <p class="message-text">${this.escapeHtml(message)}</p>
      </div>
    `;
    container.className = "result-container error";
  },

  showSuccess(message) {
    const container = this.getResultContainer();
    if (!container) { alert(message); return; }
    container.innerHTML = `
      <div class="message-container success">
        <span class="icon">✅</span>
        <p class="message-text">${this.escapeHtml(message)}</p>
      </div>
    `;
    container.className = "result-container success";
  },

  showWarning(message) {
    alert(message);
  },

  displayAnalysisResults(data) {
    const container = this.getResultContainer();
    if (!container) return;

    // --- CRITICAL FIX: MAPPING PHP KEYS TO UI VARIABLES ---
    // PHP sends: score, name, matched, missing
    // We map them here so the UI knows what to display.
    
    const matchScore = data.score || data.matchScore || 0;
    const candidateName = data.name || data.candidateName || "N/A";
    const email = data.email || "N/A";
    const experience = data.experience || "N/A";
    const suitability = data.suitability || "Analysis Complete";
    
    // Handle arrays (PHP sends 'matched', Mock sends 'matchedSkills')
    const matchedSkills = data.matched || data.matchedSkills || [];
    const missingSkills = data.missing || data.missingSkills || [];
    
    const scoreClass = this.getScoreClass(matchScore);

    container.innerHTML = `
      <div class="analysis-results">
        <h3 class="results-title">Resume Analysis Results</h3>
        
        <!-- Match Score -->
        <div class="score-section ${scoreClass}">
          <h4>Match Score</h4>
          <div class="score-display">
            <span class="score-value">${matchScore}%</span>
            <div class="score-bar">
              <div class="score-fill" style="width: ${matchScore}%"></div>
            </div>
          </div>
          <p style="text-align:center; margin-top:10px;"><strong>${suitability}</strong></p>
        </div>

        <!-- Candidate Info -->
        <div class="info-section">
          <h4>Candidate Information</h4>
          <p><strong>Name:</strong> ${this.escapeHtml(candidateName)}</p>
          <p><strong>Email:</strong> ${this.escapeHtml(email)}</p>
          <p><strong>Experience:</strong> ${this.escapeHtml(experience)}</p>
        </div>

        <!-- Skills Analysis -->
        <div class="skills-section">
            <h4>Skills Analysis</h4>
            
            <div class="skill-group matched">
                <h5>Matched Keywords ✅</h5>
                <div class="skill-tags">
                    ${matchedSkills.length > 0 
                        ? matchedSkills.map(s => `<span class="skill-tag matched">${this.escapeHtml(s)}</span>`).join("") 
                        : "<span>No matches found</span>"}
                </div>
            </div>

            <div class="skill-group missing">
                <h5>Missing Keywords ⚠️</h5>
                <div class="skill-tags">
                    ${missingSkills.length > 0 
                        ? missingSkills.map(s => `<span class="skill-tag missing">${this.escapeHtml(s)}</span>`).join("") 
                        : "<span>No missing keywords detected</span>"}
                </div>
            </div>
        </div>
      </div>
    `;

    container.className = "result-container success";
  },

  getScoreClass(score) {
    if (score >= 80) return "score-excellent";
    if (score >= 60) return "score-good";
    if (score >= 40) return "score-fair";
    return "score-poor";
  },

  escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
};

Object.freeze(UIHandler);