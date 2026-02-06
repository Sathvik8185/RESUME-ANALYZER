const UIHandler = {
  getResultContainer() {
    return document.getElementById("result");
  },

  escapeHTML(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  },

  showLoading(msg) {
    this.getResultContainer().innerHTML = `<p>${this.escapeHTML(msg)}</p>`;
  },

  showError(msg) {
    this.getResultContainer().innerHTML =
      `<p style="color:red">${this.escapeHTML(msg)}</p>`;
  },

  showSuccess(msg) {
    this.getResultContainer().innerHTML =
      `<p style="color:green">${this.escapeHTML(msg)}</p>`;
  },

  displayAnalysisResults(data) {
    const score = data.score || 0;
    const matched = data.matched || [];
    const missing = data.missing || [];

    const renderList = (arr, emptyMsg) =>
      arr.length
        ? arr.map(s => `<li>${this.escapeHTML(s)}</li>`).join("")
        : `<li><em>${emptyMsg}</em></li>`;

    this.getResultContainer().innerHTML = `
      <h3>Match Score: ${score}%</h3>
      <div class="circle-visual">${this.getCircles(score)}</div>

      <h4>Matched Skills</h4>
      <ul>${renderList(matched, "No matched skills found")}</ul>

      <h4>Missing Skills</h4>
      <ul>${renderList(missing, "No missing skills 🎉")}</ul>
    `;
  },

  getCircles(score) {
    const filled = Math.round(score / 25);
    let html = "";
    for (let i = 1; i <= 4; i++) {
      html += `<span class="circle ${i <= filled ? "filled" : "empty"}"></span>`;
    }
    return html;
  },
};

Object.freeze(UIHandler);
