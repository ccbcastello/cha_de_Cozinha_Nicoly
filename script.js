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
        { nome: "Escorredor de macarrão", icone: "🍝" },
        { nome: "Escorredor de arroz", icone: "🍚" },
        { nome: "Tábua de madeira", icone: "🪵" },
        { nome: "Tábua de plástico", icone: "📋" },
        { nome: "Tábua de vidro", icone: "🔷" },
        { nome: "Escorredor de louça", icone: "🍽️" },
        { nome: "Kit pia (lixeira, porta detergente)", icone: "🧽" },
        { nome: "Rodinho de pia", icone: "🧹" },
        { nome: "Ralador", icone: "🧀" },
        { nome: "Descascador", icone: "🥔" },
        { nome: "Batedor de ovos", icone: "🥚" },
        { nome: "Concha", icone: "🥄" },
        { nome: "Escumadeira", icone: "🍳" },
        { nome: "Pegador de massas", icone: "🍝" },
        { nome: "Espátula", icone: "🍳" },
        { nome: "Colher de pau", icone: "🥄" },
        { nome: "Colheres medidoras", icone: "📏" },
        { nome: "Peneira", icone: "⚪" },
        { nome: "Funil", icone: "🔽" },
        { nome: "Saladeira", icone: "🥗" },
        { nome: "Fruteira", icone: "🍎" },
        { nome: "Jarra de suco", icone: "🥤" },
        { nome: "Luva térmica", icone: "🧤" },
        { nome: "Panos de prato", icone: "🧽" },
        { nome: "Jogo americano", icone: "🍽️" },
        { nome: "Toalha de mesa", icone: "🏠" },
        { nome: "Centrífuga de salada", icone: "🥬" },
        { nome: "Espremedor de alho", icone: "🧄" },
        { nome: "Pote de vidro hermético", icone: "🫙" },
        { nome: "Potes de condimentos", icone: "🧂" },
        { nome: "Potes de plástico", icone: "📦" },
        { nome: "Potes de vidro", icone: "🫙" },
        { nome: "Potes de mantimentos", icone: "🏺" },
        { nome: "Assadeira redonda", icone: "🍰" },
        { nome: "Assadeira retangular", icone: "🍞" },
        { nome: "Assadeira redonda com furo", icone: "🍩" },
        { nome: "Baldes", icone: "🪣" },
        { nome: "Bacias", icone: "🥣" },
        { nome: "Vassoura", icone: "🧹" },
        { nome: "Rodo", icone: "🧽" },
        { nome: "Varal", icone: "👕" },
        { nome: "Cabide", icone: "👔" },
        { nome: "Varal com prendedores", icone: "📎" },
        { nome: "Cesto de roupa", icone: "🧺" }
    ];
    reservas = {};
    atualizarLista();
}

function reservarItem(itemNome, nomePessoa) {
    console.log('Reservando item:', itemNome, 'para:', nomePessoa);
    
    // Criar um iframe oculto para enviar o formulário
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.name = 'reservationFrame';
    document.body.appendChild(iframe);
    
    // Criar um formulário para enviar os dados
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = WEB_APP_URL;
    form.target = iframe.name;
    
    // Adicionar campos
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
    
    // Configurar listener para mensagens do iframe
    const messageHandler = function(event) {
        // Verificar se a mensagem é do tipo esperado
        if (event.data && event.data.type === 'reservationComplete') {
            // Remover o listener
            window.removeEventListener('message', messageHandler);
            
            // Remover o iframe
            setTimeout(() => {
                if (document.body.contains(iframe)) {
                    document.body.removeChild(iframe);
                }
            }, 500);
            
            // Verificar se a operação foi bem-sucedida
            if (event.data.success) {
                // Recarregar a página para atualizar os dados
                window.location.reload();
            } else {
                // Mostrar mensagem de erro
                alert('Erro ao processar a reserva: ' + (event.data.error || 'Erro desconhecido'));
            }
        }
    };
    
    // Adicionar o listener
    window.addEventListener('message', messageHandler);
    
    // Timeout para o caso de não receber resposta
    setTimeout(() => {
        window.removeEventListener('message', messageHandler);
        if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
        }
        // Recarregar a página mesmo sem confirmação
        window.location.reload();
    }, 5000);
}

function cancelarReservaItem(itemNome) {
    // Criar um iframe oculto para enviar o formulário
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.name = 'cancelFrame';
    document.body.appendChild(iframe);
    
    // Criar um formulário para enviar os dados
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = WEB_APP_URL;
    form.target = iframe.name;
    
    // Adicionar campos
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
    
    // Configurar listener para mensagens do iframe
    const messageHandler = function(event) {
        // Verificar se a mensagem é do tipo esperado
        if (event.data && event.data.type === 'reservationComplete') {
            // Remover o listener
            window.removeEventListener('message', messageHandler);
            
            // Remover o iframe
            setTimeout(() => {
                if (document.body.contains(iframe)) {
                    document.body.removeChild(iframe);
                }
            }, 500);
            
            // Verificar se a operação foi bem-sucedida
            if (event.data.success) {
                // Recarregar a página para atualizar os dados
                window.location.reload();
            } else {
                // Mostrar mensagem de erro
                alert('Erro ao processar o cancelamento: ' + (event.data.error || 'Erro desconhecido'));
            }
        }
    };
    
    // Adicionar o listener
    window.addEventListener('message', messageHandler);
    
    // Timeout para o caso de não receber resposta
    setTimeout(() => {
        window.removeEventListener('message', messageHandler);
        if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
        }
        // Recarregar a página mesmo sem confirmação
        window.location.reload();
    }, 5000);
}

function obterIcone(itemNome) {
    // Padroniza o nome para a busca
    const nomePadronizado = itemNome ? String(itemNome).trim().toLowerCase() : '';

    // Mapeamento de Itens para Emojis
    const mapaEmojis = {
        'escorredor de macarrão': '🍝',
        'escorredor de arroz': '🍚',
        'tábua de madeira': '🪵',
        'tábua de plástico': '📋',
        'tábua de vidro': '🔷',
        'escorredor de louça': '🍽️',
        'kit pia (lixeira, porta detergente)': '🧽',
        'kit pia': '🧽',
        'rodinho de pia': '🧹',
        'ralador': '🧀',
        'descascador': '🥔',
        'batedor de ovos': '🥚',
        'concha': '🥄',
        'escumadeira': '🍳',
        'pegador de massas': '🍝',
        'espátula': '🍳',
        'colher de pau': '🥄',
        'colheres medidoras': '📏',
        'peneira': '⚪',
        'funil': '🔽',
        'saladeira': '🥗',
        'fruteira': '🍎',
        'jarra de suco': '🥤',
        'luva térmica': '🧤',
        'panos de prato': '🧽',
        'jogo americano': '🍽️',
        'toalha de mesa': '🏠',
        'centrífuga de salada': '🥬',
        'espremedor de alho': '🧄',
        'pote de vidro hermético': '🫙',
        'potes de condimentos': '🧂',
        'potes de plástico': '📦',
        'potes de vidro': '🫙',
        'potes de mantimentos': '🏺',
        'assadeira redonda': '🍰',
        'assadeira retangular': '🍞',
        'assadeira redonda com furo': '🍩',
        'baldes': '🪣',
        'bacias': '🥣',
        'vassoura': '🧹',
        'rodo': '🧽',
        'varal': '👕',
        'cabide': '👔',
        'varal com prendedores': '📎',
        'cesto de roupa': '🧺'
    };

    // Emoji de Fallback (Ícone Padrão para itens desconhecidos)
    const emojiPadrao = '🍴';

    // Retorna o emoji mapeado ou o emoji padrão
    return mapaEmojis[nomePadronizado] || emojiPadrao;
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
                <span style="font-size: 1.5rem;">${item.icone}</span>
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
    alert(`"${itemNome}" reservado com sucesso para ${nome}!\n\nA página será recarregada em instantes...`);
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
    alert(`Reserva de "${itemNome}" cancelada!\n\nA página será recarregada em instantes...`);
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
