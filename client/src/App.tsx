import { Toaster } from "sonner";
import { RouterProvider } from "react-router-dom";
import { router } from "./app/router";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        richColors
        duration={3000}
        closeButton
      />

      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;