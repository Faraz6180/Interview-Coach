require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

console.log('🎭 Running in MOCK MODE (Perfect for demos!)');

// ========================================
// MOCK AI RESPONSES (Looks Real!)
// ========================================

const MOCK_QUESTIONS = {
  'software engineer': [
    "Tell me about your experience with software development and programming languages",
    "Describe a challenging bug you encountered and how you resolved it",
    "How do you approach code reviews and ensure code quality?",
    "What's your experience with version control systems like Git?",
    "Explain the difference between object-oriented and functional programming",
    "How do you stay updated with new technologies and programming trends?",
    "Describe a time when you had to optimize application performance",
    "What testing methodologies are you familiar with?",
    "How do you handle technical debt in a project?",
    "Tell me about a project where you had to learn a new technology quickly"
  ],
  'data analyst': [
    "How do you approach data cleaning and preprocessing?",
    "Tell me about your experience with SQL and database queries",
    "Describe a time when you found insights from data that impacted business decisions",
    "What data visualization tools are you proficient in?",
    "How do you handle missing or inconsistent data in large datasets?",
    "Explain your process for creating meaningful KPIs and metrics",
    "Tell me about a complex data analysis project you've completed",
    "How do you ensure data accuracy and integrity in your reports?",
    "What statistical methods do you commonly use in your analysis?",
    "Describe your experience with Excel, Python, or R for data analysis"
  ],
  'customer service': [
    "Tell me about a time you dealt with a difficult customer and how you resolved it",
    "How do you handle multiple customer inquiries simultaneously?",
    "Describe your approach to maintaining professionalism under pressure",
    "What strategies do you use to understand customer needs?",
    "Tell me about a time you went above and beyond for a customer",
    "How do you handle situations when you don't know the answer to a customer's question?",
    "Describe your experience with CRM systems or help desk software",
    "How do you measure customer satisfaction?",
    "Tell me about a time you received negative feedback and how you responded",
    "What does excellent customer service mean to you?"
  ],
  'digital marketing': [
    "Tell me about your experience with social media marketing campaigns",
    "How do you measure the success of a digital marketing campaign?",
    "Describe your experience with SEO and content marketing",
    "What analytics tools do you use to track campaign performance?",
    "Tell me about a successful email marketing campaign you've managed",
    "How do you stay updated with digital marketing trends?",
    "Describe your experience with paid advertising (Google Ads, Facebook Ads)",
    "How do you approach creating content for different target audiences?",
    "Tell me about a time when a marketing campaign didn't perform as expected",
    "What's your experience with marketing automation tools?"
  ],
  'default': [
    "Tell me about yourself and your professional background",
    "What are your greatest strengths and how do they apply to this role?",
    "Describe a challenging situation you faced at work and how you handled it",
    "Where do you see yourself in 5 years?",
    "Why are you interested in this position?",
    "What is your greatest professional achievement?",
    "How do you handle stress and pressure in the workplace?",
    "Describe a time when you had to work with a difficult team member",
    "What motivates you in your work?",
    "Why should we hire you for this position?"
  ]
};

// Mock resume analysis responses
const MOCK_RESUME_DATA = {
  skills: ["JavaScript", "React", "Node.js", "Python", "SQL", "Git"],
  experience_years: "2 years",
  key_projects: ["E-commerce Website", "Task Management App", "Data Dashboard"],
  education: "Bachelor's in Computer Science from NUST",
  strengths: ["Problem-solving", "Team collaboration", "Fast learner", "Attention to detail"]
};

const MOCK_RESUME_QUESTIONS = [
  "Tell me about your E-commerce Website project. What technologies did you use?",
  "How did you implement the shopping cart functionality in your E-commerce project?",
  "Describe the architecture of your Task Management App",
  "What challenges did you face while building the Data Dashboard?",
  "How did you ensure data security in your E-commerce Website?",
  "Tell me about your experience working with React and Node.js",
  "How do you approach debugging issues in your applications?",
  "Describe a time when you had to optimize performance in one of your projects",
  "What testing strategies did you implement in your projects?",
  "How do you handle state management in React applications?"
];

// Mock scoring based on answer length and keywords
function mockScore(transcript) {
  const words = transcript.split(' ').length;
  const hasExamples = transcript.toLowerCase().includes('example') || 
                      transcript.toLowerCase().includes('instance') ||
                      transcript.toLowerCase().includes('time when');
  const hasNumbers = /\d+/.test(transcript);
  
  let clarityScore = Math.min(8.5, 5 + (words / 20));
  let structureScore = hasExamples ? 8.0 : 6.5;
  let contentScore = hasNumbers ? 8.5 : 7.0;
  
  if (words < 20) {
    clarityScore = 5.5;
    structureScore = 5.0;
    contentScore = 5.5;
  }
  
  const overall = (clarityScore + structureScore + contentScore) / 3;
  
  return {
    clarity: parseFloat(clarityScore.toFixed(1)),
    structure: parseFloat(structureScore.toFixed(1)),
    content: parseFloat(contentScore.toFixed(1)),
    overall: parseFloat(overall.toFixed(1))
  };
}

// Mock feedback generation
function mockFeedback(question, transcript, scores) {
  const words = transcript.split(' ').length;
  const hasExamples = transcript.toLowerCase().includes('example') || 
                      transcript.toLowerCase().includes('instance');
  
  let strengths = [];
  let improvements = [];
  
  if (words > 30) {
    strengths.push("You provided a detailed response with good depth");
  }
  if (hasExamples) {
    strengths.push("Great use of specific examples to support your points");
  }
  if (scores.clarity > 7) {
    strengths.push("Clear and articulate communication");
  }
  
  if (words < 30) {
    improvements.push("Expand your answer with more specific details and examples");
  }
  if (!hasExamples) {
    improvements.push("Use the STAR method (Situation, Task, Action, Result) to structure your response with concrete examples");
  }
  if (scores.content < 7) {
    improvements.push("Include more relevant details that directly address the question and demonstrate your expertise");
  }
  
  // Ensure we always have at least 2 of each
  while (strengths.length < 2) {
    strengths.push("You maintained professionalism in your response");
  }
  while (improvements.length < 2) {
    improvements.push("Consider adding measurable achievements or outcomes to strengthen your answer");
  }
  
  const feedback = `**What You Did Well:**
- ${strengths[0]}
- ${strengths[1]}

**Areas to Improve:**
- ${improvements[0]}
- ${improvements[1]}

**Sample Ideal Answer:**
I have ${words > 30 ? 'extensive' : 'solid'} experience in this area. For example, in my previous role, I successfully handled a similar situation where I [specific action], which resulted in [measurable outcome]. This experience taught me [key learning], and I'm confident I can bring this expertise to your team.`;

  return feedback;
}

// Mock Urdu translation
function mockUrduFeedback(englishFeedback) {
  return englishFeedback
    .replace('What You Did Well:', 'Aap ne achha kiya:')
    .replace('Areas to Improve:', 'Behtar karne ke liye:')
    .replace('Sample Ideal Answer:', 'Mukhtalif Jawab:')
    .replace(/You provided a detailed response/g, 'Aap ne tafsili jawab diya')
    .replace(/Great use of specific examples/g, 'Bahut achhi misalen di')
    .replace(/Clear and articulate communication/g, 'Saaf aur wazeh guftagu')
    .replace(/Expand your answer/g, 'Apne jawab ko zyada tafsil se bayaan karein')
    .replace(/Use the STAR method/g, 'STAR method استعمال karein')
    .replace(/Include more relevant details/g, 'Zyada mutalliq tafsilat shamil karein')
    .replace(/maintained professionalism/g, 'professionalism ka khyal rakha')
    .replace(/Consider adding measurable achievements/g, 'Qaabil-e-tahseen kamyabiyan shamil karein')
    .replace(/I have/g, 'Mere paas')
    .replace(/experience in this area/g, 'is maidaan mein tajurba hai')
    .replace(/For example/g, 'Misal ke taur par')
    .replace(/in my previous role/g, 'apni pichli job mein')
    .replace(/This experience taught me/g, 'Is tajurbe ne mujhe sikhaya')
    .replace(/I\'m confident/g, 'Mujhe yakeen hai');
}

// ========================================
// API ENDPOINTS
// ========================================

// ENDPOINT 1: Generate questions
app.post('/api/generate-questions', async (req, res) => {
  console.log('\n🎯 ========== GENERATE QUESTIONS ==========');
  console.log('📥 Request:', req.body);
  
  try {
    const { jobTitle, experience } = req.body;
    
    // Simulate API delay for realism
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Find matching questions
    const jobKey = jobTitle.toLowerCase();
    let questions = MOCK_QUESTIONS['default'];
    
    for (const [key, value] of Object.entries(MOCK_QUESTIONS)) {
      if (jobKey.includes(key)) {
        questions = value;
        break;
      }
    }
    
    console.log('✅ Generated', questions.length, 'questions for:', jobTitle);
    
    res.json({ questions });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.json({ questions: MOCK_QUESTIONS['default'] });
  }
});

// ENDPOINT 2: Analyze resume
app.post('/api/analyze-resume', async (req, res) => {
  console.log('\n📄 ========== ANALYZE RESUME ==========');
  
  try {
    const { resumeText } = req.body;
    
    if (!resumeText || resumeText.length < 50) {
      return res.status(400).json({ error: 'Resume text too short' });
    }
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Try to extract some real data from the resume
    const skills = [];
    const projects = [];
    
    // Common skills
    const skillKeywords = ['javascript', 'python', 'java', 'react', 'node', 'sql', 'css', 'html', 'git', 'docker'];
    skillKeywords.forEach(skill => {
      if (resumeText.toLowerCase().includes(skill)) {
        skills.push(skill.charAt(0).toUpperCase() + skill.slice(1));
      }
    });
    
    // Extract experience
    let experienceYears = "Fresher";
    const expMatch = resumeText.match(/(\d+)\s*(years?|yr)/i);
    if (expMatch) {
      experienceYears = `${expMatch[1]} year${expMatch[1] > 1 ? 's' : ''}`;
    }
    
    // Extract education
    let education = "Bachelor's Degree";
    if (resumeText.toLowerCase().includes('master')) {
      education = "Master's Degree";
    } else if (resumeText.toLowerCase().includes('phd') || resumeText.toLowerCase().includes('doctorate')) {
      education = "PhD";
    }
    
    const resumeData = {
      skills: skills.length > 0 ? skills : MOCK_RESUME_DATA.skills,
      experience_years: experienceYears,
      key_projects: resumeText.toLowerCase().includes('project') ? 
        ["Project mentioned in resume", "Web Application", "Database System"] : 
        MOCK_RESUME_DATA.key_projects,
      education: education,
      strengths: MOCK_RESUME_DATA.strengths
    };
    
    console.log('✅ Resume analyzed:', resumeData);
    
    res.json({
      resumeData,
      questions: MOCK_RESUME_QUESTIONS
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ENDPOINT 3: Analyze answer
app.post('/api/analyze', async (req, res) => {
  console.log('\n🎤 ========== ANALYZE ANSWER ==========');
  
  try {
    const { question, transcript } = req.body;
    
    if (!question || !transcript) {
      return res.status(400).json({ error: 'Question and transcript required' });
    }
    
    console.log('❓ Question:', question.substring(0, 80));
    console.log('💬 Answer length:', transcript.length, 'chars');
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Generate scores
    const scores = mockScore(transcript);
    console.log('📊 Scores:', scores);
    
    // Generate feedback
    const feedbackEnglish = mockFeedback(question, transcript, scores);
    const feedbackUrdu = mockUrduFeedback(feedbackEnglish);
    
    console.log('✅ Analysis complete!');
    
    res.json({
      success: true,
      scores,
      feedbackEnglish,
      feedbackUrdu
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    mode: 'MOCK (Demo Mode)',
    timestamp: new Date().toISOString()
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('\n🚀 ========================================');
  console.log('🚀 Interview Coach Server RUNNING!');
  console.log(`🚀 URL: http://localhost:${PORT}`);
  console.log('🚀 ========================================');
  console.log('');
  console.log('🎭 MODE: MOCK AI (Perfect for demos!)');
  console.log('✅ All features work without API keys');
  console.log('✅ Realistic responses');
  console.log('✅ Deploy anywhere easily');
  console.log('');
  console.log('🧪 Test: http://localhost:' + PORT + '/api/health');
  console.log('');
});