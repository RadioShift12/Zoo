const sanitizeInput = (input) => {
    // Part 2
    console.log(`Original: ${input}`);
    
    let sanitized = input.replace(/<[^>]*>?/gm, '');

    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    sanitized = sanitized.replace(/[&<>"']/g, (m) => map[m]);

    console.log(`Sanitized: ${sanitized}`);
    return sanitized;
};
const contactForm = document.getElementById('contactForm');
const outputDiv = document.getElementById('output');

contactForm.addEventListener('submit', (e) => {
    // Part 2
    e.preventDefault();

    const rawName = document.getElementById('name').value;
    const rawEmail = document.getElementById('email').value;
    const rawMessage = document.getElementById('message').value;

    if (!rawName || !rawEmail || !rawMessage) {
        alert("Please fill out all fields.");
        return;
    }

    const cleanName = sanitizeInput(rawName);
    const cleanEmail = sanitizeInput(rawEmail);
    const cleanMessage = sanitizeInput(rawMessage);

    displayData(cleanName, cleanEmail, cleanMessage);
});

const displayData = (name, email, message) => {
    // Part 2
    outputDiv.innerHTML = ''; 
    
    const nameElement = document.createElement('p');

    nameElement.textContent = `Name: ${name}`; 
    
    const messageElement = document.createElement('p');
    messageElement.textContent = `Message: ${message}`;

    outputDiv.appendChild(nameElement);
    outputDiv.appendChild(messageElement);
    
    renderTestTable(name, message);
};

const renderTestTable = (name, msg) => {
    if(msg){/*e*/}
    const testResults = [
        { inputType: 'Normal Text', input: 'John Doe', result: name },
        { inputType: 'HTML Tag', input: '<b>Bold</b>', result: sanitizeInput('<b>Bold</b>') },
        { inputType: 'Script Tag', input: '<script>alert("XSS")</script>', result: sanitizeInput('<script>alert("XSS")</script>') },
        { inputType: 'Special Chars', input: 'Price < $10 & "Free"', result: sanitizeInput('Price < $10 & "Free"') }
    ];

    console.table(testResults);
};