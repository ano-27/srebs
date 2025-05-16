document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('logoutElem').addEventListener('click', async () => {
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
});