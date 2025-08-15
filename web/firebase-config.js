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

// Enable anonymous authentication
auth.useDeviceLanguage();



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
