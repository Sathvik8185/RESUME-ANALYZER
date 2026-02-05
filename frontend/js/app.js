const ResumeAnalyzerApp = {
  state: {
    uploadedFile: null,
    resumeId: null,
    analysisId: null,
    isProcessing: false,
  },

  init() {
    this.setupEventListeners();
    this.showInitialUI();
    console.log("Resume Analyzer initialized");
  },

  setupEventListeners() {
    // FIX: Listen for Button Click, not Form Submit
    const submitBtn = document.getElementById("submitBtn");
    const fileInput = document.getElementById("resume");

    if (submitBtn) {
      submitBtn.addEventListener("click", (e) => this.handleFormSubmit(e));
    }

    if (fileInput) {
      fileInput.addEventListener("change", (e) => this.handleFileSelect(e));
    }
  },

  handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) {
      this.state.uploadedFile = null;
      return;
    }
    // Simple validation
    if (file.type !== "application/pdf") {
        UIHandler.showError("Only PDF files are allowed.");
        return;
    }
    this.state.uploadedFile = file;
    UIHandler.showSuccess(`File selected: ${file.name}`);
  },

  async handleFormSubmit(event) {
    if (event) event.preventDefault();

    if (this.state.isProcessing) {
      UIHandler.showWarning("Please wait, processing...");
      return;
    }

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const jobDescription = document.getElementById("jobDescription").value.trim();

    if (!name || !email) {
      UIHandler.showError("Please enter Name and Email.");
      return;
    }

    if (!this.state.uploadedFile) {
      UIHandler.showError("Please select a resume file.");
      return;
    }

    await this.processResume({ name, email, jobDescription });
  },

  async processResume(formData) {
    this.state.isProcessing = true;
    UIHandler.showLoading("Uploading resume...");

    try {
      // Step 1: Upload
      const uploadResponse = await APIService.uploadResume(
        this.state.uploadedFile,
        formData
      );

      if (!uploadResponse.success) throw new Error(uploadResponse.error);

      this.state.resumeId = uploadResponse.data.resumeId;
      UIHandler.showLoading("Analyzing resume...");

      // Step 2: Analyze
      const analysisResponse = await APIService.analyzeResume(
        this.state.resumeId,
        formData.jobDescription,
        { name: formData.name, email: formData.email } 
      );

      if (!analysisResponse.success) throw new Error(analysisResponse.error);

      // --- CRITICAL FIX: UNWRAP THE DATA ---
      // The API returns: { success: true, data: { status: "success", data: { score: 50... } } }
      // We need to dig deep to get the actual stats.
      let finalResult = analysisResponse.data;
      
      if (finalResult.data && typeof finalResult.data === 'object') {
          finalResult = finalResult.data;
      }

      console.log("Final Data sent to UI:", finalResult); 
      this.displayResults(finalResult);

    } catch (error) {
      console.error("Error:", error);
      UIHandler.showError(error.message);
    } finally {
      this.state.isProcessing = false;
    }
  },

  displayResults(data) {
    if (typeof UIHandler.displayAnalysisResults === 'function') {
        UIHandler.displayAnalysisResults(data);
    } else {
        console.log("Results:", data);
        alert("Analysis Complete! Check Console.");
    }
  },

  showInitialUI() {
    const resultDiv = document.getElementById("result");
    if (resultDiv) resultDiv.innerHTML = '<p class="info-text">Upload a resume to get started</p>';
  }
};

// Init
document.addEventListener("DOMContentLoaded", () => ResumeAnalyzerApp.init());