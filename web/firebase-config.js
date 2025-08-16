// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBS9NW_JTE5SyajdqsGF8qeCH7ROSAWFYo",
  authDomain: "the-anomaly-897ce.firebaseapp.com",
  databaseURL: "https://the-anomaly-897ce.firebaseio.com",
  projectId: "the-anomaly-897ce",
  storageBucket: "the-anomaly-897ce.firebasestorage.app",
  messagingSenderId: "136548028625",
  appId: "1:136548028625:web:437d1081024d3907edf5f0",
  measurementId: "G-8SJHHK4Y6G"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = firebase.auth();

// Initialize Firestore
const db = firebase.firestore();

// Enable anonymous authentication
auth.useDeviceLanguage();

// Variable global para almacenar la suscripción activa
let activeGameSubscription = null;

// Function to save player distribution to Firestore
async function savePlayerDistribution(gameCode, totalPlayers, distribution, roles) {
  try {
    const docRef = await db.collection('games').doc(gameCode).set({
      totalPlayers: totalPlayers,
      playerDistribution: distribution,
      roles: roles,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      createdBy: auth.currentUser.uid,
      lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Distribución de jugadores y roles guardados en Firebase con ID:', docRef);
    return docRef;
  } catch (error) {
    console.error('❌ Error al guardar distribución en Firebase:', error);
    throw error;
  }
}

// Function to assign roles to players
function assignPlayerRoles(totalPlayers) {
  const roles = {
    ASESINO: 0,
    COMPLICE: []
  };
  
  // Siempre asignar un ASESINO (jugador aleatorio del 1 al totalPlayers)
  roles.ASESINO = Math.floor(Math.random() * totalPlayers) + 1;
  
  // Para partidas de 5+ jugadores, asignar 1 COMPLICE
  if (totalPlayers >= 5) {
    let complice;
    do {
      complice = Math.floor(Math.random() * totalPlayers) + 1;
    } while (complice === roles.ASESINO); // Asegurar que el COMPLICE sea diferente al ASESINO
    
    roles.COMPLICE.push(complice);
  }
  
  console.log('🎭 Roles asignados:', roles);
  return roles;
}

// Function to get player distribution from Firestore
async function getPlayerDistribution(gameCode) {
  try {
    const doc = await db.collection('games').doc(gameCode).get();
    if (doc.exists) {
      console.log('📋 Distribución recuperada de Firebase:', doc.data());
      return doc.data();
    } else {
      console.log('❌ No se encontró distribución para el código:', gameCode);
      return null;
    }
  } catch (error) {
    console.error('❌ Error al obtener distribución de Firebase:', error);
    throw error;
  }
}

// Function to subscribe to real-time updates for a specific game
function subscribeToGameUpdates(gameCode, onUpdate) {
  // Cancelar suscripción anterior si existe
  if (activeGameSubscription) {
    activeGameSubscription();
    console.log('🔄 Suscripción anterior cancelada');
  }
  
  console.log('🔔 Suscribiéndose a actualizaciones del juego:', gameCode);
  
  // Crear nueva suscripción en tiempo real
  activeGameSubscription = db.collection('games').doc(gameCode)
    .onSnapshot((doc) => {
      if (doc.exists) {
        const gameData = doc.data();
        console.log('🔄 Datos del juego actualizados en tiempo real:', gameData);
        
        // Llamar a la función de callback con los datos actualizados
        if (onUpdate && typeof onUpdate === 'function') {
          onUpdate(gameData);
        }
      } else {
        console.log('❌ El documento del juego ya no existe');
        // Llamar a la función de callback con null para indicar que no hay datos
        if (onUpdate && typeof onUpdate === 'function') {
          onUpdate(null);
        }
      }
    }, (error) => {
      console.error('❌ Error en la suscripción en tiempo real:', error);
    });
  
  console.log('✅ Suscripción activa para el juego:', gameCode);
  return activeGameSubscription;
}

// Function to unsubscribe from game updates
function unsubscribeFromGameUpdates() {
  if (activeGameSubscription) {
    activeGameSubscription();
    activeGameSubscription = null;
    console.log('🔇 Suscripción cancelada');
  }
}

// Function to update game state in Firestore
async function updateGameState(gameCode, updates) {
  try {
    await db.collection('games').doc(gameCode).update({
      ...updates,
      lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Estado del juego actualizado en Firebase');
  } catch (error) {
    console.error('❌ Error al actualizar estado del juego:', error);
    throw error;
  }
}

// Function to add a player move to the game
async function addPlayerMove(gameCode, playerNumber, fromRoom, toRoom, timestamp) {
  try {
    const moveData = {
      playerNumber: playerNumber,
      fromRoom: fromRoom,
      toRoom: toRoom,
      timestamp: timestamp || firebase.firestore.FieldValue.serverTimestamp()
    };
    
    await db.collection('games').doc(gameCode).collection('moves').add(moveData);
    console.log('✅ Movimiento del jugador registrado:', moveData);
  } catch (error) {
    console.error('❌ Error al registrar movimiento:', error);
    throw error;
  }
}

// Function to get player moves for a game
async function getPlayerMoves(gameCode) {
  try {
    const movesSnapshot = await db.collection('games').doc(gameCode).collection('moves')
      .orderBy('timestamp', 'desc')
      .get();
    
    const moves = [];
    movesSnapshot.forEach(doc => {
      moves.push({ id: doc.id, ...doc.data() });
    });
    
    console.log('📋 Movimientos recuperados:', moves);
    return moves;
  } catch (error) {
    console.error('❌ Error al obtener movimientos:', error);
    throw error;
  }
}

// Function to sign in anonymously
async function signInAnonymously() {
  try {
    const userCredential = await auth.signInAnonymously();
    const user = userCredential.user;
    console.log('Usuario anónimo conectado:', user.uid);
    return user;
  } catch (error) {
    console.error('Error al conectar anónimamente:', error);
    throw error;
  }
}

// Function to get current user
function getCurrentUser() {
  return auth.currentUser;
}

// Function to sign out
async function signOut() {
  try {
    // Cancelar suscripción antes de desconectar
    unsubscribeFromGameUpdates();
    
    await auth.signOut();
    console.log('Usuario desconectado');
  } catch (error) {
    console.error('Error al desconectar:', error);
    throw error;
  }
}

// Auth state observer
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log('Usuario autenticado:', user.uid);
    // Hide login section and show game content
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('game-content').style.display = 'block';
  } else {
    console.log('Usuario no autenticado');
    // Cancelar suscripción cuando el usuario se desconecta
    unsubscribeFromGameUpdates();
    
    // Show login section and hide game content
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('game-content').style.display = 'none';
  }
});
