const APIService = {
  async request(endpoint, options = {}) {
    const url = `${CONFIG.BASE_URL}${endpoint}`;
    console.log("📡 Fetching:", url);

    const defaultOptions = {
      headers: {
        ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, defaultOptions);
      const responseText = await response.text();
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("Server Response (Not JSON):", responseText);
        throw new Error("Server Error: Check Console for details.");
      }

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return { success: true, data: data, status: response.status };
    } catch (error) {
      console.error("API Request Error:", error);
      return { success: false, error: error.message || "An error occurred" };
    }
  },

  async uploadResume(file, metadata = {}) {
    const formData = new FormData();
    formData.append("resume", file);
    Object.keys(metadata).forEach((key) => formData.append(key, metadata[key]));

    return await this.request(CONFIG.ENDPOINTS.UPLOAD_RESUME, {
      method: "POST",
      body: formData,
    });
  },

  async analyzeResume(resumeId, jobDescription, metadata = {}) {
    // WE ARE PACKAGING NAME/EMAIL HERE
    const payload = { 
        resumeId, 
        jobDescription,
        name: metadata.name, 
        email: metadata.email 
    };

    return await this.request(CONFIG.ENDPOINTS.ANALYZE_RESUME, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getAnalysis(analysisId) {
    return await this.request(`${CONFIG.ENDPOINTS.GET_ANALYSIS}&id=${analysisId}`, { method: "GET" });
  },

  async healthCheck() {
    return await this.request(CONFIG.ENDPOINTS.HEALTH_CHECK, { method: "GET" });
  }
};

Object.freeze(APIService);