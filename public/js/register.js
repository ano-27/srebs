document.addEventListener('DOMContentLoaded', function () {
    console.log('Register script loaded');

    const form = document.getElementById('registerForm');
    if (!form) {
        console.error('Form element not found');
        return;
    }

    form.addEventListener('submit', async function (e) {            // The async function is the Event listener for the Submit Event. e is the event object passed automatically by the browser. It contains details about the event like what triggered it
    
        e.preventDefault();                                         // Prevents the default form submission behavior (which is to send the form data and reload the page) - - > We’ll handle the form submission ourself 

        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password }) // We are passing username: username, email: email, password: password
            });

            const data = await response.json();

            if (response.ok) {
                document.getElementById('message').innerHTML = '<p class="success">Registration successful. Redirecting to login in 4 seconds...</p>';
                setTimeout(() => {
                    window.location.href = '/login';
                }, 4000);
            } else {
                document.getElementById('message').innerHTML = `<p class="error">${data.message || 'Registration failed'}</p>`;
            }
        } catch (error) {
            console.error(error);
            document.getElementById('message').innerHTML = '<p class="error">Internal server error.</p>';
        }
    });
});