// ============ AUTHENTICATION MODULE ============
// यह फाइल सिर्फ लॉगिन और OTP से जुड़े functions handle करती है

let otpTimer = null;

// Send OTP
async function sendOTP() {
    const btn = document.getElementById('sendOtpBtn');
    if (!btn) return;
    
    const orig = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    btn.disabled = true;
    
    try {
        const res = await fetch(`${API_BASE}/api/send-otp`, { 
            method: 'POST', 
            credentials: 'include' 
        });
        
        const data = await res.json();
        
        if (res.ok && data.success) {
            window.showMessage('✅ OTP sent!', 'success');
            startOTPTimer();
        } else {
            window.showMessage('❌ Failed: ' + (data.error || 'Unknown'), 'error');
        }
    } catch (err) {
        window.showMessage('❌ Network error. Is backend running?', 'error');
    } finally {
        btn.innerHTML = orig;
        btn.disabled = false;
    }
}

// Start OTP Timer
function startOTPTimer() {
    let timeLeft = 300;
    const timerDiv = document.getElementById('otpTimer');
    
    if (otpTimer) clearInterval(otpTimer);
    
    otpTimer = setInterval(() => {
        const m = Math.floor(timeLeft / 60);
        const s = timeLeft % 60;
        timerDiv.innerHTML = `⏱️ OTP valid for: ${m}:${s.toString().padStart(2,'0')}`;
        timeLeft--;
        
        if (timeLeft < 0) {
            clearInterval(otpTimer);
            timerDiv.innerHTML = '<span style="color:var(--danger);">OTP expired!</span>';
            document.getElementById('verifyOtpBtn').disabled = true;
        }
    }, 1000);
}

// Verify OTP
async function verifyOTP() {
    const otp = document.getElementById('otpInput').value.trim();
    
    if (!otp) { 
        window.showMessage('Enter OTP', 'error'); 
        return; 
    }
    
    const btn = document.getElementById('verifyOtpBtn');
    const orig = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
    btn.disabled = true;
    
    try {
        const res = await fetch(`${API_BASE}/api/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ otp }),
            credentials: 'include'
        });
        
        const data = await res.json();
        
        if (res.ok && data.success) {
            window.showMessage('✅ Login successful!', 'success');
            if (otpTimer) clearInterval(otpTimer);
            
            document.getElementById('loginPage').style.display = 'none';
            document.getElementById('adminDashboard').style.display = 'block';
            
            // Load dashboard data
            if (typeof window.loadDashboardData === 'function') {
                window.loadDashboardData();
            }
        } else {
            window.showMessage('❌ ' + (data.error || 'Invalid OTP'), 'error');
        }
    } catch (err) {
        window.showMessage('❌ Network error', 'error');
    } finally {
        btn.innerHTML = orig;
        btn.disabled = false;
    }
}

// Logout
async function logout() {
    try {
        await fetch(`${API_BASE}/api/logout`, { 
            method: 'POST', 
            credentials: 'include' 
        });
    } catch (err) {
        console.error('Logout error:', err);
    }
    
    document.getElementById('loginPage').style.display = 'flex';
    document.getElementById('adminDashboard').style.display = 'none';
}

// Check Authentication
async function checkAuth() {
    try {
        const res = await fetch(`${API_BASE}/api/check-auth`, { 
            credentials: 'include' 
        });
        const data = await res.json();
        
        if (data.isAdmin) {
            document.getElementById('loginPage').style.display = 'none';
            document.getElementById('adminDashboard').style.display = 'block';
            
            if (typeof window.loadDashboardData === 'function') {
                window.loadDashboardData();
            }
        } else {
            document.getElementById('loginPage').style.display = 'flex';
            document.getElementById('adminDashboard').style.display = 'none';
        }
    } catch {
        document.getElementById('loginPage').style.display = 'flex';
        document.getElementById('adminDashboard').style.display = 'none';
    }
}

// Make functions globally available
window.sendOTP = sendOTP;
window.verifyOTP = verifyOTP;
window.logout = logout;
window.checkAuth = checkAuth;
