// JS file to tackle form submission and API hitting based on that

// When content of DOM is loaded, call the function
document.addEventListener('DOMContentLoaded', function() {
    console.log('Register Seller Script Loaded');
    const sellerForm = document.getElementById('seller-registration-form');
    if (sellerForm) {
        // On submit event, calls the function which takes event object 'e' (event object) as parameter 
        sellerForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const formData = {
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
                payment_from: document.getElementById('payment_from').value,
                payment_to: document.getElementById('payment_to').value,
                location: document.getElementById('location').value,
                shop_name: document.getElementById('shop_name').value
            }
            try {
                const response = await fetch('/api/register-as-seller', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify(formData)
                });
                const result = await response.json();
                if (result.success) {
                    // alert('Registration successful');
                    setTimeout(() => {
                        window.location.href= '/login';
                    }, 500);
                } else {
                    alert(`Failed to register: ${result?.message}`);
                }
            } catch (err) {
                console.error('Error: ', err);
                alert(`Internal server error: ${err}`);
            }
        });
    }
});