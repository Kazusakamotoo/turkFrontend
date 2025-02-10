import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import BoundingBoxAnnotation from "./components/BoundingBoxAnnotation";
import CompletionPage from "./components/CompletionPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BoundingBoxAnnotation />} />
        <Route path="/completion" element={<CompletionPage />} />
      </Routes>
    </Router>
  );
}

export default App;
