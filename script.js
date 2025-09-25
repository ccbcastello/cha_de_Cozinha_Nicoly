// Kitchen Shower Registry with Google Sheets Integration
// Main JavaScript file

const presentes = [
  { nome: "Escorredor de macarrão", icone: "🍝" },
  // ... (mantenha toda a lista de presentes original)
];

// Configuration
let GOOGLE_SHEETS_URL = localStorage.getItem('googleSheetsUrl') || '';
let reservas = Array(presentes.length).fill(null);

// Google Sheets Integration Functions
async function conectarGoogleSheets() {
  const url = document.getElementById('sheets-url').value.trim();
  const statusElement = document.getElementById('connection-status');
  
  if (!url) {
    statusElement.textContent = '❌ Por favor, insira a URL do Google Sheets';
    statusElement.style.color = '#dc3545';
    return;
  }
  
  try {
    statusElement.textContent = '⏳ Testando conexão...';
    statusElement.style.color = '#ffc107';
    
    // Extract spreadsheet ID from URL
    const spreadsheetId = extrairIdPlanilha(url);
    if (!spreadsheetId) {
      throw new Error('URL do Google Sheets inválida');
    }
    
    // Test connection by trying to read data
    const testUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json`;
    const response = await fetch(testUrl);
    if (!response.ok) throw new Error('Não foi possível acessar a planilha');
    
    GOOGLE_SHEETS_URL = spreadsheetId;
    localStorage.setItem('googleSheetsUrl', spreadsheetId);
    
    statusElement.textContent = '✅ Conectado ao Google Sheets com sucesso!';
    statusElement.style.color = '#28a745';
    
    // Load data from Google Sheets
    await carregarReservasDoGoogleSheets();
    atualizarLista();
  } catch (error) {
    console.error('Erro ao conectar:', error);
    statusElement.textContent = '❌ Erro na conexão. Verifique se a planilha está compartilhada publicamente.';
    statusElement.style.color = '#dc3545';
  }
}

function extrairIdPlanilha(url) {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

async function carregarReservasDoGoogleSheets() {
  if (!GOOGLE_SHEETS_URL) {
    return carregarReservasLocal();
  }
  
  try {
    const url = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEETS_URL}/gviz/tq?tqx=out:json`;
    const response = await fetch(url);
    const text = await response.text();
    const json = JSON.parse(text.substring(47).slice(0, -2));
    
    // Reset reservations
    reservas = Array(presentes.length).fill(null);
    
    // Process data from Google Sheets
    if (json.table.rows) {
      json.table.rows.forEach(row => {
        if (row.c && row.c.length >= 2) {
          const itemName = row.c[0]?.v; // Coluna A - Item
          const reservedBy = row.c[1]?.v; // Coluna B - Reserva
          
          if (itemName && reservedBy) {
            // Find matching item in our list
            const index = presentes.findIndex(p => p.nome === itemName);
            if (index !== -1) {
              reservas[index] = reservedBy;
            }
          }
        }
      });
    }
  } catch (error) {
    console.error('Erro ao carregar do Google Sheets:', error);
    carregarReservasLocal();
  }
}

async function salvarReservaNoGoogleSheets(index, nome, action = 'reserve') {
  if (!GOOGLE_SHEETS_URL) {
    return salvarReservasLocal();
  }
  
  try {
    const itemName = presentes[index].nome;
    const reservedBy = action === 'reserve' ? nome : '';
    
    // For Google Sheets API, we'd need a server-side component
    // This is a simplified version that just updates local storage
    // In a real implementation, you'd need Google Apps Script
    console.log(`Would update Google Sheets: ${itemName} -> ${reservedBy}`);
    
    // For now, fall back to localStorage
    salvarReservasLocal();
    return true;
  } catch (error) {
    console.error('Erro ao salvar no Google Sheets:', error);
    salvarReservasLocal();
    return false;
  }
}

// Restante do código permanece igual (funções de UI, localStorage, etc.)
// ... (mantenha todas as outras funções como estão)

// Local Storage Functions (Fallback)
function carregarReservasLocal() {
  const reservasSalvas = localStorage.getItem('reservasChaCozinha');
  if (reservasSalvas) {
    reservas = JSON.parse(reservasSalvas);
  } else {
    reservas = Array(presentes.length).fill(null);
  }
}

function salvarReservasLocal() {
  localStorage.setItem('reservasChaCozinha', JSON.stringify(reservas));
}

// UI Functions (mantenha todas como estão)
function mostrarLoading() {
  document.getElementById('loading-indicator').style.display = 'block';
}

function esconderLoading() {
  document.getElementById('loading-indicator').style.display = 'none';
}

// ... (mantenha todas as outras funções UI)

// Initialize the application
async function inicializar() {
  mostrarLoading();
  
  // Check if Google Sheets URL is already saved
  if (GOOGLE_SHEETS_URL) {
    document.getElementById('sheets-url').value = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEETS_URL}/edit`;
    document.getElementById('connection-status').textContent = '✅ URL salva. Conectando...';
    document.getElementById('connection-status').style.color = '#28a745';
    
    try {
      await carregarReservasDoGoogleSheets();
    } catch (error) {
      console.log('Fallback to localStorage');
      carregarReservasLocal();
    }
  } else {
    carregarReservasLocal();
  }
  
  atualizarLista();
  esconderLoading();
}

// Make functions globally accessible
window.reservar = reservar;
window.cancelarReserva = cancelarReserva;
window.conectarGoogleSheets = conectarGoogleSheets;

document.addEventListener('DOMContentLoaded', inicializar);
