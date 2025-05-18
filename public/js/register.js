document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('register').addEventListener('click', async function (e) {
        e.preventDefault();
        let email = document.getElementById('email').value;
        let  password = document.getElementById('password').value;
        const response = await fetch(`/api/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        console.log(' == data r ==', data);
        if (response.ok) {
            alert(data.message);
            window.location.href= '/login';
        } else {
            alert(data.message);
        }
    });
});