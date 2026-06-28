const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
// статика
app.use(express.static(path.join(__dirname, '../public')));

// хранилище
let tasks = [
    {
        id: uuidv4(),
        title: 'Настроить проект',
        decription: 'Инициализировать репозиторий и установить зависимости',
        status: 'done',
        prioprity: 'high',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
        id: uuidv4(),
        title: 'Написать REST API',
        description: 'Реализовать CRUD эндпоинты для задач',
        status: 'done',
        priority: 'high',
        createdAt: new Date(Date.now() - 43200000).toISOString(),
    },
    {
        id: uuidv4(),
        title: 'Сделать красивый UI',
        description: 'Спроектировать и реализовать фронтенд без фраймворков',
        status: 'in-progress',
        priority: 'medium',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
        id: uuidv4(),
        title: 'Написать тесты',
        description: 'Покрыть основные сценарии использования',
        status: 'todo',
        priority: 'low',
        createdAt: new Date().toISOString(),
    }
]; 

// получение всех задач
app.get('/api/tasks', (req, res) => {
    const { status, priority } = req.query;
    let result = [...tasks];

    if (status) result = result.filter(t => t.status === status);
    if (priority) result = result.filter(t => t.priority === priority);

    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ tasks: result, total: result.length });
});

// получение задачи по id
app.get('/api/tasks/:id', (req, res) => {
    const task = tasks.find(t => t.id === req.params.id);
    if (!task) return res.status(404).json({ error: 'Задача не найдена' });
    res.json(task);
});

// создание новой задачи
app.post('/api/tasks', (req, res) => {
    const { title, description = '', priority = 'medium' } = req.body;

    if (!title || title.trim().length === 0) {
        return res.status(400).json({ error: 'Поле title обязательно' });
    }

    const task = {
        id: uuidv4(),
        title: title.trim(),
        description: description.trim(),
        status: 'todo',
        priority,
        createdAt: new Date().toISOString(),
    };

    tasks.unshift(task);
    res.status(201).json(task);
});

// обновление задачи
app.patch('/api/tasks/:id', (req, res) => {
    const index = tasks.findIndex(t => t.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Задача не найдена' });

    const allowed = ['title', 'description', 'status', 'priority'];
    const update = {};
    for (const key of allowed) {
        if (req.body[key] !== undefined) update[key] = req.body[key];
    }

    tasks[index] = { ...tasks[index], ...update };
    res.json(tasks[index]);
});

// удаление задачи
app.delete('/api/tasks/:id', (req, res) => {
    const index = tasks.findIndex(t => t.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Задача не найдена' });

    tasks.splice(index, 1);
    res.status(204).send();
});

// статистика
app.get('/api/stats', (req, res) => {
    res.json({
        total: tasks.length,
        todo: tasks.filter(t => t.status === 'todo').length,
        inProgress: tasks.filter(t => t.status === 'in-progress').length,
        done: tasks.filter(t => t.status === 'done').length,
    });
});
// фолбэк
app.get('/*path', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
    console.log(`\n TaskFlow запущен ✦ -> http://localhost:${PORT}\n`);
});