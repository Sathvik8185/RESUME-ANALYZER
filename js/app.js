/**
 * Main Application Controller
 * Orchestrates the resume analysis workflow
 * Handles UI updates and coordinates between validation, file handling, and API calls
 */

const ResumeAnalyzerApp = {
  // State management
  state: {
    uploadedFile: null,
    resumeId: null,
    analysisId: null,
    isProcessing: false,
  },

  /**
   * Initialize the application
   */
  init() {
    this.setupEventListeners();
    this.showInitialUI();

    if (CONFIG.DEMO_MODE) {
      console.log("⚠️ DEMO MODE ACTIVE - Using mock data for testing");
      console.log(
        "💡 Set DEMO_MODE = false in config.js when backend is ready",
      );
    } else {
      console.log("🚀 Production Mode - Ready for backend integration");
    }

    console.log("Resume Analyzer initialized");
  },

  /**
   * Setup form and file input event listeners
   */
  setupEventListeners() {
    const form = document.getElementById("userForm");
    const fileInput = document.getElementById("resume");

    if (form) {
      form.addEventListener("submit", (e) => this.handleFormSubmit(e));
    }

    if (fileInput) {
      fileInput.addEventListener("change", (e) => this.handleFileSelect(e));
    }
  },

  /**
   * Handle file selection
   * @param {Event} event - File input change event
   */
  handleFileSelect(event) {
    const file = event.target.files[0];

    if (!file) {
      this.state.uploadedFile = null;
      return;
    }

    // Validate file using FileValidator
    const validation = FileValidator.validateFile(file);

    if (!validation.valid) {
      UIHandler.showError(validation.error);
      event.target.value = ""; // Clear file input
      this.state.uploadedFile = null;
      return;
    }

    this.state.uploadedFile = file;
    console.log("File selected:", file.name, "Size:", file.size);
    UIHandler.showSuccess(
      `File selected: ${file.name} (${this.formatFileSize(file.size)})`,
    );
  },

  /**
   * Handle form submission
   * @param {Event} event - Form submit event
   */
  async handleFormSubmit(event) {
    event.preventDefault();

    if (this.state.isProcessing) {
      UIHandler.showWarning("Please wait, processing...");
      return;
    }

    // Get form values
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const jobDescription =
      document.getElementById("jobDescription")?.value.trim() || "";

    // Validate form data
    const validation = FormValidator.validateForm({ name, email });

    if (!validation.valid) {
      UIHandler.showError(validation.error);
      return;
    }

    // Check if file is selected
    if (!this.state.uploadedFile) {
      console.log("State check - uploadedFile:", this.state.uploadedFile);
      UIHandler.showError("Please select a resume file to upload");
      return;
    }

    console.log("Processing resume:", this.state.uploadedFile.name);

    // Process the resume
    await this.processResume({ name, email, jobDescription });
  },

  /**
   * Process resume upload and analysis
   * @param {object} formData - User form data
   */
  async processResume(formData) {
    this.state.isProcessing = true;
    UIHandler.showLoading("Uploading resume...");

    try {
      // Step 1: Upload resume
      const uploadResponse = await APIService.uploadResume(
        this.state.uploadedFile,
        {
          name: formData.name,
          email: formData.email,
          jobDescription: formData.jobDescription,
        },
      );

      if (!uploadResponse.success) {
        throw new Error(uploadResponse.error || "Upload failed");
      }

      this.state.resumeId =
        uploadResponse.data.resumeId || uploadResponse.data.id;
      UIHandler.showLoading("Analyzing resume...");

      // Step 2: Request analysis
      const analysisResponse = await APIService.analyzeResume(
        this.state.resumeId,
        formData.jobDescription,
      );

      if (!analysisResponse.success) {
        throw new Error(analysisResponse.error || "Analysis failed");
      }

      this.state.analysisId =
        analysisResponse.data.analysisId || analysisResponse.data.id;

      // Step 3: Display results
      this.displayResults(analysisResponse.data);
    } catch (error) {
      console.error("Resume processing error:", error);
      UIHandler.showError(error.message || "Failed to process resume");
    } finally {
      this.state.isProcessing = false;
    }
  },

  /**
   * Display analysis results
   * @param {object} data - Analysis data from backend
   */
  displayResults(data) {
    UIHandler.displayAnalysisResults(data);
  },

  /**
   * Show initial UI state
   */
  showInitialUI() {
    const resultDiv = document.getElementById("result");
    if (resultDiv) {
      resultDiv.innerHTML =
        '<p class="info-text">Upload a resume to get started</p>';
    }
  },

  /**
   * Format file size to human readable format
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted file size
   */
  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  },

  /**
   * Reset application state
   */
  reset() {
    this.state = {
      uploadedFile: null,
      resumeId: null,
      analysisId: null,
      isProcessing: false,
    };

    const form = document.getElementById("userForm");
    if (form) form.reset();

    this.showInitialUI();
  },
};

// Initialize app when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => ResumeAnalyzerApp.init());
} else {
  ResumeAnalyzerApp.init();
}
