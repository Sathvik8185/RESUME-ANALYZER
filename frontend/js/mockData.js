/**
 * Mock Data Service - FOR TESTING/DEMO PURPOSES ONLY
 * Simulates backend responses to test frontend functionality
 * Remove or disable when real backend is available
 */

const MockDataService = {
  /**
   * Generate mock upload response
   * @param {File} file - Uploaded file
   * @param {object} metadata - Form metadata
   * @returns {Promise<object>} Mock upload response
   */
  async mockUploadResume(file, metadata) {
    // Simulate network delay
    await this.delay(800);

    return {
      success: true,
      data: {
        resumeId: this.generateId(),
        fileName: file.name,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
        message: "Resume uploaded successfully",
      },
      status: 200,
    };
  },

  /**
   * Generate mock analysis response based on actual form data
   * @param {string} resumeId - Resume ID
   * @param {string} jobDescription - Job description
   * @returns {Promise<object>} Mock analysis response
   */
  async mockAnalyzeResume(resumeId, jobDescription) {
    // Simulate processing delay
    await this.delay(1500);

    const candidateName =
      document.getElementById("name")?.value || "Candidate Name";
    const candidateEmail =
      document.getElementById("email")?.value || "email@example.com";
    const hasJobDescription = jobDescription && jobDescription.length > 20;

    // Note: Real backend would parse PDF and extract this data
    return {
      success: true,
      data: {
        analysisId: this.generateId(),
        resumeId: resumeId,
        matchScore: hasJobDescription
          ? this.randomScore(65, 92)
          : this.randomScore(70, 85),
        candidateName: candidateName,
        email: candidateEmail,
        skills: [
          "JavaScript",
          "Python",
          "React",
          "Node.js",
          "SQL",
          "Git",
          "REST APIs",
          "HTML/CSS",
        ],
        matchedSkills: hasJobDescription
          ? ["JavaScript", "React", "Node.js", "HTML/CSS", "Git", "REST APIs"]
          : ["JavaScript", "Python", "React", "Node.js"],
        missingSkills: hasJobDescription
          ? ["Docker", "Kubernetes", "AWS"]
          : ["Machine Learning", "DevOps"],
        experience: "3-5 years in Software Development",
        education: [
          "B.S. Computer Science - University Name (2019)",
          "Relevant Certifications and Training",
        ],
        summary: hasJobDescription
          ? "Strong candidate with good alignment to job requirements. Technical skills match well with position needs."
          : "Qualified candidate with solid technical background and relevant experience in software development.",
        recommendations: hasJobDescription
          ? [
              "Consider gaining containerization experience with Docker",
              "Cloud platform certifications would strengthen profile",
              "Kubernetes knowledge beneficial for scalability projects",
            ]
          : [
              "Strong technical foundation established",
              "Consider specializing in a specific technology stack",
              "Continuous learning in emerging technologies recommended",
            ],
        analyzedAt: new Date().toISOString(),
        note: "⚠️ This is DEMO data - Real backend will parse actual resume content",
      },
      status: 200,
    };
  },

  /**
   * Simulate network delay
   * @param {number} ms - Delay in milliseconds
   * @returns {Promise}
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },

  /**
   * Generate random ID
   * @returns {string} Random ID
   */
  generateId() {
    return "demo_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now();
  },

  /**
   * Generate random score in range
   * @param {number} min - Minimum score
   * @param {number} max - Maximum score
   * @returns {number} Random score
   */
  randomScore(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
};

// Make MockDataService immutable
Object.freeze(MockDataService);
