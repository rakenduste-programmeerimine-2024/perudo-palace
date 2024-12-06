"use client";
import { useState, useEffect } from "react";
import { Typography, IconButton, Button } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { io } from "socket.io-client";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import GameOverModal from "../GameOverModal"; // Veendu, et failitee oleks õige

const socket = io("http://localhost:3030");

//otse create koodist
// const [hostName, setHostName] = useState("");
// const [roomCode, setRoomCode] = useState("");
// const [error, setError] = useState("");
// const router = useRouter();
// const supabase = createClient();
// const [socketId, setSocketId] = useState<string>("");

// useEffect(() => {
//    socket.on("connect", () => {
//      console.log("Connected to socket server, socket ID:", socket.id);

//      setSocketId(socket.id as string);
//    });

//    socket.on("room-error", (message) => {
//      setError(message);
//    });

//    socket.on("room-created", (roomCode) => {
//      router.push(`/room?roomCode=${roomCode}&playerName=${hostName}`);
//    });

//    return () => {
//      socket.off("connect");
//      socket.off("room-error");
//      socket.off("room-created");
//    };
//  }, [router, hostName]);
//lõpp

// display all players dices
socket.on("display-all-dices", (dice) => {});

// display this player dices
socket.on("display-player-dices", (userId) => {});

// display all hearts (minus need mis on maha lainud)
socket.on("display-hearts", (lives) => {});

// display hetkest turni
socket.on("display-turn", (turns) => {});

// display hetkest turni
socket.on("display-current-bid", (activeBid) => {});

// display current action
socket.on("display-action", (action) => {});

//Täringute asetamine ekraanil
const dicePositions = [
  // Define täringu positsioonid
  { top: "43%", left: "10%" }, //vasak
  { top: "55%", left: "10%" }, //vasak
  { top: "43%", left: "16%" }, //vasak
  { top: "55%", left: "16%" }, //vasak

  { top: "20%", right: "47%" }, //ülemine
  { top: "20%", right: "41%" }, //ülemine
  { top: "32%", right: "47%" }, //ülemine
  { top: "32%", right: "41%" }, //ülemine

  { bottom: "20%", left: "47%" }, //alumine
  { bottom: "20%", left: "41%" }, //alumine
  { bottom: "32%", left: "47%" }, //alumine
  { bottom: "32%", left: "41%" }, //alumine

  { bottom: "47%", right: "10%" }, //parem
  { bottom: "35%", right: "10%" }, //parem
  { bottom: "47%", right: "16%" }, //parem
  { bottom: "35%", right: "16%" }, //parem
];

//Bettimise UI jaoks ja mängu alustamise nuppu loogika
const GamePage: React.FC = () => {
  const [isGameOver, setIsGameOver] = useState(false);
  const handlePlayAgain = () => {
  };
  const [gameStarted, setGameStarted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomCode = searchParams.get("roomCode");
  const playerName = searchParams.get("playerName");
  const [isHost, setIsHost] = useState(false);
  const [players, setPlayers] = useState<
    { id: number; name: string; bgImage: string; position: string }[]
  >([]);

  const [bidNumber, setBidNumber] = useState(1); // Number 1-16
  const [diceValue, setDiceValue] = useState(1); // Dice face 1-6
  const [isTurn, setIsTurn] = useState(false);

  //   const [players, setPlayers] = useState([
  //     { id: 1, name: "Player 1", bgImage: "url('/image/smile/smile.jpg')", position: "bottom" },
  //     { id: 2, name: "Player 2", bgImage: "url('/image/smile/smile2.jpg')", position: "right" },
  //     { id: 3, name: "Player 3", bgImage: "url('/image/smile/smile5.jpg')", position: "top" },
  //     { id: 4, name: "Player 4", bgImage: "url('/image/smile/smile6.jpg')", position: "left" },
  //   ]);

  // Hoia täringute pildid seisundis
  const [randomDiceImages, setRandomDiceImages] = useState<string[]>([]);

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

  // Ruumi loogika useEffect eraldi
  useEffect(() => {
    if (!roomCode || !playerName) {
      router.push("/");
      return;
    }

    socket.emit("update-room", roomCode);

    // Update'i mängijaid
    const positions = ["bottom", "right", "top", "left"];

    const assignPlayerData = (playersList: string[]) =>
      playersList.map((name, index) => ({
        id: index,
        name,
        bgImage: `/image/smile/smile${(index % 6) + 1}.jpg`, // Prgu käi lihtsalt pildid läbi
        position: "", // Algselt pole kellelgil positsiooni
      }));

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

    return () => {
      socket.off("update-positions");
      socket.off("current-players");
      socket.off("player-joined");
      socket.off("player-left");
    };
  }, [roomCode, playerName, router]);

  // Genereeri täringute pildid ainult üks kord
  useEffect(() => {
    const initialDiceImages = dicePositions.map(() => {
      const diceNumber = Math.floor(Math.random() * 6) + 1; // Vahemik 1-6
      return `/image/w_dice/dice${diceNumber}.png`;
    });
    setRandomDiceImages(initialDiceImages);
  }, []);

  const increaseBid = () => {
    if (bidNumber < 16) setBidNumber(bidNumber + 1);
  };
  const decreaseBid = () => {
    if (bidNumber > 1) setBidNumber(bidNumber - 1);
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
  //vb roomCode on stringina mdea prg

  const handleStartGame = (roomCode: number) => {
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

    setPlayers(orderedPlayers); // Update players to reflect the playing order
    setGameStarted(true);

    // Generate dice images for the game
    const newDiceImages = dicePositions.map(() => {
      const diceNumber = Math.floor(Math.random() * 6) + 1;
      return `/image/w_dice/dice${diceNumber}.png`;
    });
    setRandomDiceImages(newDiceImages);

    // setGameStarted(true);
    // const newDiceImages = dicePositions.map(() => {
    //   const diceNumber = Math.floor(Math.random() * 6) + 1;
    //   return `/image/w_dice/dice${diceNumber}.png`;
    // });
    // setRandomDiceImages(newDiceImages);
  };

  const handleLeaveRoom = () => {
    socket.emit("leave-room", roomCode, playerName);
    setPlayers([]);
    router.push("/");
  };

  const handlePlaceBid = async (
    roomCode: number,
    diceAmount: number,
    diceValue: number
  ) => {
    if (isTurn) {
      try {
        console.log("Placing bid...");
        console.log(`Dice Amount: ${diceAmount}, Dice Value: ${diceValue}`);
        socket.emit("placed-bid", { roomCode, diceAmount, diceValue });
      } catch (error) {
        console.error("Error placing bid:", error);
      }
    }
  };
  const handleBidCheck = async (response: boolean, roomCode: number) => {
    if (isTurn) {
      try {
        console.log("Challenging bid...");
        socket.emit("check-bid", { response, roomCode });
      } catch (error) {
        console.error("Error placing bid:", error);
      }
    }
  };

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
          <div className="absolute bottom-[10rem] right-[5rem]">
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
                onClick={() => handleStartGame(roomCode)}
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
              onClick={() => handleLeaveRoom(roomCode)}
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
          <div className="relative w-[38.7rem] h-[18.7rem] bg-table2-bg bg-center bg-cover flex items-center justify-center">
            {randomDiceImages.map((diceImage, index) => (
              <div
                key={index}
                className="absolute"
                style={{
                  ...dicePositions[index],
                  width: "2rem",
                  height: "2rem",
                  backgroundImage: `url('${diceImage}')`,
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                }}
              ></div>
            ))}
{/*             
            /*cups*/}
            {[
              { top: "41%", left: "10%" }, // Vasakul
              { top: "15%", right: "44%" }, // Üleval
              { bottom: "45%", right: "10%" }, // Paremal
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
                }}
              ></div>
            ))}
 
            {players.map((player) => (
              <div
                key={player.id}
                className={getPositionClasses(player.position)}
              >
                <Player
                  name={player.name}
                  bgImage={player.bgImage}
                  hearts={3}
                />
              </div>
            ))}
          </div>

          {/* Bid Number ja Dice Face Selector */}
          <div
            className="absolute bottom-[3rem] right-[2rem] flex flex-col items-center bg-grey-900 text-white p-6 rounded-lg"
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
                <div className="text-3xl font-bold">{bidNumber}</div>
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
            <button className="bg-green-600 px-4 py-2 rounded-lg hover:bg-green-500 font-bold mt-6">
              Place Bid
            </button>
          </div>

          {/* Sword ja Arrow nupud */}
          <div className="absolute bottom-[4rem] left-[4rem] flex space-x-4 items-center">
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
                  onPlayAgain={handlePlayAgain}
                  onLeaveRoom={handleLeaveRoom}
                  winnerName="John Doe" // Näidis-võitja nimi
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
interface PlayerProps {
  name: string;
  bgImage: string;
  hearts?: number;
  clickable?: boolean;
}

const Player: React.FC<{
  name: string;
  bgImage: string;
  hearts?: number;
  clickable: boolean;
}> = ({ name, bgImage,hearts, clickable }) => {
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
