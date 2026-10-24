import { Toaster } from "sonner";
import { RouterProvider } from "react-router-dom";
import { router } from "./app/router";
function App() {
  return (
    <>

      <Toaster
        position="top-right"
        richColors
        duration={3000}
        closeButton
      />


      <RouterProvider router={router} />;


    </>
  );
}

export default App;