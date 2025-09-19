// Firebase Modular Configuration - WHO LIES Game
// Patrón "a prueba de bombas" recomendado por GPT5

// Singleton pattern para evitar re-inicialización
let firebaseApp = null;
let firestoreDb = null;
let authService = null;

// Variable global para almacenar la suscripción activa
let activeGameSubscription = null;

// Función para inicializar Firebase una sola vez
function initializeFirebase() {
    if (firebaseApp) {
        console.log('🔄 Firebase ya está inicializado, reutilizando instancia');
        return { app: firebaseApp, db: firestoreDb, auth: authService };
    }

    try {
        // Obtener servicios de Firebase desde el módulo HTML
        const services = window.firebaseServices;
        if (!services) {
            throw new Error('Firebase services no están disponibles. Asegúrate de que el módulo HTML se haya cargado.');
        }

        firebaseApp = services.app;
        firestoreDb = services.db;
        authService = services.auth;

        console.log('✅ Firebase inicializado exitosamente con patrón singleton');
        return { app: firebaseApp, db: firestoreDb, auth: authService };
    } catch (error) {
        console.error('❌ Error al inicializar Firebase:', error);
        throw error;
    }
}

// Función para obtener instancias de Firebase (siempre la misma)
function getFirebaseServices() {
    if (!firebaseApp || !firestoreDb || !authService) {
        return initializeFirebase();
    }
    return { app: firebaseApp, db: firestoreDb, auth: authService };
}

// Función para guardar distribución de jugadores en Firestore
async function savePlayerDistribution(gameCode, totalPlayers, distribution, roles, playerVisibility = null) {
    try {
        const { db, auth } = getFirebaseServices();
        const { doc, setDoc, serverTimestamp } = window.firebaseServices;

        // Crear diccionario de preguntas inicializado en 0 para todos los jugadores
        const numberQuestionsMade = {};
        for (let i = 1; i <= totalPlayers; i++) {
            numberQuestionsMade[i] = 0;
        }

        const gameData = {
            totalPlayers: totalPlayers,
            playerDistribution: distribution,
            roles: roles,
            createdAt: serverTimestamp(),
            createdBy: auth.currentUser.uid,
            lastUpdated: serverTimestamp(),
            // Campos para el sistema de rondas
            endingRound: false,
            roundNumber: 1,
            numRound: 1,
            // Campo para el sistema de muertes
            deads: [],
            // Campo para el sistema de preguntas
            numberQuestionsMade: numberQuestionsMade,
            // Campo para el sistema de bombas
            bombPlaced: null
        };
        
        // Agregar visibilidad si se proporciona
        if (playerVisibility) {
            gameData.playerVisibility = playerVisibility;
        }
        
        await setDoc(doc(db, 'games', gameCode), gameData);
        console.log('✅ Distribución de jugadores, roles y visibilidad guardados en Firebase con ID:', gameCode);
        return true;
    } catch (error) {
        console.error('❌ Error al guardar distribución en Firebase:', error);
        throw error;
    }
}

// Función para asignar roles a jugadores
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

// Función para obtener distribución de jugadores desde Firestore
async function getPlayerDistribution(gameCode) {
    try {
        const { db } = getFirebaseServices();
        const { doc, getDoc } = window.firebaseServices;

        const docSnap = await getDoc(doc(db, 'games', gameCode));
        if (docSnap.exists()) {
            console.log('📋 Distribución recuperada de Firebase:', docSnap.data());
            return docSnap.data();
        } else {
            console.log('❌ No se encontró distribución para el código:', gameCode);
            return null;
        }
    } catch (error) {
        console.error('❌ Error al obtener distribución de Firebase:', error);
        throw error;
    }
}

// Función para iniciar fin de ronda (solo jugador 1 puede llamar esto)
async function startRoundEnding(gameCode) {
    try {
        const { db } = getFirebaseServices();
        const { doc, updateDoc, getDoc, serverTimestamp } = window.firebaseServices;

        // Obtener el estado actual del juego para evaluar bombas pre-movimiento
        const gameDoc = await getDoc(doc(db, 'games', gameCode));
        if (!gameDoc.exists()) {
            throw new Error('Juego no encontrado');
        }
        
        const gameData = gameDoc.data();
        console.log('🔄 Iniciando fase de movimiento, evaluando bombas pre-movimiento...');

        // Evaluar muertes por bomba antes del movimiento
        const preMovementDeaths = processPreMovementBombDeaths(gameData);
        
        let updateData = {
            endingRound: true,
            lastUpdated: serverTimestamp()
        };

        // Si hay muertes pre-movimiento, actualizar el array de muertos
        if (preMovementDeaths.length > 0) {
            updateData.deads = preMovementDeaths;
            console.log(`💥 ${preMovementDeaths.length} jugador(es) muerto(s) por bomba pre-movimiento: [${preMovementDeaths.join(', ')}]`);
        }

        await updateDoc(doc(db, 'games', gameCode), updateData);
        console.log('✅ Ronda terminada, modo de movimiento activado');
        
        return {
            success: true,
            preMovementDeaths: preMovementDeaths
        };
    } catch (error) {
        console.error('❌ Error al terminar la ronda:', error);
        throw error;
    }
}

// Función para actualizar movimiento del jugador
async function updatePlayerMovement(gameCode, playerNumber, nextMovement) {
    try {
        const { db } = getFirebaseServices();
        const { doc, updateDoc, serverTimestamp } = window.firebaseServices;

        const fieldName = `player${playerNumber}NextMovement`;
        await updateDoc(doc(db, 'games', gameCode), {
            [fieldName]: nextMovement,
            lastUpdated: serverTimestamp()
        });
        console.log(`✅ Movimiento del jugador ${playerNumber} actualizado: ${nextMovement}`);
        return true;
    } catch (error) {
        console.error(`❌ Error al actualizar movimiento del jugador ${playerNumber}:`, error);
        throw error;
    }
}

// Función para guardar selección de kill del ASESINO
async function saveKillSelection(gameCode, victimNumber) {
    try {
        const { db } = getFirebaseServices();
        const { doc, updateDoc, serverTimestamp } = window.firebaseServices;

        const updateData = {
            nextDeath: victimNumber,
            lastUpdated: serverTimestamp()
        };
        
        await updateDoc(doc(db, 'games', gameCode), updateData);
        
        if (victimNumber === null) {
            console.log('✅ ASESINO confirmó no matar a nadie');
        } else {
            console.log(`✅ ASESINO confirmó matar al JUGADOR ${victimNumber}`);
        }
        
        return true;
    } catch (error) {
        console.error('❌ Error al guardar selección de víctima:', error);
        throw error;
    }
}

// Función para resetear el array de muertos
async function resetDeadsArray() {
    try {
        const params = window.gameParams;
        if (!params) {
            console.log('❌ No hay parámetros de juego disponibles para resetear muertos');
            return;
        }
        
        const { db } = getFirebaseServices();
        const { doc, updateDoc, serverTimestamp, getDoc } = window.firebaseServices;
        
        // Crear diccionario de preguntas reseteado a 0 para todos los jugadores
        const numberQuestionsMade = {};
        for (let i = 1; i <= params.totalPlayers; i++) {
            numberQuestionsMade[i] = 0;
        }
        
        // Obtener datos actuales del juego para conocer roles y total de jugadores
        const gameDocRef = doc(db, 'games', params.gameCode);
        const gameSnap = await getDoc(gameDocRef);
        const currentData = gameSnap.exists() ? gameSnap.data() : {};

        const totalPlayers = currentData.totalPlayers || params.totalPlayers;
        const assassinNumber = currentData.roles?.ASESINO || null;

        // Elegir objetivo del asesino: debe ser INVITADO/A (ni ASESINO ni COMPLICE)
        let targetAsesino = null;
        if (totalPlayers && assassinNumber) {
            const compliceNumbers = Array.isArray(currentData.roles?.COMPLICE) ? currentData.roles.COMPLICE : [];
            const eligiblePlayers = [];
            for (let playerNum = 1; playerNum <= totalPlayers; playerNum++) {
                if (playerNum === assassinNumber) continue;
                if (compliceNumbers.includes(playerNum)) continue;
                eligiblePlayers.push(playerNum);
            }
            if (eligiblePlayers.length > 0) {
                const randomIndex = Math.floor(Math.random() * eligiblePlayers.length);
                targetAsesino = eligiblePlayers[randomIndex];
            } else {
                targetAsesino = null;
            }
        }
		
		await updateDoc(gameDocRef, {
			deads: [],
			numberQuestionsMade: numberQuestionsMade,
			// Definir el objetivo del asesino para la nueva partida
			targetAsesino: targetAsesino,
			// Resetear bomba colocada
			bombPlaced: null,
			lastUpdated: serverTimestamp()
		});
        
        console.log('✅ Array de muertos, contadores de preguntas y bomba reseteados exitosamente');
        if (typeof targetAsesino === 'number') {
            console.log(`🎯 Objetivo del asesino definido: JUG. ${targetAsesino}`);
        } else {
            console.log('ℹ️ No se pudo definir objetivo del asesino (faltan datos de roles)');
        }
        return true;
    } catch (error) {
        console.error('❌ Error al resetear array de muertos y contadores:', error);
        throw error;
    }
}

// Función para actualizar el contador de preguntas de un jugador
async function updateQuestionCount(gameCode, playerNumber) {
    try {
        const { db } = getFirebaseServices();
        const { doc, updateDoc, serverTimestamp, getDoc } = window.firebaseServices;
        
        // Obtener el documento actual para verificar el contador actual
        const docSnap = await getDoc(doc(db, 'games', gameCode));
        if (!docSnap.exists()) {
            throw new Error('Juego no encontrado');
        }
        
        const currentData = docSnap.data();
        const currentCount = currentData.numberQuestionsMade?.[playerNumber] || 0;
        const newCount = currentCount + 1;
        
        // Actualizar solo el contador del jugador específico
        await updateDoc(doc(db, 'games', gameCode), {
            [`numberQuestionsMade.${playerNumber}`]: newCount,
            lastUpdated: serverTimestamp()
        });
        
        console.log(`✅ Contador de preguntas del jugador ${playerNumber} actualizado: ${currentCount} → ${newCount}`);
        return newCount;
    } catch (error) {
        console.error('❌ Error al actualizar contador de preguntas:', error);
        throw error;
    }
}

// Función para verificar si todos los jugadores se han movido
async function checkAllPlayersMoved(gameCode, totalPlayers) {
    try {
        const { db } = getFirebaseServices();
        const { doc, getDoc } = window.firebaseServices;

        const docSnap = await getDoc(doc(db, 'games', gameCode));
        if (!docSnap.exists()) return false;
        
        const gameData = docSnap.data();
        let movedPlayers = 0;
        
        for (let i = 1; i <= totalPlayers; i++) {
            const fieldName = `player${i}NextMovement`;
            if (gameData[fieldName]) {
                movedPlayers++;
            }
        }
        
        return movedPlayers === totalPlayers;
    } catch (error) {
        console.error('❌ Error al verificar movimientos de jugadores:', error);
        return false;
    }
}

// Función para finalizar ronda y recalcular visibilidad
async function finalizeRound(gameCode, newDistribution, newVisibility) {
    try {
        const { db } = getFirebaseServices();
        const { doc, getDoc, updateDoc, serverTimestamp, deleteField } = window.firebaseServices;

        // Obtener el documento actual para verificar si hay una muerte pendiente
        const currentDoc = await getDoc(doc(db, 'games', gameCode));
        if (!currentDoc.exists()) {
            throw new Error('Juego no encontrado');
        }
        
        const currentData = currentDoc.data();
        const nextDeath = currentData.nextDeath;
        
        // Preparar campos a limpiar
        const updateData = {
            playerDistribution: newDistribution,
            playerVisibility: newVisibility,
            endingRound: false,
            lastUpdated: serverTimestamp()
        };
        
        // Incrementar número de ronda (sin exceder 5 para UI; la BBDD puede reflejar valor real)
        const previousRound = typeof currentData.numRound === 'number' ? currentData.numRound : (typeof currentData.roundNumber === 'number' ? currentData.roundNumber : 1);
        const newRound = previousRound + 1;
        updateData.numRound = newRound;
        updateData.roundNumber = newRound;
        
        // Limpiar campos de movimiento de todos los jugadores
        for (let i = 1; i <= Object.values(newDistribution).flat().length; i++) {
            const fieldName = `player${i}NextMovement`;
            updateData[fieldName] = deleteField();
        }
        
        // Procesar muerte si existe
        let currentDeads = currentData.deads || [];
        
        if (nextDeath !== undefined && nextDeath !== null) {
            if (nextDeath !== null) {
                // Agregar la nueva víctima al array de muertos
                if (!currentDeads.includes(nextDeath)) {
                    currentDeads.push(nextDeath);
                    console.log(`💀 JUGADOR ${nextDeath} agregado al array de muertos: [${currentDeads.join(', ')}]`);
                }
            }
            
            console.log(`✅ Muerte procesada. Array de muertos actualizado: [${currentDeads.join(', ')}]`);
        } else {
            console.log('ℹ️ No hay muerte pendiente en esta ronda');
        }
        
        // Procesar muertes por bomba
        const bombDeaths = processBombDeaths(currentData, newDistribution);
        if (bombDeaths.length > 0) {
            // Combinar muertes normales con muertes por bomba
            const allDeaths = [...currentDeads];
            bombDeaths.forEach(player => {
                if (!allDeaths.includes(player)) {
                    allDeaths.push(player);
                }
            });
            currentDeads = allDeaths;
            console.log(`💥 Muertes por bomba procesadas. Array de muertos final: [${currentDeads.join(', ')}]`);
        }
        
        // Actualizar array de muertos
        updateData.deads = currentDeads;
        
        // Limpiar campo nextDeath
        updateData.nextDeath = deleteField();

        // Resetear contadores de preguntas al finalizar la ronda
        const totalPlayers = currentData.totalPlayers || Object.values(newDistribution).flat().length;
        const numberQuestionsMadeReset = {};
        for (let i = 1; i <= totalPlayers; i++) {
            numberQuestionsMadeReset[i] = 0;
        }
        updateData.numberQuestionsMade = numberQuestionsMadeReset;

        await updateDoc(doc(db, 'games', gameCode), updateData);
        console.log('✅ Ronda finalizada, visibilidad recalculada');
        return true;
    } catch (error) {
        console.error('❌ Error al finalizar la ronda:', error);
        throw error;
    }
}

// Función para suscribirse a actualizaciones en tiempo real de un juego específico
function subscribeToGameUpdates(gameCode, onUpdate) {
    // Cancelar suscripción anterior si existe
    if (activeGameSubscription) {
        activeGameSubscription();
        console.log('🔄 Suscripción anterior cancelada');
    }
    
    console.log('🔔 Suscribiéndose a actualizaciones del juego:', gameCode);
    
    try {
        const { db } = getFirebaseServices();
        const { doc, onSnapshot } = window.firebaseServices;
        
        // Crear nueva suscripción en tiempo real
        activeGameSubscription = onSnapshot(doc(db, 'games', gameCode), (docSnap) => {
            if (docSnap.exists()) {
                const gameData = docSnap.data();
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
    } catch (error) {
        console.error('❌ Error al crear suscripción:', error);
        throw error;
    }
}

// Función para cancelar suscripción a actualizaciones del juego
function unsubscribeFromGameUpdates() {
    if (activeGameSubscription) {
        activeGameSubscription();
        activeGameSubscription = null;
        console.log('🔇 Suscripción cancelada');
    }
}

// Función para actualizar estado del juego en Firestore
async function updateGameState(gameCode, updates) {
    try {
        const { db } = getFirebaseServices();
        const { doc, updateDoc, serverTimestamp } = window.firebaseServices;

        await updateDoc(doc(db, 'games', gameCode), {
            ...updates,
            lastUpdated: serverTimestamp()
        });
        console.log('✅ Estado del juego actualizado en Firebase');
    } catch (error) {
        console.error('❌ Error al actualizar estado del juego:', error);
        throw error;
    }
}

// Función para agregar un movimiento de jugador al juego
async function addPlayerMove(gameCode, playerNumber, fromRoom, toRoom, timestamp) {
    try {
        const { db } = getFirebaseServices();
        const { collection, addDoc, serverTimestamp } = window.firebaseServices;

        const moveData = {
            playerNumber: playerNumber,
            fromRoom: fromRoom,
            toRoom: toRoom,
            timestamp: timestamp || serverTimestamp()
        };
        
        await addDoc(collection(db, 'games', gameCode, 'moves'), moveData);
        console.log('✅ Movimiento del jugador registrado:', moveData);
    } catch (error) {
        console.error('❌ Error al registrar movimiento:', error);
        throw error;
    }
}

// Función para obtener movimientos de jugadores para un juego
async function getPlayerMoves(gameCode) {
    try {
        const { db } = getFirebaseServices();
        const { collection, query, orderBy, getDocs } = window.firebaseServices;

        const movesSnapshot = await getDocs(query(
            collection(db, 'games', gameCode, 'moves'),
            orderBy('timestamp', 'desc')
        ));
        
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

// ==================== SISTEMA DE BOMBAS ====================

// Función para colocar una bomba
async function placeBomb(gameCode, roomName) {
    try {
        const { db } = getFirebaseServices();
        const { doc, updateDoc, serverTimestamp } = window.firebaseServices;

        await updateDoc(doc(db, 'games', gameCode), {
            bombPlaced: roomName,
            lastUpdated: serverTimestamp()
        });
        
        console.log(`💣 Bomba colocada en ${roomName}`);
        return true;
    } catch (error) {
        console.error('❌ Error al colocar bomba:', error);
        throw error;
    }
}

// Función para obtener la ubicación de la bomba
async function getBombLocation(gameCode) {
    try {
        const { db } = getFirebaseServices();
        const { doc, getDoc } = window.firebaseServices;

        const docSnap = await getDoc(doc(db, 'games', gameCode));
        if (docSnap.exists()) {
            const gameData = docSnap.data();
            return gameData.bombPlaced || null;
        }
        return null;
    } catch (error) {
        console.error('❌ Error al obtener ubicación de bomba:', error);
        throw error;
    }
}

// Función para validar si se puede colocar una bomba
function validateBombPlacement(playerNumber, roomName, gameData) {
    // Verificar que el jugador es el asesino
    if (gameData.roles.ASESINO !== playerNumber) {
        console.log('❌ Solo el asesino puede colocar bombas');
        return false;
    }
    
    // Verificar que estamos en fase de movimiento
    if (gameData.endingRound !== true) {
        console.log('❌ Solo se pueden colocar bombas durante la fase de movimiento');
        return false;
    }
    
    // Verificar que no hay bomba colocada previamente
    if (gameData.bombPlaced !== null) {
        console.log('❌ Ya hay una bomba colocada en la partida');
        return false;
    }
    
    // Verificar que la habitación no es 'centro'
    if (roomName === 'centro') {
        console.log('❌ No se puede colocar bomba en el centro');
        return false;
    }
    
    // Verificar que la habitación es válida (actual o contigua)
    const currentRoom = getCurrentPlayerRoom(playerNumber, gameData.playerDistribution);
    if (!currentRoom) {
        console.log('❌ No se pudo determinar la habitación actual del jugador');
        return false;
    }
    
    // Diccionario de habitaciones contiguas (roomMovements)
    const roomMovements = {
        'cocina': ['pasillo_norte', 'comedor'],
        'pasillo_norte': ['cocina', 'habitacion_principal'],
        'habitacion_principal': ['pasillo_norte', 'habitacion_invitados'],
        'comedor': ['cocina', 'torreon_oeste'],
        'habitacion_invitados': ['habitacion_principal', 'torreon_este'],
        'torreon_oeste': ['comedor', 'pasillo_sur'],
        'pasillo_sur': ['torreon_oeste', 'torreon_este'],
        'torreon_este': ['pasillo_sur', 'habitacion_invitados']
    };
    
    // Permitir colocación en habitación actual o contiguas
    const validRooms = [currentRoom, ...(roomMovements[currentRoom] || [])];
    if (!validRooms.includes(roomName)) {
        console.log(`❌ La habitación ${roomName} no es accesible desde ${currentRoom}`);
        return false;
    }
    
    // Verificar que el asesino no está muerto
    if (gameData.deads && gameData.deads.includes(playerNumber)) {
        console.log('❌ El asesino está muerto, no puede colocar bombas');
        return false;
    }
    
    console.log(`✅ Validación de bomba exitosa: ${roomName} desde ${currentRoom}`);
    return true;
}

// Función auxiliar para obtener la habitación actual del jugador
function getCurrentPlayerRoom(playerNumber, distribution) {
    for (let room in distribution) {
        if (distribution[room] && distribution[room].includes(playerNumber)) {
            return room;
        }
    }
    return null;
}

// Función para obtener habitaciones donde se puede colocar bomba
function getBombEligibleRooms(playerNumber, gameData) {
    const currentRoom = getCurrentPlayerRoom(playerNumber, gameData.playerDistribution);
    if (!currentRoom) return [];
    
    // Diccionario de habitaciones contiguas (roomMovements)
    const roomMovements = {
        'cocina': ['pasillo_norte', 'comedor'],
        'pasillo_norte': ['cocina', 'habitacion_principal'],
        'habitacion_principal': ['pasillo_norte', 'habitacion_invitados'],
        'comedor': ['cocina', 'torreon_oeste'],
        'habitacion_invitados': ['habitacion_principal', 'torreon_este'],
        'torreon_oeste': ['comedor', 'pasillo_sur'],
        'pasillo_sur': ['torreon_oeste', 'torreon_este'],
        'torreon_este': ['pasillo_sur', 'habitacion_invitados']
    };
    
    // Incluir habitación actual y contiguas, excluyendo 'centro'
    const validRooms = [currentRoom, ...(roomMovements[currentRoom] || [])];
    return validRooms.filter(room => room !== 'centro');
}

// Función para verificar si algún jugador muere por bomba
function checkBombDeaths(gameData, newDistribution) {
    // Verificar si hay bomba colocada
    if (!gameData.bombPlaced) {
        console.log('ℹ️ No hay bomba colocada, no hay muertes por bomba');
        return [];
    }
    
    const bombRoom = gameData.bombPlaced;
    console.log(`💣 Verificando muertes por bomba en habitación: ${bombRoom}`);
    
    // Obtener jugadores que están en la habitación con bomba
    const playersInBombRoom = newDistribution[bombRoom] || [];
    console.log(`💣 Jugadores en habitación con bomba: [${playersInBombRoom.join(', ')}]`);
    
    // Filtrar solo jugadores vivos (no en el array de muertos)
    const currentDeads = gameData.deads || [];
    const alivePlayersInBombRoom = playersInBombRoom.filter(player => !currentDeads.includes(player));
    
    console.log(`💣 Jugadores vivos en habitación con bomba: [${alivePlayersInBombRoom.join(', ')}]`);
    
    return alivePlayersInBombRoom;
}

// Función para procesar muertes por bomba
function processBombDeaths(gameData, newDistribution) {
    const bombDeaths = checkBombDeaths(gameData, newDistribution);
    
    if (bombDeaths.length === 0) {
        console.log('ℹ️ No hay muertes por bomba en esta ronda');
        return [];
    }
    
    console.log(`💥 Procesando ${bombDeaths.length} muerte(s) por bomba: [${bombDeaths.join(', ')}]`);
    
    // Agregar las muertes por bomba al array de muertos existente
    const currentDeads = gameData.deads || [];
    const newDeads = [...currentDeads];
    
    bombDeaths.forEach(player => {
        if (!newDeads.includes(player)) {
            newDeads.push(player);
            console.log(`💥 JUGADOR ${player} muerto por bomba en ${gameData.bombPlaced}`);
        }
    });
    
    return newDeads;
}

// ==================== EVALUACIÓN PRE-MOVIMIENTO DE BOMBAS ====================

// Función para verificar muertes por bomba antes del movimiento
function checkPreMovementBombDeaths(gameData) {
    // Verificar si hay bomba colocada
    if (!gameData.bombPlaced) {
        console.log('ℹ️ No hay bomba colocada, no hay muertes pre-movimiento');
        return [];
    }

    const bombRoom = gameData.bombPlaced;
    console.log(`💣 Verificando muertes pre-movimiento por bomba en habitación: ${bombRoom}`);

    // Obtener jugadores que están en la habitación con bomba (distribución actual)
    const playersInBombRoom = gameData.playerDistribution[bombRoom] || [];
    console.log(`💣 Jugadores en habitación con bomba: [${playersInBombRoom.join(', ')}]`);

    // Filtrar solo jugadores vivos (no en el array de muertos)
    const currentDeads = gameData.deads || [];
    const alivePlayersInBombRoom = playersInBombRoom.filter(player => !currentDeads.includes(player));

    console.log(`💣 Jugadores vivos en habitación con bomba (pre-movimiento): [${alivePlayersInBombRoom.join(', ')}]`);

    return alivePlayersInBombRoom;
}

// Función para procesar muertes por bomba antes del movimiento
function processPreMovementBombDeaths(gameData) {
    const preMovementDeaths = checkPreMovementBombDeaths(gameData);

    if (preMovementDeaths.length === 0) {
        console.log('ℹ️ No hay muertes pre-movimiento por bomba');
        return [];
    }

    console.log(`💥 Procesando ${preMovementDeaths.length} muerte(s) pre-movimiento por bomba: [${preMovementDeaths.join(', ')}]`);

    // Agregar las muertes pre-movimiento al array de muertos existente
    const currentDeads = gameData.deads || [];
    const newDeads = [...currentDeads];

    preMovementDeaths.forEach(player => {
        if (!newDeads.includes(player)) {
            newDeads.push(player);
            console.log(`💥 JUGADOR ${player} muerto por bomba pre-movimiento en ${gameData.bombPlaced}`);
        }
    });

    return newDeads;
}

// Función para iniciar sesión anónimamente
async function signInAnonymously() {
    try {
        const { auth } = getFirebaseServices();
        const { signInAnonymously } = window.firebaseServices;

        const userCredential = await signInAnonymously(auth);
        const user = userCredential.user;
        console.log('Usuario anónimo conectado:', user.uid);
        return user;
    } catch (error) {
        console.error('Error al conectar anónimamente:', error);
        throw error;
    }
}

// Función para obtener usuario actual
function getCurrentUser() {
    const { auth } = getFirebaseServices();
    return auth.currentUser;
}

// Función para cerrar sesión
async function signOut() {
    try {
        // Cancelar suscripción antes de desconectar
        unsubscribeFromGameUpdates();
        
        const { auth } = getFirebaseServices();
        const { signOut } = window.firebaseServices;

        await signOut(auth);
        console.log('Usuario desconectado');
    } catch (error) {
        console.error('Error al desconectar:', error);
        throw error;
    }
}

// Función para configurar el observer de estado de autenticación
function setupAuthStateObserver() {
    try {
        const { auth } = getFirebaseServices();
        const { onAuthStateChanged } = window.firebaseServices;

        // COMENTADO TEMPORALMENTE - La lógica del juego maneja la UI
        /*
        onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log('Usuario autenticado:', user.uid);
                // Hide login section and show game content
                const loginSection = document.getElementById('login-section');
                const gameContent = document.getElementById('game-content');
                
                if (loginSection) loginSection.style.display = 'none';
                if (gameContent) gameContent.style.display = 'block';
            } else {
                console.log('Usuario no autenticado');
                // Cancelar suscripción cuando el usuario se desconecta
                unsubscribeFromGameUpdates();
                
                // Show login section and hide game content
                const loginSection = document.getElementById('login-section');
                const gameContent = document.getElementById('game-content');
                
                if (loginSection) loginSection.style.display = 'block';
                if (gameContent) gameContent.style.display = 'none';
            }
        });
        */
        
        // Solo log de autenticación, sin cambiar la UI
        onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log('🔐 Usuario autenticado en Firebase Modular:', user.uid);
            } else {
                console.log('🔐 Usuario no autenticado en Firebase Modular');
                // Cancelar suscripción cuando el usuario se desconecta
                unsubscribeFromGameUpdates();
            }
        });
        
        console.log('✅ Observer de estado de autenticación configurado');
    } catch (error) {
        console.error('❌ Error al configurar observer de autenticación:', error);
    }
}

// Función para inicializar todo el sistema Firebase
function initializeFirebaseSystem() {
    try {
        console.log('🔄 Iniciando sistema Firebase...');
        console.log('🔍 Verificando disponibilidad de servicios...');
        
        // Esperar a que los servicios estén disponibles
        const checkServices = setInterval(() => {
            console.log('🔍 Verificando window.firebaseServices...', !!window.firebaseServices);
            
            if (window.firebaseServices) {
                clearInterval(checkServices);
                console.log('✅ Servicios Firebase disponibles, procediendo con inicialización...');
                
                // Inicializar Firebase
                initializeFirebase();
                
                // Configurar observer de autenticación
                setupAuthStateObserver();
                
                // Configurar observer de autenticación del juego
                setupGameAuthObserver();
                
                console.log('🚀 Sistema Firebase completamente inicializado');
            }
        }, 100);
        
        // Timeout de seguridad
        setTimeout(() => {
            if (!window.firebaseServices) {
                console.error('❌ Timeout: Firebase services no disponibles después de 10 segundos');
                console.error('🔍 Estado actual:', {
                    firebaseServices: !!window.firebaseServices,
                    firebaseServicesKeys: window.firebaseServices ? Object.keys(window.firebaseServices) : 'undefined'
                });
            }
        }, 10000);
        
    } catch (error) {
        console.error('❌ Error al inicializar sistema Firebase:', error);
    }
}

// Exportar todas las funciones para uso global
window.FirebaseModular = {
    // Inicialización
    initializeFirebaseSystem,
    initializeFirebase,
    getFirebaseServices,
    
    // Funciones del juego
    savePlayerDistribution,
    assignPlayerRoles,
    getPlayerDistribution,
    startRoundEnding,
    updatePlayerMovement,
    saveKillSelection,
    resetDeadsArray,
    updateQuestionCount,
    checkAllPlayersMoved,
    finalizeRound,
    
    // Suscripciones
    subscribeToGameUpdates,
    unsubscribeFromGameUpdates,
    
    // Estado del juego
    updateGameState,
    addPlayerMove,
    getPlayerMoves,
    
    // Sistema de bombas
    placeBomb,
    getBombLocation,
    validateBombPlacement,
    getBombEligibleRooms,
    checkBombDeaths,
    processBombDeaths,
    checkPreMovementBombDeaths,
    processPreMovementBombDeaths,
    
    // Autenticación
    signInAnonymously,
    getCurrentUser,
    signOut,
    setupAuthStateObserver
};

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFirebaseSystem);
} else {
    initializeFirebaseSystem();
}

console.log('📦 Firebase Modular configurado y listo para usar');
console.log('🔍 Estado de inicialización:', {
    documentReadyState: document.readyState,
    firebaseServicesAvailable: !!window.firebaseServices,
    firebaseModularAvailable: !!window.FirebaseModular
});

// Función para configurar el observer de autenticación del juego
function setupGameAuthObserver() {
    try {
        console.log('🎮 Configurando observer de autenticación del juego...');
        
        // Verificar que auth esté disponible
        if (!window.auth) {
            console.error('❌ Auth no disponible para el observer del juego');
            return;
        }
        
        // Configurar el observer de autenticación del juego
        window.auth.onAuthStateChanged(async (user) => {
            if (user) {
                console.log('🎮 Usuario autenticado en el juego:', user.uid);
                
                // Verificar si necesitamos mostrar la pantalla de selección del número de jugadores
                if (window.gameParams && window.gameParams.needsPlayerCountSelection) {
                    console.log('🎮 Mostrando pantalla de selección del número de jugadores después de autenticación');
                    if (typeof showPlayerCountSelectionScreen === 'function') {
                        showPlayerCountSelectionScreen(window.gameParams);
                    } else {
                        console.log('⚠️ Función showPlayerCountSelectionScreen no disponible');
                    }
                    return; // No continuar con el flujo normal del juego
                }
                
                // Verificar si necesitamos mostrar la pantalla de selección de jugador
                if (window.gameParams && window.gameParams.needsPlayerSelection) {
                    console.log('🎮 Mostrando pantalla de selección de jugador después de autenticación');
                    if (typeof showPlayerSelectionScreen === 'function') {
                        showPlayerSelectionScreen(window.gameParams);
                    } else {
                        console.log('⚠️ Función showPlayerSelectionScreen no disponible');
                    }
                    return; // No continuar con el flujo normal del juego
                }
                
                // Solo mostrar el juego si ya tenemos un número de jugador válido
                if (window.gameParams && typeof window.gameParams.playerNumber === 'number') {
                    console.log('🎮 Mostrando juego para jugador', window.gameParams.playerNumber);
                    
                    // Hide login section and show game content
                    const loginSection = document.getElementById('login-section');
                    const gameContent = document.getElementById('game-content');
                    const gameFooter = document.getElementById('game-footer');
                    
                    if (loginSection) loginSection.style.display = 'none';
                    if (gameContent) gameContent.style.display = 'block';
                    if (gameFooter) gameFooter.style.display = 'block';
                    
                    // Update user display
                    const userIdElement = document.getElementById('user-id');
                    if (userIdElement) userIdElement.textContent = user.uid;
                    
                    // Mostrar botón "TERMINAR RONDA" solo para jugador 1
                    const endRoundBtn = document.querySelector('.end-round-btn');
                    if (endRoundBtn && window.gameParams && window.gameParams.playerNumber === 1) {
                        endRoundBtn.style.display = 'block';
                    } else if (endRoundBtn) {
                        endRoundBtn.style.display = 'none';
                    }
                    
                    // Mostrar botón "REINICIAR JUEGO" solo para jugador 1
                    const restartBtn = document.getElementById('restart-game-btn');
                    if (restartBtn && window.gameParams && window.gameParams.playerNumber === 1) {
                        restartBtn.style.display = 'block';
                    } else if (restartBtn) {
                        restartBtn.style.display = 'none';
                    }
                    
                    // Configurar listener de conexión de Firestore
                    if (typeof setupFirestoreConnectionListener === 'function') {
                        setupFirestoreConnectionListener();
                    }
                    
                    // Solo recuperar distribución existente, no generar nueva
                    if (typeof retrieveExistingDistribution === 'function') {
                        await retrieveExistingDistribution();
                    }
                } else {
                    console.log('🎮 Usuario autenticado pero sin parámetros de juego válidos');
                    // Mantener en la pantalla de login hasta que se seleccione un jugador
                    const loginSection = document.getElementById('login-section');
                    if (loginSection) loginSection.style.display = 'block';
                }
                
            } else {
                console.log('🎮 Usuario no autenticado en el juego');
                
                // NO mostrar pantallas de selección sin autenticación
                // Solo mostrar la pantalla de login y esperar a que el usuario se autentique
                console.log('🎮 Usuario no autenticado, mostrando solo pantalla de login');
                
                // Asegurar que se muestre la pantalla de login
                const loginSection = document.getElementById('login-section');
                if (loginSection) loginSection.style.display = 'flex';
                
                // Ocultar otras pantallas
                const playerCountSection = document.getElementById('player-count-selection-section');
                const playerSelectionSection = document.getElementById('player-selection-section');
                const gameContent = document.getElementById('game-content');
                
                if (playerCountSection) playerCountSection.style.display = 'none';
                if (playerSelectionSection) playerSelectionSection.style.display = 'none';
                if (gameContent) gameContent.style.display = 'none';
                
                // Show login section and hide game content
                // loginSection ya está declarado arriba

                const gameFooter = document.getElementById('game-footer');
                
                if (loginSection) loginSection.style.display = 'block';
                if (gameContent) gameContent.style.display = 'none';
                if (gameFooter) gameFooter.style.display = 'none';
                
                // Reset user display
                const userIdElement = document.getElementById('user-id');
                if (userIdElement) userIdElement.textContent = 'Conectando...';
                
                // Actualizar estado de conexión como desconectado
                if (typeof updateConnectionStatus === 'function') {
                    updateConnectionStatus('disconnected', '🔴 No autenticado');
                }
            }
        });
        
        console.log('✅ Observer de autenticación del juego configurado');
    } catch (error) {
        console.error('❌ Error al configurar observer de autenticación del juego:', error);
    }
}

// Agregar la función al objeto global
window.FirebaseModular.setupGameAuthObserver = setupGameAuthObserver;