// Premium Loading Spinner Animation Script

function showLoadingSpinner(paymentMethod = '') {
    // Prevent multiple spinners
    if (document.getElementById('premium-loading-modal')) return;

    // Determine brand colors based on payment method
    let brandColor = '#ff4444'; // Default red
    let brandName = 'Metode Pembayaran';
    
    if (paymentMethod.toLowerCase().includes('gopay')) { brandColor = '#00aadd'; brandName = 'GoPay'; }
    else if (paymentMethod.toLowerCase().includes('ovo')) { brandColor = '#7c3aed'; brandName = 'OVO'; }
    else if (paymentMethod.toLowerCase().includes('dana')) { brandColor = '#118ee9'; brandName = 'DANA'; }
    else if (paymentMethod.toLowerCase().includes('linkaja')) { brandColor = '#e32322'; brandName = 'LinkAja'; }
    else if (paymentMethod.toLowerCase().includes('bca')) { brandColor = '#1565c0'; brandName = 'BCA Virtual Account'; }

    // Create Modal Container
    const modal = document.createElement('div');
    modal.id = 'premium-loading-modal';
    modal.innerHTML = `
        <style>
            #premium-loading-modal {
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(10, 10, 15, 0.85);
                backdrop-filter: blur(12px);
                z-index: 9999;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.3s ease;
                font-family: 'Outfit', sans-serif;
            }
            .pls-spinner-container {
                position: relative;
                width: 100px;
                height: 100px;
                margin-bottom: 30px;
            }
            .pls-circle {
                position: absolute;
                top: 0; left: 0; right: 0; bottom: 0;
                border-radius: 50%;
                border: 3px solid transparent;
            }
            .pls-circle-1 {
                border-top-color: ${brandColor};
                animation: pls-spin 2s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
            }
            .pls-circle-2 {
                top: 10px; left: 10px; right: 10px; bottom: 10px;
                border-right-color: #ffaa00;
                animation: pls-spin 2.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite reverse;
            }
            .pls-circle-3 {
                top: 20px; left: 20px; right: 20px; bottom: 20px;
                border-bottom-color: #ffffff;
                animation: pls-spin 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
            }
            @keyframes pls-spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            .pls-title {
                color: #fff;
                font-size: 20px;
                font-weight: 800;
                margin-bottom: 8px;
                text-align: center;
                letter-spacing: 0.5px;
            }
            .pls-subtitle {
                color: rgba(255, 255, 255, 0.6);
                font-size: 14px;
                font-weight: 500;
                text-align: center;
            }
            .pls-brand {
                color: ${brandColor};
                font-weight: 700;
            }
            .pls-timer {
                margin-top: 25px;
                font-size: 13px;
                color: rgba(255, 255, 255, 0.4);
                background: rgba(255, 255, 255, 0.05);
                padding: 6px 12px;
                border-radius: 20px;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
        </style>
        
        <div class="pls-spinner-container">
            <div class="pls-circle pls-circle-1"></div>
            <div class="pls-circle pls-circle-2"></div>
            <div class="pls-circle pls-circle-3"></div>
        </div>
        <div class="pls-title">Memproses Pembayaran...</div>
        <div class="pls-subtitle">Menghubungkan ke server <span class="pls-brand">${brandName}</span></div>
        <div class="pls-timer" id="plsTimer">Estimasi: 3 detik</div>
    `;
    
    document.body.appendChild(modal);
    
    // Trigger fade in
    setTimeout(() => {
        modal.style.opacity = '1';
    }, 10);
    
    // Timer Countdown Logic
    let timeLeft = 3;
    const timerEl = document.getElementById('plsTimer');
    const interval = setInterval(() => {
        timeLeft--;
        if (timeLeft > 0) {
            timerEl.textContent = `Estimasi: ${timeLeft} detik`;
        } else {
            timerEl.textContent = 'Menyelesaikan...';
            clearInterval(interval);
        }
    }, 1000);
    
    modal.dataset.interval = interval;
}

function hideLoadingSpinner() {
    const modal = document.getElementById('premium-loading-modal');
    if (modal) {
        clearInterval(modal.dataset.interval);
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}
