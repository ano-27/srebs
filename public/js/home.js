document.addEventListener('DOMContentLoaded', function() {

    // Handle Scan
    const scanButton = document.getElementById('scanQrButton');
    const scannerContainer = document.getElementById('scannerContainer');
    const video = document.getElementById('scanner');
    const cancelButton = document.getElementById('cancelScan');
    const result = document.getElementById('scanResult');
    let stream = null;

    // Start Scanning
    scanButton.addEventListener('click', startScanning);
    
    function startScanning() {
        scannerContainer.style.display = 'block';

        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(videoStream => {
            stream = videoStream;
            video.srcObject = stream;
            video.play();
            scanQRCode();
        })
        .catch(err => {
            result.textContent = 'Error accessing camera: ' + err.message;
        });
    }
    
    function scanQRCode() {
        // Capture frame every 500ms
        const interval = setInterval(() => {
            if (!stream) {
                clearInterval(interval);
                return;
            }
        
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
            // Send the frame to backend for QR processing
            canvas.toBlob(blob => {
                const formData = new FormData();
                formData.append('qrImage', blob, 'qr-scan.png');

                console.log('\n>>> Sending QR image to server...');
            
                fetch('/api/read-qr', {
                    method: 'POST',
                    body: formData
                })
                .then(response => {
                    console.log('\n>>> Response received:', response);
                    return response.json();
                })
                .then(data => {
                    if (data.success) {
                        console.log('\n>>> Data received:', data);
                        // QR code found, stop scanning
                        clearInterval(interval);
                        stopCamera();

                        const productId = data.data.product_id;
                        processProduct(productId);
                        // window.location.href = `api/qr-options/${productId}`;  // Redirecting to new route

                        scannerContainer.style.display = 'none';
                    }
                })
                .catch(err => {
                    console.error('Error processing QR code:', err);
                });
            }, 'image/jpeg');
        }, 500);
      
        // Cancel button stops scanning
        cancelButton.addEventListener('click', () => {
            clearInterval(interval);
            stopCamera();
            scannerContainer.style.display = 'none';
        });
    }
    
    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
    }

    // Process Scanned Product
    async function processProduct(productId) {
        console.log('productId', productId);
        const response = await fetch(`api/product/${productId}`, {
            method: 'GET',
            credentials: 'include'
        });
        const data = await response.json();
        if (response?.ok) {
            // Show form
            document.getElementById('product-name').textContent = data.product.name;
            document.getElementById('product-price').textContent = data.product.price;
            document.getElementById('scanned-product-container').style.display = 'block';
        }
        
        document.getElementById('add-to-cart-btn').addEventListener('click', async () => {
            const response2 = await fetch(`api/add-to-cart`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({
                    product_id: productId,
                    quantity: document.getElementById('product-quantity').value
                })
            });
            const data2 = await response2.json();
            if (response2.ok) {
                alert('Product added to cart');
            }
        });

        document.getElementById('direct-checkout-btn').addEventListener('click', async () => {
            const quantity_filled = document.getElementById('product-quantity').value; 
            const response3 = await fetch(`api/createOrder`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({
                    productId: productId,
                    amount: parseFloat(data.product.price) * quantity_filled
                })
            });
            const data3 = await response3.json();
            if (response3.ok) {
                window.location.href = `api/checkout?order_id=${data3.order.id}`;  // A GET Api will get trigerred
            }
        });
    }

    // Close scanned product form
    document.getElementById('cancel-product-view').addEventListener('click', async () => {
        document.getElementById('scanned-product-container').style.display = 'none';
    });

    // Handle Logout 
    document.getElementById('logoutElem').addEventListener('click', async (event) => {
        event.preventDefault();
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
});

