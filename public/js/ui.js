/**
 * рендер
 */

const UI = {

    /* ── Helpers ─────────────────────────────── */

    formatDate(iso) {
        const d = new Date(iso);
        return d.toLocaleDateString('ru-RU', {day: 'numeric', month: 'short' }); 
    },

    statusLabel(s) {
        return { todo: 'К выполнению', 'in-progress': 'В работе', done: 'Готово' }[s] || s;
        },
    
    priorityLabel(p) {
        return { low: 'Низкий', medium: 'Средний', high: 'Высокий' }[p] || p;
    },

    /* ── Toast ───────────────────────────────── */

    _toastTimer: null,
    showToast(msg) {
        const el = document.getElementById('toast');
        el.textContent = msg;
        el.classList.add('show');
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
    },

    /* ── Task card ───────────────────────────── */

    renderCard(task) {
        const card = document.createElement('div');
        card.className = `task-card status-${task.status}`;
        card.dataset.id = task.id;

        const isDone = task.status === 'done';

        const statusBadgeClass = {
            'todo': 'badge-todo',
            'in-progress': 'badge-in-progress',
            'done': 'badge-done'
        }[task.status] || 'badge-todo';

        const prioBadgeClass = {
            'low': 'badge-low',
            'medium': 'badge-medium',
            'high': 'badge-high'
        }[task.priority] || 'badge-medium';

        card.innerHTML = `
            <div class="task-check ${isDone ? 'checked' : ''}" role="checkbox" aria-checked="${isDone}" title="Отметить как выполнено"></div>
            <div class="task-body">
                <div class="task-title">${this._escape(task.title)}</div>
                ${task.description ? `<div class="task-desc">${this._escape(task.description)}</div>` : ''}
                <div class="task-meta">
                    <span class="badge ${statusBadgeClass}">${this.statusLabel(task.status)}</span>
                    <span class="badge ${prioBadgeClass}">${this.priorityLabel(task.priority)}</span>
                    <span class="task-date">${this.formatDate(task.createdAt)}</span>
                </div>
            </div>
            <button class="task-edit" title="Редактировать задачу">✎</button>
            <button class="task-delete" title="Удалить">✕</button>
        `;
        return card;
    },

    /* ── Task list ───────────────────────────── */

    renderList(tasks, container) {
        container.innerHTML = '';

        if (!tasks.length) {
            container.innerHTML = `
                <div class="task-empty">
                <span class="empty-icon">📝</span>
                Задачи отсутствуют
                </div>`;
            return;
        }

        for (const task of tasks) {
            container.appendChild(this.renderCard(task));
        }
    },

    /* ── Stats ───────────────────────────────── */

    renderStats(stats) {
        document.getElementById('stat-total').textContent = stats.total;
        document.getElementById('stat-todo').textContent = stats.todo;
        document.getElementById('stat-in-progress').textContent = stats['in-progress'];
        document.getElementById('stat-done').textContent = stats.done;
    },

    /* ── Modal ───────────────────────────────── */

    openModal({ title = 'Новая задача', task = null } = {}) {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('f-title').value = task ? task.title : '';
        document.getElementById('f-description').value = task ? (task.description || '') : '';
        document.getElementById('f-status').value = task ? task.status : 'todo';

        const statusField = document.getElementById('status-field');
        statusField.style.display = task ? '' : 'none';

        // приоритет
        const prio = task ? task.priority : 'medium';
        document.querySelectorAll('.prio-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.value === prio);
        });

        const overlay = document.getElementById('modal-overlay');
        overlay.classList.add('open');
        setTimeout(() => document.getElementById('f-title').focus(), 100);
    },

    closeModal() {
        document.getElementById('modal-overlay').classList.remove('open');
    },

    getModalData() {
        const priority = document.querySelector('.prio-btn.active')?.dataset.value || 'medium';
        return {
            title: document.getElementById('f-title').value.trim(),
            description: document.getElementById('f-description').value.trim(),
            priority,
            status: document.getElementById('f-status').value,
        };
    },

    /* ── Sanitize ────────────────────────────── */

    _escape(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    },
};