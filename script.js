// Kitchen Shower Registry with Automatic Google Sheets Integration
// Main JavaScript file

// Configuração fixa - URL do Google Apps Script Web App
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycby3Equ0MqOBYxYeBdAiUlEiQLT8HZwFQYdFKz0gkhPu6PnESth1CKkEgTSc6lxeBxBS/exec';

let itens = [];
let reservas = {};

// Funções para Google Sheets via Apps Script
async function carregarDados() {
    mostrarLoading();
    
    try {
        // Usar JSONP para evitar CORS
        await carregarDadosJSONP();
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        carregarListaPadrao();
    } finally {
        esconderLoading();
    }
}

function carregarDadosJSONP() {
    return new Promise((resolve, reject) => {
        // Criar um elemento script para JSONP
        const script = document.createElement('script');
        const callbackName = 'jsonpCallback_' + Date.now();
        
        // Definir a função de callback
        window[callbackName] = function(data) {
            // Limpar
            document.body.removeChild(script);
            delete window[callbackName];
            
            if (data.success) {
                itens = [];
                reservas = {};
                
                data.data.forEach((row, index) => {
                    console.log(`Processando linha ${index + 1}:`, row);
                    
                    if (!Array.isArray(row) || row.length === 0) {
                        return; // Pula linhas nulas/vazias
                    }
                    const itemNome = row[0]; // Coluna A - Item
                    const reserva = row[1];  // Coluna B - Reserva
                    
                    if (itemNome && itemNome !== 'Item') {
                        try {
                            itens.push({
                                nome: itemNome,
                                icone: obterIcone(itemNome)
                            });
                        } catch (e) {
                            console.error(`Falha ao obter ícone para item: ${itemNome} na linha ${index + 1}`, e);
                        }
                        
                        if (reserva && reserva !== 'Reserva') {
                            reservas[itemNome] = reserva;
                        }
                    }
                });
                
                atualizarLista();
                resolve();
            } else {
                reject(new Error(data.error || 'Erro ao carregar dados da planilha'));
            }
        };
        
        // Configurar erro
        script.onerror = function() {
            document.body.removeChild(script);
            delete window[callbackName];
            reject(new Error('Erro ao carregar dados da planilha'));
        };
        
        // Adicionar o script à página
        script.src = `${WEB_APP_URL}?action=get&callback=${callbackName}`;
        document.body.appendChild(script);
    });
}

function carregarListaPadrao() {
    itens = [
        { nome: "Refrigerante", icone: "fa-solid fa-wine-bottle" },
        { nome: "Salgadinhos", icone: "fa-solid fa-cookie-bite" },
        { nome: "Pratos descartáveis", icone: "fa-solid fa-plate-wheat" },
        { nome: "Guardanapos", icone: "fa-solid fa-square" },
        { nome: "Doce caseiro", icone: "fa-solid fa-candy-cane" },
        { nome: "Escorredor de arroz", icone: "fa-solid fa-filter" },
        { nome: "Escorredor de macarrão", icone: "fa-solid fa-filter" },
        { nome: "Tábua de madeira", icone: "fa-solid fa-clipboard" },
        { nome: "Tábua de plástico", icone: "fa-solid fa-clipboard" },
        { nome: "Tábua de vidro", icone: "fa-solid fa-clipboard" },
        { nome: "Escorredor de louça", icone: "fa-solid fa-sink" },
        { nome: "Kit pia (lixeira, porta detergente)", icone: "fa-solid fa-toolbox" },
        { nome: "Rodinho de pia", icone: "fa-solid fa-broom" },
        { nome: "Ralador", icone: "fa-solid fa-mortar-pestle" },
        { nome: "Descascador", icone: "fa-solid fa-knife" },
        { nome: "Batedor de ovos", icone: "fa-solid fa-egg" },
        { nome: "Concha", icone: "fa-solid fa-spoon" },
        { nome: "Escumadeira", icone: "fa-solid fa-sieve" },
        { nome: "Pegador de massas", icone: "fa-solid fa-utensils" },
        { nome: "Espátula", icone: "fa-solid fa-spatula" }
    ];
    reservas = {};
    atualizarLista();
}

function reservarItem(itemNome, nomePessoa) {
    // Criar um formulário para enviar os dados
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = WEB_APP_URL;
    form.target = '_blank'; // Abrir em nova aba para evitar recarregar a página
    
    // Adicionar campos ocultos
    const actionField = document.createElement('input');
    actionField.type = 'hidden';
    actionField.name = 'action';
    actionField.value = 'reserve';
    form.appendChild(actionField);
    
    const itemNameField = document.createElement('input');
    itemNameField.type = 'hidden';
    itemNameField.name = 'itemName';
    itemNameField.value = itemNome;
    form.appendChild(itemNameField);
    
    const reservedByField = document.createElement('input');
    reservedByField.type = 'hidden';
    reservedByField.name = 'reservedBy';
    reservedByField.value = nomePessoa;
    form.appendChild(reservedByField);
    
    const timestampField = document.createElement('input');
    timestampField.type = 'hidden';
    timestampField.name = 'timestamp';
    timestampField.value = new Date().toISOString();
    form.appendChild(timestampField);
    
    // Adicionar o formulário à página e submetê-lo
    document.body.appendChild(form);
    form.submit();
    
    // Remover o formulário após o envio
    setTimeout(() => {
        document.body.removeChild(form);
    }, 1000);
    
    // Recarregar a página após um pequeno delay
    setTimeout(() => {
        window.location.reload();
    }, 2000);
}

function cancelarReservaItem(itemNome) {
    // Criar um formulário para enviar os dados
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = WEB_APP_URL;
    form.target = '_blank'; // Abrir em nova aba para evitar recarregar a página
    
    // Adicionar campos ocultos
    const actionField = document.createElement('input');
    actionField.type = 'hidden';
    actionField.name = 'action';
    actionField.value = 'cancel';
    form.appendChild(actionField);
    
    const itemNameField = document.createElement('input');
    itemNameField.type = 'hidden';
    itemNameField.name = 'itemName';
    itemNameField.value = itemNome;
    form.appendChild(itemNameField);
    
    const timestampField = document.createElement('input');
    timestampField.type = 'hidden';
    timestampField.name = 'timestamp';
    timestampField.value = new Date().toISOString();
    form.appendChild(timestampField);
    
    // Adicionar o formulário à página e submetê-lo
    document.body.appendChild(form);
    form.submit();
    
    // Remover o formulário após o envio
    setTimeout(() => {
        document.body.removeChild(form);
    }, 1000);
    
    // Recarregar a página após um pequeno delay
    setTimeout(() => {
        window.location.reload();
    }, 2000);
}

function obterIcone(itemNome) {
    // Padroniza o nome para a busca
    const nomePadronizado = itemNome ? String(itemNome).trim().toLowerCase() : '';

    // Mapeamento de Itens para Classes do Font Awesome 6.x
    const mapaClasses = {
        'refrigerante': 'fa-solid fa-wine-bottle',
        'salgadinhos': 'fa-solid fa-cookie-bite',
        'pratos descartáveis': 'fa-solid fa-plate-wheat',
        'guardanapos': 'fa-solid fa-square',
        'doce caseiro': 'fa-solid fa-candy-cane',
        'escorredor de arroz': 'fa-solid fa-filter',
        'escorredor de macarrão': 'fa-solid fa-filter',
        'tábua de madeira': 'fa-solid fa-clipboard',
        'tábua de plástico': 'fa-solid fa-clipboard',
        'tábua de vidro': 'fa-solid fa-clipboard',
        'escorredor de louça': 'fa-solid fa-sink',
        'kit pia': 'fa-solid fa-toolbox',
        'rodinho de pia': 'fa-solid fa-broom',
        'ralador': 'fa-solid fa-mortar-pestle',
        'descascador': 'fa-solid fa-knife',
        'batedor de ovos': 'fa-solid fa-egg',
        'concha': 'fa-solid fa-spoon',
        'escumadeira': 'fa-solid fa-sieve',
        'pegador de massas': 'fa-solid fa-utensils',
        'espátula': 'fa-solid fa-spatula'
    };

    // Classe de Fallback (Ícone Padrão para itens desconhecidos)
    const classePadrao = 'fa-solid fa-question-circle';

    // Retorna a classe mapeada ou a classe padrão
    return mapaClasses[nomePadronizado] || classePadrao;
}

// UI Functions
function mostrarLoading() {
    document.getElementById('loading-indicator').style.display = 'block';
    document.getElementById('lista').style.display = 'none';
}

function esconderLoading() {
    document.getElementById('loading-indicator').style.display = 'none';
    document.getElementById('lista').style.display = 'grid';
}

function atualizarLista() {
    const listaContainer = document.getElementById('lista');
    if (!listaContainer) return;

    listaContainer.innerHTML = '';
    
    itens.forEach((item, index) => {
        const itemElemento = document.createElement('div');
        
        // Verifica se o item está reservado
        const isReservado = reservas[item.nome];
        
        if (isReservado) {
            itemElemento.classList.add('item', 'reservado');
        } else {
            itemElemento.classList.add('item');
        }
        
        // Adiciona atributo data-item para facilitar a identificação
        itemElemento.setAttribute('data-item', item.nome);
        
        // Estrutura HTML conforme o CSS existente
        itemElemento.innerHTML = `
            <div class="item-icon">
                <i class="${item.icone}"></i>
            </div>
            <h3>${item.nome}</h3>
            ${isReservado ? `
                <div class="reservado-info">
                    Reservado por: ${reservas[item.nome]}
                </div>
                <button class="cancelar-btn" onclick="cancelarReserva('${item.nome}')">
                    Cancelar Reserva
                </button>
            ` : `
                <input type="text" id="nome-${index}" placeholder="Seu nome">
                <button onclick="reservar('${item.nome}', ${index})">
                    Reservar
                </button>
            `}
        `;
        
        listaContainer.appendChild(itemElemento);
    });
}

function reservar(itemNome, index) {
    const nomeInput = document.getElementById(`nome-${index}`);
    const nome = nomeInput.value.trim();
    
    if (!nome) {
        alert("Digite seu nome para reservar.");
        return;
    }
    
    if (nome.length < 2) {
        alert("Digite um nome válido (pelo menos 2 caracteres).");
        return;
    }
    
    // Desabilitar botão durante o processamento
    const button = nomeInput.nextElementSibling;
    const originalText = button.textContent;
    button.textContent = 'Reservando...';
    button.disabled = true;
    
    // Fazer a reserva
    reservarItem(itemNome, nome);
    
    // Mostrar mensagem de sucesso
    alert(`"${itemNome}" reservado com sucesso para ${nome}!`);
}

function cancelarReserva(itemNome) {
    const nomeReservado = reservas[itemNome];
    const confirmacao = confirm(`Cancelar reserva de "${itemNome}" por ${nomeReservado}?`);
    
    if (!confirmacao) return;
    
    const button = document.querySelector(`[data-item="${itemNome}"] .cancelar-btn`);
    const originalText = button.textContent;
    button.textContent = 'Cancelando...';
    button.disabled = true;
    
    // Cancelar a reserva
    cancelarReservaItem(itemNome);
    
    // Mostrar mensagem de sucesso
    alert(`Reserva de "${itemNome}" cancelada!`);
}

// Inicialização
async function inicializar() {
    await carregarDados();
}

// Tornar funções globais
window.reservar = reservar;
window.cancelarReserva = cancelarReserva;

// Iniciar quando a página carregar
document.addEventListener('DOMContentLoaded', inicializar);

// Suporte a Enter nos campos de texto
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && e.target.type === 'text') {
        const id = e.target.id;
        if (id.startsWith('nome-')) {
            const index = parseInt(id.split('-')[1]);
            const itemNome = itens[index]?.nome;
            if (itemNome) {
                reservar(itemNome, index);
            }
        }
    }
});
