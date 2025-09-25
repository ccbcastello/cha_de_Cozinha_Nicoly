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
        const response = await fetch(WEB_APP_URL + '?action=get');
        const result = await response.json();
        
        console.log('Resposta bruta do Web App:', result); 
        console.log('Status de Sucesso:', result.success);

        if (result.success) {
            itens = [];
            reservas = {};
            
            result.data.forEach((row, index) => {
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
        } else {
            throw new Error('Erro ao carregar dados da planilha');
        }
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        carregarListaPadrao();
    } finally {
        esconderLoading();
    }
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

async function reservarItem(itemNome, nomePessoa) {
    try {
        const response = await fetch(WEB_APP_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'reserve',
                itemName: itemNome,
                reservedBy: nomePessoa,
                timestamp: new Date().toISOString()
            })
        });
        
        const text = await response.text();
        console.log('Resposta do servidor:', text);
        
        let result;
        try {
            result = JSON.parse(text);
        } catch (e) {
            console.error('Erro ao parsear JSON:', e);
            return false;
        }
        
        return result.success;
    } catch (error) {
        console.error('Erro ao reservar:', error);
        return false;
    }
}

async function cancelarReservaItem(itemNome) {
    try {
        const response = await fetch(WEB_APP_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'cancel',
                itemName: itemNome,
                timestamp: new Date().toISOString()
            })
        });
        
        const text = await response.text();
        console.log('Resposta do cancelamento:', text);
        
        let result;
        try {
            result = JSON.parse(text);
        } catch (e) {
            console.error('Erro ao parsear JSON:', e);
            return false;
        }
        
        return result.success;
    } catch (error) {
        console.error('Erro ao cancelar:', error);
        return false;
    }
}

function obterIcone(itemNome) {
    // Padroniza o nome para a busca
    const nomePadronizado = itemNome ? String(itemNome).trim().toLowerCase() : '';

    // Mapeamento de Itens para Classes do Font Awesome 6.x
    // Chaves em minúsculas para corresponder à padronização
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
    document.getElementById('lista').style.display = 'grid'; // Usar grid em vez de block
}

function atualizarLista() {
    const listaContainer = document.getElementById('lista'); // Corrigido para 'lista'
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

async function reservar(itemNome, index) {
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
    
    const success = await reservarItem(itemNome, nome);
    
    if (success) {
        reservas[itemNome] = nome;
        atualizarLista();
        alert(`"${itemNome}" reservado com sucesso para ${nome}!`);
    } else {
        alert('Erro ao reservar. Tente novamente.');
        button.textContent = originalText;
        button.disabled = false;
    }
}

async function cancelarReserva(itemNome) {
    const nomeReservado = reservas[itemNome];
    const confirmacao = confirm(`Cancelar reserva de "${itemNome}" por ${nomeReservado}?`);
    
    if (!confirmacao) return;
    
    const button = document.querySelector(`[data-item="${itemNome}"] .cancelar-btn`);
    const originalText = button.textContent;
    button.textContent = 'Cancelando...';
    button.disabled = true;
    
    const success = await cancelarReservaItem(itemNome);
    
    if (success) {
        delete reservas[itemNome];
        atualizarLista();
        alert(`Reserva de "${itemNome}" cancelada!`);
    } else {
        alert('Erro ao cancelar reserva. Tente novamente.');
        button.textContent = originalText;
        button.disabled = false;
    }
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
