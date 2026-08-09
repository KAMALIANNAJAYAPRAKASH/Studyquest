(function () {

    function calculatePriority(task) {
        let score = 0;

        // Difficulty
        const difficulty = String(task.difficulty || "").toLowerCase();

        if (difficulty === "hard") score += 40;
        else if (difficulty === "medium") score += 25;
        else score += 10;

        // Due date
        if (task.dueDate) {
            const today = new Date();
            const due = new Date(task.dueDate);

            today.setHours(0, 0, 0, 0);
            due.setHours(0, 0, 0, 0);

            const daysLeft =
                Math.ceil(
                    (due - today) /
                    (1000 * 60 * 60 * 24)
                );

            if (daysLeft < 0) score += 50;
            else if (daysLeft === 0) score += 45;
            else if (daysLeft === 1) score += 35;
            else if (daysLeft <= 3) score += 25;
            else if (daysLeft <= 7) score += 15;
        }

        // Estimated study time
        const estimatedTime =
            Number(task.estimatedTime) || 0;

        if (estimatedTime >= 60) score += 15;
        else if (estimatedTime >= 30) score += 10;
        else if (estimatedTime >= 15) score += 5;

        return score;
    }

    function getPriorityLabel(score) {
        if (score >= 80) {
            return {
                label: "Critical",
                icon: "🔴"
            };
        }

        if (score >= 60) {
            return {
                label: "High",
                icon: "🟠"
            };
        }

        if (score >= 35) {
            return {
                label: "Medium",
                icon: "🟡"
            };
        }

        return {
            label: "Low",
            icon: "🟢"
        };
    }

    function getPrioritizedTasks() {
        const tasks = appState.tasks || [];

        return tasks
            .filter(task => !task.completed)
            .map(task => {
                const score =
                    calculatePriority(task);

                return {
                    ...task,
                    priorityScore: score,
                    priority:
                        getPriorityLabel(score)
                };
            })
            .sort(
                (a, b) =>
                    b.priorityScore -
                    a.priorityScore
            );
    }

    function renderPriorityPanel() {
        const analyticsSection =
            document.getElementById(
                "analytics-section"
            );

        if (!analyticsSection) return;

        let container =
            document.getElementById(
                "priority-container"
            );

        if (!container) {
            container =
                document.createElement("div");

            container.id =
                "priority-container";

            container.className =
                "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8";

            analyticsSection.appendChild(container);
        }

        const tasks =
            getPrioritizedTasks();

        const topTasks =
            tasks.slice(0, 5);

        container.innerHTML = `
            <div class="glass-card rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">

                <div class="flex items-center gap-3 mb-6">

                    <div class="w-11 h-11 rounded-xl bg-red-100 dark:bg-red-900 flex items-center justify-center">
                        <i class="fas fa-bullseye text-red-600 dark:text-red-300"></i>
                    </div>

                    <div>
                        <h2 class="text-2xl font-bold text-gray-800 dark:text-white">
                            Smart Task Priority
                        </h2>

                        <p class="text-sm text-gray-500 dark:text-gray-400">
                            Your most important tasks are ranked automatically.
                        </p>
                    </div>

                </div>

                ${
                    topTasks.length === 0
                        ? `
                            <div class="text-center py-8">
                                <div class="text-4xl mb-3">
                                    🎉
                                </div>

                                <p class="font-semibold text-gray-800 dark:text-white">
                                    No pending tasks
                                </p>

                                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    You're all caught up!
                                </p>
                            </div>
                        `
                        :
                        `
                        <div class="space-y-3">

                            ${topTasks.map((task, index) => {

                                const priority =
                                    task.priority;

                                return `
                                    <div class="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">

                                        <div class="w-8 h-8 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center font-bold text-gray-600 dark:text-gray-200">
                                            ${index + 1}
                                        </div>

                                        <div class="flex-1 min-w-0">

                                            <p class="font-semibold text-gray-800 dark:text-white truncate">
                                                ${escapeHTML(task.name)}
                                            </p>

                                            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                ${escapeHTML(task.subject || "General")}
                                                ${
                                                    task.estimatedTime
                                                        ? ` • ${task.estimatedTime} min`
                                                        : ""
                                                }
                                            </p>

                                        </div>

                                        <div class="text-right">

                                            <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-white dark:bg-gray-700">
                                                ${priority.icon}
                                                ${priority.label}
                                            </span>

                                            <p class="text-xs text-gray-400 mt-1">
                                                Score ${task.priorityScore}
                                            </p>

                                        </div>

                                    </div>
                                `;
                            }).join("")}

                        </div>
                        `
                }

                ${
                    tasks.length > 5
                        ? `
                        <p class="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
                            Showing your top 5 priorities out of ${tasks.length} pending tasks.
                        </p>
                        `
                        : ""
                }

            </div>
        `;
    }

    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    window.calculateTaskPriority =
        calculatePriority;

    window.getPrioritizedTasks =
        getPrioritizedTasks;

    window.renderTaskPriority =
        renderPriorityPanel;

    document.addEventListener(
        "DOMContentLoaded",
        function () {
            setTimeout(
                renderPriorityPanel,
                400
            );
        }
    );

})();