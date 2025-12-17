// Configuration
let currentLanguage = 'en';
let isRecording = false;
let mediaRecorder = null;
let audioChunks = [];
let recordingTimer = null;
let recordingSeconds = 0;

// Initialize app
window.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 App starting...');
    
    setTimeout(() => {
        document.getElementById('loadingScreen').style.display = 'none';
        document.getElementById('app').style.display = 'block';
        showDashboard();
    }, 1000);
    
    setupEventListeners();
});

function setupEventListeners() {
    // Language toggle
    document.getElementById('languageToggle').addEventListener('click', toggleLanguage);
    
    // Question generator
    document.getElementById('generateQuestionsBtn').addEventListener('click', generateQuestions);
    
    // Resume analyzer
    document.getElementById('analyzeResumeBtn').addEventListener('click', analyzeResume);
    
    // Recording
    document.getElementById('recordBtn').addEventListener('click', toggleRecording);
    document.getElementById('analyzeBtn').addEventListener('click', analyzeAnswer);
    
    // Tabs
    document.getElementById('resultsTab').addEventListener('click', () => switchTab('results'));
    document.getElementById('historyTab').addEventListener('click', () => switchTab('history'));
    
    // Hide logout and usage (demo mode)
    document.getElementById('logoutBtn').style.display = 'none';
    document.querySelector('.usage-banner').style.display = 'none';
}

function showDashboard() {
    document.getElementById('authScreen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
}

// ==========================================
// GENERATE QUESTIONS
// ==========================================

async function generateQuestions() {
    const jobTitle = document.getElementById('jobTitle').value.trim();
    
    if (!jobTitle) {
        alert('Please enter a job title!');
        return;
    }
    
    const experience = document.getElementById('experienceLevel').value;
    const btn = document.getElementById('generateQuestionsBtn');
    const btnText = btn.querySelector('span');
    
    btn.disabled = true;
    btnText.textContent = '🤖 AI is generating questions...';
    
    try {
        console.log('📤 Sending request to /api/generate-questions');
        console.log('Data:', { jobTitle, experience });
        
        const response = await fetch('/api/generate-questions', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ jobTitle, experience })
        });
        
        console.log('📥 Response status:', response.status);
        console.log('📥 Response headers:', response.headers.get('content-type'));
        
        // Check if response is OK
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Server error:', errorText);
            throw new Error(`Server error: ${response.status}`);
        }
        
        // Check if response has content
        const text = await response.text();
        console.log('📝 Response text:', text);
        
        if (!text || text.trim().length === 0) {
            throw new Error('Empty response from server');
        }
        
        // Parse JSON
        let data;
        try {
            data = JSON.parse(text);
        } catch (parseError) {
            console.error('❌ JSON parse error:', parseError);
            console.error('Text was:', text);
            throw new Error('Invalid JSON response from server');
        }
        
        console.log('✅ Parsed data:', data);
        
        if (!data.questions || !Array.isArray(data.questions)) {
            throw new Error('Invalid data format - no questions array');
        }
        
        const questions = data.questions;
        
        if (questions.length === 0) {
            throw new Error('No questions generated');
        }
        
        // Populate dropdown
        const select = document.getElementById('questionSelect');
        select.innerHTML = '<option value="">-- Select a question --</option>';
        
        questions.forEach((q, index) => {
            const option = document.createElement('option');
            option.value = q;
            option.textContent = `${index + 1}. ${q}`;
            select.appendChild(option);
        });
        
        // Show question section
        document.getElementById('questionSection').style.display = 'block';
        document.getElementById('questionSection').scrollIntoView({ behavior: 'smooth' });
        
        alert(`✅ Generated ${questions.length} questions for ${jobTitle}!`);
        
    } catch (error) {
        console.error('❌ Full error:', error);
        alert(`Error: ${error.message}\n\nPlease check the browser console (F12) for details.`);
    } finally {
        btn.disabled = false;
        btnText.textContent = '✨ Generate Questions with AI';
    }
}

// ==========================================
// ANALYZE RESUME
// ==========================================

async function analyzeResume() {
    const resumeText = document.getElementById('resumeText').value.trim();
    
    if (!resumeText || resumeText.length < 50) {
        alert('Please paste your resume (at least 50 characters)!');
        return;
    }
    
    const jobTitle = document.getElementById('jobTitle').value.trim() || 'this position';
    const btn = document.getElementById('analyzeResumeBtn');
    const btnText = btn.querySelector('span');
    
    btn.disabled = true;
    btnText.textContent = '🤖 AI is analyzing your resume...';
    
    try {
        console.log('📤 Sending resume (length:', resumeText.length, 'chars)');
        
        const response = await fetch('/api/analyze-resume', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ resumeText, jobTitle })
        });
        
        console.log('📥 Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error: ${response.status} - ${errorText}`);
        }
        
        const text = await response.text();
        if (!text) {
            throw new Error('Empty response');
        }
        
        const data = JSON.parse(text);
        console.log('✅ Resume data:', data);
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        // Display resume analysis
        displayResumeAnalysis(data.resumeData);
        
        // Populate questions
        const select = document.getElementById('questionSelect');
        select.innerHTML = '<option value="">-- Select a question --</option>';
        
        data.questions.forEach((q, index) => {
            const option = document.createElement('option');
            option.value = q;
            option.textContent = `${index + 1}. ${q}`;
            select.appendChild(option);
        });
        
        document.getElementById('questionSection').style.display = 'block';
        document.getElementById('questionSection').scrollIntoView({ behavior: 'smooth' });
        
        alert(`✅ Resume analyzed! Generated ${data.questions.length} personalized questions!`);
        
    } catch (error) {
        console.error('❌ Error:', error);
        alert(`Error: ${error.message}`);
    } finally {
        btn.disabled = false;
        btnText.textContent = '🤖 Analyze Resume & Generate Questions';
    }
}

function displayResumeAnalysis(data) {
    const resultsDiv = document.getElementById('resumeAnalysisResults');
    const displayDiv = document.getElementById('resumeDataDisplay');
    
    displayDiv.innerHTML = `
        <div class="resume-data-item">
            <strong>💼 Experience:</strong>
            <span>${data.experience_years}</span>
        </div>
        <div class="resume-data-item">
            <strong>🎓 Education:</strong>
            <span>${data.education}</span>
        </div>
        <div class="resume-data-item">
            <strong>🛠️ Skills:</strong>
            <span>${data.skills.slice(0, 5).join(', ')}</span>
        </div>
        <div class="resume-data-item">
            <strong>🚀 Projects:</strong>
            <span>${data.key_projects.slice(0, 3).join(', ')}</span>
        </div>
        <div class="resume-data-item">
            <strong>⭐ Strengths:</strong>
            <span>${data.strengths.join(', ')}</span>
        </div>
    `;
    
    resultsDiv.style.display = 'block';
}

// ==========================================
// RECORDING
// ==========================================

function toggleRecording() {
    if (!isRecording) {
        startRecording();
    } else {
        stopRecording();
    }
}

async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        
        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };
        
        mediaRecorder.onstop = async () => {
            transcribeAudio();
        };
        
        mediaRecorder.start();
        isRecording = true;
        
        const btn = document.getElementById('recordBtn');
        btn.classList.add('recording');
        btn.querySelector('span:last-child').textContent = 'Stop Recording';
        
        document.getElementById('recordStatus').innerHTML = `
            <span class="status-dot"></span>
            <span>Recording...</span>
        `;
        
        recordingSeconds = 0;
        document.getElementById('timerDisplay').style.display = 'block';
        recordingTimer = setInterval(() => {
            recordingSeconds++;
            const mins = Math.floor(recordingSeconds / 60).toString().padStart(2, '0');
            const secs = (recordingSeconds % 60).toString().padStart(2, '0');
            document.getElementById('timerText').textContent = `${mins}:${secs}`;
        }, 1000);
        
    } catch (error) {
        console.error('Microphone error:', error);
        alert('Could not access microphone. Please type your answer instead.');
    }
}

function stopRecording() {
    if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        isRecording = false;
        
        const btn = document.getElementById('recordBtn');
        btn.classList.remove('recording');
        btn.querySelector('span:last-child').textContent = 'Start Recording';
        
        document.getElementById('recordStatus').innerHTML = `
            <span class="status-dot"></span>
            <span>Processing...</span>
        `;
        
        clearInterval(recordingTimer);
    }
}

function transcribeAudio() {
    // Fallback: Ask user to type
    const transcript = prompt('Please type your answer here:');
    
    if (transcript && transcript.trim()) {
        displayTranscript(transcript);
    } else {
        alert('No answer provided. Please try again.');
        resetRecording();
    }
}

function displayTranscript(text) {
    document.getElementById('transcriptText').textContent = text;
    document.getElementById('transcriptBox').style.display = 'block';
    document.getElementById('analyzeBtn').style.display = 'block';
    document.getElementById('timerDisplay').style.display = 'none';
    
    document.getElementById('recordStatus').innerHTML = `
        <span class="status-dot"></span>
        <span>Ready to analyze</span>
    `;
}

function resetRecording() {
    document.getElementById('transcriptBox').style.display = 'none';
    document.getElementById('analyzeBtn').style.display = 'none';
    document.getElementById('timerDisplay').style.display = 'none';
    document.getElementById('recordStatus').innerHTML = `
        <span class="status-dot"></span>
        <span>Ready to record</span>
    `;
}

// ==========================================
// ANALYZE ANSWER
// ==========================================

async function analyzeAnswer() {
    const question = document.getElementById('questionSelect').value || 
                     document.getElementById('customQuestion').value;
    const transcript = document.getElementById('transcriptText').textContent;
    
    if (!question) {
        alert('Please select or enter a question!');
        return;
    }
    
    if (!transcript) {
        alert('No transcript available!');
        return;
    }
    
    const btn = document.getElementById('analyzeBtn');
    btn.textContent = 'Analyzing...';
    btn.disabled = true;
    
    try {
        console.log('📤 Analyzing answer...');
        console.log('Question:', question);
        console.log('Answer length:', transcript.length);
        
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ question, transcript })
        });
        
        console.log('📥 Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error: ${response.status}`);
        }
        
        const text = await response.text();
        if (!text) {
            throw new Error('Empty response');
        }
        
        const result = JSON.parse(text);
        console.log('✅ Analysis result:', result);
        
        if (result.error) {
            throw new Error(result.error);
        }
        
        displayResults(result);
        resetRecording();
        
    } catch (error) {
        console.error('❌ Error:', error);
        alert(`Analysis failed: ${error.message}`);
    } finally {
        btn.disabled = false;
        btn.textContent = 'Analyze My Answer';
    }
}

function displayResults(result) {
    switchTab('results');
    
    document.querySelector('.empty-state').style.display = 'none';
    document.getElementById('resultsContent').style.display = 'block';
    
    const scores = result.scores;
    
    document.getElementById('scoreClarity').textContent = scores.clarity.toFixed(1);
    document.getElementById('scoreStructure').textContent = scores.structure.toFixed(1);
    document.getElementById('scoreContent').textContent = scores.content.toFixed(1);
    document.getElementById('scoreOverall').textContent = scores.overall.toFixed(1);
    
    setTimeout(() => {
        document.getElementById('barClarity').style.width = (scores.clarity * 10) + '%';
        document.getElementById('barStructure').style.width = (scores.structure * 10) + '%';
        document.getElementById('barContent').style.width = (scores.content * 10) + '%';
        document.getElementById('barOverall').style.width = (scores.overall * 10) + '%';
    }, 100);
    
    document.getElementById('feedbackEnglishText').innerHTML = formatFeedback(result.feedbackEnglish);
    document.getElementById('feedbackUrduText').innerHTML = formatFeedback(result.feedbackUrdu);
    
    if (currentLanguage === 'en') {
        document.getElementById('feedbackEnglish').style.display = 'block';
        document.getElementById('feedbackUrdu').style.display = 'none';
    } else {
        document.getElementById('feedbackEnglish').style.display = 'none';
        document.getElementById('feedbackUrdu').style.display = 'block';
    }
}

function formatFeedback(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');
}

// ==========================================
// TAB SWITCHING
// ==========================================

function switchTab(tab) {
    if (tab === 'results') {
        document.getElementById('resultsTab').classList.add('active');
        document.getElementById('historyTab').classList.remove('active');
        document.getElementById('resultsView').style.display = 'block';
        document.getElementById('historyView').style.display = 'none';
    } else {
        document.getElementById('historyTab').classList.add('active');
        document.getElementById('resultsTab').classList.remove('active');
        document.getElementById('historyView').style.display = 'block';
        document.getElementById('resultsView').style.display = 'none';
    }
}

// ==========================================
// LANGUAGE TOGGLE
// ==========================================

function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'ur' : 'en';
    
    const btn = document.getElementById('languageToggle');
    btn.textContent = currentLanguage === 'en' ? 'اردو' : 'English';
    
    document.querySelectorAll('[data-en]').forEach(el => {
        el.textContent = el.getAttribute(`data-${currentLanguage}`);
    });
    
    if (document.getElementById('resultsContent').style.display === 'block') {
        if (currentLanguage === 'en') {
            document.getElementById('feedbackEnglish').style.display = 'block';
            document.getElementById('feedbackUrdu').style.display = 'none';
        } else {
            document.getElementById('feedbackEnglish').style.display = 'none';
            document.getElementById('feedbackUrdu').style.display = 'block';
        }
    }
}

console.log('✅ App.js loaded successfully!');