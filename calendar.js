(function () {

    let currentMonth = new Date();

    function getTasks() {
        return appState.tasks || [];
    }

    function dateKey(date) {
        return `${date.getFullYear()}-${String(
            date.getMonth() + 1
        ).padStart(2, "0")}-${String(
            date.getDate()
        ).padStart(2, "0")}`;
    }

    function getTasksForDate(key) {
        return getTasks().filter(task => {
            if (!task.dueDate) return false;

            return dateKey(new Date(task.dueDate)) === key;
        });
    }

    function renderCalendar() {

        const dashboard =
            document.getElementById("dashboard-section");

        if (!dashboard) return;

        let container =
            document.getElementById("calendar-container");

        if (!container) {
            container = document.createElement("div");
            container.id = "calendar-container";
            container.className =
                "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8";

            dashboard.appendChild(container);
        }

        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        const firstDay =
            new Date(year, month, 1).getDay();

        const daysInMonth =
            new Date(year, month + 1, 0).getDate();

        const monthName =
            currentMonth.toLocaleString("default", {
                month: "long"
            });

        let cells = "";

        for (let i = 0; i < firstDay; i++) {
            cells += `
                <div class="min-h-[90px] rounded-lg bg-gray-50 dark:bg-gray-800/40"></div>
            `;
        }

        for (let day = 1; day <= daysInMonth; day++) {

            const date =
                new Date(year, month, day);

            const key = dateKey(date);

            const tasks =
                getTasksForDate(key);

            const isToday =
                key === dateKey(new Date());

            cells += `
                <div class="min-h-[90px] rounded-lg p-2 border ${
                    isToday
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                }">

                    <div class="flex justify-between items-center">

                        <span class="text-sm font-semibold ${
                            isToday
                                ? "text-blue-600"
                                : "text-gray-700 dark:text-gray-300"
                        }">
                            ${day}
                        </span>

                        ${
                            tasks.length
                                ? `
                                    <span class="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-1 rounded-full">
                                        ${tasks.length}
                                    </span>
                                `
                                : ""
                        }

                    </div>

                    <div class="mt-2 space-y-1">

                        ${tasks.slice(0, 3).map(task => `
                            <div
                                title="${escapeHTML(task.name)}"
                                class="text-xs truncate px-2 py-1 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                            >
                                ${escapeHTML(task.name)}
                            </div>
                        `).join("")}

                        ${
                            tasks.length > 3
                                ? `
                                    <div class="text-xs text-gray-400">
                                        +${tasks.length - 3} more
                                    </div>
                                `
                                : ""
                        }

                    </div>

                </div>
            `;
        }

        container.innerHTML = `
            <div class="glass-card rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">

                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

                    <div class="flex items-center gap-3">

                        <div class="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <i class="fas fa-calendar-alt text-blue-600 dark:text-blue-300"></i>
                        </div>

                        <div>

                            <h2 class="text-2xl font-bold text-gray-800 dark:text-white">
                                Study Calendar
                            </h2>

                            <p class="text-sm text-gray-500 dark:text-gray-400">
                                Keep track of upcoming study tasks.
                            </p>

                        </div>

                    </div>

                    <div class="flex items-center gap-2">

                        <button
                            id="calendar-prev"
                            class="w-9 h-9 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <i class="fas fa-chevron-left"></i>
                        </button>

                        <button
                            id="calendar-today"
                            class="px-4 h-9 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                        >
                            Today
                        </button>

                        <button
                            id="calendar-next"
                            class="w-9 h-9 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <i class="fas fa-chevron-right"></i>
                        </button>

                    </div>

                </div>

                <div class="text-center mb-5">

                    <h3 class="text-xl font-bold text-gray-800 dark:text-white">
                        ${monthName} ${year}
                    </h3>

                </div>

                <div class="grid grid-cols-7 gap-2 mb-2">

                    ${[
                        "Sun",
                        "Mon",
                        "Tue",
                        "Wed",
                        "Thu",
                        "Fri",
                        "Sat"
                    ].map(day => `
                        <div class="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 py-2">
                            ${day}
                        </div>
                    `).join("")}

                </div>

                <div class="grid grid-cols-7 gap-2">
                    ${cells}
                </div>

                <div class="flex flex-wrap gap-4 mt-5 text-xs text-gray-500 dark:text-gray-400">

                    <div class="flex items-center gap-2">
                        <span class="w-3 h-3 rounded bg-blue-500"></span>
                        Today
                    </div>

                    <div class="flex items-center gap-2">
                        <span class="w-3 h-3 rounded bg-purple-200"></span>
                        Scheduled task
                    </div>

                </div>

            </div>
        `;

        document
            .getElementById("calendar-prev")
            ?.addEventListener("click", () => {

                currentMonth.setMonth(
                    currentMonth.getMonth() - 1
                );

                renderCalendar();
            });

        document
            .getElementById("calendar-next")
            ?.addEventListener("click", () => {

                currentMonth.setMonth(
                    currentMonth.getMonth() + 1
                );

                renderCalendar();
            });

        document
            .getElementById("calendar-today")
            ?.addEventListener("click", () => {

                currentMonth = new Date();

                renderCalendar();
            });
    }

    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    window.renderStudyCalendar =
        renderCalendar;

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            setTimeout(
                renderCalendar,
                800
            );

        }
    );

})();