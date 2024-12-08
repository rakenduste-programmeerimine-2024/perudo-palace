"use client";
import { useState, useEffect } from "react";
import { Typography, IconButton, Button } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { io } from "socket.io-client";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import GameOverModal from "../GameOverModal"; // Veendu, et failitee oleks õige

const socket = io("http://localhost:3030");

//Täringute asetamine ekraanil
const dicePositions = [
  { bottom: "20%", left: "47%" }, //alumine
  { bottom: "20%", left: "41%" }, //alumine
  { bottom: "32%", left: "47%" }, //alumine
  { bottom: "32%", left: "41%" }, //alumine

  { top: "43%", left: "10%" }, //vasak
  { top: "55%", left: "10%" }, //vasak
  { top: "43%", left: "16%" }, //vasak
  { top: "55%", left: "16%" }, //vasak

  { top: "20%", right: "47%" }, //ülemine
  { top: "20%", right: "41%" }, //ülemine
  { top: "32%", right: "47%" }, //ülemine
  { top: "32%", right: "41%" }, //ülemine

  { bottom: "47%", right: "10%" }, //parem
  { bottom: "35%", right: "10%" }, //parem
  { bottom: "47%", right: "16%" }, //parem
  { bottom: "35%", right: "16%" }, //parem
];
//Cuppide asetamine ekraanil
const cupPositionsMap = {
   bottom: { top: "65%", right: "44%" }, // all

   left: { top: "41%", right: "80%" }, // Vasakul

   top:{ top: "15%", right: "44%" }, // Üleval

   right: { top: "41%", right: "10%" } // Paremal
}
//Bettimise UI jaoks ja mängu alustamise nuppu loogika
const GamePage: React.FC = () => {
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomCode = searchParams.get("roomCode");
  const playerName = searchParams.get("playerName");
  const [isHost, setIsHost] = useState(false);
  const [players, setPlayers] = useState<{ id: number; name: string; bgImage: string; position: string; hearts:number }[]>([]);
  const [diceAmount, setDiceNumber] = useState(1); // Number 1-16
  const [diceValue, setDiceValue] = useState(1); // Dice face 1-6
  const [isTurn, setIsTurn] = useState(false);
  const [allDiceImages, setAllDiceImages] = useState<
  { image: string; position: { bottom?: string; left?: string; top?: string; right?: string } }[]
   >([]); // Hoia täringute pildid seisundis
  const [playerDiceImages, setPlayerDiceImages] = useState<
  { image: string; position: { bottom?: string; left?: string; top?: string; right?: string } }[]
   >([]);
  const [isDisplayingDice, setDisplayingDice] = useState(false);
  const [hasDice, setHasDice] = useState(false);
  const [cupPositions, setCupPositions] = useState<
  { position: string, coordinates: {
      top: string;
      right: string;
      };}[]
   >([]);
   const [activeBidAmount, setActiveBidAmount] = useState(0);
   const [activeBidValue, setActiveBidValue] = useState(1);
   const [winner, setWinner] = useState("");
  //#region LISTENERS

  // starting
  useEffect(() => {
    socket.on("start-game", () => {
      setGameStarted(true);
      console.log("STARTED GAME!");
    });

    socket.on("room-host", (hostName: string) => {
      setIsHost(hostName === playerName);
    });

    return () => {
      socket.off("start-game");
      socket.off("room-host");
    };
  }, []);
  //test players
   useEffect(() => {
      console.log("Players after position update:", players);
   }, [players]);
  // Ruumi loogika useEffect eraldi
  useEffect(() => {
    if (!roomCode || !playerName) {
      router.push("/");
      return;
    }

    socket.emit("update-room", roomCode);

    // Update'i mängijaid
    const assignPlayerData = (playersList: string[]) =>
      playersList.map((name, index) => ({
        id: index,
        name,
        bgImage: `/image/smile/smile${(index % 6) + 1}.jpg`, // Prgu käi lihtsalt pildid läbi
        position: "", // Algselt pole kellelgil positsiooni
        hearts:3,
      }
    ));

    socket.on("current-players", (playersList: string[]) => {
      setPlayers(assignPlayerData(playersList));
    });

    socket.on("player-joined", (newPlayerName: string) => {
      if (!newPlayerName) return;
      setPlayers((prev) => {
        const updatedPlayers = [...prev.map((p) => p.name), newPlayerName];
        return assignPlayerData(updatedPlayers);
      });
    });

    socket.on("player-left", (leftPlayerName: string) => {
      setPlayers((prev) => {
        const updatedPlayers = prev
          .map((p) => p.name)
          .filter((name) => name !== leftPlayerName);
        return assignPlayerData(updatedPlayers);
      });
    });

    socket.on("update-positions", (updatedPositions) => {
      setPlayers((prevPlayers) =>
        prevPlayers.map((player, index) => {
          const positionKey = `position${index + 1}`;
          const newPosition = updatedPositions[positionKey];
          return {
            ...player,
            position: newPosition || "",
          };
        })
      );
    });
    
    //Kõikide täringud
    socket.on("generate-dice", (dice, playersNames, playersPositions) => {
      console.log("Received playersNames:", playersNames); // Verify it's an array
      console.log("Received dice:", dice);  // Verify dice data
      console.log("Received playersPositions:", playersPositions); // Verify positions data
      if (hasDice) { return; }
      //Minu arust seda ei ole üldse vaja
      //setHasDice(true);
      const namesArray = playersNames
      const positionMap: {
         "bottom": [number, number];
         "left": [number, number];
         "top": [number, number];
         "right": [number, number];
       } = {
         "bottom": [0, 4],
         "left": [4, 8],
         "top": [8, 12],
         "right": [12, 16],
       };
       for (let i = 0; i < namesArray.length; i++) {
         console.log("suutsin lugeda length, kuna esimene oli tühi playersNames")
         const playerPosition = playersPositions[`position${i + 1}`]; // Get the position for each player (position1, position2, etc.)
         const playerDice = dice[i]; // Get the player's dice
         
         // Skip if no dice or position available
         if (!playerDice || !playerPosition) {
           continue;
         }
         
         // Get the correct range from positionMap based on player position (bottom, left, top, right)
         const [start, end] = positionMap[playerPosition as "bottom" | "left" | "top" | "right"] || [0, 4];
     
         // Generate dice images with their positions
         const diceImagesWithPositions = dicePositions.slice(start, end).map((position, index) => {
           const diceNumber = playerDice[index]; // Get the dice number for this player
           return {
             image: `/image/w_dice/dice${diceNumber}.png`,
             position,
           };
         });
     
         // Save the dice positions in the state (for example, playerDiceImages)
         setAllDiceImages(prevImages => [
           ...prevImages,
           ...diceImagesWithPositions, // Add new dice with positions to the state
         ]);
       }
      // const diceImages = dicePositions.filter((_, index) => index < dice.length * 4).map(() => {
      //   const diceNumber = dice[arrayValue][diceValue]; // Vahemik 1-6

      //   diceValue++;
      //   if (diceValue > 3) {diceValue = 0; arrayValue++; }

      //   return `/image/w_dice/dice${diceNumber}.png`;
      // });

      // console.log("All dice: " + diceImages);
      // setAllDiceImages(diceImages);
    });

    //Iga mängija eraldi täringud
    socket.on("display-player-dice", (playerNumber, userName, dice, position) =>{
      if (userName !== playerName) { return; }

      //console.log("Player pos: ",  position);

      //leiab õige mängja positsiooni lauas ja selle järgi paneme ka täringud
      const playerPosition = position;
      //console.log("antud positsioon:" + position)
      if (!playerPosition || !["bottom", "left", "top", "right"].includes(playerPosition)) {
        console.error("Invalid player position:", playerPosition);
      }
      
      //Täringute positsoonide indexid oleneds mis kohas mängja on
      const positionMap: {
         "bottom": [number, number];
         "left": [number, number];
         "top": [number, number];
         "right": [number, number];
       } = {
         "bottom": [0, 4],
         "left": [4, 8],
         "top": [8, 12],
         "right": [12, 16],
       };

      //valib mis mängja täringuid näeb 
      const playerSet = dice[playerNumber];
       //vaatab mängjia indexit(playerNumber) ja võtab õiged kordinaadid objectist
      const [start, end] = positionMap[playerPosition as "bottom" | "left" | "top" | "right"] || [0, 4];
      const diceImagesWithPositions = dicePositions.slice(start, end).map((position, index) => {
         const diceNumber = playerSet[index]; //Võtab õige mängja täringuid
         return {
           image: `/image/w_dice/dice${diceNumber}.png`,
           position,
         };
       });

      // Filtreerin cuppide positsioonid
      const filteredCupPositions = Object.entries(cupPositionsMap)
      .filter(([cPosition]) => cPosition !== playerPosition)
      .map(([cPosition, coordinates]) => ({
        position: cPosition,
        coordinates: {
          top: `${coordinates.top}`,
          right: `${coordinates.right}`,
        },
      }));

      //console.log("cuppide kordinaadid?: ",filteredCupPositions)
      //salvestab kordinaadid, et neid saaks lehel kasutada
      setCupPositions(filteredCupPositions);
      setPlayerDiceImages(diceImagesWithPositions);
    });

    socket.on("hide-all-dices", () => {
      console.log("Hiding all dice!");

      setDisplayingDice(false);
    });

    socket.on("display-all-dices", () => {
      console.log("Displaying all dices!")
      
      setDisplayingDice(true);
    });

    socket.on("display-hearts", (lives, playerNames) => {
      for (let i = 0; i < lives.length; i++) {
        const lifeIndicator = lives[i];
        const playerName = playerNames[i];

        console.log("Player " + playerName + " has " + lifeIndicator + " lives left!")
      }
      setPlayers((prevPlayers) =>
         prevPlayers.map((player) => {
           const playerIndex = playerNames.indexOf(player.name); // Use the player's name to find the correct index
           return playerIndex !== -1
             ? { ...player, hearts: lives[playerIndex] } // Update hearts based on the correct index
             : player;
         })
      );
      
    });

    socket.on("display-turn", (turns, names) => {
      for (let i = 0; i < turns.length; i++) {

        const turnIndicator = turns[i];
        const userName = names[i];
        
        if (turnIndicator && userName == playerName){
          setIsTurn (true);
          console.log("Your turn!");
          //alert("Your turn!");
          break;
        }
        else{
          setIsTurn(false);
          console.log("Not your turn!");
          //alert("Not your turn!");
        }
      }
    });
    //Panem kõikidele mängjatele uue bidi
    socket.on("display-current-bid", (newBid) => {
      console.log("Displaying current bid: " + newBid.diceAmount + " : " + newBid.diceValue);
      setActiveBidAmount(newBid.diceAmount)
      setActiveBidValue(newBid.diceValue)
    });
    socket.on("game-over", (winner) => {
      setWinner(winner)
      setIsGameOver(true)
    })
    return () => {
      socket.off("update-positions");
      socket.off("current-players");
      socket.off("player-joined");
      socket.off("player-left");
      socket.off("hide-all-dice");
      socket.off("display-all-dices");
      socket.off("display-player-dices");
      socket.off("display-hearts");
      socket.off("display-turn");
      socket.off("display-current-bid");
    };
  }, [roomCode, playerName, router]);

  //#endregion

  //#region FUNCTIONS

  const increaseBid = () => {
    if (diceAmount < 16) setDiceNumber(diceAmount + 1);
  };
  const decreaseBid = () => {
    if (diceAmount > 1) setDiceNumber(diceAmount - 1);
  };
  const increaseDice = () => {
    if (diceValue < 6) setDiceValue(diceValue + 1);
  };
  const decreaseDice = () => {
    if (diceValue > 1) setDiceValue(diceValue - 1);
  };
  
  const handleAvatarClick = (clickedPosition: string) => {
    if (gameStarted) return;

    // Check, kas kooht on võetud
    const positionTaken = players.some(
      (player) => player.position === clickedPosition
    );

    if (positionTaken) {
      return;
    }

    // serverisse ka positisiooniinfo et teistel ka sync'iksid
    socket.emit("position-picked", {
      playerName,
      position: clickedPosition,
      roomCode,
    });

    setPlayers((prevPlayers) =>
      prevPlayers.map((player) =>
        player.name === playerName
          ? { ...player, position: clickedPosition }
          : player
      )
    );
  };

  const handleStartGame = () => {
    const playersWithoutPosition = players.filter((player) => !player.position);

    if (playersWithoutPosition.length > 0) {
      alert("All players must select a position before starting the game.");
      return;
    }

    socket.emit("start-game", roomCode);

    const order = ["bottom", "right", "top", "left"];

    // Ensure all players have a position and establish the playing order
    const orderedPlayers = players
      .filter((player) => order.includes(player.position)) // Filter players with valid positions
      .sort((a, b) => order.indexOf(a.position) - order.indexOf(b.position)); // Sort by position
    console.log("mängjiad enne start: " + players)
    setPlayers(orderedPlayers); // Update players to reflect the playing order
    console.log("mängjiad prst start: " + players)
    setGameStarted(true);
  };

  const handleLeaveRoom = () => {
    socket.emit("leave-room", roomCode, playerName);
    setPlayers([]);
    router.push("/");
  };

  const handlePlaceBid = () => {
    if (!isTurn) { return; }

    console.log("Placing bid...");
    console.log(`Dice Amount: ${diceAmount}, Dice Value: ${diceValue}`);
    socket.emit("placed-bid", { roomCode, diceAmount: diceAmount, diceValue: diceValue });
  };

  const handleBidCheck = (response: boolean) => {
    if (isTurn){
      console.log("Challenging bid...");
      socket.emit("check-bid", { response, roomCode });
      setHasDice(false)
    }
  };
  
  //#endregion

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-gray-800 relative">
      {!gameStarted ? (
        <>
          {/* Ootamisala, enne positsioonide valimist */}
          <div className="absolute top-50 left-0 flex flex-col items-center space-y-4 bg-black bg-opacity-50 p-4 rounded-lg max-h-full">
            {players
              .filter((player) => !player.position)
              .map((player) => (
                <div key={player.id} className="flex flex-col items-center">
                  <Player
                    key={player.id}
                    bgImage={player.bgImage}
                    clickable={!gameStarted}
                    name={""}
                  />
                  <span className="mt-2 text-white font-semibold">
                    {player.name}
                  </span>{" "}
                </div>
              ))}
          </div>
          {/* Lobby vaade */}
          <div className="relative w-[31rem] h-[15rem] bg-table2-bg bg-center bg-cover flex items-center justify-center">
            {["bottom", "right", "top", "left"].map((position) => {
              const playerInPosition = players.find(
                (player) => player.position === position
              );

              return (
                <div
                  key={position}
                  className={getPositionClasses(position)}
                  onClick={() => handleAvatarClick(position)}
                  style={{
                    cursor: gameStarted ? "default" : "pointer",
                  }}
                >
                  {playerInPosition ? (
                    <Player
                      name={playerInPosition.name}
                      bgImage={playerInPosition.bgImage}
                      hearts={playerInPosition.hearts}
                      clickable={!gameStarted}

                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center">
                      <Typography
                        variant="body1"
                        className="font-semibold text-white"
                      >
                        Empty
                      </Typography>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Start Game ja Leave nupp */}
          <div className="absolute top-[1rem] left-[7rem]">
            <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg w-full max-w-xs text-center">
              <p className="font-semibold text-lg">
                Room Code: <span className="font-bold">{roomCode}</span>
              </p>
            </div>
            {!isHost ? (
              <div className="bg-yellow-600 text-white p-4 rounded-md shadow-lg flex items-center space-x-3">
                <span className="font-semibold">⏳</span>
                <p className="text-lg font-semibold">
                  Waiting for the host to start the game...
                </p>
              </div>
            ) : (
              <Button
                variant="contained"
                color="success"
                onClick={() => handleStartGame()}
                sx={{
                  padding: "1rem 2rem",
                  fontSize: "1.25rem",
                  fontWeight: "bold",
                  backgroundColor: "#4CAF50",
                  "&:hover": {
                    backgroundColor: "#45A049",
                  },
                }}
              >
                START GAME
              </Button>
            )}

            <Button
              variant="contained"
              color="success"
              onClick={() => handleLeaveRoom()}
              sx={{
                padding: "1rem 2rem",
                fontSize: "1.25rem",
                fontWeight: "bold",
                backgroundColor: "#af4c4c",
                "&:hover": {
                  backgroundColor: "#a04545",
                },
              }}
            >
              LEAVE
            </Button>
          </div>
        </>
      ) : (
        <>
          {/* Mängu vaade */}
          <div className="relative w-[58rem] h-[28rem] bg-table2-bg bg-center bg-cover flex items-center justify-center">
            {/*dices*/}
            {isDisplayingDice ? (
              <>
                {allDiceImages.map((diceInfo, index) => (
                  <div
                    key={index}
                    className="absolute"
                    style={{
                      ...diceInfo.position,
                      width: "2rem",
                      height: "2rem",
                      backgroundImage: `url('${diceInfo.image}')`,
                      backgroundSize: "contain",
                      backgroundRepeat: "no-repeat",
                  }}/>
                ))}
              </>
            ) : (
              <>
                {playerDiceImages.map((diceImage, index) => (
                  <div
                     key={index}
                     className="absolute"
                     style={{
                        ...diceImage.position,
                        width: "2rem",
                        height: "2rem",
                        backgroundImage: `url('${diceImage.image}')`,
                        backgroundSize: "contain",
                        backgroundRepeat: "no-repeat",
                     }}
                  />
                  ))}
              </>
            )}
            {/*cups*/}
            {isDisplayingDice ? (
              <>
              </>
            ) : (
               <>
                  {cupPositions.map((cupPos, index) => (
                     <div
                        key={index}
                        className="absolute"
                        style={{
                        ...cupPos.coordinates, 
                        width: "6rem",
                        height: "6rem",
                        backgroundImage: "url('/image/cup1.png')",
                        backgroundSize: "contain",
                        backgroundRepeat: "no-repeat",
                        }}
                     />
                  ))}
               </>
            )}

            {players.map((player) => (
              <div
                key={player.id}
                className={getPositionClasses(player.position)}
              >
                <Player
                  name={player.name}
                  bgImage={player.bgImage}
                  hearts={player.hearts}
                  clickable={false}
                  
                />
              </div>
            ))}
          </div>
          
          {/* Current bid box */}
          <div
            className="absolute top-[1rem] left-[2rem] flex flex-col items-center bg-grey-900 text-white p-6 rounded-lg"
            style={{ width: "200px", height: "150px" }} // Kohandatud laius ja kõrgus
          >
            <h1 className="text-xl font-bold mb-4">Current Bid</h1>
            {/* Horisontaalne paigutus */}
            <div className="flex items-center justify-center space-x-4">
              {/* Bid Number */}
                <div className="text-3xl font-bold">{activeBidAmount}</div>
              </div>
              {/* "X" ikoon */}
              <div className="text-3xl font-bold">X</div>
              {/* Dice koos nooltega */}
              <div className="flex flex-col items-center">
                <div
                  className="w-16 h-16 bg-cover bg-center"
                  style={{
                    backgroundImage: `url('/image/dice/dice${activeBidValue}.png')`,
                  }}
                ></div>
              </div>
            </div>


          {/* Bid Number ja Dice Face Selector */}
          <div
            className="absolute bottom-[2rem] right-[2rem] flex flex-col items-center bg-grey-900 text-white p-6 rounded-lg"
            style={{ width: "200px", height: "310px" }} // Kohandatud laius ja kõrgus
          >
            <h1 className="text-xl font-bold mb-4">Your Bid</h1>
            {/* Horisontaalne paigutus */}
            <div className="flex items-center justify-center space-x-4">
              {/* Bid Number koos nooltega */}
              <div className="flex flex-col items-center">
                <button
                  className="text-lg font-bold bg-gray-700 p-2 rounded hover:bg-gray-600 mb-2"
                  onClick={increaseBid}
                >
                  ↑
                </button>
                <div className="text-3xl font-bold">{diceAmount}</div>
                <button
                  className="text-lg font-bold bg-gray-700 p-2 rounded hover:bg-gray-600 mt-2"
                  onClick={decreaseBid}
                >
                  ↓
                </button>
              </div>
              {/* "X" ikoon */}
              <div className="text-3xl font-bold">X</div>
              {/* Dice koos nooltega */}
              <div className="flex flex-col items-center">
                <button
                  className="text-lg font-bold bg-gray-700 p-2 rounded hover:bg-gray-600 mb-2"
                  onClick={increaseDice}
                >
                  ↑
                </button>
                <div
                  className="w-16 h-16 bg-cover bg-center"
                  style={{
                    backgroundImage: `url('/image/dice/dice${diceValue}.png')`,
                  }}
                ></div>
                <button
                  className="text-lg font-bold bg-gray-700 p-2 rounded hover:bg-gray-600 mt-2"
                  onClick={decreaseDice}
                >
                  ↓
                </button>
              </div>
            </div>
            {/* Place Bid nupp */}
            <button 
            className="bg-green-600 px-4 py-2 rounded-lg hover:bg-green-500 font-bold mt-6"
            onClick={() => handlePlaceBid()}>
              Place Bid
            </button>
          </div>
            
          {/* Sword ja Arrow nupud */}
          <div className="absolute bottom-[2rem] left-[4rem] flex space-x-4 items-center">
            {/* Sword nupp ja tekst */}
            <div className="flex flex-col items-center">
              <IconButton
                color="primary"
                sx={{
                  fontSize: 26.7,
                  width: "100px", // määrab laiuse
                  height: "100px", // määrab kõrguse
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onClick={() => handleBidCheck(false)}
              >
                <img
                  src="/image/sword.png"
                  alt="Sword"
                  style={{
                    width: "100%", // kohandab pildi suuruse nupu sees
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </IconButton>
              <span className="text-white text-lg font-semibold mt-2">
                Challenge
              </span>
            </div>

            {/* Arrow nupp ja tekst */}
            <div className="flex flex-col items-center">
              <IconButton
                color="primary"
                sx={{
                  fontSize: 26.7,
                  width: "100px", // määrab laiuse
                  height: "100px", // määrab kõrguse
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onClick={() => handleBidCheck(true)}
              >
                <img
                  src="/image/arrow.png"
                  alt="Arrow"
                  style={{
                    width: "100%", // kohandab pildi suuruse nupu sees
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </IconButton>
              <span className="text-white text-lg font-semibold mt-2">
                Bullseye
              </span>
            </div>
              {/* Läbipaistev endgame kast */}
              {isGameOver && (
              <div
                className="fixed inset-0 flex flex-col items-center justify-center text-white p-6 bg-grey-700 bg-opacity-80"
              >
                {/* GameOverModal komponent */}
                <GameOverModal
                  onPlayAgain={handleStartGame}
                  onLeaveRoom={handleLeaveRoom}
                  winnerName={`${winner}`} //Võitja nimi
                />
              </div>
              )}
          </div>
        </>
      )}
    </div>
  );
};
//CSS
const getPositionClasses = (position: string) => {
  switch (position) {
    case "left":
      return "absolute left-[3rem] top-1/2 transform -translate-y-1/2 -translate-x-32";
    case "top":
      return "absolute top-[2rem] left-1/2 transform -translate-x-1/2 -translate-y-32";
    case "right":
      return "absolute right-[3rem] top-1/2 transform -translate-y-1/2 translate-x-32";
    case "bottom":
      return "absolute bottom-[2rem] left-1/2 transform -translate-x-1/2 translate-y-32";
    default:
      return "";
  }
};

//Mängjate profiilid

const Player: React.FC<{
  name: string;
  bgImage: string;
  hearts?: number;
  clickable: boolean;
}> = ({ name, bgImage, hearts, clickable }) => {
  return (
    <div
    className={`flex flex-col items-center space-y-2 ${clickable ? "cursor-pointer" : ""}`}
  >
    {hearts && (
      <div className="flex space-x-1">
        {Array.from({ length: hearts }).map((_, index) => (
          <FavoriteIcon key={index} className="text-red-800" />
        ))}
      </div>
    )}
    <div
      className={`w-16 h-16 rounded-full border-4 ${
        clickable ? "cursor-pointer" : ""
      }`}
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Typography
        variant="body2"
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 font-bold text-white text-shadow"
      >
        {name}
      </Typography>
    </div>
    </div>
  );
}

export default GamePage;
