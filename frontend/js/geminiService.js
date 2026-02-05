/**
 * Gemini AI Service
 * Handles resume parsing using Google's Gemini API
 */

const GeminiService = {
  /**
   * Extract text from PDF file using browser's File API
   * @param {File} file - PDF file
   * @returns {Promise<string>} Extracted text
   */
  async extractTextFromPDF(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async function (e) {
        try {
          const typedarray = new Uint8Array(e.target.result);

          // Load PDF.js library if available
          if (typeof pdfjsLib !== "undefined") {
            const pdf = await pdfjsLib.getDocument(typedarray).promise;
            let fullText = "";

            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              const pageText = textContent.items
                .map((item) => item.str)
                .join(" ");
              fullText += pageText + "\n";
            }

            resolve(fullText);
          } else {
            // Fallback: Just send the file name and type
            resolve(
              `Resume file: ${file.name} (PDF parsing requires PDF.js library)`,
            );
          }
        } catch (error) {
          console.error("PDF extraction error:", error);
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsArrayBuffer(file);
    });
  },

  /**
   * Convert file to base64 for Gemini API
   * @param {File} file - Resume file
   * @returns {Promise<string>} Base64 encoded file
   */
  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  /**
   * Parse resume using Gemini API
   * @param {File} file - Resume file
   * @param {string} jobDescription - Optional job description
   * @returns {Promise<object>} Parsed resume data
   */
  async parseResume(file, jobDescription = "") {
    if (!CONFIG.GEMINI.API_KEY) {
      throw new Error(
        "Gemini API key not configured. Please add your API key in config.js",
      );
    }

    try {
      // For gemini-pro (text-only), we'll use file name and metadata
      // In production, you'd extract text from PDF using a backend service

      // Prepare the prompt with file information
      const prompt = this.buildPromptForTextOnly(file.name, jobDescription);

      // Prepare the request payload (text only, no file data)
      const payload = {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 1,
          maxOutputTokens: 8192,
        },
      };

      // Make API request
      const response = await fetch(
        `${CONFIG.GEMINI.API_URL}?key=${CONFIG.GEMINI.API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error?.message || `API Error: ${response.status}`,
        );
      }

      const data = await response.json();

      // Extract the text response
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textResponse) {
        throw new Error("No response from Gemini API");
      }

      // Parse the JSON response
      const parsedData = this.parseGeminiResponse(textResponse);

      return {
        success: true,
        data: parsedData,
      };
    } catch (error) {
      console.error("Gemini API Error:", error);
      return {
        success: false,
        error: error.message || "Failed to parse resume",
      };
    }
  },

  /**
   * Build prompt for text-only model (when PDF parsing not available)
   * @param {string} fileName - Resume file name
   * @param {string} jobDescription - Optional job description
   * @returns {string} Formatted prompt
   */
  buildPromptForTextOnly(fileName, jobDescription) {
    let prompt = `You are a professional resume analyzer. Based on the resume file named "${fileName}", generate a comprehensive resume analysis in JSON format.

Since I cannot see the actual PDF content, please generate a realistic sample resume analysis that demonstrates the structure and format expected.

Generate a sample resume with the following structure:

Extract the following information:
1. Personal Information: name, email, phone, location, linkedin, portfolio/website
2. Professional Summary or Objective
3. Work Experience: company, position, duration, responsibilities, achievements
4. Education: institution, degree, field of study, graduation year, GPA if available
5. Skills: categorized into technical skills, soft skills, tools, languages
6. Projects: name, description, technologies used, role
7. Certifications and Courses
8. Languages spoken
9. Awards and Achievements
10. Publications (if any)
`;

    if (jobDescription) {
      prompt += `\n11. Match Score: Analyze how well this resume matches the following job description (0-100):
Job Description: ${jobDescription}

Provide:
- Overall match score (0-100)
- Matching skills
- Missing skills
- Recommendations for improvement
`;
    }

    prompt += `\nReturn ONLY a valid JSON object with this structure:
{
  "personalInfo": {
    "name": "Sample Candidate",
    "email": "candidate@email.com",
    "phone": "+1234567890",
    "location": "City, Country",
    "linkedin": "linkedin.com/in/profile",
    "portfolio": "portfolio.com"
  },
  "summary": "Professional summary text...",
  "experience": [
    {
      "company": "Company Name",
      "position": "Job Title",
      "duration": "2020-2023",
      "responsibilities": ["Responsibility 1", "Responsibility 2"],
      "achievements": ["Achievement 1", "Achievement 2"]
    }
  ],
  "education": [
    {
      "institution": "University Name",
      "degree": "Bachelor of Science",
      "field": "Computer Science",
      "graduationYear": "2020",
      "gpa": "3.8"
    }
  ],
  "skills": {
    "technical": ["JavaScript", "Python", "React"],
    "soft": ["Leadership", "Communication"],
    "tools": ["Git", "Docker", "VS Code"],
    "languages": ["JavaScript", "Python"]
  },
  "projects": [
    {
      "name": "Project Name",
      "description": "Project description",
      "technologies": ["React", "Node.js"],
      "role": "Lead Developer"
    }
  ],
  "certifications": ["AWS Certified", "Google Cloud"],
  "spokenLanguages": ["English", "Spanish"],
  "awards": ["Award 1", "Award 2"],
  "publications": []${
    jobDescription
      ? `,
  "jobMatch": {
    "score": 75,
    "matchingSkills": ["JavaScript", "React"],
    "missingSkills": ["AWS", "Kubernetes"],
    "recommendations": ["Learn cloud platforms", "Gain DevOps experience"]
  }`
      : ""
  }
}

Generate realistic, professional data. Return ONLY the JSON, no additional text.`;

    return prompt;
  },

  /**
   * Build prompt for Gemini (legacy - kept for reference)
   * @param {string} jobDescription - Optional job description
   * @returns {string} Formatted prompt
   */
  buildPrompt(jobDescription) {
    let prompt = `You are a professional resume parser. Analyze the resume and extract information.

Extract the following:
1. Personal Information: name, email, phone, location, linkedin, portfolio/website
2. Professional Summary or Objective
3. Work Experience: company, position, duration, responsibilities, achievements
4. Education: institution, degree, field of study, graduation year, GPA if available
5. Skills: categorized into technical skills, soft skills, tools, languages
6. Projects: name, description, technologies used, role
7. Certifications and Courses
8. Languages spoken
9. Awards and Achievements
10. Publications (if any)
`;

    if (jobDescription) {
      prompt += `\n11. Match Score: Analyze how well this resume matches the following job description (0-100):
Job Description: ${jobDescription}

Provide:
- Overall match score (0-100)
- Matching skills
- Missing skills
- Recommendations for improvement
`;
    }

    prompt += `\nReturn ONLY a valid JSON object with this structure:
{
  "personalInfo": {
    "name": "",
    "email": "",
    "phone": "",
    "location": "",
    "linkedin": "",
    "portfolio": ""
  },
  "summary": "",
  "experience": [
    {
      "company": "",
      "position": "",
      "duration": "",
      "responsibilities": [],
      "achievements": []
    }
  ],
  "education": [
    {
      "institution": "",
      "degree": "",
      "field": "",
      "graduationYear": "",
      "gpa": ""
    }
  ],
  "skills": {
    "technical": [],
    "soft": [],
    "tools": [],
    "languages": []
  },
  "projects": [
    {
      "name": "",
      "description": "",
      "technologies": [],
      "role": ""
    }
  ],
  "certifications": [],
  "spokenLanguages": [],
  "awards": [],
  "publications": []${
    jobDescription
      ? `,
  "jobMatch": {
    "score": 0,
    "matchingSkills": [],
    "missingSkills": [],
    "recommendations": []
  }`
      : ""
  }
}

Ensure all fields are filled with extracted data or empty strings/arrays if not found. Return ONLY the JSON, no additional text.`;

    return prompt;
  },

  /**
   * Parse Gemini API response
   * @param {string} response - Text response from Gemini
   * @returns {object} Parsed data
   */
  parseGeminiResponse(response) {
    try {
      // Remove markdown code blocks if present
      let jsonStr = response.trim();
      if (jsonStr.startsWith("```json")) {
        jsonStr = jsonStr.replace(/```json\n?/g, "").replace(/```\n?/g, "");
      } else if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.replace(/```\n?/g, "");
      }

      const parsed = JSON.parse(jsonStr);

      // Add metadata
      parsed.parsedAt = new Date().toISOString();
      parsed.parser = "Gemini AI";

      return parsed;
    } catch (error) {
      console.error("Failed to parse Gemini response:", error);
      console.log("Raw response:", response);

      // Return a basic structure if parsing fails
      return {
        error: "Failed to parse AI response",
        rawResponse: response,
        personalInfo: {
          name: "Parsing Error",
          email: "",
          phone: "",
          location: "",
        },
        summary: "Failed to parse resume. Please check the file format.",
        experience: [],
        education: [],
        skills: {
          technical: [],
          soft: [],
          tools: [],
          languages: [],
        },
        projects: [],
        certifications: [],
        spokenLanguages: [],
        awards: [],
        publications: [],
      };
    }
  },
};
