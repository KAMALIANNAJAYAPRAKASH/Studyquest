(function () {
    const STORAGE_KEY = "studyquest_study_activity";

    function getActivity() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        } catch {
            return {};
        }
    }

    function saveActivity(activity) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(activity));
    }

    function todayKey(date = new Date()) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    function recordStudyActivity(minutes) {
        if (!minutes || minutes <= 0) return;

        const activity = getActivity();
        const key = todayKey();

        activity[key] = (Number(activity[key]) || 0) + Number(minutes);

        saveActivity(activity);
    }

    function getActivityLevel(minutes) {
        if (minutes <= 0) return 0;
        if (minutes < 15) return 1;
        if (minutes < 30) return 2;
        if (minutes < 60) return 3;
        return 4;
    }

    function getLastNDays(numberOfDays) {
        const days = [];
        const today = new Date();

        for (let i = numberOfDays - 1; i >= 0; i--) {
            const date = new Date(today);

            date.setDate(today.getDate() - i);

            days.push({
                date,
                key: todayKey(date)
            });
        }

        return days;
    }

    function calculateCurrentStreak(activity) {
        let streak = 0;
        const date = new Date();

        while (true) {
            const key = todayKey(date);

            if ((Number(activity[key]) || 0) <= 0) {
                break;
            }

            streak++;
            date.setDate(date.getDate() - 1);
        }

        return streak;
    }

    function calculateLongestStreak(activity) {
        const dates = Object.keys(activity)
            .filter(key => Number(activity[key]) > 0)
            .sort();

        if (dates.length === 0) return 0;

        let longest = 1;
        let current = 1;

        for (let i = 1; i < dates.length; i++) {
            const previous = new Date(dates[i - 1]);
            const currentDate = new Date(dates[i]);

            const difference =
                Math.round(
                    (currentDate - previous) /
                    (1000 * 60 * 60 * 24)
                );

            if (difference === 1) {
                current++;
                longest = Math.max(longest, current);
            } else {
                current = 1;
            }
        }

        return longest;
    }

    function getTotalStudyMinutes(activity) {
        return Object.values(activity).reduce(
            (total, minutes) =>
                total + (Number(minutes) || 0),
            0
        );
    }

    function formatMinutes(minutes) {
        minutes = Math.round(Number(minutes) || 0);

        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;

        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }

        return `${mins}m`;
    }

    function getMonthName(date) {
        return date.toLocaleString("default", {
            month: "long"
        });
    }

    function renderHeatmap() {
        const container =
            document.getElementById("study-streak-container");

        if (!container) return;

        const activity = getActivity();

        const days = getLastNDays(91);

        const currentStreak =
            calculateCurrentStreak(activity);

        const longestStreak =
            calculateLongestStreak(activity);

        const totalMinutes =
            getTotalStudyMinutes(activity);

        const activeDays =
            Object.values(activity)
                .filter(minutes => Number(minutes) > 0)
                .length;

        const cells = days.map(day => {
            const minutes =
                Number(activity[day.key]) || 0;

            const level =
                getActivityLevel(minutes);

            const dateText =
                day.date.toLocaleDateString(
                    undefined,
                    {
                        weekday: "short",
                        month: "short",
                        day: "numeric"
                    }
                );

            return `
                <div
                    class="study-heat-cell"
                    data-date="${day.key}"
                    title="${dateText}: ${minutes} minutes"
                    style="
                        width: 14px;
                        height: 14px;
                        border-radius: 3px;
                        background: ${getCellColor(level)};
                    "
                ></div>
            `;
        }).join("");

        container.innerHTML = `
            <div class="glass-card rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">

                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                    <div class="flex items-center gap-3">

                        <div class="w-11 h-11 rounded-xl bg-green-100 dark:bg-green-900 flex items-center justify-center">
                            <i class="fas fa-fire text-green-600 dark:text-green-300 text-lg"></i>
                        </div>

                        <div>
                            <h2 class="text-2xl font-bold text-gray-800 dark:text-white">
                                Study Streak
                            </h2>

                            <p class="text-sm text-gray-500 dark:text-gray-400">
                                Build consistency, one study session at a time.
                            </p>
                        </div>

                    </div>

                    <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <span>Less</span>

                        ${[0, 1, 2, 3, 4].map(level => `
                            <span
                                style="
                                    display:inline-block;
                                    width:14px;
                                    height:14px;
                                    border-radius:3px;
                                    background:${getCellColor(level)};
                                "
                            ></span>
                        `).join("")}

                        <span>More</span>
                    </div>

                </div>

                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">

                    <div class="rounded-xl bg-orange-50 dark:bg-orange-900/20 p-4">
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                            Current Streak
                        </p>

                        <p class="text-3xl font-bold text-orange-500 mt-1">
                            ${currentStreak}
                        </p>

                        <p class="text-xs text-gray-500 dark:text-gray-400">
                            day${currentStreak === 1 ? "" : "s"}
                        </p>
                    </div>

                    <div class="rounded-xl bg-purple-50 dark:bg-purple-900/20 p-4">
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                            Longest Streak
                        </p>

                        <p class="text-3xl font-bold text-purple-500 mt-1">
                            ${longestStreak}
                        </p>

                        <p class="text-xs text-gray-500 dark:text-gray-400">
                            day${longestStreak === 1 ? "" : "s"}
                        </p>
                    </div>

                    <div class="rounded-xl bg-blue-50 dark:bg-blue-900/20 p-4">
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                            Study Time
                        </p>

                        <p class="text-3xl font-bold text-blue-500 mt-1">
                            ${formatMinutes(totalMinutes)}
                        </p>

                        <p class="text-xs text-gray-500 dark:text-gray-400">
                            total
                        </p>
                    </div>

                    <div class="rounded-xl bg-green-50 dark:bg-green-900/20 p-4">
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                            Active Days
                        </p>

                        <p class="text-3xl font-bold text-green-500 mt-1">
                            ${activeDays}
                        </p>

                        <p class="text-xs text-gray-500 dark:text-gray-400">
                            study days
                        </p>
                    </div>

                </div>

                <div class="mt-6">

                    <div class="flex items-center justify-between mb-3">

                        <div>
                            <p class="font-semibold text-gray-800 dark:text-white">
                                Last 91 Days
                            </p>

                            <p class="text-xs text-gray-500 dark:text-gray-400">
                                Your daily study activity
                            </p>
                        </div>

                        <span class="text-sm text-gray-500 dark:text-gray-400">
                            ${getMonthName(new Date())}
                        </span>

                    </div>

                    <div
                        class="overflow-x-auto pb-2"
                        style="scrollbar-width:thin;"
                    >
                        <div
                            class="grid gap-1"
                            style="
                                grid-template-columns:repeat(13, 14px);
                                grid-auto-flow:column;
                                grid-template-rows:repeat(7, 14px);
                                width:max-content;
                            "
                        >
                            ${createCalendarCells(days, activity)}
                        </div>
                    </div>

                </div>

                <div class="mt-5 p-4 rounded-xl bg-gray-50 dark:bg-gray-800">

                    <div class="flex items-start gap-3">

                        <i class="fas fa-lightbulb text-yellow-500 mt-1"></i>

                        <div>

                            <p class="font-semibold text-gray-800 dark:text-white">
                                Streak Tip
                            </p>

                            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                ${getStreakMessage(currentStreak)}
                            </p>

                        </div>

                    </div>

                </div>

            </div>
        `;
    }

    function createCalendarCells(days, activity) {
        const cells = [];

        const firstDate = days[0].date;

        const startDay = firstDate.getDay();

        for (let i = 0; i < startDay; i++) {
            cells.push(`
                <div style="
                    width:14px;
                    height:14px;
                "></div>
            `);
        }

        days.forEach(day => {
            const minutes =
                Number(activity[day.key]) || 0;

            const level =
                getActivityLevel(minutes);

            const dateText =
                day.date.toLocaleDateString(
                    undefined,
                    {
                        weekday: "short",
                        month: "short",
                        day: "numeric"
                    }
                );

            cells.push(`
                <div
                    title="${dateText}: ${minutes} minutes"
                    style="
                        width:14px;
                        height:14px;
                        border-radius:3px;
                        background:${getCellColor(level)};
                        cursor:pointer;
                    "
                ></div>
            `);
        });

        return cells.join("");
    }

    function getCellColor(level) {
        const darkMode =
            document.documentElement.classList.contains("dark");

        if (darkMode) {
            return [
                "#374151",
                "#14532d",
                "#166534",
                "#15803d",
                "#22c55e"
            ][level];
        }

        return [
            "#e5e7eb",
            "#bbf7d0",
            "#86efac",
            "#4ade80",
            "#16a34a"
        ][level];
    }

    function getStreakMessage(streak) {
        if (streak === 0) {
            return "Start a Focus Session today to begin your study streak.";
        }

        if (streak === 1) {
            return "Great start! Study again tomorrow to reach a 2-day streak.";
        }

        if (streak < 7) {
            return `You're on a ${streak}-day streak. Keep going and reach one full week!`;
        }

        if (streak < 30) {
            return `🔥 ${streak} days in a row! You're building a serious study habit.`;
        }

        return `🏆 ${streak} consecutive days! Your consistency is excellent.`;
    }

    function createStreakUI() {
        const analyticsSection =
            document.getElementById("analytics-section");

        if (!analyticsSection) return;

        if (document.getElementById("study-streak-container")) {
            renderHeatmap();
            return;
        }

        const container =
            document.createElement("div");

        container.id = "study-streak-container";

        container.className =
            "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8";

        analyticsSection.appendChild(container);

        renderHeatmap();
    }

    window.recordStudyActivity = recordStudyActivity;

    window.renderStudyStreak = renderHeatmap;

    document.addEventListener(
        "DOMContentLoaded",
        function () {
            setTimeout(createStreakUI, 300);
        }
    );

    window.addEventListener(
        "studyquest:activity",
        function (event) {
            if (
                event.detail &&
                event.detail.minutes
            ) {
                recordStudyActivity(
                    event.detail.minutes
                );

                renderHeatmap();
            }
        }
    );
})();