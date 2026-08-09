(function () {

    const BADGES = [
        {
            id: "first-task",
            name: "First Step",
            icon: "🌱",
            description: "Complete your first task.",
            condition: data => data.completed >= 1
        },
        {
            id: "five-tasks",
            name: "Getting Serious",
            icon: "📚",
            description: "Complete 5 tasks.",
            condition: data => data.completed >= 5
        },
        {
            id: "ten-tasks",
            name: "Task Master",
            icon: "🎯",
            description: "Complete 10 tasks.",
            condition: data => data.completed >= 10
        },
        {
            id: "one-hour",
            name: "Deep Focus",
            icon: "⏱️",
            description: "Study for at least 1 hour.",
            condition: data => data.studyMinutes >= 60
        },
        {
            id: "five-hours",
            name: "Study Machine",
            icon: "🔥",
            description: "Study for at least 5 hours.",
            condition: data => data.studyMinutes >= 300
        },
        {
            id: "seven-day-streak",
            name: "Consistency",
            icon: "🔥",
            description: "Reach a 7-day study streak.",
            condition: data => data.streak >= 7
        }
    ];

    function getData() {
        const tasks = appState.tasks || [];

        const completed =
            tasks.filter(task => task.completed).length;

        const studyMinutes =
            tasks.reduce(
                (total, task) =>
                    total +
                    (Number(task.actualStudyTime) || 0) / 60,
                0
            );

        let streak = 0;

        try {
            const activity =
                JSON.parse(
                    localStorage.getItem(
                        "studyquest_study_activity"
                    )
                ) || {};

            const date = new Date();

            while (true) {
                const key =
                    `${date.getFullYear()}-${String(
                        date.getMonth() + 1
                    ).padStart(2, "0")}-${String(
                        date.getDate()
                    ).padStart(2, "0")}`;

                if (!(Number(activity[key]) > 0)) {
                    break;
                }

                streak++;

                date.setDate(
                    date.getDate() - 1
                );
            }

        } catch {
            streak = 0;
        }

        return {
            completed,
            studyMinutes,
            streak
        };
    }

    function getUnlockedBadges() {
        const data = getData();

        return BADGES.filter(
            badge => badge.condition(data)
        );
    }

    function renderBadges() {

        const dashboard =
            document.getElementById(
                "dashboard-section"
            );

        if (!dashboard) return;

        let container =
            document.getElementById(
                "badges-container"
            );

        if (!container) {

            container =
                document.createElement("div");

            container.id =
                "badges-container";

            container.className =
                "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8";

            dashboard.appendChild(container);
        }

        const unlocked =
            getUnlockedBadges();

        container.innerHTML = `
            <div class="glass-card rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">

                <div class="flex items-center justify-between mb-6">

                    <div class="flex items-center gap-3">

                        <div class="w-11 h-11 rounded-xl bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">

                            <i class="fas fa-trophy text-yellow-600 dark:text-yellow-300"></i>

                        </div>

                        <div>

                            <h2 class="text-2xl font-bold text-gray-800 dark:text-white">
                                Achievements
                            </h2>

                            <p class="text-sm text-gray-500 dark:text-gray-400">
                                Keep studying to unlock new badges.
                            </p>

                        </div>

                    </div>

                    <div class="text-sm font-semibold text-gray-500 dark:text-gray-400">
                        ${unlocked.length}/${BADGES.length} unlocked
                    </div>

                </div>

                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">

                    ${BADGES.map(badge => {

                        const isUnlocked =
                            unlocked.some(
                                item =>
                                    item.id === badge.id
                            );

                        return `
                            <div
                                class="rounded-xl p-4 text-center border
                                ${
                                    isUnlocked
                                        ? "border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20"
                                        : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                                }"
                            >

                                <div class="text-4xl mb-3 ${
                                    isUnlocked
                                        ? ""
                                        : "grayscale opacity-40"
                                }">
                                    ${badge.icon}
                                </div>

                                <p class="font-bold text-sm text-gray-800 dark:text-white">
                                    ${badge.name}
                                </p>

                                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    ${badge.description}
                                </p>

                                <p class="text-xs font-semibold mt-3 ${
                                    isUnlocked
                                        ? "text-green-600"
                                        : "text-gray-400"
                                }">
                                    ${
                                        isUnlocked
                                            ? "✓ Unlocked"
                                            : "🔒 Locked"
                                    }
                                </p>

                            </div>
                        `;

                    }).join("")}

                </div>

            </div>
        `;
    }

    function checkNewBadges() {

        const previous =
            JSON.parse(
                localStorage.getItem(
                    "studyquest_unlocked_badges"
                ) || "[]"
            );

        const unlocked =
            getUnlockedBadges();

        const newBadges =
            unlocked.filter(
                badge =>
                    !previous.includes(
                        badge.id
                    )
            );

        if (newBadges.length > 0) {

            const updated =
                unlocked.map(
                    badge => badge.id
                );

            localStorage.setItem(
                "studyquest_unlocked_badges",
                JSON.stringify(updated)
            );

            newBadges.forEach(
                badge => {

                    setTimeout(() => {

                        if (
                            typeof showNotification ===
                            "function"
                        ) {
                            showNotification(
                                `🏆 ${badge.name}`,
                                badge.description,
                                "success"
                            );
                        }

                    }, 500);

                }
            );
        }
    }

    window.renderGamification =
        renderBadges;

    window.checkStudyQuestBadges =
        checkNewBadges;

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            setTimeout(() => {

                renderBadges();

                checkNewBadges();

            }, 500);

        }
    );

})();