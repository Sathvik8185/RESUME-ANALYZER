/**
 * Main Application Controller - FIXED VERSION
 */

const ResumeAnalyzerApp = {
  state: {
    uploadedFile: null,
    isProcessing: false,
    analysisResult: null,
  },

  init() {
    this.setupEventListeners();
    this.showInitialUI();
  },

  setupEventListeners() {
    const fileInput = document.getElementById("resume");
    const submitBtn = document.getElementById("submitBtn");
    const downloadBtn = document.getElementById("downloadReportBtn");

    if (fileInput) {
      fileInput.addEventListener("change", (e) =>
        this.handleFileSelect(e)
      );
    }

    if (submitBtn) {
      submitBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.handleAnalyzeClick();
      });
    }

    if (downloadBtn) {
      downloadBtn.addEventListener("click", () =>
        this.generatePDF()
      );
    }
  },

  handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    const validation = FileValidator.validateFile(file);
    if (!validation.valid) {
      UIHandler.showError(validation.error);
      event.target.value = "";
      this.state.uploadedFile = null;
      return;
    }

    this.state.uploadedFile = file;
    UIHandler.showSuccess(`File selected: ${file.name}`);
  },

  async handleAnalyzeClick() {
    if (this.state.isProcessing) return;

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const jobDescription = document
      .getElementById("jobDescription")
      .value.trim();

    const validation = FormValidator.validateForm({
      name,
      email,
      jobDescription,
    });

    if (!validation.valid) {
      UIHandler.showError(validation.error);
      return;
    }

    if (!this.state.uploadedFile) {
      UIHandler.showError("Please select a resume file");
      return;
    }

    await this.processResume(jobDescription);
  },

  async processResume(jobDescription) {
    this.state.isProcessing = true;
    UIHandler.showLoading("Analyzing resume...");

    try {
      // Call the API service
      const result = await APIService.analyzeResume(
        this.state.uploadedFile,
        jobDescription
      );

      console.log("API Result:", result); // Debug log

      // ✅ FIX: Check result.success (not result.status)
      if (!result.success) {
        throw new Error(
          result.error || "Resume analysis failed"
        );
      }

      // ✅ FIX: Store the actual data
      this.state.analysisResult = result.data;
      
      // Display results
      this.displayResults(result.data);

      // Show download button
      document.getElementById("downloadReportBtn").style.display = "block";
      
    } catch (err) {
      UIHandler.showError(err.message);
    } finally {
      this.state.isProcessing = false;
    }
  },

  displayResults(data) {
    UIHandler.displayAnalysisResults(data);
  },

  showInitialUI() {
    document.getElementById("result").innerHTML =
      '<p class="info-text">Upload a resume to get started 🚀</p>';
  },

  generatePDF() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    const data = this.state.analysisResult;
    if (!data) {
      UIHandler.showError("No analysis data available");
      return;
    }

    const score = data.score || 0;
    const matched = data.matched || [];
    const missing = data.missing || [];

    let y = 20;

    pdf.setFontSize(18);
    pdf.text("Resume Analysis Report", 20, y);
    y += 12;

    pdf.setFontSize(12);
    pdf.text(`Match Score: ${score}%`, 20, y);
    y += 10;

    // 4-circle indicator
    const filled = Math.round(score / 25);
    for (let i = 0; i < 4; i++) {
      pdf.circle(20 + i * 12, y, 4, "S");
      if (i < filled) {
        pdf.circle(20 + i * 12, y, 3, "F");
      }
    }

    y += 15;
    pdf.text("Matched Skills:", 20, y);
    y += 8;

    matched.forEach((skill) => {
      pdf.text(`• ${skill}`, 25, y);
      y += 6;
    });

    y += 5;
    pdf.text("Missing Skills:", 20, y);
    y += 8;

    missing.forEach((skill) => {
      pdf.text(`• ${skill}`, 25, y);
      y += 6;
    });

    pdf.save("resume-analysis-report.pdf");
    UIHandler.showSuccess("PDF report downloaded!");
  },
};

document.addEventListener("DOMContentLoaded", () => {
  ResumeAnalyzerApp.init();
});