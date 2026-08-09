(function () {
    const TIMER_KEY = 'studyquest_focus_timer';

    let timerState = {
        taskId: null,
        duration: 0,
        remaining: 0,
        running: false,
        startedAt: null
    };

    let timerInterval = null;

    function saveTimerState() {
        localStorage.setItem(TIMER_KEY, JSON.stringify(timerState));
    }

    function loadTimerState() {
        const saved = localStorage.getItem(TIMER_KEY);

        if (!saved) return;

        try {
            timerState = JSON.parse(saved);
        } catch (error) {
            localStorage.removeItem(TIMER_KEY);
        }
    }

    function getPendingTasks() {
        return (appState.tasks || []).filter(task => !task.completed);
    }

    function getSelectedTask() {
        if (!timerState.taskId) return null;

        return appState.tasks.find(
            task => String(task.id) === String(timerState.taskId)
        );
    }

    function formatTime(seconds) {
        seconds = Math.max(0, Math.floor(seconds));

        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }

        return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    function renderTimer() {
        const container = document.getElementById('focus-timer-container');

        if (!container) return;

        const task = getSelectedTask();
        const pendingTasks = getPendingTasks();

        const taskOptions = pendingTasks.map(item => `
            <option value="${item.id}" ${String(item.id) === String(timerState.taskId) ? 'selected' : ''}>
                ${item.name} — ${item.subject}
            </option>
        `).join('');

        container.innerHTML = `
            <div class="glass-card rounded-2xl p-6 shadow-lg border border-blue-100 dark:border-gray-700">

                <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

                    <div class="flex items-start gap-4">
                        <div class="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <i class="fas fa-stopwatch text-xl text-blue-600 dark:text-blue-300"></i>
                        </div>

                        <div>
                            <p class="text-sm font-medium text-blue-600 dark:text-blue-400">
                                FOCUS SESSION
                            </p>

                            <h2 class="text-2xl font-bold text-gray-800 dark:text-white">
                                Study with Focus
                            </h2>

                            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Track your actual study time.
                            </p>
                        </div>
                    </div>

                    <div class="text-center">
                        <div id="focus-timer-display"
                             class="text-5xl font-bold tracking-wider text-gray-800 dark:text-white">
                            ${formatTime(timerState.remaining || 0)}
                        </div>

                        <p id="focus-timer-status"
                           class="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            ${timerState.running ? 'Focus session in progress' : 'Ready to study'}
                        </p>
                    </div>

                </div>

                <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">

                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Select a pending task
                        </label>

                        <select id="focus-task-select"
                                class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none">
                            <option value="">Choose a task...</option>
                            ${taskOptions}
                        </select>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Session Length
                        </label>

                        <select id="focus-duration-select"
                                class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none"
                                ${timerState.running ? 'disabled' : ''}>
                            <option value="15">15 minutes</option>
                            <option value="25" selected>25 minutes</option>
                            <option value="30">30 minutes</option>
                            <option value="45">45 minutes</option>
                            <option value="60">60 minutes</option>
                        </select>
                    </div>

                </div>

                <div class="flex flex-wrap gap-3 mt-5">

                    <button id="focus-start-btn"
                            class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all"
                            ${timerState.running ? 'disabled' : ''}>
                        <i class="fas fa-play mr-2"></i>
                        ${timerState.remaining > 0 && !timerState.running ? 'Resume' : 'Start Focus'}
                    </button>

                    <button id="focus-pause-btn"
                            class="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-semibold transition-all"
                            ${timerState.running ? '' : 'disabled'}>
                        <i class="fas fa-pause mr-2"></i>
                        Pause
                    </button>

                    <button id="focus-finish-btn"
                            class="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all"
                            ${timerState.taskId && timerState.remaining < timerState.duration && !timerState.running ? '' : 'disabled'}>
                        <i class="fas fa-check mr-2"></i>
                        Finish Session
                    </button>

                    <button id="focus-reset-btn"
                            class="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-semibold transition-all">
                        <i class="fas fa-rotate-left mr-2"></i>
                        Reset
                    </button>

                </div>

                <div class="mt-5 p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <div class="flex items-center justify-between text-sm">
                        <span class="text-gray-500 dark:text-gray-400">
                            Current task
                        </span>

                        <span id="focus-current-task"
                              class="font-semibold text-gray-800 dark:text-white">
                            ${task ? task.name : 'No task selected'}
                        </span>
                    </div>
                </div>

            </div>
        `;

        attachTimerEvents();
    }

    function attachTimerEvents() {
        const taskSelect = document.getElementById('focus-task-select');
        const durationSelect = document.getElementById('focus-duration-select');

        const startBtn = document.getElementById('focus-start-btn');
        const pauseBtn = document.getElementById('focus-pause-btn');
        const finishBtn = document.getElementById('focus-finish-btn');
        const resetBtn = document.getElementById('focus-reset-btn');

        if (taskSelect) {
            taskSelect.addEventListener('change', function () {
                timerState.taskId = this.value || null;

                if (timerState.taskId) {
                    const task = getSelectedTask();

                    if (task) {
                        timerState.duration =
                            (Number(task.estimatedTime) || 25) * 60;

                        timerState.remaining = timerState.duration;
                    }
                }

                saveTimerState();
                renderTimer();
            });
        }

        if (durationSelect) {
            durationSelect.addEventListener('change', function () {
                timerState.duration = Number(this.value) * 60;
                timerState.remaining = timerState.duration;

                saveTimerState();
                updateTimerDisplay();
            });
        }

        if (startBtn) {
            startBtn.addEventListener('click', startTimer);
        }

        if (pauseBtn) {
            pauseBtn.addEventListener('click', pauseTimer);
        }

        if (finishBtn) {
            finishBtn.addEventListener('click', finishSession);
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', resetTimer);
        }
    }

    function startTimer() {
        const task = getSelectedTask();

        if (!task) {
            showNotification(
                'Select a Task',
                'Choose a pending task before starting.',
                'error'
            );
            return;
        }

        if (!timerState.remaining) {
            const durationSelect =
                document.getElementById('focus-duration-select');

            const minutes =
                Number(durationSelect?.value) || 25;

            timerState.duration = minutes * 60;
            timerState.remaining = timerState.duration;
        }

        timerState.running = true;
        timerState.startedAt = timerState.startedAt || Date.now();

        saveTimerState();

        clearInterval(timerInterval);

        timerInterval = setInterval(() => {
            if (timerState.remaining > 0) {
                timerState.remaining--;

                saveTimerState();
                updateTimerDisplay();
            }

            if (timerState.remaining <= 0) {
                clearInterval(timerInterval);

                timerState.running = false;

                saveTimerState();

                updateTimerDisplay();

                showNotification(
                    '⏰ Focus Complete!',
                    'Your study session has finished.',
                    'success'
                );
            }
        }, 1000);

        renderTimer();
    }

    function pauseTimer() {
        timerState.running = false;

        clearInterval(timerInterval);

        saveTimerState();

        renderTimer();
    }

    function finishSession() {
        const task = getSelectedTask();

        if (!task) return;

        const studiedSeconds =
            Math.max(0, timerState.duration - timerState.remaining);

        if (studiedSeconds < 60) {
            showNotification(
                'Keep Going',
                'Study for at least one minute before finishing.',
                'error'
            );
            return;
        }

        task.actualStudyTime =
            (Number(task.actualStudyTime) || 0) + studiedSeconds;

        saveToLocalStorage();

        clearInterval(timerInterval);

        const minutes = Math.floor(studiedSeconds / 60);

        timerState = {
            taskId: null,
            duration: 0,
            remaining: 0,
            running: false,
            startedAt: null
        };

        saveTimerState();

        if (typeof updateUI === 'function') {
            updateUI();
        }

        showNotification(
            '📚 Study Session Saved',
            `${minutes} minute${minutes === 1 ? '' : 's'} added to your study time.`,
            'success'
        );

        renderTimer();
    }

    function resetTimer() {
        clearInterval(timerInterval);

        timerState = {
            taskId: null,
            duration: 0,
            remaining: 0,
            running: false,
            startedAt: null
        };

        saveTimerState();

        renderTimer();
    }

    function updateTimerDisplay() {
        const display =
            document.getElementById('focus-timer-display');

        const status =
            document.getElementById('focus-timer-status');

        if (display) {
            display.textContent =
                formatTime(timerState.remaining);
        }

        if (status) {
            status.textContent = timerState.running
                ? 'Focus session in progress'
                : 'Timer paused';
        }

        const finishBtn =
            document.getElementById('focus-finish-btn');

        if (finishBtn) {
            finishBtn.disabled =
                !timerState.taskId ||
                timerState.remaining >= timerState.duration ||
                timerState.running;
        }
    }

    function createTimerUI() {
        const dashboard =
            document.getElementById('dashboard-section');

        if (!dashboard) return;

        const mainContainer =
            dashboard.querySelector('.max-w-7xl');

        if (!mainContainer) return;

        const timerWrapper =
            document.createElement('div');

        timerWrapper.id = 'focus-timer-container';
        timerWrapper.className = 'mb-8';

        mainContainer.insertBefore(
            timerWrapper,
            mainContainer.firstChild
        );

        loadTimerState();

        if (
            timerState.taskId &&
            !getSelectedTask()
        ) {
            resetTimer();
            return;
        }

        renderTimer();
    }

    document.addEventListener('DOMContentLoaded', function () {
        setTimeout(createTimerUI, 100);
    });

    window.addEventListener('beforeunload', function () {
        saveTimerState();
    });
})();