import React from "react";

const COMPLETION_CODE =  Math.floor(10000 + Math.random() * 90000);
const CompletionPage = () => {
  return (
    <div className="completion-container">
      <h1>Task Completed</h1>
      <h2>Your survey code:</h2>
      <p className="completion-code">{COMPLETION_CODE}</p>
    </div>
  );
};

export default CompletionPage;
