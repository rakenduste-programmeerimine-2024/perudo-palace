"use client";

import { useState, useEffect } from "react";
import { Typography, IconButton, Button } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { io } from 'socket.io-client';
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

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

//Täringute asetamine ekraanil
const dicePositions = [
    { top: "43%", left: "10%" },//vasak
    { top: "55%", left: "10%" },//vasak
    { top: "43%", left: "16%" },//vasak
    { top: "55%", left: "16%" },//vasak

    { top: "20%", right: "47%" },//ülemine
    { top: "20%", right: "41%" },//ülemine
    { top: "32%", right: "47%" },//ülemine
    { top: "32%", right: "41%" },//ülemine

    { bottom: "20%", left: "47%" },//alumine
    { bottom: "20%", left: "41%" },//alumine
    { bottom: "32%", left: "47%" },//alumine
    { bottom: "32%", left: "41%" },//alumine

    { bottom: "47%", right: "10%" },//parem
    { bottom: "35%", right: "10%" },//parem
    { bottom: "47%", right: "16%" },//parem
    { bottom: "35%", right: "16%" },//parem
  ];

//Bettimise UI jaoks ja mängu alustamise nuppu loogika
const GamePage: React.FC = () => {
  const [gameStarted, setGameStarted] = useState(false);

  const [players, setPlayers] = useState([
    { id: 1, name: "Player 1", bgImage: "url('/image/smile/smile.jpg')", position: "bottom" },
    { id: 2, name: "Player 2", bgImage: "url('/image/smile/smile2.jpg')", position: "right" },
    { id: 3, name: "Player 3", bgImage: "url('/image/smile/smile5.jpg')", position: "top" },
    { id: 4, name: "Player 4", bgImage: "url('/image/smile/smile6.jpg')", position: "left" },
  ]);

  const [bidNumber, setBidNumber] = useState(1); // Number 1-16
  const [diceValue, setDiceValue] = useState(1); // Dice face 1-6
  const [isTurn, setIsTurn] = useState(false);


  // Hoia täringute pildid seisundis
  const [randomDiceImages, setRandomDiceImages] = useState<string[]>([]);

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

  const handleAvatarClick = (clickedPlayerId: number) => {
    if (gameStarted) return;

    setPlayers((prevPlayers) => {
      const clickedIndex = prevPlayers.findIndex((player) => player.id === clickedPlayerId);
      const orderedPlayers = [...prevPlayers.slice(clickedIndex), ...prevPlayers.slice(0, clickedIndex)];
      const positions = ["bottom", "right", "top", "left"];

      return orderedPlayers.map((player, index) => ({
        ...player,
        position: positions[index],
      }));
    });
  };

  const handleStartGame = () => {
   try {
      setGameStarted(true);
      const newDiceImages = dicePositions.map(() => {
        const diceNumber = Math.floor(Math.random() * 6) + 1;
        return `/image/w_dice/dice${diceNumber}.png`;
      });
      setRandomDiceImages(newDiceImages);
   } catch (error) {
      console.error("Error placing bid:", error);
}
  };
  const handlePlaceBid = async (diceAmount: number, diceValue: number) => {
   if (isTurn){
      try {
         console.log("Placing bid...");
         console.log(`Dice Amount: ${diceAmount}, Dice Value: ${diceValue}`);
         socket.emit("placed-bid")
     } catch (error) {
         console.error("Error placing bid:", error);
     }
   }

};
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-green-900 relative">
      {!gameStarted ? (
        <>
          {/* Lobby vaade */}
          <div className="relative w-[58rem] h-[28rem] bg-table2-bg bg-center bg-cover flex items-center justify-center">
            {players.map((player) => (
              <div
                key={player.id}
                className={getPositionClasses(player.position)}
                onClick={() => handleAvatarClick(player.id)}
              >
                <Player name={player.name} bgImage={player.bgImage} clickable={!gameStarted} />
              </div>
            ))}
          </div>

          {/* Start Game nupp */}
          <div className="absolute bottom-[10rem] right-[5rem]">
            <Button
              variant="contained"
              color="success"
              onClick={handleStartGame}
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
          </div>
        </>
      ) : (
        <>
          {/* Mängu vaade */}
          <div className="relative w-[58rem] h-[28rem] bg-table2-bg bg-center bg-cover flex items-center justify-center">
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
                }}
              ></div>
            ))}
            {/*cups*/}
            {[
              { top: '41%', left: '10%' },  // Vasakul
              { top: '15%', right: '44%' }, // Üleval
              { bottom: '45%', right: '10%' } // Paremal
            ].map((style, index) => (
              <div
                key={index}
                className="absolute"
                style={{
                  ...style,
                  width: '6rem',
                  height: '6rem',
                  backgroundImage: "url('/image/cup1.png')",
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                }}
              ></div>
            ))}

            {players.map((player) => (
              <div key={player.id} className={getPositionClasses(player.position)}>
                <Player name={player.name} bgImage={player.bgImage} hearts={3} />
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
            <div className="text-4xl font-bold text-center">{bidNumber}</div>
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
            <div className="text-4xl font-bold text-center">🎲 {diceValue}</div>
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
            <div className="text-4xl font-bold">{bidNumber}</div>
            <div className="text-4xl font-bold">X</div>
            <div
            className="w-16 h-16 bg-cover bg-center"
            style={{
                backgroundImage: `url('/image/dice/dice${diceValue}.png')`,
            }}
            ></div>
        </div>
        <button 
         onClick={handlePlaceBid(setBidNumber,setDiceValue)} 
         className="bg-green-600 px-4 py-2 rounded-lg hover:bg-green-500 font-bold">
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
            <span className="text-white text-lg font-semibold mt-2">Challenge</span>
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
            <span className="text-white text-lg font-semibold mt-2">Bullseye</span>
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

const Player: React.FC<PlayerProps> = ({ name, bgImage, hearts, clickable }) => {
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
        className="w-16 h-16 rounded-full"
        style={{
          backgroundImage: bgImage,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: "transparent",
        }}
      />
      <Typography variant="body1" className="font-semibold text-white">
        {name}
      </Typography>
    </div>
  );
};

export default GamePage;
