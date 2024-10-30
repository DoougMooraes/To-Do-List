// Importa as dependências
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

let tarefas = []; // Armazenamento temporário em memória

// Rota para listar tarefas
app.get('/tarefas', (req, res) => {
    res.json(tarefas);
});

// Rota para adicionar tarefa
app.post('/tarefas', (req, res) => {
    const novaTarefa = req.body.tarefa;
    if (novaTarefa) {
        tarefas.push(novaTarefa);
        res.status(201).json({ message: 'Tarefa adicionada com sucesso!' });
    } else {
        res.status(400).json({ message: 'Tarefa inválida.' });
    }
});

// Rota para excluir tarefa
app.delete('/tarefas/:tarefa', (req, res) => {
    const tarefaParaRemover = req.params.tarefa;
    tarefas = tarefas.filter(tarefa => tarefa !== tarefaParaRemover);
    res.json({ message: 'Tarefa removida com sucesso!' });
});

// Inicializa o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
