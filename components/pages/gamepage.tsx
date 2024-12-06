"use client"

import { useState, useEffect } from "react";
import { Typography, IconButton, Button } from "@mui/material";
import { io } from 'socket.io-client';
import { useRouter, useSearchParams } from "next/navigation";

const socket = io("http://localhost:3030");

//Täringute asetamine ekraanil
const dicePositions = [
  // Define täringu positsioonid
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

//Bettimise UI jaoks ja mängu alustamise nuppu loogika
const GamePage: React.FC = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomCode = searchParams.get("roomCode");
  const playerName = searchParams.get("playerName");
  const [isHost, setIsHost] = useState(false);
  const [players, setPlayers] = useState<{ id: number; name: string; bgImage: string; position: string }[]>([]);
  const [diceNumber, setDiceNumber] = useState(1); // Number 1-16
  const [diceValue, setDiceValue] = useState(1); // Dice face 1-6
  const [isTurn, setIsTurn] = useState(false);
  const [randomDiceImages, setRandomDiceImages] = useState<string[]>([]); // Hoia täringute pildid seisundis
  const [playerDiceImages, setPlayerDiceImages] = useState<
  { image: string; position: { bottom?: string; left?: string; top?: string; right?: string } }[]
>([]);
  const [isDisplayingDice, setDisplayingDice] = useState(false);
  const [hasDice, setHasDice] = useState(false);

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

    socket.on("generate-dice", (dice) => {
      if (hasDice) { return; }
      setHasDice(true);

      let arrayValue = 0;
      let diceValue = 0;

      const diceImages = dicePositions.filter((_, index) => index < dice.length * 4).map(() => {
        const diceNumber = dice[arrayValue][diceValue]; // Vahemik 1-6

        diceValue++;
        if (diceValue > 3) {diceValue = 0; arrayValue++; }

        return `/image/w_dice/dice${diceNumber}.png`;
      });

      console.log("All dice: " + diceImages);
      setRandomDiceImages(diceImages);
    });

    socket.on("display-player-dice", (playerNumber, userName, dice, position) =>{
      if (userName !== playerName) { return; }

      console.log("Player pos: ",  position);

      //leiab õige mängja positsiooni lauas ja selle järgi paneme ka täringud
      const cplayerPosition = position;
      console.log("antud positsioon:" + position)
      if (!cplayerPosition || !["bottom", "left", "top", "right"].includes(cplayerPosition)) {
        console.error("Invalid player position:", cplayerPosition);
      }
      
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
      const [start, end] = positionMap[cplayerPosition as "bottom" | "left" | "top" | "right"] || [0, 4];
      const diceImagesWithPositions = dicePositions.slice(start, end).map((position, index) => {
         const diceNumber = playerSet[index]; // Get the dice number for this position
         return {
           image: `/image/w_dice/dice${diceNumber}.png`,
           position, // Include the position data from dicePositions
         };
       });
       
       // Update the state
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

    socket.on("display-hearts", (lives, players) => {
      for (let i = 0; i < lives.length; i++) {
        const lifeIndicator = lives[i];
        const playerName = players[i];

        console.log("Player " + playerName + " has " + lifeIndicator + " lives left!")
      }
    });

    socket.on("display-turn", (turns, names) => {
      for (let i = 0; i < turns.length; i++) {

        const turnIndicator = turns[i];
        const userName = names[i];
        
        if (turnIndicator && userName == playerName){
          setIsTurn (true);
          console.log("Your turn!");
          break;
        }
        else{
          setIsTurn(false);
        }
      }
    });

    socket.on("display-current-bid", (activeBid) => {
      console.log("Displaying current bid: " + activeBid.diceAmount + " : " + activeBid.diceValue);
    });

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
    if (diceNumber < 16) setDiceNumber(diceNumber + 1);
  };
  const decreaseBid = () => {
    if (diceNumber > 1) setDiceNumber(diceNumber - 1);
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
    console.log(`Dice Amount: ${diceNumber}, Dice Value: ${diceValue}`);
    socket.emit("placed-bid", { roomCode, bidNumber: diceNumber, diceValue });
  };

  const handleBidCheck = (response: boolean) => {
    if (isTurn){
      console.log("Challenging bid...");
      socket.emit("check-bid", { response, roomCode });
    }
  };
  
  //#endregion

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-gray-800 relative">
      {!gameStarted ? (
        <>
          {/* Lobby vaade */}
          <div className="relative w-[58rem] h-[28rem] bg-table2-bg bg-center bg-cover flex items-center justify-center">
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
                      clickable={!gameStarted}
                      hearts={3}
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
            {/* Ootamisala, enne positsioonide valimist */}
            <div className="absolute top-0 left-0 flex flex-col items-center space-y-4">
              {players
                .filter((player) => !player.position)
                .map((player) => (
                  <Player
                    key={player.id}
                    name={player.name}
                    bgImage={player.bgImage}
                    clickable={!gameStarted}
                    hearts={3}
                  />
                ))}
            </div>
          </div>

          {/* Start Game ja Leave nupp */}
          <div className="absolute bottom-[10rem] right-[5rem]">
            {!isHost ? (
              <p>Waiting for the host to start the game...</p>
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
                {randomDiceImages.map((diceImage, index) => (
                  <div
                    key={index}
                    className="absolute"
                    style={{
                      ...dicePositions[index],
                      width: "3rem",
                      height: "3rem",
                      backgroundImage: `url('${diceImage}')`,
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
                        width: "3rem",
                        height: "3rem",
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
                {[
                  { top: "41%", left: "10%" }, // Vasakul
                  { top: "15%", right: "44%" }, // Üleval
                  { bottom: "45%", right: "10%" }, // Paremal
                  //{ bottom: "15%", right: "44%" } // all
                ].map((style, index) => (
                  <div
                    key={index}
                    className="absolute"
                    style={{
                      ...style,
                      width: "6rem",
                      height: "6rem",
                      backgroundImage: "url('/image/cup1.png')",
                      backgroundSize: "contain",
                      backgroundRepeat: "no-repeat",
                    }}/>
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
                  hearts={3}
                  clickable={true}
                  
                />
              </div>
            ))}
          </div>

          {/* Bid Number ja Dice Face Selector */}
          <div
            className="absolute bottom-[2rem] right-[5rem] flex flex-col items-center space-y-4 bg-gray-800 text-white p-6 rounded-lg"
            style={{ width: "240px", height: "350px" }} // Kindel laius ja kõrgus
          >
            <h1 className="text-2xl font-bold">Your Bid</h1>
            <div className="flex items-center justify-center space-x-8">
              {/* Bid Number Selector */}
              <div className="flex flex-col items-center">
                <button
                  className="text-lg font-bold bg-gray-700 p-2 rounded hover:bg-gray-600"
                  onClick={increaseBid}
                >
                  ↑
                </button>
                <div className="text-4xl font-bold text-center">
                  {diceNumber}
                </div>
                <button
                  className="text-lg font-bold bg-gray-700 p-2 rounded hover:bg-gray-600"
                  onClick={decreaseBid}
                >
                  ↓
                </button>
              </div>
              {/* Dice Face Selector */}
              <div className="flex flex-col items-center">
                <button
                  className="text-lg font-bold bg-gray-700 p-2 rounded hover:bg-gray-600"
                  onClick={increaseDice}
                >
                  ↑
                </button>
                <div className="text-4xl font-bold text-center">
                  🎲 {diceValue}
                </div>
                <button
                  className="text-lg font-bold bg-gray-700 p-2 rounded hover:bg-gray-600"
                  onClick={decreaseDice}
                >
                  ↓
                </button>
              </div>
            </div>
            {/* Dice Image Section */}
            <div className="mt-4 flex items-center justify-center space-x-4">
              <div className="text-4xl font-bold">{diceNumber}</div>
              <div className="text-4xl font-bold">X</div>
              <div
                className="w-16 h-16 bg-cover bg-center"
                style={{
                  backgroundImage: `url('/image/dice/dice${diceValue}.png')`,
                }}
              ></div>
            </div>
            <button 
              className="bg-green-600 px-4 py-2 rounded-lg hover:bg-green-500 font-bold"
              onClick={() => handlePlaceBid()}>
              Place Bid
            </button>
          </div>
          {/* Sword ja Arrow nupud */}
          <div className="absolute bottom-[7rem] left-[10rem] flex space-x-6 items-center">
            {/* Sword nupp ja tekst */}
            <div className="flex flex-col items-center">
              <IconButton
                color="primary"
                sx={{
                  fontSize: 40,
                  width: "150px", // määrab laiuse
                  height: "150px", // määrab kõrguse
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onClick={() => handleBidCheck(true)}
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
                  fontSize: 40,
                  width: "150px", // määrab laiuse
                  height: "150px", // määrab kõrguse
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onClick={() => handleBidCheck(false)}
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
      return "absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-32";
    case "top":
      return "absolute top-[-1rem] left-1/2 transform -translate-x-1/2 -translate-y-32";
    case "right":
      return "absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-32";
    case "bottom":
      return "absolute bottom-[-2rem] left-1/2 transform -translate-x-1/2 translate-y-32";
    default:
      return "";
  }
};

//Mängjate profiilid
interface PlayerProps {
  name: string;
  bgImage: string;
  hearts?: number;
  clickable?: boolean;
}

const Player: React.FC<{
  name: string;
  bgImage: string;
  hearts: number;
  clickable: boolean;
  
}> = ({ name, bgImage, clickable, hearts }) => {
  return (
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
  );
};

export default GamePage;
