"use client";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import React from "react";

const theme = createTheme({
  palette: {
    primary: {
      main: "#FFA500", // Oranž
    },
    secondary: {
      main: "#FFA500",
    },
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#FFA500", // Fokusel oranž äär
          },
        },
        notchedOutline: {
          borderColor: "#FFA500", // Tavaline oranž äär
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "#FFA500", // Label värv
          "&.Mui-focused": {
            color: "#FFA500", // Fokusel label oranž
          },
        },
      },
    },
  },
});

export function MuiThemeProvider({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
