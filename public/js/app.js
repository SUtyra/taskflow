/**
 * связь api и ui
 */

(function () {
  'use strict';

  // ── State ────────────────────────────────────────────
  let currentFilter = '';
  let editingTaskId = null;

  const taskList = document.getElementById('taskList');

  // ── Bootstrap ────────────────────────────────────────
  async function init() {
    await loadAll();
    bindEvents();
  }

  // ── Data loading ─────────────────────────────────────
  async function loadAll() {
    await Promise.all([loadTasks(), loadStats()]);
  }

  async function loadTasks() {
    taskList.innerHTML = '<div class="loading">Загрузка...</div>';
    try {
      const params = currentFilter ? { status: currentFilter } : {};
      const { tasks } = await Api.getTasks(params);
      UI.renderList(tasks, taskList);
    } catch (e) {
      taskList.innerHTML = '<div class="empty">⚠️ Не удалось загрузить задачи</div>';
    }
  }

  async function loadStats() {
    try {
      const stats = await Api.getStats();
      UI.renderStats(stats);
    } catch (_) {}
  }

  // ── Events ────────────────────────────────────────────

  function bindEvents() {
    // фильтрация
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.status;
        updatePageTitle();
        loadTasks();
      });
    });

    // открыть модалку создания
    document.getElementById('btn-add').addEventListener('click', () => {
      editingTaskId = null;
      UI.openModal({ title: 'Новая задача' });
    });

    // закрыть модалку
    document.getElementById('modal-close').addEventListener('click', UI.closeModal.bind(UI));
    document.getElementById('btn-cancel').addEventListener('click', UI.closeModal.bind(UI));
    document.getElementById('modal-overlay').addEventListener('click', e => {
      if (e.target === e.currentTarget) UI.closeModal();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') UI.closeModal();
    });

    // приоритет
    document.getElementById('f-priority').addEventListener('click', e => {
      const btn = e.target.closest('.prio-btn');
      if (!btn) return;
      document.querySelectorAll('.prio-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });

    // сохранить
    document.getElementById('btn-save').addEventListener('click', handleSave);
    document.getElementById('f-title').addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSave(); }
    });

    // делегирование событий на карточки
    taskList.addEventListener('click', handleCardClick);
  }

  async function handleSave() {
    const data = UI.getModalData();

    if (!data.title) {
      document.getElementById('f-title').focus();
      return;
    }

    document.getElementById('btn-save').disabled = true;

    try {
      if (editingTaskId) {
        await Api.updateTask(editingTaskId, data);
        UI.showToast('Задача обновлена ✓');
      } else {
        await Api.createTask(data);
        UI.showToast('Задача создана ✓');
      }
      UI.closeModal();
      await loadAll();
    } catch (e) {
      UI.showToast('Ошибка: ' + (e.message || 'Неизвестная ошибка'));
    } finally {
      document.getElementById('btn-save').disabled = false;
    }
  }

  async function handleCardClick(e) {
    const card = e.target.closest('.task-card');
    if (!card) return;
    const id = card.dataset.id;

    // чекбокс: переключение статуса
    if (e.target.classList.contains('task-check')) {
      const isDone = e.target.classList.contains('checked');
      const newStatus = isDone ? 'todo' : 'done';
      try {
        await Api.updateTask(id, { status: newStatus });
        await loadAll();
      } catch (err) {
        UI.showToast('Ошибка: ' + err.message);
      }
      return;
    }

    // кнопка удаления
    if (e.target.classList.contains('task-delete')) {
      if (!confirm('Удалить задачу?')) return;
      try {
        await Api.deleteTask(id);
        UI.showToast('Задача удалена');
        await loadAll();
      } catch (err) {
        UI.showToast('Ошибка: ' + err.message);
      }
      return;
    }

    // кнопка редактирования
    if (e.target.classList.contains('task-edit')) {
      const title = card.querySelector('.task-title').textContent;
      const desc = card.querySelector('.task-desc')?.textContent || '';
      const status = [...card.classList].find(c => c.startsWith('status-'))?.replace('status-', '') || 'todo';

      const prioBadge = card.querySelector('.badge:nth-child(2)');
      const prioText = prioBadge?.textContent;
      const priority = { 'Низкий': 'low', 'Средний': 'medium', 'Высокий': 'high' }[prioText] || 'medium';

      editingTaskId = id;
      UI.openModal({
        title: 'Редактировать задачу',
        task: { title, description: desc, status, priority },
      });
    }
  }

  function updatePageTitle() {
    const labels = {
      '': 'Все задачи',
      'todo': 'К выполнению',
      'in-progress': 'В работе',
      'done': 'Готово',
    };
    document.getElementById('page-title').textContent = labels[currentFilter] || 'Задачи';
  }

  // ── Start ────────────────────────────────────────────
  init();
})();