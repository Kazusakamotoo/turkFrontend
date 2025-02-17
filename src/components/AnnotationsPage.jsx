import React, { useEffect, useState } from "react";
import "../App.css";

const API_URL = "https://turkbackend.onrender.com";

const AnnotationsPage = () => {
  const [annotations, setAnnotations] = useState([]);

  useEffect(() => {
    fetchAnnotations();
  }, []);

  const fetchAnnotations = async () => {
    try {
      const response = await fetch(`${API_URL}/api/annotations`);
      const data = await response.json();
      setAnnotations(data);
    } catch (error) {
      console.error("Error fetching annotations:", error);
    }
  };

  return (
    <div className="annotations-container">
      <h1>All Annotations</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Worker ID</th>
            <th>Image ID</th>
            <th>Bounding Boxes</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {annotations.map((annotation) => (
            <tr key={annotation.id}>
              <td>{annotation.id}</td>
              <td>{annotation.worker_id}</td>
              <td>{annotation.image_id}</td>
              <td>{JSON.stringify(annotation.bounding_boxes)}</td>
              <td>{annotation.timestamp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AnnotationsPage;
