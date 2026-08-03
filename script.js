// StudyQuest - Gamified Learning Planner
// All application logic and state management

// ============================================
// STATE MANAGEMENT & INITIALIZATION
// ============================================

let appState = {
    tasks: [],
    xp: 0,
    badges: [],
    streak: {
        current: 0,
        lastDate: null
    },
    xpHistory: [],
    darkMode: false,
    currentFilter: 'all'
};

// Badge definitions
const BADGES = {
    firstTask: {
        id: 'firstTask',
        name: 'First Steps',
        description: 'Complete your first task',
        icon: 'fa-star',
        color: 'text-yellow-500',
        requirement: 1
    },
    fiveTasks: {
        id: 'fiveTasks',
        name: 'Getting Started',
        description: 'Complete 5 tasks',
        icon: 'fa-fire',
        color: 'text-orange-500',
        requirement: 5
    },
    sevenDayStreak: {
        id: 'sevenDayStreak',
        name: 'Dedicated Learner',
        description: 'Maintain a 7-day study streak',
        icon: 'fa-calendar-check',
        color: 'text-green-500',
        requirement: 7
    },
    tenTasks: {
        id: 'tenTasks',
        name: 'Achiever',
        description: 'Complete 10 tasks',
        icon: 'fa-medal',
        color: 'text-blue-500',
        requirement: 10
    },
    level5: {
        id: 'level5',
        name: 'Rising Star',
        description: 'Reach Level 5',
        icon: 'fa-rocket',
        color: 'text-purple-500',
        requirement: 5
    }
};

// ============================================
// INITIALIZATION
// ============================================

function initializeApp() {
    loadFromLocalStorage();
    checkDarkMode();
    updateUI();
    initializeCharts();
    renderBadges();
    
    // Add sample data if first time
    if (appState.tasks.length === 0) {
        addSampleData();
    }
}

function addSampleData() {
    const sampleTasks = [
        { name: 'Review Calculus Derivatives', subject: 'Mathematics', description: 'Complete practice problems 1-20', completed: true, createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
        { name: 'Read Physics Chapter 4', subject: 'Physics', description: 'Focus on Newton\'s laws', completed: true, createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
        { name: 'Complete Chemistry Lab Report', subject: 'Chemistry', description: 'Experiment on acid-base reactions', completed: false, createdAt: new Date().toISOString() },
        { name: 'Study for History Quiz', subject: 'History', description: 'World War II timeline', completed: false, createdAt: new Date().toISOString() },
        { name: 'Practice English Essay Writing', subject: 'English', description: 'Argumentative essay structure', completed: true, createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
        { name: 'Learn Programming Arrays', subject: 'Computer Science', description: 'Array manipulation and algorithms', completed: false, createdAt: new Date().toISOString() },
        { name: 'Biology Cell Structure', subject: 'Biology', description: 'Understand mitochondria and nucleus', completed: true, createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() }
    ];
    
    sampleTasks.forEach(task => {
        const newTask = {
            id: Date.now() + Math.random(),
            ...task
        };
        appState.tasks.push(newTask);
        
        if (task.completed) {
            appState.xp += 10;
            addXPHistory(10, task.createdAt);
        }
    });
    
    // Set initial streak
    appState.streak.current = 3;
    appState.streak.lastDate = new Date().toISOString().split('T')[0];
    
    // Unlock initial badges
    checkAndUnlockBadges();
    
    saveToLocalStorage();
    updateUI();
}

// ============================================
// LOCAL STORAGE
// ============================================

function saveToLocalStorage() {
    localStorage.setItem('studyquest_data', JSON.stringify(appState));
}

function loadFromLocalStorage() {
    const savedData = localStorage.getItem('studyquest_data');
    if (savedData) {
        appState = JSON.parse(savedData);
    }
}

// ============================================
// DARK MODE
// ============================================

function checkDarkMode() {
    const savedDarkMode = localStorage.getItem('studyquest_darkmode');
    if (savedDarkMode === 'true' || (!savedDarkMode && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        appState.darkMode = true;
        document.documentElement.classList.add('dark');
    }
}

function toggleDarkMode() {
    appState.darkMode = !appState.darkMode;
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('studyquest_darkmode', appState.darkMode);
    
    // Update charts with new theme
    updateCharts();
}

// ============================================
// NAVIGATION
// ============================================

function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section-content').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Show selected section
    document.getElementById(`${sectionName}-section`).classList.remove('hidden');
    
    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.section === sectionName) {
            link.classList.add('active');
        }
    });
    
    // Update content based on section
    if (sectionName === 'dashboard') {
        updateDashboard();
    } else if (sectionName === 'tasks') {
        renderTasks();
    } else if (sectionName === 'analytics') {
        updateCharts();
    } else if (sectionName === 'badges') {
        renderBadges();
    }
}

// ============================================
// XP & LEVEL SYSTEM
// ============================================

function calculateLevel(xp) {
    return Math.floor(xp / 100) + 1;
}

function getXPForNextLevel(currentLevel) {
    return currentLevel * 100;
}

function addXP(amount) {
    const oldLevel = calculateLevel(appState.xp);
    appState.xp += amount;
    const newLevel = calculateLevel(appState.xp);
    
    // Add to XP history
    addXPHistory(amount);
    
    // Show XP notification
    showNotification('✨ XP Gained!', `+${amount} XP`, 'success');
    
    // Animate XP display
    const xpElement = document.getElementById('hero-xp');
    if (xpElement) {
        xpElement.classList.add('xp-animation');
        setTimeout(() => xpElement.classList.remove('xp-animation'), 600);
    }
    
    // Check for level up
    if (newLevel > oldLevel) {
        showNotification('🎉 Level Up!', `You reached Level ${newLevel}!`, 'success');
        checkAndUnlockBadges();
    }
    
    saveToLocalStorage();
    updateUI();
}

function addXPHistory(amount, date = null) {
    const today = date || new Date().toISOString().split('T')[0];
    const existingEntry = appState.xpHistory.find(entry => entry.date === today);
    
    if (existingEntry) {
        existingEntry.xp += amount;
    } else {
        appState.xpHistory.push({ date: today, xp: amount });
    }
    
    // Keep only last 30 days
    if (appState.xpHistory.length > 30) {
        appState.xpHistory = appState.xpHistory.slice(-30);
    }
}

// ============================================
// STREAK SYSTEM
// ============================================

function updateStreak() {
    const today = new Date().toISOString().split('T')[0];
    const lastDate = appState.streak.lastDate;
    
    if (!lastDate) {
        appState.streak.current = 1;
        appState.streak.lastDate = today;
    } else if (lastDate === today) {
        // Already studied today
        return;
    } else {
        const lastDateTime = new Date(lastDate).getTime();
        const todayTime = new Date(today).getTime();
        const daysDiff = Math.floor((todayTime - lastDateTime) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
            // Consecutive day
            appState.streak.current += 1;
            appState.streak.lastDate = today;
            checkAndUnlockBadges();
        } else if (daysDiff > 1) {
            // Streak broken
            appState.streak.current = 1;
            appState.streak.lastDate = today;
        }
    }
    
    saveToLocalStorage();
}

// ============================================
// TASK MANAGEMENT
// ============================================

function addTask() {
    const nameInput = document.getElementById('task-name');
    const subjectInput = document.getElementById('task-subject');
    const descriptionInput = document.getElementById('task-description');
    
    const name = nameInput.value.trim();
    const subject = subjectInput.value.trim();
    const description = descriptionInput.value.trim();
    
    if (!name || !subject) {
        showNotification('❌ Error', 'Please fill in task name and subject', 'error');
        return;
    }
    
    const newTask = {
        id: Date.now(),
        name,
        subject,
        description,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    appState.tasks.unshift(newTask);
    saveToLocalStorage();
    
    // Clear inputs
    nameInput.value = '';
    subjectInput.value = '';
    descriptionInput.value = '';
    
    showNotification('✅ Success', 'Task added successfully!', 'success');
    renderTasks();
    updateUI();
}

function quickAddTask() {
    const nameInput = document.getElementById('quick-task-input');
    const subjectInput = document.getElementById('quick-subject-input');
    
    const name = nameInput.value.trim();
    const subject = subjectInput.value.trim() || 'General';
    
    if (!name) {
        showNotification('❌ Error', 'Please enter a task name', 'error');
        return;
    }
    
    const newTask = {
        id: Date.now(),
        name,
        subject,
        description: '',
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    appState.tasks.unshift(newTask);
    saveToLocalStorage();
    
    // Clear inputs
    nameInput.value = '';
    subjectInput.value = '';
    
    showNotification('✅ Success', 'Task added successfully!', 'success');
    updateUI();
}

function toggleTaskComplete(taskId) {
    const task = appState.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    task.completed = !task.completed;
    
    if (task.completed) {
        // Add XP and update streak
        addXP(10);
        updateStreak();
        checkAndUnlockBadges();
    } else {
        // Remove XP if uncompleted
        appState.xp = Math.max(0, appState.xp - 10);
    }
    
    saveToLocalStorage();
    renderTasks();
    updateUI();
}

function deleteTask(taskId) {
    const task = appState.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Remove XP if task was completed
    if (task.completed) {
        appState.xp = Math.max(0, appState.xp - 10);
    }
    
    appState.tasks = appState.tasks.filter(t => t.id !== taskId);
    saveToLocalStorage();
    renderTasks();
    updateUI();
    showNotification('🗑️ Deleted', 'Task removed', 'info');
}

function filterTasks(filter) {
    appState.currentFilter = filter;
    
    // Update filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active', 'bg-blue-600', 'text-white');
        btn.classList.add('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
        
        if (btn.dataset.filter === filter) {
            btn.classList.add('active', 'bg-blue-600', 'text-white');
            btn.classList.remove('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
        }
    });
    
    renderTasks();
}

function renderTasks() {
    const tasksList = document.getElementById('tasks-list');
    
    let filteredTasks = appState.tasks;
    if (appState.currentFilter === 'pending') {
        filteredTasks = appState.tasks.filter(t => !t.completed);
    } else if (appState.currentFilter === 'completed') {
        filteredTasks = appState.tasks.filter(t => t.completed);
    }
    
    if (filteredTasks.length === 0) {
        tasksList.innerHTML = `
            <div class="text-center py-12">
                <i class="fas fa-tasks text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
                <p class="text-xl text-gray-500 dark:text-gray-400">No tasks found</p>
                <p class="text-gray-400 dark:text-gray-500">Add a task to get started!</p>
            </div>
        `;
        return;
    }
    
    tasksList.innerHTML = filteredTasks.map(task => `
        <div class="glass-card card rounded-xl p-6 shadow-lg ${task.completed ? 'opacity-75' : ''}">
            <div class="flex items-start gap-4">
                <button onclick="toggleTaskComplete(${task.id})" 
                        class="mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                               ${task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300 dark:border-gray-600 hover:border-green-500'}">
                    ${task.completed ? '<i class="fas fa-check text-white text-xs"></i>' : ''}
                </button>
                
                <div class="flex-1">
                    <div class="flex flex-wrap items-start justify-between gap-2 mb-2">
                        <h3 class="text-lg font-semibold ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-white'}">
                            ${task.name}
                        </h3>
                        <span class="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                            ${task.subject}
                        </span>
                    </div>
                    
                    ${task.description ? `
                        <p class="text-gray-600 dark:text-gray-400 mb-3">${task.description}</p>
                    ` : ''}
                    
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-gray-500 dark:text-gray-400">
                            <i class="far fa-calendar mr-1"></i>
                            ${new Date(task.createdAt).toLocaleDateString()}
                        </span>
                        <button onclick="deleteTask(${task.id})" 
                                class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// ============================================
// BADGES SYSTEM
// ============================================

function checkAndUnlockBadges() {
    const completedTasks = appState.tasks.filter(t => t.completed).length;
    const currentLevel = calculateLevel(appState.xp);
    const currentStreak = appState.streak.current;
    
    let newBadgesUnlocked = false;
    
    // Check each badge
    if (completedTasks >= 1 && !appState.badges.includes('firstTask')) {
        appState.badges.push('firstTask');
        showBadgeUnlock(BADGES.firstTask);
        newBadgesUnlocked = true;
    }
    
    if (completedTasks >= 5 && !appState.badges.includes('fiveTasks')) {
        appState.badges.push('fiveTasks');
        showBadgeUnlock(BADGES.fiveTasks);
        newBadgesUnlocked = true;
    }
    
    if (completedTasks >= 10 && !appState.badges.includes('tenTasks')) {
        appState.badges.push('tenTasks');
        showBadgeUnlock(BADGES.tenTasks);
        newBadgesUnlocked = true;
    }
    
    if (currentStreak >= 7 && !appState.badges.includes('sevenDayStreak')) {
        appState.badges.push('sevenDayStreak');
        showBadgeUnlock(BADGES.sevenDayStreak);
        newBadgesUnlocked = true;
    }
    
    if (currentLevel >= 5 && !appState.badges.includes('level5')) {
        appState.badges.push('level5');
        showBadgeUnlock(BADGES.level5);
        newBadgesUnlocked = true;
    }
    
    if (newBadgesUnlocked) {
        saveToLocalStorage();
    }
}

function showBadgeUnlock(badge) {
    showNotification('🏆 Badge Unlocked!', badge.name, 'success');
}

function renderBadges() {
    const badgesContainer = document.getElementById('badges-container');
    
    const badgesHTML = Object.values(BADGES).map(badge => {
        const isUnlocked = appState.badges.includes(badge.id);
        
        return `
            <div class="glass-card card rounded-xl p-6 shadow-lg text-center ${isUnlocked ? 'badge-unlock' : 'opacity-50'}">
                <div class="text-6xl ${isUnlocked ? badge.color : 'text-gray-400 dark:text-gray-600'} mb-4">
                    <i class="fas ${badge.icon}"></i>
                </div>
                <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-2">${badge.name}</h3>
                <p class="text-gray-600 dark:text-gray-400 mb-4">${badge.description}</p>
                ${isUnlocked ? 
                    '<span class="inline-block px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">Unlocked!</span>' :
                    '<span class="inline-block px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-sm font-medium">Locked</span>'
                }
            </div>
        `;
    }).join('');
    
    badgesContainer.innerHTML = badgesHTML;
}

// ============================================
// CHARTS
// ============================================

let tasksChart = null;
let xpChart = null;

function initializeCharts() {
    // Tasks Distribution Chart
    const tasksCtx = document.getElementById('tasksChart');
    if (tasksCtx) {
        tasksChart = new Chart(tasksCtx, {
            type: 'doughnut',
            data: {
                labels: ['Completed', 'Pending'],
                datasets: [{
                    data: [0, 0],
                    backgroundColor: ['#10B981', '#3B82F6'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: appState.darkMode ? '#E5E7EB' : '#374151',
                            font: { size: 14 }
                        }
                    }
                }
            }
        });
    }
    
    // XP Over Time Chart
    const xpCtx = document.getElementById('xpChart');
    if (xpCtx) {
        xpChart = new Chart(xpCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'XP Gained',
                    data: [],
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: appState.darkMode ? '#E5E7EB' : '#374151'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: appState.darkMode ? '#E5E7EB' : '#374151'
                        },
                        grid: {
                            color: appState.darkMode ? '#374151' : '#E5E7EB'
                        }
                    },
                    x: {
                        ticks: {
                            color: appState.darkMode ? '#E5E7EB' : '#374151'
                        },
                        grid: {
                            color: appState.darkMode ? '#374151' : '#E5E7EB'
                        }
                    }
                }
            }
        });
    }
    
    updateCharts();
}

function updateCharts() {
    const completedTasks = appState.tasks.filter(t => t.completed).length;
    const pendingTasks = appState.tasks.filter(t => !t.completed).length;
    
    // Update tasks chart
    if (tasksChart) {
        tasksChart.data.datasets[0].data = [completedTasks, pendingTasks];
        tasksChart.options.plugins.legend.labels.color = appState.darkMode ? '#E5E7EB' : '#374151';
        tasksChart.update();
    }
    
    // Update XP chart
    if (xpChart) {
        const last7Days = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            last7Days.push(date.toISOString().split('T')[0]);
        }
        
        const xpData = last7Days.map(date => {
            const entry = appState.xpHistory.find(h => h.date === date);
            return entry ? entry.xp : 0;
        });
        
        const labels = last7Days.map(date => {
            const d = new Date(date);
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        
        xpChart.data.labels = labels;
        xpChart.data.datasets[0].data = xpData;
        xpChart.options.plugins.legend.labels.color = appState.darkMode ? '#E5E7EB' : '#374151';
        xpChart.options.scales.y.ticks.color = appState.darkMode ? '#E5E7EB' : '#374151';
        xpChart.options.scales.x.ticks.color = appState.darkMode ? '#E5E7EB' : '#374151';
        xpChart.options.scales.y.grid.color = appState.darkMode ? '#374151' : '#E5E7EB';
        xpChart.options.scales.x.grid.color = appState.darkMode ? '#374151' : '#E5E7EB';
        xpChart.update();
    }
}

// ============================================
// UI UPDATES
// ============================================

function updateUI() {
    updateDashboard();
    renderTasks();
    updateCharts();
}

function updateDashboard() {
    const currentLevel = calculateLevel(appState.xp);
    const xpForNextLevel = getXPForNextLevel(currentLevel);
    const currentLevelXP = appState.xp % 100;
    const progressPercentage = (currentLevelXP / 100) * 100;
    
    const completedTasks = appState.tasks.filter(t => t.completed).length;
    const pendingTasks = appState.tasks.filter(t => !t.completed).length;
    
    // Update hero stats
    document.getElementById('hero-level').textContent = currentLevel;
    document.getElementById('hero-xp').textContent = appState.xp;
    document.getElementById('hero-streak').textContent = appState.streak.current;
    
    // Update stat cards
    document.getElementById('stat-completed').textContent = completedTasks;
    document.getElementById('stat-pending').textContent = pendingTasks;
    document.getElementById('stat-badges').textContent = appState.badges.length;
    document.getElementById('stat-next-level').textContent = `${100 - currentLevelXP} XP`;
    
    // Update level progress
    document.getElementById('progress-current-level').textContent = currentLevel;
    document.getElementById('progress-current-xp').textContent = currentLevelXP;
    document.getElementById('progress-next-level').textContent = 100;
    document.getElementById('level-progress-bar').style.width = `${progressPercentage}%`;
    document.getElementById('xp-to-next-level').textContent = 100 - currentLevelXP;
    document.getElementById('next-level-number').textContent = currentLevel + 1;
    
    // Update analytics streak
    const streakElement = document.getElementById('current-streak');
    if (streakElement) {
        streakElement.textContent = appState.streak.current;
    }
    
    // Update recent tasks
    const recentTasks = appState.tasks.slice(0, 5);
    const recentTasksContainer = document.getElementById('recent-tasks');
    
    if (recentTasks.length === 0) {
        recentTasksContainer.innerHTML = '<p class="text-gray-500 dark:text-gray-400">No tasks yet. Add your first task!</p>';
    } else {
        recentTasksContainer.innerHTML = recentTasks.map(task => `
            <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div class="flex items-center gap-3">
                    <div class="w-5 h-5 rounded-full ${task.completed ? 'bg-green-500' : 'bg-blue-500'}"></div>
                    <div>
                        <p class="font-medium text-gray-800 dark:text-white ${task.completed ? 'line-through' : ''}">${task.name}</p>
                        <p class="text-sm text-gray-500 dark:text-gray-400">${task.subject}</p>
                    </div>
                </div>
                ${task.completed ? '<i class="fas fa-check-circle text-green-500"></i>' : '<i class="far fa-circle text-gray-400"></i>'}
            </div>
        `).join('');
    }
}

// ============================================
// NOTIFICATIONS
// ============================================

function showNotification(title, message, type = 'info') {
    const notification = document.getElementById('notification');
    const icon = document.getElementById('notification-icon');
    const titleElement = document.getElementById('notification-title');
    const messageElement = document.getElementById('notification-message');
    
    // Set icon based on type
    if (type === 'success') {
        icon.innerHTML = '✅';
    } else if (type === 'error') {
        icon.innerHTML = '❌';
    } else {
        icon.innerHTML = 'ℹ️';
    }
    
    titleElement.textContent = title;
    messageElement.textContent = message;
    
    // Show notification
    notification.style.transform = 'translateY(0)';
    
    // Hide after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateY(8rem)';
    }, 3000);
}

// ============================================
// INITIALIZE ON LOAD
// ============================================

document.addEventListener('DOMContentLoaded', initializeApp);
