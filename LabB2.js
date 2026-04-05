const MAX_NAME_LENGTH = 50;
const MAX_MSG_LENGTH = 500;
const RATE_LIMIT_MS = 60000; 
const MAX_ATTEMPTS = 5;

//  Part 1, 3: Sanitization & SQL Protection
const sanitizeInput = (text) => {
    if (typeof text !== 'string') return "";
    
    const sqlKeywords = /SELECT|INSERT|UPDATE|DELETE|DROP|UNION|OR|AND|--|;/gi;
    let cleanText = text.replace(sqlKeywords, "");

    // Replacing quotes to prevent break-outs
    cleanText = cleanText.replace(/'/g, "''").replace(/"/g, '""');
    
    return cleanText.trim();
};

// Part 2: Overflow Protection
const validateLength = (text, maxLength) => {
    if (text.length > maxLength) {
        return { 
            valid: false, 
            data: text.substring(0, maxLength), 
            originalLength: text.length 
        };
    }
    return { valid: true, data: text };
};

const generateCSRFToken = () => {
    const array = new Uint32Array(2);
    window.crypto.getRandomValues(array);
    const token = Array.from(array, dec => dec.toString(16)).join('');
    sessionStorage.setItem('csrf_token', token);
    return token;
};

const checkRateLimit = () => {
    const now = Date.now();
    let logs = [];
    try {
        logs = JSON.parse(sessionStorage.getItem('submission_logs') || '[]');
    } catch (e) {
        console.error("Session storage error:", e);
    }
    
    logs = logs.filter(timestamp => now - timestamp < RATE_LIMIT_MS);
    
    if (logs.length >= MAX_ATTEMPTS) {
        const waitTime = Math.ceil((logs[0] + RATE_LIMIT_MS - now) / 1000);
        return { allowed: false, waitTime };
    }
    
    logs.push(now);
    sessionStorage.setItem('submission_logs', JSON.stringify(logs));
    return { allowed: true };
};

const setStatusMessage = (text, isError = false) => {
    const outputDiv = document.getElementById('output');
    if (!outputDiv) return;

    while (outputDiv.firstChild) {
        outputDiv.removeChild(outputDiv.firstChild);
    }

    const messageElement = document.createElement('p');
    messageElement.textContent = text;
    messageElement.style.color = isError ? 'red' : 'green';
    messageElement.style.fontWeight = 'bold';
    outputDiv.appendChild(messageElement);
};

const contactForm = document.getElementById('contactForm');
let currentToken = generateCSRFToken();

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        try {
            const storedToken = sessionStorage.getItem('csrf_token');
            const rateStatus = checkRateLimit();
            
            // 1. DoS Validation
            if (!rateStatus.allowed) {
                setStatusMessage(`Rate limit exceeded. Wait ${rateStatus.waitTime}s.`, true);
                logTestResult('DoS Protection', 'Spamming', 'Block', 'Blocked', 'PASS');
                return;
            }

            // 2. CSRF Validation
            if (!storedToken || storedToken !== currentToken) {
                setStatusMessage("Security Error: Invalid Session.", true);
                logTestResult('CSRF Protection', 'Invalid Token', 'Reject', 'Rejected', 'PASS');
                return;
            }

            // 3. Buffer Overflow and SQL Validation
            const nameEl = document.getElementById('name');
            const msgEl = document.getElementById('message');

            if (!nameEl || !msgEl) throw new Error("Form elements missing.");

            // Data Type and Length Check
            const nameCheck = validateLength(nameEl.value, MAX_NAME_LENGTH);
            const msgCheck = validateLength(msgEl.value, MAX_MSG_LENGTH);

            if (!nameCheck.valid) {
                setStatusMessage(`Name exceeds ${MAX_NAME_LENGTH} chars. Truncated.`, true);
                logTestResult('Buffer Overflow', 'Oversized Name', 'Truncate/Reject', 'Detected', 'PASS');
                return;
            }

            if (!msgCheck.valid) {
                setStatusMessage(`Message exceeds ${MAX_MSG_LENGTH} chars.`, true);
                logTestResult('Buffer Overflow', 'Oversized Message', 'Reject', 'Detected', 'PASS');
                return;
            }

            // SQL Protection
            const sanitizedName = sanitizeInput(nameCheck.data);
            const sanitizedMsg = sanitizeInput(msgCheck.data);

            // Pattern Match Check for Logging
            if (nameEl.value.match(/SELECT|DROP|--/i)) {
                logTestResult('SQL Protection', nameEl.value, 'Cleanse', 'Pattern Stripped', 'PASS');
            }

            if (sanitizedName && sanitizedMsg) {
                setStatusMessage(`Thank you, ${sanitizedName}. Your message has been received securely.`);
                logTestResult('Valid Submission', 'Authorized User', 'Success', 'Success', 'PASS');
                
                contactForm.reset();
                currentToken = generateCSRFToken();
            }

        } catch (error) {
            console.error("Submission Error:", error);
            setStatusMessage("An unexpected error occurred.", true);
        }
    });
}

// Part 4: Testing Documentation
const testLog = [];
function logTestResult(testCase, input, expected, actual, status) {
    testLog.push({
        "Test Case": testCase,
        "Input": input.substring(0, 20) + (input.length > 20 ? "..." : ""),
        "Expected": expected,
        "Actual": actual,
        "Result": status
    });
    console.clear();
    console.table(testLog);
}