import { BrowserRouter, Routes, Route } from "react-router";
import { HomePage, CropPage } from "./pages";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/crop" element={<CropPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
