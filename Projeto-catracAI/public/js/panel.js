const DB_NAME = 'catracaDB';
const DB_VERSION = 1;
const STORE_NAME = 'users';
const STORE_LOGS = 'logs';

const usersTableBody = document.querySelector('#usersTable tbody');
const logsDiv = document.getElementById('logs');

let db;

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(STORE_LOGS)) {
        db.createObjectStore(STORE_LOGS, { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.errorCode);
  });
}

async function getAllUsers() {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = (e) => reject(e.target.error);
    });
  }
  

async function getLogsByUserName(userName) {
  const tx = db.transaction(STORE_LOGS, 'readonly');
  const store = tx.objectStore(STORE_LOGS);
  return new Promise((resolve) => {
    const logs = [];
    store.openCursor().onsuccess = function (event) {
      const cursor = event.target.result;
      if (cursor) {
        if (cursor.value.name === userName) {
          logs.push(cursor.value);
        }
        cursor.continue();
      } else {
        resolve(logs);
      }
    };
  });
}

async function deleteUser(userId) {
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  return new Promise((resolve, reject) => {
    const request = store.delete(userId);
    request.onsuccess = () => resolve();
    request.onerror = (e) => reject(e.target.errorCode);
  });
}

async function updateUserName(userId, newName) {
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  return new Promise((resolve, reject) => {
    const getRequest = store.get(userId);
    getRequest.onsuccess = () => {
      const user = getRequest.result;
      if (!user) return reject('Usuário não encontrado');
      user.name = newName;
      const updateRequest = store.put(user);
      updateRequest.onsuccess = () => resolve();
      updateRequest.onerror = (e) => reject(e.target.errorCode);
    };
    getRequest.onerror = (e) => reject(e.target.errorCode);
  });
}

function renderUsers(users) {
  usersTableBody.innerHTML = '';
  users.forEach(user => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${user.id}</td>
      <td contenteditable="true" data-id="${user.id}" class="editable-name">${user.name}</td>
      <td>
        <button data-id="${user.id}" class="btn-view-logs">Ver Logs</button>
        <button data-id="${user.id}" class="btn-delete-user">Deletar</button>
      </td>
    `;
    usersTableBody.appendChild(tr);
  });
}

function renderLogs(logs) {
  if (!logs.length) {
    logsDiv.textContent = 'Nenhum log encontrado para este usuário.';
    return;
  }
  logsDiv.innerHTML = '';
  logs.forEach(log => {
    const p = document.createElement('p');
    p.textContent = `[${new Date(log.timestamp || log.time_stamp || Date.now()).toLocaleString()}] ${log.name || 'Usuário'}: ${log.action || JSON.stringify(log)}`;
    logsDiv.appendChild(p);
  });
}

async function refreshUsers() {
  const users = await getAllUsers();
  renderUsers(users);
}

usersTableBody.addEventListener('click', async (e) => {
  if (e.target.classList.contains('btn-delete-user')) {
    const userId = Number(e.target.dataset.id);
    if (confirm('Deseja realmente deletar este usuário?')) {
      await deleteUser(userId);
      await refreshUsers();
      logsDiv.textContent = 'Usuário deletado.';
    }
  } else if (e.target.classList.contains('btn-view-logs')) {
    const userId = Number(e.target.dataset.id);
    const users = await getAllUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
      const logs = await getLogsByUserName(user.name);
      renderLogs(logs);
    }
  }
});

usersTableBody.addEventListener('input', async (e) => {
  if (e.target.classList.contains('editable-name')) {
    const userId = Number(e.target.dataset.id);
    const newName = e.target.textContent.trim();
    if (newName) {
      try {
        await updateUserName(userId, newName);
        logsDiv.textContent = `Nome do usuário ${userId} atualizado para "${newName}".`;
      } catch (err) {
        logsDiv.textContent = `Erro ao atualizar nome: ${err}`;
      }
    }
  }
});

// Inicialização
(async () => {
  db = await openDatabase();
  await refreshUsers();
})();
