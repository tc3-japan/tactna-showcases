import { RouterProvider } from "react-router-dom";
import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "@emotion/react";
import theme from "./theme";
import router from "./router";

export const App = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <RouterProvider router={router} />
  </ThemeProvider>
);

export default App;
