"use client";

import React, { useEffect } from "react";
import { Button } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { io } from "socket.io-client";

const Restart = () => {
  const handlePlayAgain = () => {
  };

  const handleLeaveRoom = () => {
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800 text-white space-y-8">
      <h1 className="text-4xl font-bold">Game Over</h1>
      <p className="text-lg">What would you like to do next?</p>
      <div className="flex flex-col space-y-4">
        <Button
          variant="contained"
          color="success"
          onClick={handlePlayAgain}
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
          PLAY AGAIN
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleLeaveRoom}
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
    </div>
  );
};

export default Restart;
