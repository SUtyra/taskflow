/**
 * слой с rest api
 * все методы возвращают promise.
 */

const API_BASE = '/api';

const Api = {

  /** получить все задачи */
  async getTasks(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const url = qs ? `${API_BASE}/tasks?${qs}` : `${API_BASE}/tasks`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Не удалось загрузить задачи');
    return res.json();
  },

  /** создать новую задачу */
  async createTask(data) {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Ошибка при создании задачи');
    }
    return res.json();
  },

  /** обновить задачу */
  async updateTask(id, data) {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Ошибка при обновлении задачи');
    return res.json();
  },

  /** удалить задачу */
  async deleteTask(id) {
    const res = await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Ошибка при удалении задачи');
  },

  /** получить статистику */
  async getStats() {
    const res = await fetch(`${API_BASE}/stats`);
    if (!res.ok) throw new Error('Ошибка при загрузке статистики');
    return res.json();
  },
};