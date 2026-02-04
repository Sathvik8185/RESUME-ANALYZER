/**
 * UI Handler Module
 * Manages all UI updates and displays for the application
 * Handles success, error, loading states, and analysis results display
 */

const UIHandler = {
  /**
   * Get result container element
   * @returns {HTMLElement} Result div element
   */
  getResultContainer() {
    return document.getElementById("result");
  },

  /**
   * Show loading state
   * @param {string} message - Loading message
   */
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

  /**
   * Show error message
   * @param {string} message - Error message
   */
  showError(message) {
    const container = this.getResultContainer();
    if (!container) {
      alert(message);
      return;
    }

    container.innerHTML = `
      <div class="message-container error">
        <span class="icon">❌</span>
        <p class="message-text">${this.escapeHtml(message)}</p>
      </div>
    `;
    container.className = "result-container error";
  },

  /**
   * Show success message
   * @param {string} message - Success message
   */
  showSuccess(message) {
    const container = this.getResultContainer();
    if (!container) {
      alert(message);
      return;
    }

    container.innerHTML = `
      <div class="message-container success">
        <span class="icon">✅</span>
        <p class="message-text">${this.escapeHtml(message)}</p>
      </div>
    `;
    container.className = "result-container success";
  },

  /**
   * Show warning message
   * @param {string} message - Warning message
   */
  showWarning(message) {
    const container = this.getResultContainer();
    if (!container) {
      alert(message);
      return;
    }

    container.innerHTML = `
      <div class="message-container warning">
        <span class="icon">⚠️</span>
        <p class="message-text">${this.escapeHtml(message)}</p>
      </div>
    `;
    container.className = "result-container warning";
  },

  /**
   * Display analysis results from backend
   * @param {object} data - Analysis data
   * Expected format from backend:
   * {
   *   matchScore: number (0-100),
   *   candidateName: string,
   *   email: string,
   *   skills: array,
   *   matchedSkills: array,
   *   missingSkills: array,
   *   experience: string,
   *   education: array,
   *   summary: string,
   *   recommendations: array
   * }
   */
  displayAnalysisResults(data) {
    const container = this.getResultContainer();
    if (!container) return;

    // Check if this is Gemini parsed data
    if (data.parsedData) {
      this.displayGeminiResults(data);
      return;
    }

    const {
      matchScore = 0,
      candidateName = "N/A",
      email = "N/A",
      skills = [],
      matchedSkills = [],
      missingSkills = [],
      experience = "N/A",
      education = [],
      summary = "",
      recommendations = [],
      note = "",
    } = data;

    const scoreClass = this.getScoreClass(matchScore);

    container.innerHTML = `
      <div class="analysis-results">
        <h3 class="results-title">Resume Analysis Results</h3>
        
        ${
          note
            ? `<div class="demo-notice">
          <p>⚠️ <strong>Note:</strong> ${this.escapeHtml(note)}</p>
        </div>`
            : ""
        }
        
        <!-- Match Score -->
        <div class="score-section ${scoreClass}">
          <h4>Match Score</h4>
          <div class="score-display">
            <span class="score-value">${matchScore}%</span>
            <div class="score-bar">
              <div class="score-fill" style="width: ${matchScore}%"></div>
            </div>
          </div>
        </div>

        <!-- Candidate Info -->
        <div class="info-section">
          <h4>Candidate Information</h4>
          <p><strong>Name:</strong> ${this.escapeHtml(candidateName)}</p>
          <p><strong>Email:</strong> ${this.escapeHtml(email)}</p>
          <p><strong>Experience:</strong> ${this.escapeHtml(experience)}</p>
        </div>

        <!-- Skills Analysis -->
        ${this.renderSkillsSection(skills, matchedSkills, missingSkills)}

        <!-- Education -->
        ${this.renderEducationSection(education)}

        <!-- Summary -->
        ${
          summary
            ? `
          <div class="summary-section">
            <h4>Summary</h4>
            <p>${this.escapeHtml(summary)}</p>
          </div>
        `
            : ""
        }

        <!-- Recommendations -->
        ${this.renderRecommendationsSection(recommendations)}
      </div>
    `;

    container.className = "result-container success";
  },

  /**
   * Render skills section
   */
  renderSkillsSection(allSkills, matchedSkills, missingSkills) {
    if (!allSkills || allSkills.length === 0) {
      return "";
    }

    return `
      <div class="skills-section">
        <h4>Skills Analysis</h4>
        
        ${
          matchedSkills && matchedSkills.length > 0
            ? `
          <div class="skill-group matched">
            <h5>Matched Skills ✅</h5>
            <div class="skill-tags">
              ${matchedSkills
                .map(
                  (skill) =>
                    `<span class="skill-tag matched">${this.escapeHtml(
                      skill,
                    )}</span>`,
                )
                .join("")}
            </div>
          </div>
        `
            : ""
        }
        
        ${
          missingSkills && missingSkills.length > 0
            ? `
          <div class="skill-group missing">
            <h5>Missing Skills ⚠️</h5>
            <div class="skill-tags">
              ${missingSkills
                .map(
                  (skill) =>
                    `<span class="skill-tag missing">${this.escapeHtml(
                      skill,
                    )}</span>`,
                )
                .join("")}
            </div>
          </div>
        `
            : ""
        }
      </div>
    `;
  },

  /**
   * Render education section
   */
  renderEducationSection(education) {
    if (!education || education.length === 0) {
      return "";
    }

    return `
      <div class="education-section">
        <h4>Education</h4>
        <ul class="education-list">
          ${education
            .map(
              (edu) =>
                `<li>${this.escapeHtml(
                  typeof edu === "string" ? edu : edu.degree || "N/A",
                )}</li>`,
            )
            .join("")}
        </ul>
      </div>
    `;
  },

  /**
   * Render recommendations section
   */
  renderRecommendationsSection(recommendations) {
    if (!recommendations || recommendations.length === 0) {
      return "";
    }

    return `
      <div class="recommendations-section">
        <h4>Recommendations</h4>
        <ul class="recommendations-list">
          ${recommendations
            .map((rec) => `<li>${this.escapeHtml(rec)}</li>`)
            .join("")}
        </ul>
      </div>
    `;
  },

  /**
   * Get CSS class based on match score
   * @param {number} score - Match score
   * @returns {string} CSS class
   */
  getScoreClass(score) {
    if (score >= 80) return "score-excellent";
    if (score >= 60) return "score-good";
    if (score >= 40) return "score-fair";
    return "score-poor";
  },

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  },

  /**
   * Clear result container
   */
  clear() {
    const container = this.getResultContainer();
    if (container) {
      container.innerHTML = "";
      container.className = "result-container";
    }
  },

  /**
   * Display Gemini AI parsed results with enhanced UI
   * @param {object} data - Data from Gemini API
   */
  displayGeminiResults(data) {
    const container = this.getResultContainer();
    if (!container) return;

    const parsed = data.parsedData;
    const personalInfo = parsed.personalInfo || {};
    const experience = parsed.experience || [];
    const education = parsed.education || [];
    const skills = parsed.skills || {};
    const projects = parsed.projects || [];
    const certifications = parsed.certifications || [];
    const jobMatch = parsed.jobMatch || null;

    let html = `
      <div class="gemini-results">
        <div class="results-header">
          <h2>📄 Resume Analysis</h2>
          <p class="ai-badge">✨ Powered by Gemini AI</p>
        </div>`;

    // Job Match Score (if available)
    if (jobMatch && jobMatch.score !== undefined) {
      const scoreClass = this.getScoreClass(jobMatch.score);
      html += `
        <div class="match-score-card ${scoreClass}">
          <h3>🎯 Job Match Score</h3>
          <div class="score-circle">
            <svg viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" />
              <circle cx="50" cy="50" r="45" 
                style="stroke-dasharray: ${jobMatch.score * 2.827}, 282.7" />
            </svg>
            <div class="score-text">
              <span class="score-number">${jobMatch.score}</span>
              <span class="score-label">/ 100</span>
            </div>
          </div>
        </div>`;
    }

    // Personal Information
    html += `
      <div class="info-card">
        <h3>👤 Personal Information</h3>
        <div class="info-grid">
          ${personalInfo.name ? `<div class="info-item"><strong>Name:</strong> ${this.escapeHtml(personalInfo.name)}</div>` : ""}
          ${personalInfo.email ? `<div class="info-item"><strong>Email:</strong> <a href="mailto:${this.escapeHtml(personalInfo.email)}">${this.escapeHtml(personalInfo.email)}</a></div>` : ""}
          ${personalInfo.phone ? `<div class="info-item"><strong>Phone:</strong> ${this.escapeHtml(personalInfo.phone)}</div>` : ""}
          ${personalInfo.location ? `<div class="info-item"><strong>Location:</strong> ${this.escapeHtml(personalInfo.location)}</div>` : ""}
          ${personalInfo.linkedin ? `<div class="info-item"><strong>LinkedIn:</strong> <a href="${this.escapeHtml(personalInfo.linkedin)}" target="_blank">Profile</a></div>` : ""}
          ${personalInfo.portfolio ? `<div class="info-item"><strong>Portfolio:</strong> <a href="${this.escapeHtml(personalInfo.portfolio)}" target="_blank">Website</a></div>` : ""}
        </div>
      </div>`;

    // Professional Summary
    if (parsed.summary) {
      html += `
        <div class="summary-card">
          <h3>📝 Professional Summary</h3>
          <p>${this.escapeHtml(parsed.summary)}</p>
        </div>`;
    }

    // Work Experience
    if (experience.length > 0) {
      html += `
        <div class="experience-card">
          <h3>💼 Work Experience</h3>`;

      experience.forEach((exp, index) => {
        html += `
          <div class="experience-item">
            <div class="exp-header">
              <h4>${this.escapeHtml(exp.position || "Position")}</h4>
              <span class="exp-company">${this.escapeHtml(exp.company || "Company")}</span>
            </div>
            <p class="exp-duration">${this.escapeHtml(exp.duration || "Duration not specified")}</p>
            ${
              exp.responsibilities && exp.responsibilities.length > 0
                ? `
              <div class="exp-details">
                <strong>Responsibilities:</strong>
                <ul>
                  ${exp.responsibilities.map((r) => `<li>${this.escapeHtml(r)}</li>`).join("")}
                </ul>
              </div>`
                : ""
            }
            ${
              exp.achievements && exp.achievements.length > 0
                ? `
              <div class="exp-details">
                <strong>Achievements:</strong>
                <ul>
                  ${exp.achievements.map((a) => `<li>${this.escapeHtml(a)}</li>`).join("")}
                </ul>
              </div>`
                : ""
            }
          </div>`;
      });

      html += `</div>`;
    }

    // Education
    if (education.length > 0) {
      html += `
        <div class="education-card">
          <h3>🎓 Education</h3>`;

      education.forEach((edu) => {
        html += `
          <div class="education-item">
            <h4>${this.escapeHtml(edu.degree || "Degree")} ${edu.field ? `in ${this.escapeHtml(edu.field)}` : ""}</h4>
            <p class="edu-institution">${this.escapeHtml(edu.institution || "Institution")}</p>
            <p class="edu-year">${this.escapeHtml(edu.graduationYear || "Year")}</p>
            ${edu.gpa ? `<p class="edu-gpa">GPA: ${this.escapeHtml(edu.gpa)}</p>` : ""}
          </div>`;
      });

      html += `</div>`;
    }

    // Skills
    const allSkills = [
      ...(skills.technical || []),
      ...(skills.soft || []),
      ...(skills.tools || []),
      ...(skills.languages || []),
    ];

    if (allSkills.length > 0) {
      html += `
        <div class="skills-card">
          <h3>🛠️ Skills</h3>`;

      if (skills.technical && skills.technical.length > 0) {
        html += `
          <div class="skill-category">
            <h4>Technical Skills</h4>
            <div class="skill-tags">
              ${skills.technical.map((skill) => `<span class="skill-tag tech">${this.escapeHtml(skill)}</span>`).join("")}
            </div>
          </div>`;
      }

      if (skills.tools && skills.tools.length > 0) {
        html += `
          <div class="skill-category">
            <h4>Tools & Technologies</h4>
            <div class="skill-tags">
              ${skills.tools.map((tool) => `<span class="skill-tag tool">${this.escapeHtml(tool)}</span>`).join("")}
            </div>
          </div>`;
      }

      if (skills.soft && skills.soft.length > 0) {
        html += `
          <div class="skill-category">
            <h4>Soft Skills</h4>
            <div class="skill-tags">
              ${skills.soft.map((skill) => `<span class="skill-tag soft">${this.escapeHtml(skill)}</span>`).join("")}
            </div>
          </div>`;
      }

      if (skills.languages && skills.languages.length > 0) {
        html += `
          <div class="skill-category">
            <h4>Programming Languages</h4>
            <div class="skill-tags">
              ${skills.languages.map((lang) => `<span class="skill-tag lang">${this.escapeHtml(lang)}</span>`).join("")}
            </div>
          </div>`;
      }

      html += `</div>`;
    }

    // Projects
    if (projects.length > 0) {
      html += `
        <div class="projects-card">
          <h3>🚀 Projects</h3>`;

      projects.forEach((project) => {
        html += `
          <div class="project-item">
            <h4>${this.escapeHtml(project.name || "Project")}</h4>
            ${project.role ? `<p class="project-role">Role: ${this.escapeHtml(project.role)}</p>` : ""}
            ${project.description ? `<p class="project-desc">${this.escapeHtml(project.description)}</p>` : ""}
            ${
              project.technologies && project.technologies.length > 0
                ? `
              <div class="project-tech">
                <strong>Technologies:</strong>
                ${project.technologies.map((tech) => `<span class="tech-badge">${this.escapeHtml(tech)}</span>`).join("")}
              </div>`
                : ""
            }
          </div>`;
      });

      html += `</div>`;
    }

    // Certifications
    if (certifications.length > 0) {
      html += `
        <div class="certifications-card">
          <h3>🏆 Certifications</h3>
          <ul class="cert-list">
            ${certifications.map((cert) => `<li>${this.escapeHtml(cert)}</li>`).join("")}
          </ul>
        </div>`;
    }

    // Job Match Details
    if (jobMatch) {
      if (jobMatch.matchingSkills && jobMatch.matchingSkills.length > 0) {
        html += `
          <div class="match-skills-card success-bg">
            <h3>✅ Matching Skills</h3>
            <div class="skill-tags">
              ${jobMatch.matchingSkills.map((skill) => `<span class="skill-tag matched">${this.escapeHtml(skill)}</span>`).join("")}
            </div>
          </div>`;
      }

      if (jobMatch.missingSkills && jobMatch.missingSkills.length > 0) {
        html += `
          <div class="match-skills-card warning-bg">
            <h3>⚠️ Skills Gap</h3>
            <div class="skill-tags">
              ${jobMatch.missingSkills.map((skill) => `<span class="skill-tag missing">${this.escapeHtml(skill)}</span>`).join("")}
            </div>
          </div>`;
      }

      if (jobMatch.recommendations && jobMatch.recommendations.length > 0) {
        html += `
          <div class="recommendations-card">
            <h3>💡 Recommendations</h3>
            <ul class="recommendations-list">
              ${jobMatch.recommendations.map((rec) => `<li>${this.escapeHtml(rec)}</li>`).join("")}
            </ul>
          </div>`;
      }
    }

    html += `
        <div class="parsed-info">
          <small>Parsed by ${this.escapeHtml(parsed.parser || "AI")} on ${new Date(parsed.parsedAt || Date.now()).toLocaleString()}</small>
        </div>
      </div>`;

    container.innerHTML = html;
    container.className = "result-container gemini-results-container";
  },
};

// Make UIHandler immutable
Object.freeze(UIHandler);
