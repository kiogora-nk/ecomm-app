// ============================================
// APEX TECH INVESTMENT APP - COMPLETE WITH LOGIN
// ============================================

// --- DATA STORAGE ---
let currentUser = null;
let users = [];
let transactions = [];
let lastClaimDate = null;

// --- PACKAGE DATA ---
const packages = [
    { id: 1, brand: 'DELL', level: 'Level 1', deposit: 800, daily: 80, days: 16, total: 1280 },
    { id: 2, brand: 'HP', level: 'Level 2', deposit: 1800, daily: 130, days: 20, total: 2600 },
    { id: 3, brand: 'Lenovo', level: 'Level 3', deposit: 3900, daily: 200, days: 24, total: 4800 },
    { id: 4, brand: 'Apple', level: 'Level 4', deposit: 7850, daily: 320, days: 32, total: 10240 },
    { id: 5, brand: 'ASUS', level: 'Level 5', deposit: 16500, daily: 555, days: 40, total: 22200 },
    { id: 6, brand: 'Acer', level: 'Level 6', deposit: 23750, daily: 600, days: 60, total: 36000 },
    { id: 7, brand: 'Microsoft', level: 'Level 7', deposit: 38250, daily: 770, days: 70, total: 53900 },
    { id: 8, brand: 'Samsung', level: 'Level 8', deposit: 45000, daily: 850, days: 78, total: 66300 }
];

// --- LEVEL DATA ---
const levels = [
    { level: 1, name: 'Bronze', requirement: 0, benefits: ['Basic machines', '5% daily returns', 'Direct referrals: 5%'] },
    { level: 2, name: 'Silver', requirement: 10000, benefits: ['Premium machines', '8% daily returns', 'Direct referrals: 10%', 'Level 2 commissions: 3%'] },
    { level: 3, name: 'Gold', requirement: 50000, benefits: ['VIP machines', '12% daily returns', 'Direct referrals: 15%', 'Level 2: 5%', 'Level 3: 2%'] },
    { level: 4, name: 'Platinum', requirement: 100000, benefits: ['All machines', '15% daily returns', 'Direct referrals: 20%', 'All commissions doubled'] }
];

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    loadUserData();
    
    // Check if user is already logged in
    if (currentUser) {
        showMainApp();
        updateAllDisplays();
        startDailyReturnsTimer();
    } else {
        showWelcome();
    }
});

// --- DAILY RETURNS TIMER (runs every minute) ---
function startDailyReturnsTimer() {
    setInterval(() => {
        if (currentUser) {
            processDailyReturns();
        }
    }, 60000);
}

// ============================================
// NAVIGATION FUNCTIONS
// ============================================
function showWelcome() {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.getElementById('view-welcome').classList.add('active');
}

function showLoginForm() {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.getElementById('view-login').classList.add('active');
    
    // Clear form
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
    document.getElementById('remember-me').checked = false;
}

function showRegisterForm() {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.getElementById('view-register').classList.add('active');
    
    // Clear form
    document.getElementById('reg-name').value = '';
    document.getElementById('reg-email').value = '';
    document.getElementById('reg-phone').value = '';
    document.getElementById('reg-password').value = '';
    document.getElementById('reg-confirm-password').value = '';
    document.getElementById('reg-referral').value = '';
    document.getElementById('accept-terms').checked = false;
}

function showMainApp() {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.getElementById('view-home').classList.add('active');
    document.getElementById('bottom-nav').style.display = 'flex';
    
    // Set home as active nav
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.querySelector('.nav-item').classList.add('active');
    
    // Update all displays
    updateAllDisplays();
}

function continueAsGuest() {
    // Create a guest user
    currentUser = {
        id: 'GUEST' + Math.floor(Math.random() * 10000),
        name: 'Guest User',
        email: 'guest@example.com',
        phone: '254700000000',
        referralCode: 'GUEST' + Math.floor(Math.random() * 10000),
        referredBy: null,
        level: 1,
        totalRevenue: 0,
        walletBalance: 0,
        joinDate: new Date().toISOString(),
        investments: [],
        referrals: [],
        commissionEarned: 0,
        dailyStreak: 0,
        isGuest: true
    };
    
    users.push(currentUser);
    saveUserData();
    showMainApp();
    showNotification('Welcome! You are browsing as a guest.');
}

// ============================================
// AUTHENTICATION
// ============================================
function loginUser() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const remember = document.getElementById('remember-me').checked;
    
    // Validate
    if (!email || !password) {
        showNotification('Please enter email and password');
        return;
    }
    
    // Find user
    const user = users.find(u => u.email === email && u.password === btoa(password));
    
    if (user) {
        currentUser = user;
        
        if (remember) {
            saveUserData();
        }
        
        showMainApp();
        showNotification(`Welcome back, ${user.name.split(' ')[0]}!`);
    } else {
        showNotification('Invalid email or password');
    }
}

function registerUser() {
    // Get form values
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;
    const referralCode = document.getElementById('reg-referral').value.trim();
    const acceptTerms = document.getElementById('accept-terms').checked;
    
    // Validate name
    if (!name) {
        showNotification('Please enter your full name');
        document.getElementById('reg-name').focus();
        return;
    }
    
    // Validate email
    if (!email) {
        showNotification('Please enter your email address');
        document.getElementById('reg-email').focus();
        return;
    }
    
    if (!validateEmail(email)) {
        showNotification('Please enter a valid email address');
        document.getElementById('reg-email').focus();
        return;
    }
    
    // Check if email already exists
    if (users.some(u => u.email === email)) {
        showNotification('Email already registered. Please login.');
        return;
    }
    
    // Validate phone
    if (!phone) {
        showNotification('Please enter your phone number');
        document.getElementById('reg-phone').focus();
        return;
    }
    
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 12) {
        showNotification('Phone number should be 10-12 digits (e.g., 254712345678)');
        document.getElementById('reg-phone').focus();
        return;
    }
    
    // Validate password
    if (!password) {
        showNotification('Please enter a password');
        document.getElementById('reg-password').focus();
        return;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters');
        document.getElementById('reg-password').focus();
        return;
    }
    
    // Validate password confirmation
    if (password !== confirmPassword) {
        showNotification('Passwords do not match');
        document.getElementById('reg-confirm-password').focus();
        return;
    }
    
    // Validate terms
    if (!acceptTerms) {
        showNotification('Please accept the Terms & Conditions');
        return;
    }
    
    // Generate unique user ID
    const userId = 'APX' + Math.floor(Math.random() * 10000) + Math.floor(Math.random() * 1000);
    
    // Create user object
    currentUser = {
        id: userId,
        name: name,
        email: email,
        phone: cleanPhone,
        password: btoa(password),
        referralCode: userId,
        referredBy: referralCode || null,
        level: 1,
        totalRevenue: 0,
        walletBalance: 0,
        joinDate: new Date().toISOString(),
        investments: [],
        referrals: [],
        commissionEarned: 0,
        dailyStreak: 0
    };
    
    // Add to users array
    users.push(currentUser);
    
    // Process referral if provided
    if (referralCode) {
        processReferral(referralCode, currentUser);
    }
    
    // Save data
    saveUserData();
    
    // Show main app
    showMainApp();
    
    showNotification(`Welcome ${name.split(' ')[0]}! Start by purchasing your first machine.`);
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showChangePassword() {
    document.getElementById('password-modal').style.display = 'flex';
    
    // Clear form
    document.getElementById('current-password').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-new-password').value = '';
}

function closePasswordModal() {
    document.getElementById('password-modal').style.display = 'none';
}

function changePassword() {
    const current = document.getElementById('current-password').value;
    const newPass = document.getElementById('new-password').value;
    const confirm = document.getElementById('confirm-new-password').value;
    
    // Validate current password
    if (btoa(current) !== currentUser.password) {
        showNotification('Current password is incorrect');
        return;
    }
    
    // Validate new password
    if (!newPass || newPass.length < 6) {
        showNotification('New password must be at least 6 characters');
        return;
    }
    
    // Validate confirmation
    if (newPass !== confirm) {
        showNotification('New passwords do not match');
        return;
    }
    
    // Update password
    currentUser.password = btoa(newPass);
    saveUserData();
    
    closePasswordModal();
    showNotification('Password updated successfully!');
}

// ============================================
// REFERRAL SYSTEM
// ============================================
function processReferral(referralCode, newUser) {
    const referrer = users.find(u => u.referralCode === referralCode);
    if (referrer) {
        // Add referral to referrer's list
        referrer.referrals.push({
            userId: newUser.id,
            name: newUser.name,
            date: new Date().toISOString(),
            commission: 0
        });
        
        // Give instant bonus
        referrer.walletBalance += 500;
        referrer.totalRevenue += 500;
        
        // Record transaction
        addTransaction(referrer.id, 'Referral Bonus', 500, 'credit');
        
        showNotification(`Referral successful! You earned 500 KES bonus!`);
        saveUserData();
    }
}

// ============================================
// MPESA PAYMENT SYSTEM
// ============================================
let currentPurchase = null;

function showMpesaModal(pkg) {
    currentPurchase = pkg;
    
    document.getElementById('payment-details').innerHTML = `
        <div class="package-preview">
            <h4>${pkg.brand} ${pkg.level}</h4>
            <p class="price">KES ${pkg.deposit.toLocaleString()}</p>
            <p>Daily Return: KES ${pkg.daily}</p>
            <p>Cycle: ${pkg.days} days</p>
            <p>Total Profit: KES ${pkg.total}</p>
        </div>
    `;
    
    document.getElementById('mpesa-modal').style.display = 'flex';
    
    // Pre-fill with user's phone if available
    if (currentUser && currentUser.phone) {
        document.getElementById('mpesa-phone').value = currentUser.phone;
    }
}

function closeMpesaModal() {
    document.getElementById('mpesa-modal').style.display = 'none';
    currentPurchase = null;
}

function processMpesaPayment() {
    const phone = document.getElementById('mpesa-phone').value.trim();
    const pin = document.getElementById('mpesa-pin').value;
    
    // Validate phone
    if (!phone) {
        showNotification('Please enter your M-Pesa phone number');
        document.getElementById('mpesa-phone').focus();
        return;
    }
    
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 12) {
        showNotification('Please enter a valid M-Pesa number (e.g., 254712345678)');
        document.getElementById('mpesa-phone').focus();
        return;
    }
    
    // Validate PIN
    if (!pin) {
        showNotification('Please enter your M-Pesa PIN');
        document.getElementById('mpesa-pin').focus();
        return;
    }
    
    if (pin.length < 4) {
        showNotification('Please enter a valid M-Pesa PIN');
        document.getElementById('mpesa-pin').focus();
        return;
    }
    
    if (!currentPurchase) {
        showNotification('No package selected');
        return;
    }
    
    showNotification('STK push sent to your phone. Please enter PIN to complete payment.');
    
    // Simulate payment processing
    setTimeout(() => {
        completePurchase();
    }, 2000);
}

function completePurchase() {
    // Create investment record
    const investment = {
        id: Date.now(),
        userId: currentUser.id,
        packageId: currentPurchase.id,
        brand: currentPurchase.brand,
        level: currentPurchase.level,
        amount: currentPurchase.deposit,
        dailyReturn: currentPurchase.daily,
        totalReturn: currentPurchase.total,
        days: currentPurchase.days,
        daysCompleted: 0,
        startDate: new Date().toISOString(),
        lastClaimDate: null,
        status: 'active'
    };
    
    currentUser.investments.push(investment);
    
    // Record transaction
    addTransaction(currentUser.id, `Purchased ${currentPurchase.brand} Machine`, currentPurchase.deposit, 'debit');
    
    // Pay commission to referrer
    if (currentUser.referredBy) {
        const referrer = users.find(u => u.referralCode === currentUser.referredBy);
        if (referrer) {
            const commission = currentPurchase.deposit * 0.1; // 10% commission
            referrer.walletBalance += commission;
            referrer.commissionEarned += commission;
            addTransaction(referrer.id, `Commission from ${currentUser.name}`, commission, 'credit');
            
            // Update referral record
            const referral = referrer.referrals.find(r => r.userId === currentUser.id);
            if (referral) {
                referral.commission += commission;
            }
            
            saveUserData();
        }
    }
    
    // Close modal and update UI
    closeMpesaModal();
    saveUserData();
    updateAllDisplays();
    
    showNotification(`Success! You purchased ${currentPurchase.brand} machine!`);
    switchToHome();
}

// ============================================
// DAILY REWARDS
// ============================================
function claimDailyReward() {
    const today = new Date().toDateString();
    
    // Check if already claimed today
    if (lastClaimDate === today) {
        showNotification('You already claimed your daily reward today!');
        return;
    }
    
    // Calculate reward
    let reward = 50; // Base reward
    
    // Bonus for active investments
    const activeInvestments = currentUser.investments.filter(i => i.status === 'active');
    reward += activeInvestments.length * 10;
    
    // Level bonus
    reward += currentUser.level * 20;
    
    // Streak bonus
    if (lastClaimDate) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (new Date(lastClaimDate).toDateString() === yesterday.toDateString()) {
            currentUser.dailyStreak = (currentUser.dailyStreak || 0) + 1;
            reward += currentUser.dailyStreak * 5;
        } else {
            currentUser.dailyStreak = 1;
        }
    } else {
        currentUser.dailyStreak = 1;
    }
    
    // Credit reward
    lastClaimDate = today;
    currentUser.walletBalance += reward;
    currentUser.totalRevenue += reward;
    
    // Record transaction
    addTransaction(currentUser.id, 'Daily Reward', reward, 'credit');
    
    // Update UI
    updateRewardBanner(true);
    saveUserData();
    updateWalletDisplay();
    
    showNotification(`🎉 You claimed ${reward} KES daily reward!`);
}

// ============================================
// INVESTMENT RETURNS
// ============================================
function processDailyReturns() {
    const today = new Date().toDateString();
    let returnsProcessed = false;
    
    currentUser.investments.forEach(investment => {
        if (investment.status === 'active') {
            const lastClaim = investment.lastClaimDate ? new Date(investment.lastClaimDate).toDateString() : null;
            
            if (lastClaim !== today) {
                const dailyReturn = investment.dailyReturn;
                currentUser.walletBalance += dailyReturn;
                currentUser.totalRevenue += dailyReturn;
                
                investment.daysCompleted++;
                investment.lastClaimDate = new Date().toISOString();
                returnsProcessed = true;
                
                // Record daily return transaction
                addTransaction(currentUser.id, `Daily Return - ${investment.brand}`, dailyReturn, 'credit');
                
                // Check if investment cycle complete
                if (investment.daysCompleted >= investment.days) {
                    investment.status = 'completed';
                    const completionBonus = investment.amount * 0.2; // 20% bonus
                    currentUser.walletBalance += completionBonus;
                    addTransaction(currentUser.id, `${investment.brand} Cycle Complete Bonus`, completionBonus, 'credit');
                    showNotification(`🎉 ${investment.brand} machine cycle complete! Bonus: ${completionBonus} KES`);
                }
            }
        }
    });
    
    if (returnsProcessed) {
        checkLevelUp();
        saveUserData();
        updateAllDisplays();
    }
}

// ============================================
// LEVEL SYSTEM
// ============================================
function checkLevelUp() {
    const totalInvested = currentUser.investments.reduce((sum, inv) => sum + inv.amount, 0);
    
    let newLevel = 1;
    for (let i = levels.length - 1; i >= 0; i--) {
        if (totalInvested >= levels[i].requirement) {
            newLevel = levels[i].level;
            break;
        }
    }
    
    if (newLevel > currentUser.level) {
        currentUser.level = newLevel;
        const levelBonus = newLevel * 1000;
        currentUser.walletBalance += levelBonus;
        addTransaction(currentUser.id, `Level ${newLevel} Up Bonus`, levelBonus, 'credit');
        showNotification(`🎉 Congratulations! You reached Level ${newLevel}! Bonus: ${levelBonus} KES`);
    }
}

// ============================================
// WITHDRAWAL SYSTEM
// ============================================
function showWithdrawModal() {
    document.getElementById('withdraw-balance').textContent = `KES ${currentUser.walletBalance.toLocaleString()}`;
    document.getElementById('withdraw-modal').style.display = 'flex';
    
    // Pre-fill with user's phone
    if (currentUser && currentUser.phone) {
        document.getElementById('withdraw-phone').value = currentUser.phone;
    }
}

function closeWithdrawModal() {
    document.getElementById('withdraw-modal').style.display = 'none';
}

function processWithdrawal() {
    const amount = parseFloat(document.getElementById('withdraw-amount').value);
    const phone = document.getElementById('withdraw-phone').value.trim();
    
    // Validate amount
    if (!amount || isNaN(amount)) {
        showNotification('Please enter an amount to withdraw');
        document.getElementById('withdraw-amount').focus();
        return;
    }
    
    if (amount < 100) {
        showNotification('Minimum withdrawal is KES 100');
        document.getElementById('withdraw-amount').focus();
        return;
    }
    
    if (amount > currentUser.walletBalance) {
        showNotification(`Insufficient balance. Available: KES ${currentUser.walletBalance}`);
        document.getElementById('withdraw-amount').focus();
        return;
    }
    
    // Validate phone
    if (!phone) {
        showNotification('Please enter your M-Pesa phone number');
        document.getElementById('withdraw-phone').focus();
        return;
    }
    
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 12) {
        showNotification('Please enter a valid M-Pesa number (e.g., 254712345678)');
        document.getElementById('withdraw-phone').focus();
        return;
    }
    
    // Process withdrawal
    currentUser.walletBalance -= amount;
    addTransaction(currentUser.id, 'Withdrawal to M-Pesa', amount, 'debit', 'pending');
    
    showNotification(`KES ${amount.toLocaleString()} sent to ${cleanPhone}. Check your M-Pesa.`);
    
    closeWithdrawModal();
    saveUserData();
    updateWalletDisplay();
}

// ============================================
// REFERRAL MODAL FUNCTIONS
// ============================================
function showReferralModal() {
    document.getElementById('referral-link-text').textContent = `https://apex.tech/ref/${currentUser.referralCode}`;
    document.getElementById('modal-referral-count').textContent = currentUser.referrals.length;
    
    const referralEarnings = currentUser.referrals.reduce((sum, r) => sum + r.commission, 0);
    document.getElementById('modal-referral-earnings').textContent = `KES ${referralEarnings.toLocaleString()}`;
    
    document.getElementById('referral-modal').style.display = 'flex';
}

function closeReferralModal() {
    document.getElementById('referral-modal').style.display = 'none';
}

function copyReferralLink() {
    const link = document.querySelector('#referral-modal .referral-link').textContent;
    navigator.clipboard.writeText(link).then(() => {
        showNotification('✅ Referral link copied!');
    }).catch(() => {
        showNotification('Failed to copy link');
    });
}

function copyReferralCode() {
    navigator.clipboard.writeText(currentUser.referralCode).then(() => {
        showNotification('✅ Referral code copied!');
    });
}

function shareReferral() {
    if (navigator.share) {
        navigator.share({
            title: 'Join Apex Tech',
            text: 'Invest in advertising machines and earn daily returns!',
            url: `https://apex.tech/ref/${currentUser.referralCode}`
        }).catch(() => {
            copyReferralLink();
        });
    } else {
        copyReferralLink();
    }
}

// ============================================
// TRANSACTIONS
// ============================================
function addTransaction(userId, description, amount, type, status = 'completed') {
    const transaction = {
        id: Date.now(),
        userId: userId,
        date: new Date().toISOString(),
        description: description,
        amount: amount,
        type: type,
        status: status
    };
    
    transactions.push(transaction);
    
    // Keep only last 100 transactions
    if (transactions.length > 100) {
        transactions.shift();
    }
    
    saveUserData();
}

function showTransactionHistory() {
    const userTransactions = transactions.filter(t => t.userId === currentUser.id);
    
    if (userTransactions.length === 0) {
        document.getElementById('transaction-list').innerHTML = `
            <div class="no-transactions">
                <i class="fas fa-receipt"></i>
                <p>No transactions yet</p>
            </div>
        `;
    } else {
        let html = '<div class="transaction-list">';
        
        userTransactions.slice().reverse().forEach(t => {
            const date = new Date(t.date).toLocaleDateString();
            const sign = t.type === 'credit' ? '+' : '-';
            const color = t.type === 'credit' ? '#10b981' : '#ef4444';
            
            html += `
                <div class="transaction-item">
                    <div class="transaction-info">
                        <strong>${t.description}</strong>
                        <small>${date}</small>
                    </div>
                    <div class="transaction-amount" style="color: ${color}">
                        ${sign}KES ${t.amount.toLocaleString()}
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        document.getElementById('transaction-list').innerHTML = html;
    }
    
    document.getElementById('transaction-modal').style.display = 'flex';
}

function closeTransactionModal() {
    document.getElementById('transaction-modal').style.display = 'none';
}

// ============================================
// UI UPDATE FUNCTIONS
// ============================================
function updateAllDisplays() {
    updateUserInfo();
    renderPackages();
    renderInvestments();
    renderTeam();
    renderRewards();
    renderLevels();
    updateProfile();
}

function updateUserInfo() {
    document.getElementById('display-name').textContent = currentUser.name.split(' ')[0];
    document.getElementById('display-id').textContent = currentUser.id;
    document.getElementById('display-level').textContent = `Level ${currentUser.level} Investor`;
    
    document.getElementById('total-revenue').textContent = `KES ${currentUser.totalRevenue.toLocaleString()}`;
    document.getElementById('wallet-balance').textContent = `KES ${currentUser.walletBalance.toLocaleString()}`;
    document.getElementById('team-count').textContent = currentUser.referrals.length;
}

function updateWalletDisplay() {
    document.getElementById('wallet-balance').textContent = `KES ${currentUser.walletBalance.toLocaleString()}`;
}

function updateRewardBanner(claimed = false) {
    const banner = document.getElementById('daily-reward-banner');
    
    if (claimed) {
        banner.classList.add('claimed');
        document.getElementById('reward-title').textContent = 'Reward Claimed!';
        document.getElementById('reward-desc').textContent = 'Come back tomorrow';
        document.getElementById('claim-badge').textContent = 'Claimed';
    } else {
        banner.classList.remove('claimed');
        document.getElementById('reward-title').textContent = 'Daily Reward Ready!';
        document.getElementById('reward-desc').textContent = 'Claim your bonus';
        document.getElementById('claim-badge').textContent = 'Claim Now';
    }
}

// ============================================
// RENDER FUNCTIONS
// ============================================
function renderPackages() {
    const container = document.getElementById('package-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    packages.forEach(pkg => {
        const card = document.createElement('div');
        card.className = 'package-card';
        
        const fmt = (num) => num.toLocaleString();
        const roi = Math.round((pkg.total - pkg.deposit) / pkg.deposit * 100);
        
        card.innerHTML = `
            <div class="package-header">
                <span class="brand-badge">${pkg.brand}</span>
                <span class="cycle-info">${pkg.days} Days</span>
            </div>
            <h4>${pkg.level}</h4>
            
            <div class="package-stats">
                <div class="stat-box">
                    <small>Price</small>
                    <strong>${fmt(pkg.deposit)}</strong>
                </div>
                <div class="stat-box">
                    <small>Daily</small>
                    <strong class="text-green">${fmt(pkg.daily)}</strong>
                </div>
                <div class="stat-box">
                    <small>Total</small>
                    <strong class="text-blue">${fmt(pkg.total)}</strong>
                </div>
            </div>
            
            <div class="package-roi">
                <span>ROI: ${roi}%</span>
            </div>
            
            <button class="btn-buy" onclick='showMpesaModal(${JSON.stringify(pkg)})'>
                <i class="fas fa-mobile-alt"></i> Buy with M-Pesa
            </button>
        `;
        
        container.appendChild(card);
    });
}

function renderInvestments() {
    const container = document.getElementById('active-investments');
    if (!container) return;
    
    const activeInvestments = currentUser.investments.filter(i => i.status === 'active');
    
    if (activeInvestments.length === 0) {
        container.innerHTML = `
            <div class="no-investments">
                <i class="fas fa-box-open"></i>
                <p>No active machines yet</p>
                <button class="btn-buy-small" onclick="switchToPackages()">Buy Your First Machine</button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    activeInvestments.slice(0, 3).forEach(inv => {
        const progress = (inv.daysCompleted / inv.days) * 100;
        
        const item = document.createElement('div');
        item.className = 'investment-item';
        item.innerHTML = `
            <div class="investment-brand">
                <span class="brand-dot" style="background: ${getBrandColor(inv.brand)}"></span>
                <span>${inv.brand}</span>
            </div>
            <div class="investment-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <span class="progress-text">${inv.daysCompleted}/${inv.days} days</span>
            </div>
            <div class="investment-value">KES ${inv.dailyReturn}/day</div>
        `;
        
        container.appendChild(item);
    });
    
    if (activeInvestments.length > 3) {
        const more = document.createElement('div');
        more.className = 'more-investments';
        more.innerHTML = `<span>+${activeInvestments.length - 3} more machines</span>`;
        container.appendChild(more);
    }
}

function getBrandColor(brand) {
    const colors = {
        'DELL': '#0076a8',
        'HP': '#0096d6',
        'Lenovo': '#e2231a',
        'Apple': '#555555',
        'ASUS': '#0066b3',
        'Acer': '#83b81a',
        'Microsoft': '#f25022',
        'Samsung': '#1428a0'
    };
    return colors[brand] || '#2563eb';
}

function renderTeam() {
    const teamStats = document.getElementById('team-stats');
    if (teamStats) {
        const totalCommission = currentUser.referrals.reduce((sum, r) => sum + r.commission, 0);
        
        teamStats.innerHTML = `
            <div class="team-stat-card">
                <small>Direct Referrals</small>
                <h3>${currentUser.referrals.length}</h3>
            </div>
            <div class="team-stat-card">
                <small>Commission Earned</small>
                <h3>KES ${totalCommission.toLocaleString()}</h3>
            </div>
        `;
    }
    
    const teamList = document.getElementById('team-list');
    if (teamList) {
        if (currentUser.referrals.length === 0) {
            teamList.innerHTML = `
                <div class="no-team">
                    <i class="fas fa-users"></i>
                    <p>No team members yet</p>
                    <button class="btn-refer" onclick="showReferralModal()">Invite Now</button>
                </div>
            `;
        } else {
            teamList.innerHTML = '';
            
            currentUser.referrals.forEach(ref => {
                const member = document.createElement('div');
                member.className = 'team-member';
                member.innerHTML = `
                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(ref.name)}&background=2563eb&color=fff" alt="Team member">
                    <div class="member-info">
                        <h4>${ref.name}</h4>
                        <p>Joined: ${new Date(ref.date).toLocaleDateString()}</p>
                        <p class="commission">Commission: KES ${ref.commission.toLocaleString()}</p>
                    </div>
                `;
                
                teamList.appendChild(member);
            });
        }
    }
}

function renderRewards() {
    const container = document.getElementById('rewards-container');
    if (!container) return;
    
    const today = new Date().toDateString();
    const canClaimDaily = lastClaimDate !== today;
    
    container.innerHTML = `
        <div class="reward-card ${!canClaimDaily ? 'claimed' : ''}">
            <i class="fas fa-gift"></i>
            <h4>Daily Check-in</h4>
            <p>Claim ${50 + ((currentUser.dailyStreak || 0) * 5)} KES daily</p>
            <p class="streak">🔥 ${currentUser.dailyStreak || 0} day streak</p>
            <button class="btn-reward" onclick="claimDailyReward()" ${!canClaimDaily ? 'disabled' : ''}>
                ${canClaimDaily ? 'Claim Now' : 'Already Claimed'}
            </button>
        </div>
        
        <div class="reward-card">
            <i class="fas fa-trophy"></i>
            <h4>Referral Bonus</h4>
            <p>Earn 500 KES per referral</p>
            <p>Plus 10% commission</p>
            <button class="btn-reward" onclick="showReferralModal()">Refer Now</button>
        </div>
        
        <div class="reward-card">
            <i class="fas fa-star"></i>
            <h4>Level ${currentUser.level + 1} Bonus</h4>
            <p>Reach Level ${currentUser.level + 1}</p>
            <p>Reward: ${(currentUser.level + 1) * 1000} KES</p>
            <button class="btn-reward" onclick="switchToView('levels')">View Progress</button>
        </div>
    `;
}

function renderLevels() {
    const container = document.getElementById('levels-container');
    if (!container) return;
    
    document.getElementById('current-level-display').textContent = `Level ${currentUser.level}`;
    
    const totalInvested = currentUser.investments.reduce((sum, inv) => sum + inv.amount, 0);
    
    container.innerHTML = '';
    
    levels.forEach(level => {
        const isCurrent = level.level === currentUser.level;
        const isUnlocked = totalInvested >= level.requirement;
        const isLocked = !isUnlocked && level.level > currentUser.level;
        
        const card = document.createElement('div');
        card.className = `level-card ${isCurrent ? 'current' : ''} ${isLocked ? 'locked' : ''}`;
        
        card.innerHTML = `
            <div class="level-header">
                <span class="level-number">Level ${level.level}: ${level.name}</span>
                <span class="level-requirement">${level.requirement.toLocaleString()} KES</span>
            </div>
            <div class="level-benefits">
                ${level.benefits.map(b => `<p><i class="fas ${isLocked ? 'fa-lock' : 'fa-check-circle'}"></i> ${b}</p>`).join('')}
            </div>
            ${level.level === currentUser.level + 1 ? `
                <div class="next-level-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${Math.min(100, (totalInvested / level.requirement) * 100)}%"></div>
                    </div>
                    <span>${totalInvested.toLocaleString()} / ${level.requirement.toLocaleString()} KES</span>
                </div>
            ` : ''}
        `;
        
        container.appendChild(card);
    });
}

function updateProfile() {
    document.getElementById('profile-name').textContent = currentUser.name;
    document.getElementById('profile-fullname').textContent = currentUser.name;
    document.getElementById('profile-email').textContent = currentUser.email;
    document.getElementById('profile-phone').textContent = currentUser.phone;
    document.getElementById('profile-referral').textContent = currentUser.referralCode;
    document.getElementById('profile-username').textContent = `@${currentUser.name.toLowerCase().replace(/\s+/g, '_')}`;
    
    // Format join date
    const joinDate = new Date(currentUser.joinDate);
    document.getElementById('profile-joined').textContent = joinDate.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
    
    // Update avatar
    document.getElementById('profile-avatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=2563eb&color=fff&size=128`;
    
    // Update badges
    const badges = document.getElementById('profile-badges');
    badges.innerHTML = `
        <span class="badge verified"><i class="fas fa-check-circle"></i> Verified</span>
        <span class="badge level">Level ${currentUser.level}</span>
        ${currentUser.referrals.length > 0 ? '<span class="badge"><i class="fas fa-users"></i> Referrer</span>' : ''}
    `;
    
    // Update stats
    const totalInvested = currentUser.investments.reduce((sum, inv) => sum + inv.amount, 0);
    const daysActive = Math.floor((new Date() - new Date(currentUser.joinDate)) / (1000 * 60 * 60 * 24));
    
    document.getElementById('profile-stats').innerHTML = `
        <div class="profile-stat-item">
            <span class="stat-value">${currentUser.referrals.length}</span>
            <span class="stat-label">Team</span>
        </div>
        <div class="profile-stat-item">
            <span class="stat-value">KES ${(totalInvested / 1000).toFixed(1)}K</span>
            <span class="stat-label">Invested</span>
        </div>
        <div class="profile-stat-item">
            <span class="stat-value">${daysActive}</span>
            <span class="stat-label">Days</span>
        </div>
        <div class="profile-stat-item">
            <span class="stat-value">${currentUser.investments.length}</span>
            <span class="stat-label">Machines</span>
        </div>
    `;
}

// ============================================
// NAVIGATION
// ============================================
function switchTab(viewName, navElement) {
    // Hide all views
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    
    // Show selected view
    const viewElement = document.getElementById(`view-${viewName}`);
    if (viewElement) {
        viewElement.classList.add('active');
    }

    // Update nav styling
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    if (navElement) {
        navElement.classList.add('active');
    }
    
    // Refresh data based on view
    if (viewName === 'home') updateAllDisplays();
    if (viewName === 'team') renderTeam();
    if (viewName === 'rewards') renderRewards();
    if (viewName === 'packages') renderPackages();
    if (viewName === 'levels') renderLevels();
    if (viewName === 'profile') updateProfile();
}

function switchToView(viewName) {
    // Hide all views
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    
    // Show selected view
    const viewElement = document.getElementById(`view-${viewName}`);
    if (viewElement) {
        viewElement.classList.add('active');
    }

    // Update bottom nav
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    
    const navMap = {
        'home': 0,
        'tasks': 1,
        'packages': 2,
        'profile': 3
    };
    
    if (navMap[viewName] !== undefined) {
        document.querySelectorAll('.nav-item')[navMap[viewName]].classList.add('active');
    }
    
    // Refresh data
    if (viewName === 'home') updateAllDisplays();
    if (viewName === 'team') renderTeam();
    if (viewName === 'rewards') renderRewards();
    if (viewName === 'packages') renderPackages();
    if (viewName === 'levels') renderLevels();
    if (viewName === 'profile') updateProfile();
}

function switchToHome() {
    switchToView('home');
}

function switchToPackages() {
    switchToView('packages');
}

// ============================================
// NOTIFICATION SYSTEM
// ============================================
function showNotification(message) {
    const toast = document.getElementById('notification-toast');
    const messageEl = document.getElementById('notification-message');
    
    messageEl.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ============================================
// DATA PERSISTENCE
// ============================================
function saveUserData() {
    try {
        localStorage.setItem('apex_currentUser', JSON.stringify(currentUser));
        localStorage.setItem('apex_users', JSON.stringify(users));
        localStorage.setItem('apex_transactions', JSON.stringify(transactions));
        localStorage.setItem('apex_lastClaim', lastClaimDate || '');
    } catch (e) {
        console.error('Error saving data:', e);
    }
}

function loadUserData() {
    try {
        const savedUser = localStorage.getItem('apex_currentUser');
        const savedUsers = localStorage.getItem('apex_users');
        const savedTransactions = localStorage.getItem('apex_transactions');
        const savedLastClaim = localStorage.getItem('apex_lastClaim');
        
        if (savedUser) currentUser = JSON.parse(savedUser);
        if (savedUsers) users = JSON.parse(savedUsers);
        if (savedTransactions) transactions = JSON.parse(savedTransactions);
        if (savedLastClaim) lastClaimDate = savedLastClaim;
    } catch (e) {
        console.error('Error loading data:', e);
    }
}

// ============================================
// LOGOUT
// ============================================
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        currentUser = null;
        localStorage.removeItem('apex_currentUser');
        
        showWelcome();
        document.getElementById('bottom-nav').style.display = 'none';
        
        showNotification('Logged out successfully');
    }
}

// ============================================
// ERROR HANDLING
// ============================================
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('Error: ' + msg);
    showNotification('An error occurred. Please try again.');
    return false;
};