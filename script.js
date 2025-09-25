// Kitchen Shower Registry with Automatic Google Sheets Integration
// Main JavaScript file

// Configuração fixa - URL do Google Apps Script Web App
// SUBSTITUA PELA SUA URL DO WEB APP
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
                
                // --- LINHAS FALTANTES QUE DEVEM SER INSERIDAS NOVAMENTE ---
                if (!Array.isArray(row) || row.length === 0) {
                    return; // Pula linhas nulas/vazias
                }
                const itemNome = row[0]; // Coluna A - Item (Declarado e inicializado!)
                const reserva = row[1];  // Coluna B - Reserva (Declarado e inicializado!)
                // ------------------------------------------------------------
                
                if (itemNome && itemNome !== 'Item') {
                    // ... (resto do seu código)
                    // Aqui itemNome está corretamente definido
                    try {
                        itens.push({
                            nome: itemNome,
                            icone: obterIcone(itemNome)
                        });
                    } catch (e) {
                        console.error(`Falha ao obter ícone para item: ${itemNome} na linha ${index + 1}`, e);
                    }
                    
                    if (reserva && reserva !== 'Reserva') { // Usa a variável 'reserva'
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
        { nome: "Escorredor de macarrão", icone: "🍝" },
        { nome: "Escorredor de arroz", icone: "🍚" },
        { nome: "Tábua de madeira", icone: "🪵" },
        // ... (adicione todos os itens da sua lista original)
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

// ... (mantenha a função obterIcone e as funções UI iguais)
function obterIcone(itemNome) {
    // Padroniza o nome para a busca (boa prática)
    const nomePadronizado = itemNome ? String(itemNome).trim().toLowerCase() : '';

    // Mapeamento de Itens para Classes do Font Awesome 6.x
    const mapaClasses = {
        'Refrigerante': 'fa-solid fa-wine-bottle'
		'Salgadinhos':	'fa-solid fa-cookie-bite'
		'Pratos descartáveis':	'fa-solid fa-plate-wheat'
		'Guardanapos':	'fa-solid fa-square'
		'Escorredor de arroz':	'fa-solid fa-filter'
		'Escorredor de macarrão':	'fa-solid fa-filter'
		'Tábua de madeira':	'fa-solid fa-clipboard'
		'Tábua de plástico':	'fa-solid fa-clipboard'
		'Tábua de vidro':	'fa-solid fa-clipboard'
		'Escorredor de louça':	'fa-solid fa-sink'
		'Kit pia':	'fa-solid fa-toolbox'
		'Rodinho de pia':	'fa-solid fa-broom'
		'Ralador':	'fa-solid fa-mortar-pestle'
		'Descascador':	'fa-solid fa-knife'
		'Batedor de ovos':	'fa-solid fa-egg'
		'Concha': 'fa-solid fa-spoon'
		'Escumadeira': 'fa-solid fa-sieve'
		'Pegador de massas': 'fa-solid fa-utensils'
		'Espátula':	'fa-solid fa-spatula'
    };

    // Classe de Fallback (Ícone Padrão para itens desconhecidos)
    const classePadrao = 'fa-solid fa-question-circle'; // Ponto de interrogação

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
    document.getElementById('lista').style.display = 'block';
}

// --- Exemplo de como a função atualizarLista deve ser adaptada ---
function atualizarLista() {
    const listaContainer = document.getElementById('lista-itens');
    if (!listaContainer) return; // Garante que o container existe

    listaContainer.innerHTML = ''; // Limpa o container
    
    itens.forEach(item => {
        // Cria a estrutura HTML para cada item
        const itemElemento = document.createElement('div');
        itemElemento.classList.add('item-lista'); // Classe para estilização CSS

        // Estrutura do ícone acima do nome
        itemElemento.innerHTML = `
            <div class="item-icone">
                <i class="${item.icone}"></i>
            </div>
            <div class="item-nome">
                ${item.nome}
            </div>
            <div class="item-reserva">
                ${reservas[item.nome] || ''} 
            </div>
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
        reservas[item.nome] = nome;
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
