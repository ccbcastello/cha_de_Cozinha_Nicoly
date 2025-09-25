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
    // 1. Limpar e padronizar o nome do item para a busca (boa prática)
    // Converte para minúsculas e remove espaços extras
    const nomePadronizado = itemNome ? String(itemNome).trim().toLowerCase() : '';

    // 2. O Mapa de Ícones (use nomes padronizados em minúsculas)
    const mapaIcones = {
        'mesa': 'icone_mesa.svg',
        'cadeira': 'icone_cadeira.svg',
        'computador': 'icone_pc.svg',
        // Adicione todos os seus mapeamentos aqui, em minúsculas
    };

    // 3. Fallback (Ícone Padrão)
    const iconePadrao = 'icone_desconhecido.svg'; 

    // 4. Lógica Segura: Retorna o ícone mapeado OU o ícone padrão
    const icone = mapaIcones[nomePadronizado];

    // Se o ícone for encontrado, retorna. Senão, retorna o padrão.
    return icone || iconePadrao;
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

function atualizarLista() {
    const container = document.getElementById("lista");
    container.innerHTML = "";
    
    itens.forEach((item, index) => {
        const div = document.createElement("div");
        div.className = "item" + (reservas[item.nome] ? " reservado" : "");
        div.setAttribute('data-item', item.nome);
        
        if (reservas[item.nome]) {
            // Item reservado
            div.innerHTML = `
                <div class="item-icon">${item.icone}</div>
                <h3>${item.nome}</h3>
                <div class="reservado-info">✓ Reservado por: ${reservas[item.nome]}</div>
                <button class="cancelar-btn" onclick="cancelarReserva('${item.nome}')">Cancelar Reserva</button>
            `;
        } else {
            // Item disponível
            div.innerHTML = `
                <div class="item-icon">${item.icone}</div>
                <h3>${item.nome}</h3>
                <input type="text" id="nome-${index}" placeholder="Digite seu nome">
                <button onclick="reservar('${item.nome}', ${index})">Reservar</button>
            `;
        }
        
        container.appendChild(div);
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
