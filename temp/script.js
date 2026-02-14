// Floating Hearts Background
function createFloatingHearts() {
    const container = document.getElementById('floating-hearts-container');
    const heartCount = 15;

    for (let i = 0; i < heartCount; i++) {
        const heart = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        heart.classList.add('floating-heart');
        heart.setAttribute('viewBox', '0 0 24 24');
        heart.setAttribute('fill', 'currentColor');
        
        const size = 20 + Math.random() * 30;
        heart.style.width = size + 'px';
        heart.style.height = size + 'px';
        heart.style.left = Math.random() * 100 + '%';
        heart.style.animationDelay = Math.random() * 5 + 's';
        heart.style.animationDuration = (8 + Math.random() * 4) + 's';
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z');
        
        heart.appendChild(path);
        container.appendChild(heart);
    }
}

// Popup Modal Functions
function openPopup() {
    const overlay = document.getElementById('popup-overlay');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closePopup() {
    const overlay = document.getElementById('popup-overlay');
    overlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Response Message Functions
function showResponse(type) {
    const responseContainer = document.getElementById('response-message');
    responseContainer.style.display = 'block';
    
    if (type === 'yes') {
        responseContainer.className = 'response-message response-yes';
        responseContainer.innerHTML = `
            <svg class="response-sparkle sparkle-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15 8.5 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 9 8.5 12 2"></polygon>
            </svg>
            <svg class="response-sparkle sparkle-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15 8.5 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 9 8.5 12 2"></polygon>
            </svg>
            <div class="response-header">
                <h3 class="response-title response-title-yes">HEHEHEHE</h3>
            </div>
            <p class="response-text response-text-yes">
                Love you :)
            </p>
            <img class="response-emoji" src="image0.jpg" alt="HEHE">
            <p class="response-text response-text-yes" style="font-size: 0.5rem; text-align: right; margin-top: 20px;">
                Should've picked this from the start...
            </p>
        `;
    } else {
        responseContainer.className = 'response-message response-no';

        // Define multiple 'no' responses
        const noResponses = [
            `
            <div class="response-header">
                <h3 class="response-title response-title-no">Wrong one bro</h3>
            </div>
            <p class="response-text response-text-no">
                W H A T
            </p>
            <img class="response-emoji emoji-shake" src="image1.jpg" alt="minion">
            `,
            `
            <div class="response-header">
                <h3 class="response-title response-title-no">Dude...</h3>
            </div>
            <p class="response-text response-text-no">
                Cmon...
            </p>
            <img class="response-emoji emoji-shake" src="image2.jpg" alt="cat">
            `,
            `
            <div class="response-header">
                <h3 class="response-title response-title-no">WRONG ANSWER</h3>
            </div>
            <p class="response-text response-text-no">
                NOPE NOPE NOPE NOPE NOPE NOPE NOPE NOPE NOPE NOPE NOPE 
            </p>
            <p class="response-text response-text-no">
                BOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO 
            </p>
            <img class="response-emoji emoji-shake" src="image3.jpg" alt="upin n ipin">
            `
        ];

        // Randomly select a response
        const randomResponse = noResponses[Math.floor(Math.random() * noResponses.length)];
        responseContainer.innerHTML = randomResponse;
    }
    
    // Scroll to response message
    setTimeout(() => {
        responseContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initialize floating hearts
    createFloatingHearts();
    
    // Main button click
    document.getElementById('main-button').addEventListener('click', openPopup);
    
    // Popup close button
    document.getElementById('close-popup').addEventListener('click', closePopup);
    
    // Close popup when clicking overlay
    document.getElementById('popup-overlay').addEventListener('click', function(e) {
        if (e.target === this) {
            closePopup();
        }
    });
    
    // Close popup with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closePopup();
        }
    });
    
    // Yes button
    document.getElementById('btn-yes').addEventListener('click', function() {
        showResponse('yes');
        closePopup();
    });
    
    // No button
    document.getElementById('btn-no').addEventListener('click', function() {
        showResponse('no');
        closePopup();
    });
});
