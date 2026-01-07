/**
 * Game Room service - Lógica específica de CARRERAS
 */
export function createGameRoomService() {
  const rooms = new Map();
  let nextRoomId = 1;

  function createRoom(player1Ws, player2Ws) {
    const roomId = `room_${nextRoomId++}`;
    
    const room = {
      id: roomId,
      active: true,
      players: {
        player1: { ws: player1Ws, laps: 0, finished: false },
        player2: { ws: player2Ws, laps: 0, finished: false }
      }
    };

    rooms.set(roomId, room);
    // Guardamos el ID de la sala en el propio socket para recuperarlo rápido luego
    player1Ws.roomId = roomId;
    player2Ws.roomId = roomId;

    return roomId;
  }

  // Recibimos posición (x, y, ángulo) y se la enviamos al rival
  function handlePlayerMove(ws, data) {
    const roomId = ws.roomId;
    if (!roomId) return;

    const room = rooms.get(roomId);
    if (!room || !room.active) return;

    // Identificar quién envía y quién recibe
    const isPlayer1 = room.players.player1.ws === ws;
    const opponent = isPlayer1 ? room.players.player2.ws : room.players.player1.ws;

    if (opponent.readyState === 1) { // WebSocket.OPEN
      opponent.send(JSON.stringify({
        type: 'playerUpdate',
        x: data.x,
        y: data.y,
        angle: data.angle,
        speed: data.speed
      }));
    }
  }

  // === CORREGIDO: Lógica para reenviar el golpe ===
  function handlePlayerHit(senderWs, data) {
      // 1. Usamos ws.roomId (igual que en handlePlayerMove)
      const roomId = senderWs.roomId;
      if (!roomId) return;

      const room = rooms.get(roomId);
      if (!room || !room.active) return;

      // 2. Identificamos al oponente (igual que arriba)
      // Como players es un OBJETO, no podemos usar forEach.
      const isPlayer1 = room.players.player1.ws === senderWs;
      const opponent = isPlayer1 ? room.players.player2.ws : room.players.player1.ws;

      // 3. Enviamos el golpe SOLO al oponente
      if (opponent.readyState === 1) {
        opponent.send(JSON.stringify({
          type: 'playerHit',
          velocityX: data.velocityX,
          velocityY: data.velocityY
        }));
      }
  }

  // Gestionar fin de carrera (cuando alguien gana)
  function handleRaceFinish(ws) {
    const roomId = ws.roomId;
    if (!roomId) return;
    const room = rooms.get(roomId);
    if (!room || !room.active) return;

    const isPlayer1 = room.players.player1.ws === ws;
    const winnerId = isPlayer1 ? 'player1' : 'player2';

    // Avisar a ambos que hay un ganador
    const gameOverMsg = JSON.stringify({
      type: 'gameOver',
      winner: winnerId
    });

    room.players.player1.ws.send(gameOverMsg);
    room.players.player2.ws.send(gameOverMsg);

    room.active = false; // Cerrar sala
  }

  function handleDisconnect(ws) {
    const roomId = ws.roomId;
    if (!roomId) return;

    const room = rooms.get(roomId);
    if (!room) return;

    if (room.active) {
      const isPlayer1 = room.players.player1.ws === ws;
      const opponent = isPlayer1 ? room.players.player2.ws : room.players.player1.ws;

      if (opponent.readyState === 1) {
        opponent.send(JSON.stringify({ type: 'opponentDisconnected' }));
      }
    }
    room.active = false;
    rooms.delete(roomId);
  }

  // === IMPORTANTE: Añadimos handlePlayerHit al return ===
  return {
    createRoom,
    handlePlayerMove,
    handlePlayerHit, // <--- AHORA SÍ ESTÁ DISPONIBLE PARA index.js
    handleRaceFinish,
    handleDisconnect
  };
}