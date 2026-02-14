/**
 * Gantt-Bang - Main Application Script
 * A client-side interactive Gantt chart application
 * https://github.com/yourusername/gantt-bang
 */

// ==================== APP STATE ====================
const AppState = {
    tasks: [],
    currentEditId: null,
    viewScale: 'week',
    theme: 'light',
    dragState: {
        isDragging: false,
        isResizing: false,
        taskId: null,
        startX: 0,
        originalStart: null,
        originalEnd: null,
        resizeHandle: null
    }
};

// ==================== UTILITIES ====================
const Utils = {
    /**
     * Generate a unique ID for tasks
     * @returns {string} Unique identifier
     */
    generateId: () => `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,

    /**
     * Format date to YYYY-MM-DD string
     * @param {Date} date - Date object to format
     * @returns {string} Formatted date string
     */
    formatDate: (date) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    /**
     * Parse date string to Date object (handles timezone properly)
     * @param {string} dateString - Date string in YYYY-MM-DD format
     * @returns {Date} Date object
     */
    parseDate: (dateString) => new Date(dateString + 'T00:00:00'),

    /**
     * Get the date range for the timeline based on tasks
     * @param {Array} tasks - Array of task objects
     * @returns {Object} Object with start and end dates
     */
    getDateRange: (tasks) => {
        if (tasks.length === 0) {
            const today = new Date();
            const start = new Date(today);
            start.setDate(start.getDate() - 7);
            const end = new Date(today);
            end.setDate(end.getDate() + 21);
            return { start, end };
        }

        let minDate = new Date(tasks[0].startDate);
        let maxDate = new Date(tasks[0].endDate);

        tasks.forEach(task => {
            const start = new Date(task.startDate);
            const end = new Date(task.endDate);
            if (start < minDate) minDate = start;
            if (end > maxDate) maxDate = end;
        });

        // Add padding to the range
        minDate.setDate(minDate.getDate() - 3);
        maxDate.setDate(maxDate.getDate() + 3);

        return { start: minDate, end: maxDate };
    },

    /**
     * Calculate the number of days between two dates
     * @param {Date} date1 - Start date
     * @param {Date} date2 - End date
     * @returns {number} Number of days
     */
    daysBetween: (date1, date2) => {
        const oneDay = 24 * 60 * 60 * 1000;
        return Math.round((date2 - date1) / oneDay);
    },

    /**
     * Generate an array of dates based on the view scale
     * @param {Date} start - Start date
     * @param {Date} end - End date
     * @param {string} scale - View scale (day, week, month)
     * @returns {Array} Array of Date objects
     */
    generateDateArray: (start, end, scale) => {
        const dates = [];
        const current = new Date(start);

        while (current <= end) {
            dates.push(new Date(current));
            
            if (scale === 'day') {
                current.setDate(current.getDate() + 1);
            } else if (scale === 'week') {
                current.setDate(current.getDate() + 7);
            } else if (scale === 'month') {
                current.setMonth(current.getMonth() + 1);
            }
        }

        return dates;
    },

    /**
     * Format date for display based on scale
     * @param {Date} date - Date to format
     * @param {string} scale - View scale
     * @returns {string} Formatted date string
     */
    formatDateDisplay: (date, scale) => {
        const options = { month: 'short', day: 'numeric' };
        if (scale === 'month') {
            return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        }
        return date.toLocaleDateString('en-US', options);
    },

    /**
     * Check if a date is today
     * @param {Date} date - Date to check
     * @returns {boolean} True if date is today
     */
    isToday: (date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    },

    /**
     * Save application state to localStorage
     */
    saveToStorage: () => {
        localStorage.setItem('ganttBangTasks', JSON.stringify(AppState.tasks));
        localStorage.setItem('ganttBangTheme', AppState.theme);
        localStorage.setItem('ganttBangViewScale', AppState.viewScale);
    },

    /**
     * Load application state from localStorage
     */
    loadFromStorage: () => {
        const tasks = localStorage.getItem('ganttBangTasks');
        const theme = localStorage.getItem('ganttBangTheme');
        const viewScale = localStorage.getItem('ganttBangViewScale');

        if (tasks) AppState.tasks = JSON.parse(tasks);
        if (theme) {
            AppState.theme = theme;
            document.body.setAttribute('data-theme', theme);
            document.getElementById('themeSelector').value = theme;
        }
        if (viewScale) {
            AppState.viewScale = viewScale;
            document.getElementById('viewScale').value = viewScale;
        }
    }
};

// ==================== TASK MANAGER ====================
const TaskManager = {
    /**
     * Save a new task or update existing task
     */
    saveTask: () => {
        const name = document.getElementById('taskName').value.trim();
        const start = document.getElementById('taskStart').value;
        const end = document.getElementById('taskEnd').value;
        const color = document.getElementById('taskColor').value;

        // Validation
        if (!name) {
            alert('Please enter a task name');
            return;
        }
        if (!start || !end) {
            alert('Please select start and end dates');
            return;
        }
        if (new Date(start) > new Date(end)) {
            alert('End date must be after start date');
            return;
        }

        const task = {
            id: AppState.currentEditId || Utils.generateId(),
            name,
            startDate: start,
            endDate: end,
            color
        };

        if (AppState.currentEditId) {
            // Update existing task
            const index = AppState.tasks.findIndex(t => t.id === AppState.currentEditId);
            AppState.tasks[index] = task;
            AppState.currentEditId = null;
            document.getElementById('addTaskBtnText').textContent = 'Add Task';
        } else {
            // Add new task
            AppState.tasks.push(task);
        }

        TaskManager.clearForm();
        Utils.saveToStorage();
        UI.render();
    },

    /**
     * Edit task - populate form with task data
     * @param {string} id - Task ID
     */
    editTask: (id) => {
        const task = AppState.tasks.find(t => t.id === id);
        if (!task) return;

        document.getElementById('taskName').value = task.name;
        document.getElementById('taskStart').value = task.startDate;
        document.getElementById('taskEnd').value = task.endDate;
        document.getElementById('taskColor').value = task.color;
        document.getElementById('taskColorHex').value = task.color;

        AppState.currentEditId = id;
        document.getElementById('addTaskBtnText').textContent = 'Update Task';
        
        // Scroll to top of sidebar
        document.querySelector('.sidebar-content').scrollTop = 0;
    },

    /**
     * Delete task
     * @param {string} id - Task ID
     */
    deleteTask: (id) => {
        if (!confirm('Are you sure you want to delete this task?')) return;

        AppState.tasks = AppState.tasks.filter(t => t.id !== id);
        Utils.saveToStorage();
        UI.render();
    },

    /**
     * Clear the task form
     */
    clearForm: () => {
        document.getElementById('taskName').value = '';
        document.getElementById('taskStart').value = '';
        document.getElementById('taskEnd').value = '';
        document.getElementById('taskColor').value = '#6366f1';
        document.getElementById('taskColorHex').value = '#6366f1';
        AppState.currentEditId = null;
        document.getElementById('addTaskBtnText').textContent = 'Add Task';
    },

    /**
     * Update task dates (used by drag functionality)
     * @param {string} id - Task ID
     * @param {Date} startDate - New start date
     * @param {Date} endDate - New end date
     */
    updateTaskDates: (id, startDate, endDate) => {
        const task = AppState.tasks.find(t => t.id === id);
        if (!task) return;

        task.startDate = Utils.formatDate(startDate);
        task.endDate = Utils.formatDate(endDate);
        Utils.saveToStorage();
    }
};

// ==================== UI RENDERER ====================
const UI = {
    /**
     * Main render function - renders both task list and timeline
     */
    render: () => {
        UI.renderTaskList();
        UI.renderTimeline();
    },

    /**
     * Render task list in sidebar
     */
    renderTaskList: () => {
        const container = document.getElementById('taskList');
        
        if (AppState.tasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <div class="empty-state-text">No tasks yet</div>
                    <div class="empty-state-subtext">Add your first task to get started</div>
                </div>
            `;
            return;
        }

        container.innerHTML = AppState.tasks.map(task => `
            <div class="task-item" data-id="${task.id}">
                <div class="task-item-header">
                    <div class="task-item-title">
                        <span class="task-color-indicator" style="background: ${task.color}"></span>
                        <span>${task.name}</span>
                    </div>
                    <div class="task-item-actions">
                        <button class="icon-btn edit-task" data-id="${task.id}" title="Edit Task">✏️</button>
                        <button class="icon-btn delete delete-task" data-id="${task.id}" title="Delete Task">🗑️</button>
                    </div>
                </div>
                <div class="task-item-dates">
                    ${Utils.formatDateDisplay(Utils.parseDate(task.startDate), 'day')} → 
                    ${Utils.formatDateDisplay(Utils.parseDate(task.endDate), 'day')}
                </div>
            </div>
        `).join('');

        // Attach event listeners
        container.querySelectorAll('.edit-task').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                TaskManager.editTask(btn.dataset.id);
            });
        });

        container.querySelectorAll('.delete-task').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                TaskManager.deleteTask(btn.dataset.id);
            });
        });
    },

    /**
     * Render the Gantt chart timeline
     */
    renderTimeline: () => {
        const wrapper = document.getElementById('timelineWrapper');

        if (AppState.tasks.length === 0) {
            wrapper.innerHTML = `
                <div class="empty-state" style="padding: 100px 20px;">
                    <div class="empty-state-icon">📅</div>
                    <div class="empty-state-text">Your timeline is empty</div>
                    <div class="empty-state-subtext">Add tasks to see them visualized on the timeline</div>
                </div>
            `;
            return;
        }

        const { start: rangeStart, end: rangeEnd } = Utils.getDateRange(AppState.tasks);
        const dates = Utils.generateDateArray(rangeStart, rangeEnd, AppState.viewScale);
        const totalDays = Utils.daysBetween(rangeStart, rangeEnd);

        // Render timeline header
        const headerHTML = `
            <div class="timeline-header">
                <div class="timeline-header-label">Task Name</div>
                <div class="timeline-dates">
                    ${dates.map(date => `
                        <div class="timeline-date-cell ${Utils.isToday(date) ? 'today' : ''}">
                            ${Utils.formatDateDisplay(date, AppState.viewScale)}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // Render timeline chart with task bars
        const chartHTML = `
            <div class="timeline-chart">
                ${AppState.tasks.map(task => {
                    const taskStart = Utils.parseDate(task.startDate);
                    const taskEnd = Utils.parseDate(task.endDate);
                    const taskDuration = Utils.daysBetween(taskStart, taskEnd) + 1;
                    const offsetDays = Utils.daysBetween(rangeStart, taskStart);
                    
                    const left = (offsetDays / totalDays) * 100;
                    const width = (taskDuration / totalDays) * 100;

                    return `
                        <div class="timeline-row">
                            <div class="timeline-row-label" title="${task.name}">${task.name}</div>
                            <div class="timeline-row-bars">
                                <div class="timeline-grid-lines">
                                    ${dates.map(date => `
                                        <div class="timeline-grid-line ${Utils.isToday(date) ? 'today' : ''}"></div>
                                    `).join('')}
                                </div>
                                <div class="task-bar" 
                                     data-id="${task.id}"
                                     style="left: ${left}%; width: ${width}%; background: ${task.color}">
                                    <div class="task-bar-resize-handle left" data-handle="left"></div>
                                    ${task.name}
                                    <div class="task-bar-resize-handle right" data-handle="right"></div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        wrapper.innerHTML = headerHTML + chartHTML;

        // Attach drag event listeners
        DragHandler.init();
    }
};

// ==================== DRAG HANDLER ====================
const DragHandler = {
    /**
     * Initialize drag handlers for all task bars
     */
    init: () => {
        const taskBars = document.querySelectorAll('.task-bar');
        taskBars.forEach(bar => {
            bar.addEventListener('mousedown', DragHandler.onMouseDown);
        });
    },

    /**
     * Handle mouse down event on task bar
     * @param {MouseEvent} e - Mouse event
     */
    onMouseDown: (e) => {
        // Check if clicking on resize handle
        if (e.target.classList.contains('task-bar-resize-handle')) {
            AppState.dragState.isResizing = true;
            AppState.dragState.resizeHandle = e.target.dataset.handle;
        } else {
            AppState.dragState.isDragging = true;
        }

        const taskBar = e.currentTarget;
        const taskId = taskBar.dataset.id;
        const task = AppState.tasks.find(t => t.id === taskId);

        AppState.dragState.taskId = taskId;
        AppState.dragState.startX = e.clientX;
        AppState.dragState.originalStart = new Date(task.startDate);
        AppState.dragState.originalEnd = new Date(task.endDate);

        taskBar.classList.add('dragging');

        document.addEventListener('mousemove', DragHandler.onMouseMove);
        document.addEventListener('mouseup', DragHandler.onMouseUp);

        e.preventDefault();
    },

    /**
     * Handle mouse move event during drag
     * @param {MouseEvent} e - Mouse event
     */
    onMouseMove: (e) => {
        if (!AppState.dragState.isDragging && !AppState.dragState.isResizing) return;

        const deltaX = e.clientX - AppState.dragState.startX;
        const container = document.querySelector('.timeline-row-bars');
        const containerWidth = container.offsetWidth;
        
        const { start: rangeStart, end: rangeEnd } = Utils.getDateRange(AppState.tasks);
        const totalDays = Utils.daysBetween(rangeStart, rangeEnd);
        
        const daysMoved = Math.round((deltaX / containerWidth) * totalDays);

        const task = AppState.tasks.find(t => t.id === AppState.dragState.taskId);
        if (!task) return;

        if (AppState.dragState.isDragging) {
            // Move entire task
            const newStart = new Date(AppState.dragState.originalStart);
            newStart.setDate(newStart.getDate() + daysMoved);
            
            const newEnd = new Date(AppState.dragState.originalEnd);
            newEnd.setDate(newEnd.getDate() + daysMoved);

            const taskBar = document.querySelector(`.task-bar[data-id="${task.id}"]`);
            const taskDuration = Utils.daysBetween(newStart, newEnd) + 1;
            const offsetDays = Utils.daysBetween(rangeStart, newStart);
            
            const left = (offsetDays / totalDays) * 100;
            const width = (taskDuration / totalDays) * 100;

            taskBar.style.left = `${left}%`;
            taskBar.style.width = `${width}%`;
        } else if (AppState.dragState.isResizing) {
            // Resize task
            const taskBar = document.querySelector(`.task-bar[data-id="${task.id}"]`);
            
            if (AppState.dragState.resizeHandle === 'left') {
                const newStart = new Date(AppState.dragState.originalStart);
                newStart.setDate(newStart.getDate() + daysMoved);
                
                if (newStart < AppState.dragState.originalEnd) {
                    const taskDuration = Utils.daysBetween(newStart, AppState.dragState.originalEnd) + 1;
                    const offsetDays = Utils.daysBetween(rangeStart, newStart);
                    
                    const left = (offsetDays / totalDays) * 100;
                    const width = (taskDuration / totalDays) * 100;

                    taskBar.style.left = `${left}%`;
                    taskBar.style.width = `${width}%`;
                }
            } else if (AppState.dragState.resizeHandle === 'right') {
                const newEnd = new Date(AppState.dragState.originalEnd);
                newEnd.setDate(newEnd.getDate() + daysMoved);
                
                if (newEnd > AppState.dragState.originalStart) {
                    const taskDuration = Utils.daysBetween(AppState.dragState.originalStart, newEnd) + 1;
                    const width = (taskDuration / totalDays) * 100;

                    taskBar.style.width = `${width}%`;
                }
            }
        }
    },

    /**
     * Handle mouse up event - finalize drag operation
     */
    onMouseUp: () => {
        if (!AppState.dragState.isDragging && !AppState.dragState.isResizing) return;

        const taskBar = document.querySelector(`.task-bar[data-id="${AppState.dragState.taskId}"]`);
        taskBar.classList.remove('dragging');

        // Calculate final dates from bar position
        const { start: rangeStart, end: rangeEnd } = Utils.getDateRange(AppState.tasks);
        const totalDays = Utils.daysBetween(rangeStart, rangeEnd);

        const leftPercent = parseFloat(taskBar.style.left) || 0;
        const widthPercent = parseFloat(taskBar.style.width) || 0;

        const startDays = Math.round((leftPercent / 100) * totalDays);
        const durationDays = Math.round((widthPercent / 100) * totalDays);

        const newStart = new Date(rangeStart);
        newStart.setDate(newStart.getDate() + startDays);

        const newEnd = new Date(newStart);
        newEnd.setDate(newEnd.getDate() + durationDays - 1);

        TaskManager.updateTaskDates(AppState.dragState.taskId, newStart, newEnd);
        UI.render();

        // Reset drag state
        AppState.dragState = {
            isDragging: false,
            isResizing: false,
            taskId: null,
            startX: 0,
            originalStart: null,
            originalEnd: null,
            resizeHandle: null
        };

        document.removeEventListener('mousemove', DragHandler.onMouseMove);
        document.removeEventListener('mouseup', DragHandler.onMouseUp);
    }
};

// ==================== EXPORT MANAGER ====================
const ExportManager = {
    /**
     * Export timeline as PNG image
     */
    exportPNG: async () => {
        const timeline = document.getElementById('timelineWrapper');
        const btn = document.getElementById('exportPNGBtn');
        const originalText = btn.innerHTML;
        
        btn.innerHTML = '<div class="spinner"></div> <span>Exporting...</span>';
        btn.disabled = true;

        try {
            const canvas = await html2canvas(timeline, {
                backgroundColor: getComputedStyle(document.body).getPropertyValue('--bg-primary'),
                scale: 2,
                logging: false
            });

            const link = document.createElement('a');
            link.download = `gantt-bang-${Date.now()}.png`;
            link.href = canvas.toDataURL();
            link.click();
        } catch (error) {
            console.error('PNG export failed:', error);
            alert('Failed to export PNG. Please try again.');
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    },

    /**
     * Export timeline as PDF document
     */
    exportPDF: async () => {
        const timeline = document.getElementById('timelineWrapper');
        const btn = document.getElementById('exportPDFBtn');
        const originalText = btn.innerHTML;
        
        btn.innerHTML = '<div class="spinner"></div> <span>Exporting...</span>';
        btn.disabled = true;

        try {
            const canvas = await html2canvas(timeline, {
                backgroundColor: getComputedStyle(document.body).getPropertyValue('--bg-primary'),
                scale: 2,
                logging: false
            });

            const imgData = canvas.toDataURL('image/png');
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });

            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save(`gantt-bang-${Date.now()}.pdf`);
        } catch (error) {
            console.error('PDF export failed:', error);
            alert('Failed to export PDF. Please try again.');
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }
};

// ==================== EVENT LISTENERS ====================
const EventListeners = {
    /**
     * Initialize all event listeners
     */
    init: () => {
        // Add/Update task button
        document.getElementById('addTaskBtn').addEventListener('click', TaskManager.saveTask);

        // Enter key to submit form
        document.getElementById('taskName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') TaskManager.saveTask();
        });

        // Color picker sync
        const colorPicker = document.getElementById('taskColor');
        const colorHex = document.getElementById('taskColorHex');
        
        colorPicker.addEventListener('input', (e) => {
            colorHex.value = e.target.value;
        });

        // Theme selector
        document.getElementById('themeSelector').addEventListener('change', (e) => {
            AppState.theme = e.target.value;
            document.body.setAttribute('data-theme', e.target.value);
            Utils.saveToStorage();
        });

        // View scale selector
        document.getElementById('viewScale').addEventListener('change', (e) => {
            AppState.viewScale = e.target.value;
            Utils.saveToStorage();
            UI.render();
        });

        // Export buttons
        document.getElementById('exportPNGBtn').addEventListener('click', ExportManager.exportPNG);
        document.getElementById('exportPDFBtn').addEventListener('click', ExportManager.exportPDF);

        // Set default dates (today and 7 days from now)
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        
        document.getElementById('taskStart').valueAsDate = today;
        document.getElementById('taskEnd').valueAsDate = nextWeek;
    }
};

// ==================== APPLICATION INITIALIZATION ====================
const init = () => {
    console.log('🚀 Gantt-Bang initialized');
    Utils.loadFromStorage();
    EventListeners.init();
    UI.render();
};

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
