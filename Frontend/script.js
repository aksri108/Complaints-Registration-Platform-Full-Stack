const BACKEND_BASE_URL = 'https://complaints-registration-platform-full-tzas.onrender.com/';

// --- Utility Functions ---
const getElement = id => document.getElementById(id);
const showError = (id, msg) => {
    const el = getElement(id);
    if (el) {
        el.textContent = msg;
        el.classList.remove('hidden');
    }
};
const hideError = id => {
    const el = getElement(id);
    if (el) {
        el.classList.add('hidden');
        el.textContent = '';
    }
};
const showSuccess = (id, msg) => {
    const el = getElement(id);
    if (el) {
        el.textContent = msg;
        el.classList.remove('hidden');
    }
};
const hideSuccess = id => {
    const el = getElement(id);
    if (el) {
        el.classList.add('hidden');
        el.textContent = '';
    }
};

// Global state
let currentUser = null;

// --- Session Management ---
async function checkSession() {
    const path = window.location.pathname;
    const isAuthPage = path.endsWith('login.html') || path.endsWith('register.html');

    try {
        const res = await fetch(`${BACKEND_BASE_URL}/auth/me`, { credentials: 'include' });
        if (res.ok) {
            currentUser = await res.json();

            // If logged in and on auth page, redirect to dashboard
            if (isAuthPage) {
                window.location.href = 'index.html';
                return;
            }

            // Make body visible now that session is verified
            document.body.style.display = 'block';

            // Adjust UI based on role
            setupRoleBasedUI();

            // If on dashboard, load data
            if (path.endsWith('index.html') || path === '/' || path.endsWith('/')) {
                loadDashboardData();
            }
        } else {
            // Not logged in
            if (!isAuthPage) {
                window.location.href = 'login.html';
            } else {
                // If on auth page and not logged in, just show the page
                document.body.style.display = 'block';
            }
        }
    } catch (err) {
        console.error('Session check failed', err);
        if (!isAuthPage) {
            window.location.href = 'login.html';
        } else {
            document.body.style.display = 'block';
        }
    }
}

function setupRoleBasedUI() {
    const newComplaintBtn = getElement('newComplaintBtn');
    const dashboardTitle = getElement('dashboardTitle');
    const navLinks = getElement('navLinks');

    if (currentUser.role === 'admin') {
        if (dashboardTitle) dashboardTitle.textContent = 'Admin Dashboard';
        if (newComplaintBtn) newComplaintBtn.style.display = 'none'; // Admins don't submit complaints

        // Remove 'Submit New' link if on complaint page (shouldn't be there anyway, but just in case)
        if (navLinks) {
            const links = navLinks.querySelectorAll('a');
            links.forEach(link => {
                if (link.textContent === 'Submit New') link.style.display = 'none';
            });
        }
    }

    // Setup logout button
    const logoutBtn = getElement('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await fetch(`${BACKEND_BASE_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
            window.location.href = 'login.html';
        });
    }
}

// --- Page Specific Logic ---

// Run session check on load
document.addEventListener('DOMContentLoaded', () => {
    checkSession();

    const path = window.location.pathname;

    // Login logic
    const loginForm = getElement('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideError('generalError');

            const email = getElement('email').value;
            const password = getElement('password').value;
            const btn = getElement('loginBtn');
            btn.disabled = true;
            btn.textContent = 'Logging in...';

            try {
                const res = await fetch(`${BACKEND_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                    credentials: 'include'
                });

                if (res.ok) {
                    window.location.href = 'index.html';
                } else {
                    const data = await res.json();
                    showError('generalError', data.error || 'Login failed');
                    btn.disabled = false;
                    btn.textContent = 'Login';
                }
            } catch (err) {
                showError('generalError', 'Network error. Please try again.');
                btn.disabled = false;
                btn.textContent = 'Login';
            }
        });
    }

    // Register logic
    const requestOtpForm = getElement('requestOtpForm');
    const verifyOtpForm = getElement('verifyOtpForm');

    if (requestOtpForm) {
        requestOtpForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideError('generalError');
            hideSuccess('generalSuccess');

            const name = getElement('regName').value;
            const email = getElement('regEmail').value;
            const btn = getElement('requestOtpBtn');

            btn.disabled = true;
            btn.textContent = 'Sending OTP...';

            try {
                const res = await fetch(`${BACKEND_BASE_URL}/auth/send-otp`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email })
                });

                if (res.ok) {
                    showSuccess('generalSuccess', 'OTP sent to your email.');
                    requestOtpForm.classList.add('hidden');
                    verifyOtpForm.classList.remove('hidden');

                    // Store email temporarily for verify step
                    verifyOtpForm.dataset.email = email;
                } else {
                    const data = await res.json();
                    showError('generalError', data.error || 'Failed to send OTP');
                    btn.disabled = false;
                    btn.textContent = 'Send OTP';
                }
            } catch (err) {
                showError('generalError', 'Network error.');
                btn.disabled = false;
                btn.textContent = 'Send OTP';
            }
        });
    }

    if (verifyOtpForm) {
        verifyOtpForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideError('generalError');

            const email = verifyOtpForm.dataset.email;
            const otp = getElement('regOtp').value;
            const password = getElement('regPassword').value;
            const confirmPassword = getElement('regConfirmPassword').value;

            if (password !== confirmPassword) {
                showError('generalError', 'Passwords do not match');
                return;
            }

            const btn = getElement('registerBtn');
            btn.disabled = true;
            btn.textContent = 'Verifying...';

            try {
                const res = await fetch(`${BACKEND_BASE_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, otp, password })
                });

                if (res.ok) {
                    showSuccess('generalSuccess', 'Registration successful! Redirecting to login...');
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 2000);
                } else {
                    const data = await res.json();
                    showError('generalError', data.error || 'Registration failed');
                    btn.disabled = false;
                    btn.textContent = 'Complete Registration';
                }
            } catch (err) {
                showError('generalError', 'Network error.');
                btn.disabled = false;
                btn.textContent = 'Complete Registration';
            }
        });
    }

    // Complaint submission logic
    const complaintForm = getElement('complaintForm');
    const getAiQuestionBtn = getElement('getAiQuestionBtn');

    if (complaintForm && getAiQuestionBtn) {
        let currentAiQuestion = '';

        getAiQuestionBtn.addEventListener('click', async () => {
            const complaintText = getElement('complaintText').value;
            if (!complaintText.trim()) {
                showError('generalError', 'Please enter your complaint first.');
                return;
            }

            hideError('generalError');
            getAiQuestionBtn.disabled = true;
            getAiQuestionBtn.textContent = 'Generating...';

            try {
                const res = await fetch(`${BACKEND_BASE_URL}/complaints/ai/question`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ complaint_text: complaintText }),
                    credentials: 'include'
                });

                if (res.ok) {
                    const data = await res.json();
                    currentAiQuestion = data.ai_question;

                    getElement('aiQuestionText').textContent = currentAiQuestion;
                    getElement('aiSection').classList.remove('hidden');
                    getAiQuestionBtn.style.display = 'none';
                    getElement('complaintText').readOnly = true; // Lock the text area
                } else {
                    const data = await res.json();
                    showError('generalError', data.error || 'Failed to get follow-up question');
                    getAiQuestionBtn.disabled = false;
                    getAiQuestionBtn.textContent = 'Next';
                }
            } catch (err) {
                showError('generalError', 'Network error.');
                getAiQuestionBtn.disabled = false;
                getAiQuestionBtn.textContent = 'Next';
            }
        });

        complaintForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideError('generalError');

            const complaintText = getElement('complaintText').value;
            const userAnswer = getElement('userAnswer').value;
            const btn = getElement('submitComplaintBtn');

            btn.disabled = true;
            btn.textContent = 'Submitting...';

            try {
                const res = await fetch(`${BACKEND_BASE_URL}/complaints`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        complaint_text: complaintText,
                        ai_question: currentAiQuestion,
                        ai_answer: userAnswer
                    }),
                    credentials: 'include'
                });

                if (res.ok) {
                    window.location.href = 'index.html'; // Redirect back to dashboard
                } else {
                    const data = await res.json();
                    showError('generalError', data.error || 'Submission failed');
                    btn.disabled = false;
                    btn.textContent = 'Submit Complaint';
                }
            } catch (err) {
                showError('generalError', 'Network error.');
                btn.disabled = false;
                btn.textContent = 'Submit Complaint';
            }
        });
    }
});

// --- Dashboard Loading ---
async function loadDashboardData() {
    const listEl = getElement('complaintsList');
    if (!listEl) return;

    try {
        const endpoint = currentUser.role === 'admin' ? '/admin/complaints' : '/complaints/my';
        const res = await fetch(`${BACKEND_BASE_URL}${endpoint}`, { credentials: 'include' });

        if (res.ok) {
            const complaints = await res.json();

            if (complaints.length === 0) {
                listEl.innerHTML = '<p class="text-center" style="color: var(--text-secondary);">No complaints found.</p>';
                return;
            }

            listEl.innerHTML = '';
            complaints.forEach(c => {
                const date = new Date(c.createdAt).toLocaleDateString() + ' ' + new Date(c.createdAt).toLocaleTimeString();

                let html = `
                    <div class="complaint-item">
                        <div class="complaint-header">
                            <span class="user-info">${currentUser.role === 'admin' ? `${c.userName} (${c.userEmail})` : 'You'}</span>
                            <span>${date}</span>
                        </div>
                        
                        <div class="complaint-block">
                            <h4>Original Complaint</h4>
                            <p>${escapeHTML(c.complaintText)}</p>
                        </div>
                `;

                if (c.aiQuestion) {
                    html += `
                        <div class="complaint-block">
                            <h4>AI Follow-up Question</h4>
                            <p style="color: var(--text-secondary);">${escapeHTML(c.aiQuestion)}</p>
                        </div>
                        <div class="complaint-block">
                            <h4>Answer</h4>
                            <p>${escapeHTML(c.userAnswer || 'No answer provided')}</p>
                        </div>
                    `;
                }

                html += `</div>`;
                listEl.innerHTML += html;
            });
        } else {
            showError('generalError', 'Failed to load complaints');
            listEl.innerHTML = '';
        }
    } catch (err) {
        showError('generalError', 'Network error while loading complaints');
        listEl.innerHTML = '';
    }
}

// Simple HTML escaping to prevent XSS
function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g,
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag])
    );
}
