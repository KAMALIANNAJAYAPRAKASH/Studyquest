(function () {

    function buildStudyPlan() {
        const tasks = (appState.tasks || [])
            .filter(task => !task.completed);

        if (!tasks.length) {
            return [];
        }

        return [...tasks]
            .sort((a, b) => {

                const difficulty = {
                    hard: 3,
                    medium: 2,
                    easy: 1
                };

                const aDifficulty =
                    difficulty[
                        String(a.difficulty || "easy").toLowerCase()
                    ] || 1;

                const bDifficulty =
                    difficulty[
                        String(b.difficulty || "easy").toLowerCase()
                    ] || 1;

                const aDue = a.dueDate
                    ? new Date(a.dueDate).getTime()
                    : Infinity;

                const bDue = b.dueDate
                    ? new Date(b.dueDate).getTime()
                    : Infinity;

                if (aDue !== bDue) {
                    return aDue - bDue;
                }

                return bDifficulty - aDifficulty;
            })
            .slice(0, 6);
    }

    function renderStudyPlanner() {

        const dashboard =
            document.getElementById(
                "dashboard-section"
            );

        if (!dashboard) return;

        let container =
            document.getElementById(
                "study-planner-container"
            );

        if (!container) {

            container =
                document.createElement("div");

            container.id =
                "study-planner-container";

            container.className =
                "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8";

            dashboard.appendChild(container);
        }

        const tasks =
            buildStudyPlan();

        const totalMinutes =
            tasks.reduce(
                (total, task) =>
                    total +
                    (Number(task.estimatedTime) || 25),
                0
            );

        container.innerHTML = `
            <div class="glass-card rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">

                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

                    <div class="flex items-center gap-3">

                        <div class="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center">

                            <i class="fas fa-calendar-check text-blue-600 dark:text-blue-300"></i>

                        </div>

                        <div>

                            <h2 class="text-2xl font-bold text-gray-800 dark:text-white">
                                Today's Study Plan
                            </h2>

                            <p class="text-sm text-gray-500 dark:text-gray-400">
                                A focused plan based on your pending tasks.
                            </p>

                        </div>

                    </div>

                    ${
                        tasks.length
                            ? `
                            <div class="px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/30">

                                <span class="text-sm text-gray-500 dark:text-gray-400">
                                    Planned time
                                </span>

                                <span class="font-bold text-blue-600 dark:text-blue-300 ml-2">
                                    ${formatMinutes(totalMinutes)}
                                </span>

                            </div>
                            `
                            : ""
                    }

                </div>

                ${
                    tasks.length === 0
                        ? `
                            <div class="text-center py-8">

                                <div class="text-4xl mb-3">
                                    🎉
                                </div>

                                <p class="font-semibold text-gray-800 dark:text-white">
                                    Your plan is clear!
                                </p>

                                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Add a task to create your next study plan.
                                </p>

                            </div>
                        `
                        :
                        `
                            <div class="space-y-3">

                                ${tasks.map((task, index) => {

                                    const difficulty =
                                        String(
                                            task.difficulty || "easy"
                                        ).toLowerCase();

                                    const difficultyIcon =
                                        difficulty === "hard"
                                            ? "🔴"
                                            : difficulty === "medium"
                                                ? "🟡"
                                                : "🟢";

                                    const minutes =
                                        Number(
                                            task.estimatedTime
                                        ) || 25;

                                    return `
                                        <div class="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">

                                            <div class="w-9 h-9 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center font-bold text-gray-600 dark:text-gray-200">
                                                ${index + 1}
                                            </div>

                                            <div class="flex-1 min-w-0">

                                                <p class="font-semibold text-gray-800 dark:text-white truncate">
                                                    ${escapeHTML(task.name)}
                                                </p>

                                                <div class="flex flex-wrap gap-2 mt-1">

                                                    <span class="text-xs text-gray-500 dark:text-gray-400">
                                                        ${escapeHTML(task.subject || "General")}
                                                    </span>

                                                    <span class="text-xs text-gray-500 dark:text-gray-400">
                                                        ${difficultyIcon} ${difficulty}
                                                    </span>

                                                </div>

                                            </div>

                                            <div class="text-right">

                                                <p class="font-semibold text-blue-600 dark:text-blue-300">
                                                    ${minutes} min
                                                </p>

                                                <p class="text-xs text-gray-400">
                                                    Focus
                                                </p>

                                            </div>

                                        </div>
                                    `;

                                }).join("")}

                            </div>

                            <div class="mt-5 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20">

                                <div class="flex gap-3">

                                    <i class="fas fa-lightbulb text-blue-500 mt-1"></i>

                                    <p class="text-sm text-gray-600 dark:text-gray-300">
                                        Start with the first task and complete it before moving to the next one. For longer tasks, use the Focus Timer to avoid multitasking.
                                    </p>

                                </div>

                            </div>
                        `
                }

            </div>
        `;
    }

    function formatMinutes(minutes) {

        minutes =
            Math.round(
                Number(minutes) || 0
            );

        const hours =
            Math.floor(minutes / 60);

        const mins =
            minutes % 60;

        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }

        return `${mins}m`;
    }

    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    window.renderStudyPlanner =
        renderStudyPlanner;

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            setTimeout(
                renderStudyPlanner,
                700
            );

        }
    );

})();