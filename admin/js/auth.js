// ================= AUTH MODULE =================
const API_BASE = 'http://localhost:3001';
let otpTimer = null;

// ---------- SEND OTP ----------
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
            showMessage('loginMessage', '✅ OTP sent!', 'success');
            startOTPTimer();
        } else {
            showMessage('loginMessage', '❌ ' + (data.error || 'Failed'), 'error');
        }
    } catch {
        showMessage('loginMessage', '❌ Backend not running', 'error');
    } finally {
        btn.innerHTML = orig;
        btn.disabled = false;
    }
}

// ---------- TIMER ----------
function startOTPTimer() {
    let timeLeft = 300;
    const timerDiv = document.getElementById('otpTimer');

    if (otpTimer) clearInterval(otpTimer);

    otpTimer = setInterval(() => {
        const m = Math.floor(timeLeft / 60);
        const s = timeLeft % 60;

        if (timerDiv) {
            timerDiv.innerHTML =
                `⏱️ OTP valid for: ${m}:${s.toString().padStart(2,'0')}`;
        }

        timeLeft--;

        if (timeLeft < 0) {
            clearInterval(otpTimer);
        }
    }, 1000);
}

// ---------- VERIFY OTP ----------
async function verifyOTP() {
    const otp = document.getElementById('otpInput').value.trim();

    if (!otp) {
        showMessage('loginMessage', 'Enter OTP', 'error');
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/api/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ otp }),
            credentials: 'include'
        });

        const data = await res.json();

        if (res.ok && data.success) {
            document.getElementById('loginPage').style.display = 'none';
            document.getElementById('adminDashboard').style.display = 'block';

            // 🔥 IMPORTANT — init main app
            window.initAdminApp?.();
        } else {
            showMessage('loginMessage', '❌ Invalid OTP', 'error');
        }
    } catch {
        showMessage('loginMessage', '❌ Network error', 'error');
    }
}

// ---------- SESSION CHECK ----------
async function checkAuth() {
    try {
        const res = await fetch(`${API_BASE}/api/check-auth`, {
            credentials: 'include'
        });

        const data = await res.json();

        if (data.isAdmin) {
            document.getElementById('loginPage').style.display = 'none';
            document.getElementById('adminDashboard').style.display = 'block';

            window.initAdminApp?.();
        }
    } catch {}
}

// ---------- LOGOUT ----------
async function logout() {
    await fetch(`${API_BASE}/api/logout`, {
        method: 'POST',
        credentials: 'include'
    });
    location.reload();
}

// expose globally
window.sendOTP = sendOTP;
window.verifyOTP = verifyOTP;
window.checkAuth = checkAuth;
window.logout = logout;
