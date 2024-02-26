import React from "react";
import ReactDOM from "react-dom/client";
import { Route, BrowserRouter, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { MantineProvider, createTheme, rem } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import "@mantine/core/styles.css";
import "@mantine/core/styles/Notification.css";
import { App } from "./App";
import Modal from "react-modal";

const theme = createTheme({
  fontFamily: "Open Sans, sans-serif",
  primaryColor: "cyan",
  shadows: {
    md: "1px 1px 3px rgba(0, 0, 0, .25)",
    xl: "5px 5px 3px rgba(0, 0, 0, .25)",
  },
  headings: {
    fontFamily: "Roboto, sans-serif",
    sizes: {
      h1: { fontSize: rem(36) },
    },
  },
});

Modal.setAppElement("#root");

ReactDOM.createRoot(document.getElementById("root")!).render(
  // <React.StrictMode>
    <BrowserRouter>
      <MantineProvider theme={theme}>
        <Notifications
          limit={3}
          zIndex={1000}
          style={{
            position: "fixed",
            top: "10px",
            right: 0,
            width: "300px",
            padding: "5px",
          }}
        />
        <AuthProvider>
          <Routes>
            <Route path="/*" element={<App />} />
          </Routes>
        </AuthProvider>
      </MantineProvider>
    </BrowserRouter>,
  //</React.StrictMode>

);
