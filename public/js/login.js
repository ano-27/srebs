console.log('Login script loaded');
document.getElementById('loginForm').addEventListener('submit', async(e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/login', {                    // Hit api/login
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({username, password})
        });
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('accessToken', data.userData.accessToken);      // Store tokens locally (not cookies) - - > Will be used to pass authorization in headings to backend
            localStorage.setItem('refreshToken', data.userData.refreshToken);
            localStorage.setItem('username', data.userData.username);
            localStorage.setItem('isLoggedIn', 'true');
            document.getElementById('message').innerHTML = '<p class="success">Login successful. Redirecting to profile in 4 seconds...</p>';
            setTimeout(() => {
                window.location.href= '/profile';
            }, 4000);
        } else {
            document.getElementById('message').innerHTML = `<p class="error">${data.message || 'Login failed'}</p>`;
        }
    } catch (error) {
        console.log(error);
        document.getElementById('message').innerHTML = '<p class="error">Internal server error</p>';
    }
});