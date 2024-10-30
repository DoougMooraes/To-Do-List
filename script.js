// Captura dos elementos do HTML
const inputDataVencimento = document.getElementById('data-vencimento');
const inputTarefa = document.getElementById('nova-tarefa');
const botaoAdicionar = document.getElementById('adicionar-tarefa');
const listaTarefas = document.getElementById('lista-tarefas');
const botaoTodas = document.getElementById('todas-tarefas');
const botaoConcluidas = document.getElementById('tarefas-concluidas');
const botaoPendentes = document.getElementById('tarefas-pendentes');

// Função para carregar tarefas do servidor
async function carregarTarefas() {
    const response = await fetch('http://localhost:3000/tarefas');
    const tarefas = await response.json();
    tarefas.forEach(tarefa => criarTarefaNaLista(tarefa.tarefa, tarefa.prioridade, tarefa.dataVencimento)); // Adicionado o dataVencimento
}

// Função para definir a cor com base na prioridade
function getCorPorPrioridade(prioridade) {
    switch (prioridade) {
        case 'alta':
            return 'red';
        case 'media':
            return 'orange';
        case 'baixa':
            return 'green';
        default:
            return 'black';
    }
}

// Função para criar e exibir tarefa
function criarTarefaNaLista(textoTarefa, prioridade, dataVencimento) {
    const itemLista = document.createElement('li');
    itemLista.setAttribute('data-vencimento', dataVencimento); // Armazena a data de vencimento

    // Criação do seletor de prioridade
    const seletorPrioridade = document.createElement('select');
    ['alta', 'media', 'baixa'].forEach(opcao => {
        const option = document.createElement('option');
        option.value = opcao;
        option.textContent = opcao.charAt(0).toUpperCase() + opcao.slice(1); // Capitaliza a primeira letra
        option.selected = opcao === prioridade; // Define a opção selecionada
        seletorPrioridade.appendChild(option);
    });

    itemLista.style.color = getCorPorPrioridade(prioridade);
    itemLista.appendChild(document.createTextNode(textoTarefa)); // Adiciona o texto da tarefa

    // Adiciona a funcionalidade de marcar como concluída
    itemLista.onclick = () => {
        itemLista.classList.toggle('concluida');
    };

    // Evento para alterar a prioridade
    seletorPrioridade.addEventListener('change', (event) => {
        const novaPrioridade = event.target.value;
        itemLista.style.color = getCorPorPrioridade(novaPrioridade);
        // Aqui você pode adicionar lógica para atualizar a prioridade no servidor, se necessário
    });

    // Botão para editar a tarefa
    const editarBtn = document.createElement('button');
    editarBtn.textContent = 'Editar';
    editarBtn.onclick = function () {
        const novoTexto = prompt("Edite sua tarefa:", textoTarefa);
        if (novoTexto !== null && novoTexto.trim() !== "") {
            itemLista.firstChild.textContent = novoTexto; // Atualiza o texto da tarefa
            // Reanexa o seletor de prioridade
            itemLista.removeChild(seletorPrioridade);
            const novoSeletorPrioridade = seletorPrioridade.cloneNode(true);
            itemLista.appendChild(novoSeletorPrioridade);
        }
    };

    // Botão para excluir a tarefa
    const botaoExcluir = document.createElement('button');
    botaoExcluir.textContent = 'Excluir';
    botaoExcluir.classList.add('excluir');
    botaoExcluir.onclick = (event) => {
        event.stopPropagation(); // Impede que o clique no botão marque a tarefa
        removerTarefaLocalStorage(textoTarefa);
        itemLista.remove();
    };

    itemLista.appendChild(seletorPrioridade); // Adiciona o seletor de prioridade
    itemLista.appendChild(editarBtn);
    itemLista.appendChild(botaoExcluir);
    listaTarefas.appendChild(itemLista);
}

// Função para adicionar tarefa
async function adicionarTarefa() {
    const textoTarefa = inputTarefa.value.trim();
    const tarefasExistentes = Array.from(listaTarefas.children).map(tarefa => tarefa.firstChild.textContent);
    const dataVencimento = inputDataVencimento.value; // Captura a data de vencimento
    if (textoTarefa === "") {
        alert('Por favor, insira uma tarefa.');
        return;
    }
    
    if (tarefasExistentes.includes(textoTarefa)) {
        alert('Esta tarefa já existe.');
        return;
    }

    await fetch('http://localhost:3000/tarefas', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tarefa: textoTarefa, prioridade: 'baixa', dataVencimento }) // Define prioridade padrão como 'baixa'
    });
    
    criarTarefaNaLista(textoTarefa, 'baixa', dataVencimento); // Chama a função com a prioridade padrão
    inputTarefa.value = ''; // Limpa o campo de entrada
    inputDataVencimento.value = ''; // Limpa o campo de data
}

// Função para verificar tarefas próximas do vencimento
function verificarVencimentos() {
    const tarefas = listaTarefas.children;
    const hoje = new Date();

    for (const tarefa of tarefas) {
        const dataVencimento = tarefa.getAttribute('data-vencimento'); // Supondo que você armazene a data no elemento
        if (dataVencimento) {
            const vencimento = new Date(dataVencimento);
            const diff = vencimento - hoje; // Diferença em milissegundos

            if (diff <= 86400000 && diff > 0) { // 86400000 ms = 1 dia
                alert(`A tarefa "${tarefa.firstChild.textContent}" está próxima do vencimento!`);
            }
        }
    }
}

// Chame a função de verificação a cada 60 segundos
setInterval(verificarVencimentos, 60000);

// Função para remover tarefa do servidor
async function removerTarefaLocalStorage(tarefa) {
    await fetch(`http://localhost:3000/tarefas/${encodeURIComponent(tarefa)}`, {
        method: 'DELETE'
    });
}

// Função para filtrar tarefas
function filtrarTarefas(tipo) {
    const tarefas = listaTarefas.children;
    for (const tarefa of tarefas) {
        const concluida = tarefa.classList.contains('concluida');
        if (tipo === 'todas') {
            tarefa.style.display = 'block'; // Mostra todas
        } else if (tipo === 'concluidas' && !concluida) {
            tarefa.style.display = 'none'; // Oculta não concluídas
        } else if (tipo === 'pendentes' && concluida) {
            tarefa.style.display = 'none'; // Oculta concluídas
        } else {
            tarefa.style.display = 'block'; // Mostra as que estão na condição
        }
    }
}

// Eventos
botaoAdicionar.addEventListener('click', adicionarTarefa);
inputTarefa.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        adicionarTarefa();
    }
});
botaoTodas.addEventListener('click', () => filtrarTarefas('todas'));
botaoConcluidas.addEventListener('click', () => filtrarTarefas('concluidas'));
botaoPendentes.addEventListener('click', () => filtrarTarefas('pendentes'));
window.addEventListener('load', carregarTarefas);
