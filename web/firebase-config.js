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

// Function to save player distribution to Firestore
async function savePlayerDistribution(gameCode, totalPlayers, distribution, roles) {
  try {
    const docRef = await db.collection('games').doc(gameCode).set({
      totalPlayers: totalPlayers,
      playerDistribution: distribution,
      roles: roles,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      createdBy: auth.currentUser.uid
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
    // Show login section and hide game content
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('game-content').style.display = 'none';
  }
});
