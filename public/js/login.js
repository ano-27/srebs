console.log('Login script loaded');
document.getElementById('loginForm').addEventListener('submit', async(e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (response.ok) {  
            localStorage.setItem('accessToken', data.userData.accessToken);      // Store tokens locally (not cookies) - - > Will be used to pass authorization in headings to backend
            localStorage.setItem('refreshToken', data.userData.refreshToken);
            localStorage.setItem('email', data.userData.email);
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('user_id', data.userData.user_id);
            localStorage.setItem('role', data.userData.role);
            // document.getElementById('message').innerHTML = '<p class="success">Login successful. Redirecting to profile in 4 seconds...</p>';
            alert(`Login successful`);
            setTimeout(() => {
                if (data.userData.role === 'customer') {
                    window.location.href = '/home';
                } else if (data.userData.role === 'owner') {
                    window.location.href= '/dashboard-index';
                }
            }, 500);
        } else {
            alert(`Login error: ${data.message}`);
            // document.getElementById('message').innerHTML = `<p class="error">${data.message || 'Login failed'}</p>`;
        }
    } catch (error) {
        console.log(error);
        document.getElementById('message').innerHTML = '<p class="error">Internal server error</p>';
    }
});