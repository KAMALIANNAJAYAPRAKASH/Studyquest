(function () {

    function getRecommendations() {
        const tasks = (appState.tasks || [])
            .filter(task => !task.completed);

        if (!tasks.length) {
            return [
                {
                    icon: "🎉",
                    title: "You're all caught up!",
                    text: "No pending tasks. Add a new task when you are ready."
                }
            ];
        }

        const recommendations = [];

        const sorted = [...tasks].sort((a, b) => {
            const aDate = a.dueDate
                ? new Date(a.dueDate).getTime()
                : Infinity;

            const bDate = b.dueDate
                ? new Date(b.dueDate).getTime()
                : Infinity;

            return aDate - bDate;
        });

        const nextTask = sorted[0];

        if (nextTask) {
            recommendations.push({
                icon: "🎯",
                title: "Start with this task",
                text: `"${nextTask.name}" should be your next focus task.`
            });
        }

        const hardTask = tasks.find(
            task =>
                String(task.difficulty).toLowerCase() === "hard"
        );

        if (hardTask) {
            recommendations.push({
                icon: "🧠",
                title: "Tackle the difficult task",
                text: `"${hardTask.name}" is marked as difficult. Try it when your energy is highest.`
            });
        }

        const longTask = tasks.find(
            task =>
                Number(task.estimatedTime || 0) >= 60
        );

        if (longTask) {
            recommendations.push({
                icon: "⏱️",
                title: "Break long sessions down",
                text: `"${longTask.name}" is a long task. Try dividing it into 25–30 minute Focus Sessions.`
            });
        }

        const subjects = {};

        tasks.forEach(task => {
            const subject =
                task.subject || "General";

            subjects[subject] =
                (subjects[subject] || 0) + 1;
        });

        const busiestSubject =
            Object.entries(subjects)
                .sort((a, b) => b[1] - a[1])[0];

        if (busiestSubject) {
            recommendations.push({
                icon: "📚",
                title: "Focus on your busiest subject",
                text: `${busiestSubject[0]} has ${busiestSubject[1]} pending task${busiestSubject[1] === 1 ? "" : "s"}.`
            });
        }

        const overdueTask = tasks.find(task => {
            if (!task.dueDate) return false;

            const due =
                new Date(task.dueDate);

            due.setHours(23, 59, 59, 999);

            return due < new Date();
        });

        if (overdueTask) {
            recommendations.unshift({
                icon: "🚨",
                title: "Overdue task detected",
                text: `"${overdueTask.name}" is overdue. Prioritize it before starting lower-priority work.`
            });
        }

        return recommendations.slice(0, 4);
    }

    function renderRecommendations() {

        const dashboard =
            document.getElementById(
                "dashboard-section"
            );

        if (!dashboard) return;

        let container =
            document.getElementById(
                "recommendations-container"
            );

        if (!container) {

            container =
                document.createElement("div");

            container.id =
                "recommendations-container";

            container.className =
                "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8";

            dashboard.appendChild(container);
        }

        const recommendations =
            getRecommendations();

        container.innerHTML = `
            <div class="glass-card rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">

                <div class="flex items-center gap-3 mb-6">

                    <div class="w-11 h-11 rounded-xl bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">

                        <i class="fas fa-lightbulb text-indigo-600 dark:text-indigo-300"></i>

                    </div>

                    <div>

                        <h2 class="text-2xl font-bold text-gray-800 dark:text-white">
                            Study Recommendations
                        </h2>

                        <p class="text-sm text-gray-500 dark:text-gray-400">
                            Suggestions based on your current workload.
                        </p>

                    </div>

                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

                    ${recommendations.map(item => `
                        <div class="flex gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">

                            <div class="text-2xl">
                                ${item.icon}
                            </div>

                            <div>

                                <h3 class="font-semibold text-gray-800 dark:text-white">
                                    ${item.title}
                                </h3>

                                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    ${escapeHTML(item.text)}
                                </p>

                            </div>

                        </div>
                    `).join("")}

                </div>

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

    window.renderStudyRecommendations =
        renderRecommendations;

    document.addEventListener(
        "DOMContentLoaded",
        function () {
            setTimeout(
                renderRecommendations,
                600
            );
        }
    );

})();