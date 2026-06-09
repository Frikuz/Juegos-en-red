export function createMatchmakingService(gameRoomService) {
  const queue = [];
  const AVAILABLE_POWERUPS = ["speed", "slow", "ice"];

  function joinQueue(ws) {
    if (queue.some(player => player.ws === ws)) return;
    queue.push({ ws });
    ws.send(JSON.stringify({ type: 'queueStatus', status: 'waiting' }));
    tryMatch();
  }

  function leaveQueue(ws) {
    const index = queue.findIndex(player => player.ws === ws);
    if (index !== -1) queue.splice(index, 1);
  }

  function tryMatch() {
    if (queue.length >= 2) {
      const p1 = queue.shift();
      const p2 = queue.shift();

      // Creamos sala sin bola
      const roomId = gameRoomService.createRoom(p1.ws, p2.ws);
      
      // 3. Enviamos la lista 'initialPowerUps' a ambos jugadores
      p1.ws.send(JSON.stringify({ 
          type: 'gameStart', 
          role: 'player1', 
          roomId, 
      }));
      
      p2.ws.send(JSON.stringify({ 
          type: 'gameStart', 
          role: 'player2', 
          roomId,
      }));
    }
}

  return { joinQueue, leaveQueue };
}