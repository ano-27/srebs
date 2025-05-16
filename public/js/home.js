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
                        window.location.href = `api/qr-options/${productId}`;  // Redirecting to new route

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

    // Handle Logout 
    document.getElementById('logoutElem').addEventListener('click', async () => {
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
                localStorage.removeItem('accessToken');
                window.location.href = '/login';
            }
        }
    }); 
});

