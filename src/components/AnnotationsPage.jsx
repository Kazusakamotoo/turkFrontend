import React, { useEffect, useState } from "react";
import "../App.css";

const API_URL = "https://turkbackendai.onrender.com";

const AnnotationsPage = () => {
  const [annotations, setAnnotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnnotations();
  }, []);

  const fetchAnnotations = async () => {
    try {
      const response = await fetch(`${API_URL}/api/annotations`);
      if (!response.ok) {
        throw new Error("Failed to fetch annotations.");
      }
      const data = await response.json();

      const parsedData = data.map(annotation => ({
        ...annotation,
        bounding_boxes: JSON.parse(annotation.segmentation_mask) || [], 
        timestamp: new Date(annotation.timestamp).toLocaleString() 
      }));

      setAnnotations(parsedData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching annotations:", error);
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="annotations-container">
      <h1>All Annotations</h1>

      {loading ? (
        <p>Loading annotations...</p>
      ) : error ? (
        <p className="error">Error: {error}</p>
      ) : (
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
                <td>
                  {annotation.bounding_boxes.length > 0 ? (
                    <ul>
                      {annotation.bounding_boxes.map((box, index) => (
                        <li key={index}>
                          X: {box.x}, Y: {box.y}, W: {box.width}, H: {box.height}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span>No bounding boxes</span>
                  )}
                </td>
                <td>{annotation.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AnnotationsPage;
