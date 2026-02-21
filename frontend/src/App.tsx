import { BrowserRouter, Routes, Route } from "react-router";
import { HomePage } from "@/pages/Home/HomePage";
import { CropPage } from "@/pages/Cropper/CropPage";

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
