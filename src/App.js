import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import BoundingBoxAnnotation from "./components/BoundingBoxAnnotation";
import CompletionPage from "./components/CompletionPage";
import AnnotationsPage from "./components/AnnotationsPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BoundingBoxAnnotation />} />
        <Route path="/completion" element={<CompletionPage />} />
        <Route path="/annotations" element={<AnnotationsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
