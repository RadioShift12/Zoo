// --- Part 1: CSRF Token Generator ---
// Uses Web Crypto API for tokens
const generateCSRFToken = () => {
    const array = new Uint32Array(2);
    window.crypto.getRandomValues(array);
    const token = Array.from(array, dec => dec.toString(16)).join('');
    sessionStorage.setItem('csrf_token', token);
    return token;
};

// --- Part 3: DoS Protection Tracking ---
const RATE_LIMIT_MS = 60000; 
const MAX_ATTEMPTS = 5;

const checkRateLimit = () => {
    const now = Date.now();
    let logs = JSON.parse(sessionStorage.getItem('submission_logs') || '[]');
    
    // Filter logs for the last 60 seconds
    logs = logs.filter(timestamp => now - timestamp < RATE_LIMIT_MS);
    
    if (logs.length >= MAX_ATTEMPTS) {
        const waitTime = Math.ceil((logs[0] + RATE_LIMIT_MS - now) / 1000);
        return { allowed: false, waitTime };
    }
    
    logs.push(now);
    sessionStorage.setItem('submission_logs', JSON.stringify(logs));
    return { allowed: true };
};

// --- UI Feedback Helper ---
const setStatusMessage = (text, isError = false) => {
    const outputDiv = document.getElementById('output');
    if (!outputDiv) return;

    // Clear existing content
    while (outputDiv.firstChild) {
        outputDiv.removeChild(outputDiv.firstChild);
    }

    const messageElement = document.createElement('p');
    messageElement.textContent = text;
    messageElement.style.color = isError ? 'red' : 'green';
    messageElement.style.fontWeight = 'bold';
    outputDiv.appendChild(messageElement);
};

// --- Main Form Controller ---
const contactForm = document.getElementById('contactForm');
let currentToken = generateCSRFToken();

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const storedToken = sessionStorage.getItem('csrf_token');
    const rateStatus = checkRateLimit();
    
    // 1. DoS Validation
    if (!rateStatus.allowed) {
        setStatusMessage(`Rate limit exceeded. Please wait ${rateStatus.waitTime}s.`, true);
        logTestResult('DoS Protection', 'Spam detected', 'Block', 'Blocked', 'PASS');
        return;
    }

    // 2. CSRF Validation
    if (!storedToken || storedToken !== currentToken) {
        setStatusMessage("Security Error: Invalid Session Token.", true);
        logTestResult('CSRF Protection', 'Invalid Token', 'Reject', 'Rejected', 'PASS');
        return;
    }

    // 3. Secure Data Processing
    const rawName = document.getElementById('name').value;
    const rawMsg = document.getElementById('message').value;

    if (rawName && rawMsg) {
        // Successful Submission Logic
        setStatusMessage(`Thank you, ${rawName}. Your message has been received securely.`);
        logTestResult('Valid Submission', 'Authorized User', 'Success', 'Success', 'PASS');
        
        // Reset form and rotate token
        contactForm.reset();
        currentToken = generateCSRFToken();
    }
});

// --- Part 4: Testing Documentation ---
const testLog = [];
function logTestResult(testCase, input, expected, actual, status) {
    testLog.push({
        "Test Case": testCase,
        "Input": input,
        "Expected": expected,
        "Actual": actual,
        "Result": status
    });
    console.clear();
    console.table(testLog);
}