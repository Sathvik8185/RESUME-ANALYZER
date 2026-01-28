const APIService = {
  /**
   * Generic fetch wrapper with error handling
   * @param {string} endpoint - API endpoint
   * @param {object} options - Fetch options
   * @returns {Promise<object>} Response data
   */
  async request(endpoint, options = {}) {
    const url = `${CONFIG.BASE_URL}${endpoint}`;

    const defaultOptions = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        CONFIG.REQUEST_TIMEOUT,
      );

      const response = await fetch(url, {
        ...defaultOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Parse response
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`,
        );
      }

      return {
        success: true,
        data: data,
        status: response.status,
      };
    } catch (error) {
      console.error("API Request Error:", error);

      if (error.name === "AbortError") {
        throw new Error("Request timeout - please try again");
      }

      return {
        success: false,
        error: error.message || "An error occurred",
        status: error.status || 500,
      };
    }
  },

  /**
   * Upload resume file to backend
   * @param {File} file - Resume file
   * @param {object} metadata - Additional form data (name, email, job description)
   * @returns {Promise<object>} Upload response with file ID
   */
  async uploadResume(file, metadata = {}) {
    // Use Gemini API if enabled
    if (CONFIG.GEMINI?.USE_GEMINI && typeof GeminiService !== "undefined") {
      console.log("🤖 Using Gemini AI for resume parsing");
      return await this.uploadAndParseWithGemini(file, metadata);
    }

    // Use mock data if in demo mode (for testing without backend)
    if (CONFIG.DEMO_MODE && typeof MockDataService !== "undefined") {
      console.log("📝 Demo Mode: Using mock data for testing");
      return await MockDataService.mockUploadResume(file, metadata);
    }

    const formData = new FormData();
    formData.append("resume", file);

    // Append metadata
    Object.keys(metadata).forEach((key) => {
      formData.append(key, metadata[key]);
    });

    try {
      const url = `${CONFIG.BASE_URL}${CONFIG.ENDPOINTS.UPLOAD_RESUME}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        CONFIG.REQUEST_TIMEOUT,
      );

      const response = await fetch(url, {
        method: "POST",
        body: formData, // Don't set Content-Type header for FormData
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Upload failed");
      }

      return {
        success: true,
        data: data,
        status: response.status,
      };
    } catch (error) {
      console.error("Resume Upload Error:", error);

      if (error.name === "AbortError") {
        throw new Error("Upload timeout - please try again");
      }

      return {
        success: false,
        error: error.message || "Upload failed",
        status: error.status || 500,
      };
    }
  },

  /**
   * Request resume analysis
   * @param {string} resumeId - ID of uploaded resume
   * @param {object} jobDescription - Job description for matching
   * @returns {Promise<object>} Analysis response
   */
  async analyzeResume(resumeId, jobDescription = null) {
    // If using Gemini, the analysis is already done during upload
    if (CONFIG.GEMINI?.USE_GEMINI) {
      console.log("✅ Analysis already completed by Gemini AI");
      return {
        success: true,
        data: {
          analysisId: resumeId,
          status: "completed",
          message: "Analysis completed",
        },
      };
    }

    // Use mock data if in demo mode (for testing without backend)
    if (CONFIG.DEMO_MODE && typeof MockDataService !== "undefined") {
      console.log("📊 Demo Mode: Generating mock analysis results");
      return await MockDataService.mockAnalyzeResume(resumeId, jobDescription);
    }

    const payload = {
      resumeId: resumeId,
    };

    if (jobDescription) {
      payload.jobDescription = jobDescription;
    }

    return await this.request(CONFIG.ENDPOINTS.ANALYZE_RESUME, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Upload and parse resume with Gemini AI
   * @param {File} file - Resume file
   * @param {object} metadata - Additional metadata
   * @returns {Promise<object>} Parsed resume data
   */
  async uploadAndParseWithGemini(file, metadata = {}) {
    try {
      // Parse resume with Gemini
      const result = await GeminiService.parseResume(
        file,
        metadata.jobDescription || "",
      );

      if (!result.success) {
        throw new Error(result.error || "Failed to parse resume");
      }

      // Merge metadata with parsed data
      const parsedData = result.data;

      // Add user-provided metadata
      if (metadata.name && !parsedData.personalInfo.name) {
        parsedData.personalInfo.name = metadata.name;
      }
      if (metadata.email && !parsedData.personalInfo.email) {
        parsedData.personalInfo.email = metadata.email;
      }

      return {
        success: true,
        data: {
          resumeId: `gemini_${Date.now()}`,
          fileName: file.name,
          uploadedAt: new Date().toISOString(),
          parsedData: parsedData,
          metadata: metadata,
        },
      };
    } catch (error) {
      console.error("Gemini parsing error:", error);
      return {
        success: false,
        error: error.message || "Failed to parse resume with Gemini AI",
      };
    }
  },

  /**
   * Get analysis results
   * @param {string} analysisId - Analysis ID
   * @returns {Promise<object>} Analysis results
   */
  async getAnalysis(analysisId) {
    const endpoint = CONFIG.ENDPOINTS.GET_ANALYSIS.replace(":id", analysisId);
    return await this.request(endpoint, {
      method: "GET",
    });
  },

  /**
   * Health check endpoint
   * @returns {Promise<object>} Backend health status
   */
  async healthCheck() {
    return await this.request(CONFIG.ENDPOINTS.HEALTH_CHECK, {
      method: "GET",
    });
  },
};

// Make APIService immutable
Object.freeze(APIService);
