(function () {
    function formatMinutes(minutes) {
        minutes = Math.max(0, Math.round(minutes));

        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;

        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }

        return `${mins}m`;
    }

    function getAnalyticsData() {
        const tasks = appState.tasks || [];

        const completed = tasks.filter(task => task.completed);
        const pending = tasks.filter(task => !task.completed);

        const totalStudySeconds = tasks.reduce(
            (total, task) =>
                total + (Number(task.actualStudyTime) || 0),
            0
        );

        const totalEstimatedMinutes = tasks.reduce(
            (total, task) =>
                total + (Number(task.estimatedTime) || 0),
            0
        );

        const completedStudySeconds = completed.reduce(
            (total, task) =>
                total + (Number(task.actualStudyTime) || 0),
            0
        );

        const completionRate = tasks.length
            ? Math.round((completed.length / tasks.length) * 100)
            : 0;

        const studyEfficiency =
            totalEstimatedMinutes > 0
                ? Math.min(
                    100,
                    Math.round(
                        (totalStudySeconds / 60 /
                            totalEstimatedMinutes) * 100
                    )
                )
                : 0;

        const easy = completed.filter(
            task => task.difficulty === 'easy'
        ).length;

        const medium = completed.filter(
            task => task.difficulty === 'medium'
        ).length;

        const hard = completed.filter(
            task => task.difficulty === 'hard'
        ).length;

        return {
            totalTasks: tasks.length,
            completedTasks: completed.length,
            pendingTasks: pending.length,
            totalStudySeconds,
            completedStudySeconds,
            totalEstimatedMinutes,
            completionRate,
            studyEfficiency,
            easy,
            medium,
            hard
        };
    }

    function renderAnalytics() {
        const container =
            document.getElementById('analytics-container');

        if (!container) return;

        const data = getAnalyticsData();

        container.innerHTML = `
            <div class="glass-card rounded-2xl p-6 shadow-lg">

                <div class="flex items-center gap-3 mb-6">
                    <div class="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                        <i class="fas fa-chart-line text-purple-600 dark:text-purple-300"></i>
                    </div>

                    <div>
                        <h2 class="text-2xl font-bold text-gray-800 dark:text-white">
                            Productivity Analytics
                        </h2>

                        <p class="text-sm text-gray-500 dark:text-gray-400">
                            See how effectively you're studying.
                        </p>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                    <div class="rounded-xl p-5 bg-blue-50 dark:bg-blue-900/30">
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-gray-500 dark:text-gray-400">
                                Total Study Time
                            </span>

                            <i class="fas fa-clock text-blue-500"></i>
                        </div>

                        <p class="text-3xl font-bold text-gray-800 dark:text-white mt-2">
                            ${formatMinutes(data.totalStudySeconds / 60)}
                        </p>
                    </div>

                    <div class="rounded-xl p-5 bg-green-50 dark:bg-green-900/30">
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-gray-500 dark:text-gray-400">
                                Tasks Completed
                            </span>

                            <i class="fas fa-check-circle text-green-500"></i>
                        </div>

                        <p class="text-3xl font-bold text-gray-800 dark:text-white mt-2">
                            ${data.completedTasks}
                        </p>

                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            ${data.completionRate}% completion rate
                        </p>
                    </div>

                    <div class="rounded-xl p-5 bg-purple-50 dark:bg-purple-900/30">
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-gray-500 dark:text-gray-400">
                                XP Earned
                            </span>

                            <i class="fas fa-star text-purple-500"></i>
                        </div>

                        <p class="text-3xl font-bold text-gray-800 dark:text-white mt-2">
                            ${appState.xp || 0}
                        </p>
                    </div>

                    <div class="rounded-xl p-5 bg-orange-50 dark:bg-orange-900/30">
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-gray-500 dark:text-gray-400">
                                Study Efficiency
                            </span>

                            <i class="fas fa-bolt text-orange-500"></i>
                        </div>

                        <p class="text-3xl font-bold text-gray-800 dark:text-white mt-2">
                            ${data.studyEfficiency}%
                        </p>
                    </div>

                </div>

                <div class="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">

                    <div class="rounded-xl border border-gray-200 dark:border-gray-700 p-5">

                        <h3 class="font-bold text-gray-800 dark:text-white mb-4">
                            Task Progress
                        </h3>

                        <div class="mb-4">
                            <div class="flex justify-between text-sm mb-2">
                                <span class="text-gray-500 dark:text-gray-400">
                                    Completed
                                </span>

                                <span class="font-semibold text-gray-800 dark:text-white">
                                    ${data.completedTasks}/${data.totalTasks}
                                </span>
                            </div>

                            <div class="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    class="h-full bg-green-500 rounded-full transition-all"
                                    style="width: ${data.completionRate}%"
                                ></div>
                            </div>
                        </div>

                        <div>
                            <div class="flex justify-between text-sm mb-2">
                                <span class="text-gray-500 dark:text-gray-400">
                                    Study Time vs Planned
                                </span>

                                <span class="font-semibold text-gray-800 dark:text-white">
                                    ${data.studyEfficiency}%
                                </span>
                            </div>

                            <div class="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    class="h-full bg-purple-500 rounded-full transition-all"
                                    style="width: ${data.studyEfficiency}%"
                                ></div>
                            </div>
                        </div>

                    </div>

                    <div class="rounded-xl border border-gray-200 dark:border-gray-700 p-5">

                        <h3 class="font-bold text-gray-800 dark:text-white mb-4">
                            Completed by Difficulty
                        </h3>

                        <div class="space-y-4">

                            <div>
                                <div class="flex justify-between text-sm mb-1">
                                    <span>🟢 Easy</span>
                                    <span class="font-semibold">
                                        ${data.easy}
                                    </span>
                                </div>

                                <div class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                                    <div
                                        class="h-2 bg-green-500 rounded-full"
                                        style="width: ${data.completedTasks ? (data.easy / data.completedTasks) * 100 : 0}%"
                                    ></div>
                                </div>
                            </div>

                            <div>
                                <div class="flex justify-between text-sm mb-1">
                                    <span>🟡 Medium</span>
                                    <span class="font-semibold">
                                        ${data.medium}
                                    </span>
                                </div>

                                <div class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                                    <div
                                        class="h-2 bg-yellow-500 rounded-full"
                                        style="width: ${data.completedTasks ? (data.medium / data.completedTasks) * 100 : 0}%"
                                    ></div>
                                </div>
                            </div>

                            <div>
                                <div class="flex justify-between text-sm mb-1">
                                    <span>🔴 Hard</span>
                                    <span class="font-semibold">
                                        ${data.hard}
                                    </span>
                                </div>

                                <div class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                                    <div
                                        class="h-2 bg-red-500 rounded-full"
                                        style="width: ${data.completedTasks ? (data.hard / data.completedTasks) * 100 : 0}%"
                                    ></div>
                                </div>
                            </div>

                        </div>

                    </div>

                </div>

                <div class="mt-6 rounded-xl bg-gray-50 dark:bg-gray-800 p-5">

                    <div class="flex items-center gap-3">
                        <i class="fas fa-lightbulb text-yellow-500 text-xl"></i>

                        <div>
                            <h3 class="font-bold text-gray-800 dark:text-white">
                                Study Insight
                            </h3>

                            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                ${generateInsight(data)}
                            </p>
                        </div>
                    </div>

                </div>

            </div>
        `;
    }

    function generateInsight(data) {
        if (data.totalTasks === 0) {
            return 'Add your first study task to start tracking your productivity.';
        }

        if (data.totalStudySeconds === 0) {
            return 'Start a Focus Session to begin measuring your actual study time.';
        }

        if (data.completionRate >= 80) {
            return 'Excellent task completion. Keep maintaining this consistency.';
        }

        if (data.studyEfficiency >= 80) {
            return 'Your study time is closely aligned with your planned workload.';
        }

        if (data.pendingTasks > data.completedTasks) {
            return 'You have more pending tasks than completed tasks. Try finishing one small task next.';
        }

        return 'Keep logging Focus Sessions to build a more accurate picture of your study habits.';
    }

    function createAnalyticsUI() {
        const analyticsSection =
            document.getElementById('analytics-section');

        if (!analyticsSection) return;

        if (document.getElementById('analytics-container')) {
            renderAnalytics();
            return;
        }

        const container =
            document.createElement('div');

        container.id = 'analytics-container';
        container.className = 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8';

        analyticsSection.appendChild(container);

        renderAnalytics();
    }

    window.renderStudyAnalytics = renderAnalytics;

    document.addEventListener('DOMContentLoaded', function () {
        setTimeout(createAnalyticsUI, 200);
    });
})();