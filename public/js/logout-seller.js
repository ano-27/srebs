document.addEventListener('DOMContentLoaded', function() {
    console.log('== dom contents loaded ==')
    const logoutButtonExists = document.getElementById('logoutElem');
    if (logoutButtonExists) {
        console.log('== logout button exists ==');
        document.getElementById('logoutElem').addEventListener('click', async (event) => {
            event.preventDefault(); // Stops the default anchor behaviour to avoid clash bw JS re-direction and anchor href = "" 
            console.log('== seller logout script called ==');
            if (confirm('Proceed with Logout?')) {
                try {
                    await fetch('/api/logout', {
                        method: 'POST',
                        credentials: 'include'
                    });
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    window.location.href = '/login';
                } catch (error) {
                    console.log(error);
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    window.location.href = '/login';
                }
            }
        });
    } 
});
