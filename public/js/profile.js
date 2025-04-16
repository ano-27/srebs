async function fetchProfile() {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        window.location.href = '/login';
        return;
    }
    try {
        const response = await fetch('/api/profile', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        if (response.status === 401) {
            await refreshToken();
            fetchProfile();
            return;
        }
        const data = await response.json();
        if (response.ok) {
            const profileDiv = document.getElementById('profileData');
            profileDiv.innerHTML = `
                <p><strong>Username:</strong> ${data.username}</p>
                <p><strong>Email:</strong> ${data.email}</p>
                <!-- Add more profile data as needed -->
            `;
        } else {
            document.getElementById('profileData').innerHTML = `<p class="error">${data.message || 'Failed to load profile'}</p>`; 
        }
    } catch (error) {
        document.getElementById('profileData').innerHTML = '<p class="error">Something went wrong. Please try again.</p>';
    }
}

async function refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      window.location.href = '/login';
      return;
    }
    try {
        const response = await fetch('/refreshtoken', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refreshToken })
        });
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('accessToken', data.accessToken);
            if (data.refreshToken) {
              localStorage.setItem('refreshToken', data.refreshToken);
            }
        } else {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
         }
    } catch (error) {
        console.log(error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
    }
}

document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        await fetch('/api/logout', {
            method: 'POST',
            credentials: 'include'    // Include cookies in the request. Better than sending refreshToken in body. Moreover, in Backend, we are handling currently via cookies only. We haven't set up to receive refreshToken in req.body
        });
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
    } catch (error) {
        console.log(error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
    }
});
window.addEventListener('DOMContentLoaded', fetchProfile);  // When HTML contents of profile.handlebars page are loaded and parsed, call the fetchProfile function.  // Just placing the script at the end of Handlebar file, doesn't always guarantee the correct order, so, it's a safe practise to use DOMContentLoaded