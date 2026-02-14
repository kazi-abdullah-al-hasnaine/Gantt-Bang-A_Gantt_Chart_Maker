/**
 * Gantt-Bang - Main Application
 * Simple and reliable Gantt chart maker
 */

// ==================== STATE ====================
const State = {
    tasks: [],
    editingId: null,
    viewScale: 'week',
    theme: 'light'
};

// ==================== COLORS ====================
const COLORS = [
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Cyan', value: '#06b6d4' },
    { name: 'Teal', value: '#14b8a6' },
    { name: 'Green', value: '#10b981' },
    { name: 'Lime', value: '#84cc16' },
    { name: 'Yellow', value: '#eab308' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Violet', value: '#8b5cf6' }
];

// ==================== UTILITIES ====================
function generateId() {
    return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function parseDate(dateStr) {
    return new Date(dateStr + 'T00:00:00');
}

function daysBetween(date1, date2) {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round((date2 - date1) / oneDay);
}

function isToday(date) {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
}

function getTextColor(bgColor) {
    let r, g, b;
    
    if (bgColor.startsWith('#')) {
        const hex = bgColor.replace('#', '');
        r = parseInt(hex.substr(0, 2), 16);
        g = parseInt(hex.substr(2, 2), 16);
        b = parseInt(hex.substr(4, 2), 16);
    } else if (bgColor.startsWith('rgb')) {
        const match = bgColor.match(/\d+/g);
        if (match && match.length >= 3) {
            r = parseInt(match[0]);
            g = parseInt(match[1]);
            b = parseInt(match[2]);
        } else {
            return '#ffffff';
        }
    } else {
        return '#ffffff';
    }
    
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 155 ? '#000000' : '#ffffff';
}

// ==================== STORAGE ====================
function saveData() {
    localStorage.setItem('ganttBangTasks', JSON.stringify(State.tasks));
    localStorage.setItem('ganttBangTheme', State.theme);
    localStorage.setItem('ganttBangViewScale', State.viewScale);
}

function loadData() {
    const tasks = localStorage.getItem('ganttBangTasks');
    const theme = localStorage.getItem('ganttBangTheme');
    const viewScale = localStorage.getItem('ganttBangViewScale');
    
    if (tasks) State.tasks = JSON.parse(tasks);
    if (theme) {
        State.theme = theme;
        document.body.setAttribute('data-theme', theme);
        document.getElementById('themeSelector').value = theme;
    }
    if (viewScale) {
        State.viewScale = viewScale;
        document.getElementById('viewScale').value = viewScale;
    }
}

// ==================== TASKS ====================
function addOrUpdateTask() {
    const name = document.getElementById('taskName').value.trim();
    const start = document.getElementById('taskStart').value;
    const end = document.getElementById('taskEnd').value;
    const color = document.getElementById('taskColor').value;
    
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
        id: State.editingId || generateId(),
        name,
        startDate: start,
        endDate: end,
        color
    };
    
    if (State.editingId) {
        const index = State.tasks.findIndex(t => t.id === State.editingId);
        State.tasks[index] = task;
        State.editingId = null;
        document.getElementById('addTaskBtnText').textContent = 'Add Task';
    } else {
        State.tasks.push(task);
    }
    
    clearForm();
    saveData();
    render();
}

function editTask(id) {
    const task = State.tasks.find(t => t.id === id);
    if (!task) return;
    
    document.getElementById('taskName').value = task.name;
    document.getElementById('taskStart').value = task.startDate;
    document.getElementById('taskEnd').value = task.endDate;
    document.getElementById('taskColor').value = task.color;
    document.getElementById('taskColorHex').value = task.color;
    
    State.editingId = id;
    document.getElementById('addTaskBtnText').textContent = 'Update Task';
    renderColorPresets();
    document.querySelector('.sidebar-content').scrollTop = 0;
}

function deleteTask(id) {
    if (!confirm('Delete this task?')) return;
    State.tasks = State.tasks.filter(t => t.id !== id);
    saveData();
    render();
}

function clearForm() {
    document.getElementById('taskName').value = '';
    document.getElementById('taskStart').value = '';
    document.getElementById('taskEnd').value = '';
    document.getElementById('taskColor').value = '#6366f1';
    document.getElementById('taskColorHex').value = '#6366f1';
    State.editingId = null;
    document.getElementById('addTaskBtnText').textContent = 'Add Task';
    renderColorPresets();
}

function updateTaskDates(id, startDate, endDate) {
    const task = State.tasks.find(t => t.id === id);
    if (!task) return;
    task.startDate = formatDate(startDate);
    task.endDate = formatDate(endDate);
    saveData();
}

// ==================== RENDER ====================
function render() {
    renderTaskList();
    renderTimeline();
}

function renderColorPresets() {
    const container = document.getElementById('colorPresets');
    const currentColor = document.getElementById('taskColor').value;
    
    container.innerHTML = COLORS.map(color => `
        <button class="color-preset ${color.value === currentColor ? 'selected' : ''}" 
                style="background: ${color.value}" 
                data-color="${color.value}"
                title="${color.name}"
                type="button">
        </button>
    `).join('');
    
    container.querySelectorAll('.color-preset').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const color = btn.dataset.color;
            document.getElementById('taskColor').value = color;
            document.getElementById('taskColorHex').value = color;
            renderColorPresets();
        });
    });
}

function renderTaskList() {
    const container = document.getElementById('taskList');
    
    if (State.tasks.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <div class="empty-state-text">No tasks yet</div>
                <div class="empty-state-subtext">Add your first task</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = State.tasks.map(task => {
        const startDate = parseDate(task.startDate);
        const endDate = parseDate(task.endDate);
        const startStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const endStr = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        return `
            <div class="task-item">
                <div class="task-item-header">
                    <div class="task-item-title">
                        <span class="task-color-indicator" style="background: ${task.color}"></span>
                        <span>${task.name}</span>
                    </div>
                    <div class="task-item-actions">
                        <button class="icon-btn" onclick="editTask('${task.id}')" title="Edit">✏️</button>
                        <button class="icon-btn delete" onclick="deleteTask('${task.id}')" title="Delete">🗑️</button>
                    </div>
                </div>
                <div class="task-item-dates">${startStr} → ${endStr}</div>
            </div>
        `;
    }).join('');
}

function renderTimeline() {
    const wrapper = document.getElementById('timelineWrapper');
    
    if (State.tasks.length === 0) {
        wrapper.innerHTML = `
            <div class="empty-state" style="padding: 100px 20px;">
                <div class="empty-state-icon">📅</div>
                <div class="empty-state-text">Timeline is empty</div>
                <div class="empty-state-subtext">Add tasks to visualize</div>
            </div>
        `;
        return;
    }
    
    // Calculate date range
    let minDate = new Date(State.tasks[0].startDate);
    let maxDate = new Date(State.tasks[0].endDate);
    
    State.tasks.forEach(task => {
        const start = new Date(task.startDate);
        const end = new Date(task.endDate);
        if (start < minDate) minDate = start;
        if (end > maxDate) maxDate = end;
    });
    
    minDate.setDate(minDate.getDate() - 3);
    maxDate.setDate(maxDate.getDate() + 3);
    
    // Generate dates
    const dates = [];
    const current = new Date(minDate);
    while (current <= maxDate) {
        dates.push(new Date(current));
        if (State.viewScale === 'day') {
            current.setDate(current.getDate() + 1);
        } else if (State.viewScale === 'week') {
            current.setDate(current.getDate() + 7);
        } else {
            current.setMonth(current.getMonth() + 1);
        }
    }
    
    const totalDays = daysBetween(minDate, maxDate);
    
    // Header
    let html = `
        <div class="timeline-header">
            <div class="timeline-header-label">Task Name</div>
            <div class="timeline-dates">
                ${dates.map(date => {
                    const label = State.viewScale === 'month' 
                        ? date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                        : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    return `<div class="timeline-date-cell ${isToday(date) ? 'today' : ''}">${label}</div>`;
                }).join('')}
            </div>
        </div>
        <div class="timeline-chart">
    `;
    
    // Rows
    State.tasks.forEach(task => {
        const taskStart = parseDate(task.startDate);
        const taskEnd = parseDate(task.endDate);
        const taskDuration = daysBetween(taskStart, taskEnd) + 1;
        const offsetDays = daysBetween(minDate, taskStart);
        
        const left = (offsetDays / totalDays) * 100;
        const width = (taskDuration / totalDays) * 100;
        
        html += `
            <div class="timeline-row">
                <div class="timeline-row-label" title="${task.name}">${task.name}</div>
                <div class="timeline-row-bars">
                    <div class="timeline-grid-lines">
                        ${dates.map(date => 
                            `<div class="timeline-grid-line ${isToday(date) ? 'today' : ''}"></div>`
                        ).join('')}
                    </div>
                    <div class="task-bar" 
                         data-id="${task.id}"
                         style="left: ${left}%; width: ${width}%; background: ${task.color};">
                        <div class="task-bar-resize-handle left" data-handle="left"></div>
                        ${task.name}
                        <div class="task-bar-resize-handle right" data-handle="right"></div>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    wrapper.innerHTML = html;
    
    initDrag();
    adjustRowHeights();
}

// ==================== DYNAMIC ROW HEIGHTS ====================
function adjustRowHeights() {
    // Use setTimeout to ensure DOM is rendered
    setTimeout(() => {
        document.querySelectorAll('.timeline-row-bars').forEach(rowBars => {
            const taskBar = rowBars.querySelector('.task-bar');
            if (taskBar) {
                // Measure the actual rendered height of the task bar
                const barHeight = taskBar.offsetHeight;
                // Set the container to match (with padding)
                rowBars.style.height = barHeight + 'px';
                rowBars.style.minHeight = barHeight + 'px';
            }
        });
    }, 0);
}

// ==================== DRAG ====================
let dragState = {
    active: false,
    resizing: false,
    taskId: null,
    startX: 0,
    originalStart: null,
    originalEnd: null,
    handle: null
};

function initDrag() {
    document.querySelectorAll('.task-bar').forEach(bar => {
        bar.addEventListener('mousedown', onMouseDown);
    });
}

function onMouseDown(e) {
    if (e.target.classList.contains('task-bar-resize-handle')) {
        dragState.resizing = true;
        dragState.handle = e.target.dataset.handle;
    } else {
        dragState.active = true;
    }
    
    const taskId = e.currentTarget.dataset.id;
    const task = State.tasks.find(t => t.id === taskId);
    
    dragState.taskId = taskId;
    dragState.startX = e.clientX;
    dragState.originalStart = new Date(task.startDate);
    dragState.originalEnd = new Date(task.endDate);
    
    e.currentTarget.classList.add('dragging');
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    e.preventDefault();
}

function onMouseMove(e) {
    if (!dragState.active && !dragState.resizing) return;
    
    const deltaX = e.clientX - dragState.startX;
    const container = document.querySelector('.timeline-row-bars');
    const containerWidth = container.offsetWidth;
    
    let minDate = new Date(State.tasks[0].startDate);
    let maxDate = new Date(State.tasks[0].endDate);
    State.tasks.forEach(task => {
        const start = new Date(task.startDate);
        const end = new Date(task.endDate);
        if (start < minDate) minDate = start;
        if (end > maxDate) maxDate = end;
    });
    minDate.setDate(minDate.getDate() - 3);
    maxDate.setDate(maxDate.getDate() + 3);
    
    const totalDays = daysBetween(minDate, maxDate);
    const daysMoved = Math.round((deltaX / containerWidth) * totalDays);
    
    const taskBar = document.querySelector(`.task-bar[data-id="${dragState.taskId}"]`);
    
    if (dragState.active) {
        const newStart = new Date(dragState.originalStart);
        newStart.setDate(newStart.getDate() + daysMoved);
        const newEnd = new Date(dragState.originalEnd);
        newEnd.setDate(newEnd.getDate() + daysMoved);
        
        const taskDuration = daysBetween(newStart, newEnd) + 1;
        const offsetDays = daysBetween(minDate, newStart);
        const left = (offsetDays / totalDays) * 100;
        const width = (taskDuration / totalDays) * 100;
        
        taskBar.style.left = `${left}%`;
        taskBar.style.width = `${width}%`;
    } else if (dragState.resizing) {
        if (dragState.handle === 'left') {
            const newStart = new Date(dragState.originalStart);
            newStart.setDate(newStart.getDate() + daysMoved);
            if (newStart < dragState.originalEnd) {
                const taskDuration = daysBetween(newStart, dragState.originalEnd) + 1;
                const offsetDays = daysBetween(minDate, newStart);
                const left = (offsetDays / totalDays) * 100;
                const width = (taskDuration / totalDays) * 100;
                taskBar.style.left = `${left}%`;
                taskBar.style.width = `${width}%`;
            }
        } else {
            const newEnd = new Date(dragState.originalEnd);
            newEnd.setDate(newEnd.getDate() + daysMoved);
            if (newEnd > dragState.originalStart) {
                const taskDuration = daysBetween(dragState.originalStart, newEnd) + 1;
                const width = (taskDuration / totalDays) * 100;
                taskBar.style.width = `${width}%`;
            }
        }
    }
}

function onMouseUp() {
    if (!dragState.active && !dragState.resizing) return;
    
    const taskBar = document.querySelector(`.task-bar[data-id="${dragState.taskId}"]`);
    taskBar.classList.remove('dragging');
    
    let minDate = new Date(State.tasks[0].startDate);
    let maxDate = new Date(State.tasks[0].endDate);
    State.tasks.forEach(task => {
        const start = new Date(task.startDate);
        const end = new Date(task.endDate);
        if (start < minDate) minDate = start;
        if (end > maxDate) maxDate = end;
    });
    minDate.setDate(minDate.getDate() - 3);
    maxDate.setDate(maxDate.getDate() + 3);
    
    const totalDays = daysBetween(minDate, maxDate);
    const leftPercent = parseFloat(taskBar.style.left) || 0;
    const widthPercent = parseFloat(taskBar.style.width) || 0;
    
    const startDays = Math.round((leftPercent / 100) * totalDays);
    const durationDays = Math.round((widthPercent / 100) * totalDays);
    
    const newStart = new Date(minDate);
    newStart.setDate(newStart.getDate() + startDays);
    const newEnd = new Date(newStart);
    newEnd.setDate(newEnd.getDate() + durationDays - 1);
    
    updateTaskDates(dragState.taskId, newStart, newEnd);
    render();
    
    dragState = {
        active: false,
        resizing: false,
        taskId: null,
        startX: 0,
        originalStart: null,
        originalEnd: null,
        handle: null
    };
    
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
}

// ==================== EXPORT (SIMPLE & RELIABLE) ====================
async function exportPNG() {
    const btn = document.getElementById('exportPNGBtn');
    const originalText = btn.innerHTML;
    
    btn.innerHTML = '<div class="spinner"></div> Exporting...';
    btn.disabled = true;
    
    try {
        const timeline = document.getElementById('timelineWrapper');
        
        // Force full opacity and disable animations for export
        const styleEl = document.createElement('style');
        styleEl.textContent = `
            #timelineWrapper * { 
                opacity: 1 !important; 
                animation: none !important;
            }
        `;
        document.head.appendChild(styleEl);
        
        // Give styles time to apply
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Capture chart exactly as displayed
        const canvas = await html2canvas(timeline, {
            scale: 2,
            logging: false,
            allowTaint: true,
            useCORS: true,
            backgroundColor: null
        });
        
        // Remove temporary style
        styleEl.remove();
        
        // Download
        const link = document.createElement('a');
        const date = new Date().toISOString().slice(0, 10);
        link.download = `gantt-bang-${date}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
    } catch (error) {
        alert('Export failed: ' + error.message);
        console.error(error);
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// ==================== INIT ====================
function init() {
    loadData();
    renderColorPresets();
    render();
    
    // Events
    document.getElementById('addTaskBtn').addEventListener('click', addOrUpdateTask);
    document.getElementById('taskName').addEventListener('keypress', e => {
        if (e.key === 'Enter') addOrUpdateTask();
    });
    
    document.getElementById('taskColor').addEventListener('input', e => {
        document.getElementById('taskColorHex').value = e.target.value;
        renderColorPresets();
    });
    
    document.getElementById('themeSelector').addEventListener('change', e => {
        State.theme = e.target.value;
        document.body.setAttribute('data-theme', e.target.value);
        saveData();
    });
    
    document.getElementById('viewScale').addEventListener('change', e => {
        State.viewScale = e.target.value;
        saveData();
        render();
    });
    
    document.getElementById('exportPNGBtn').addEventListener('click', exportPNG);
    
    // Set default dates
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    document.getElementById('taskStart').valueAsDate = today;
    document.getElementById('taskEnd').valueAsDate = nextWeek;
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
