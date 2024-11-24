//Mängjate array, mis tuleb serverisse lykkata rav, mille täidad socketio'ga lobby kaudu. Selle järgi on ka kõik muud mängu loogika jaoks vajalikud arrayd mängjate arvuga sobivalt täidetud loodetavasti.
export const players = ["Player1","Player2","Player3","Player4"];
//siin sama lugu, et jälgida kelle mängija turn on
export const turns = Array(players.length).fill(false);
//siin sama lugu, et jälgida iga mängjia täringud
export const dice = Array(players.length).fill(null).map(() => Array(4).fill(1));
//Elude jälgimine
export const lives = Array(players.length).fill(3);
//Aktiivse Bluffi objekt, jälgib ka kes tegi viimase bluffi indeksi
export const activeBluff = {diceValue:1, diceAmount:1, playerIndex:0};

//Ütleb kellel on turn, teeb kõik täringu veeretused
export function handleGameStart() {  
   turns = Array(players.length).fill(false);
   dice = Array(players.length).fill(null).map(() => Array(4).fill(1));
   lives = Array(players.length).fill(3);
   //Kõikidele mängjatele täringute veeretamine
   handleDiceRolls(dice);
   //Mängu alguse turni seadmine
   handleTurns(turns);
}
//Muudab kelle turn on olenevat sellest kelle turn prg on
export function handleTurns(turnArray) {
   for (let i = 0; i < turnArray.length; i++) {
      // Mängu algus: paned 1. mängja käigu trueks
      if (!turnArray.includes(true)) {
         turnArray[0] = true;
         return turnArray;
      }

      // Otsin mängjate kelle turn on prg
      if (turnArray[i] === true) {
         turnArray[i] = false;
         // Panen turni järgmisele mängjale
         if (i + 1 < turnArray.length) {
            turnArray[i + 1] = true;
         } else {
            // Kui mängija on arrays viimane paned essa mängja turni trueks
            turnArray[0] = true;
         }
         break;
      }
   }
   return turnArray;
}

//Kui mängija otsustab callida bluffi tõeseks või valeks, kontrollib üle kõik täringud, et kas see ühtib bluffiga
export function handleDiceCheck(response, diceArray, diceValue, diceAmount){
   let diceCounter = 0;
   //Käib läbi kõik täringud ja loetab, mitu kindlat täringut on
   for (let i = 0; i < diceArray.length; i++) {
      for (let j = 0; j < diceArray[i].length; j++) {
         if(diceArray[i][j] == diceValue){
            diceCounter++
         }
      }
  }
  //Muutujad, et lihtsalt elusid maha saaks võtta.
  const lastBlufferPlayer = activeBluff.playerIndex;
  const checkerPlayer = (lastBlufferPlayer + 1) % diceArray.length;

  //kontrollib kas leitud täringute arv ühtib sellege, mis on bluffis
  if(diceCounter == diceAmount){
   if (response === false){
      lives[checkerPlayer]--;
      if(lives[checkerPlayer == 0]){handlePlayerDeath(checkerPlayer)}
   }
   else{
      lives[lastBlufferPlayer]--;
      if(lives[lastBlufferPlayer == 0]){handlePlayerDeath(lastBlufferPlayer)}
   }
  }
  //Kui ei ühti
  else{
   if (response === false){
      lives[lastBlufferPlayer]--;
      if(lives[lastBlufferPlayer == 0]){handlePlayerDeath(lastBlufferPlayer)}
   }
   else{
      lives[checkerPlayer]--;
      if(lives[checkerPlayer == 0]){handlePlayerDeath(checkerPlayer)}
   }
  }
}

//Mängjia paneb enda käigu ajal mitu, missugust täringut on laual kokku tema arust. Need params väärtused tuleksid frontendist kust seda Bidi submititakse
export function handleDiceBidSubmit(roomCode, diceValue, diceAmount) {
   for (let i = 0; i < turns.length; i++) {
      if(turns[i] === true){
         playerIndex = i;
         break;
      }
   }
   //Määrab, mis Bid on prg laual (mitu täringut keegi (viimasena) arvab, et on laual prg)
   //Mis täringu väärtus (1,2,3,4,5,6)
   rooms[roomCode].activeBid.diceValue = diceValue;
   //Mitu seda täringut arvatakse et on laual
   rooms[roomCode].activeBid.diceAmount = diceAmount;
   rooms[roomCode].activeBid.playerIndex = playerIndex;
   handleTurns(turns);
}

//Veeretab mängu alguses, või kui round saab lõbi igale mängjale täringud.
export function handleDiceRolls(diceArray){
   for (let i = 0; i < diceArray.length; i++) {
      for (let j = 0; j < diceArray[i].length; j++) {
          diceArray[i][j] = Math.floor(Math.random() * 6) + 1;
      }
  }
  return diceArray;
}
// Vaatab kas mäng peaks läbi olema (ainult üks mängija on elus)
export function checkGameOver() {
   const activePlayers = lives.filter(life => life > 0).length;

   if (activePlayers === 1) {
      console.log("Game Over! Restarting game...");
      handleGameStart(); // Restardib mängu
   }
}
//Kui mängjal on elud 0 siis võtame ta mängu loogikast välja 
export function handlePlayerDeath(i){
   console.log(`Player ${players[i]} has been eliminated.`);

   turns.splice(i, 1);
   dice.splice(i, 1);
   lives.splice(i, 1);

   checkGameOver();
}