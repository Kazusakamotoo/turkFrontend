import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

const API_URL = "https://turkbackend.onrender.com"; 

const BoundingBoxAnnotation = () => {
  const [images, setImages] = useState([]);
  const [imageIds, setImageIds] = useState([]);
  const [boundingBoxes, setBoundingBoxes] = useState([]);
  const [drawing, setDrawing] = useState(false);
  const [workerId, setWorkerId] = useState("worker_123");
  const [currentBox, setCurrentBox] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const navigate = useNavigate();

  const startX = useRef(0);
  const startY = useRef(0);

  useEffect(() => {
    fetchNewImage();
  }, []);

  const fetchNewImage = () => {
    fetch(`${API_URL}/api/image`)
      .then((res) => res.json())
      .then((data) => {
  
        if (!data.image_url) {
          alert("Error loading image. Please refresh.");
          return;
        }
  
        setImages((prevImages) => [...prevImages, data.image_url]);
        setImageIds((prevImageIds) => [...prevImageIds, data.image_id]);
  
        setBoundingBoxes((prevBoxes) => [...prevBoxes, []]);
      })
      .catch((err) => console.error("Fetch error:", err));
  };
  

const handleMouseDown = (e) => {
  e.preventDefault();
  const rect = e.currentTarget.getBoundingClientRect();
  startX.current = e.clientX - rect.left;
  startY.current = e.clientY - rect.top;

  setCurrentBox({
    x: startX.current,
    y: startY.current,
    width: 0,
    height: 0,
  });

  setDrawing(true);
};

const handleMouseMove = (e) => {
  if (!drawing) return;

  const rect = e.currentTarget.getBoundingClientRect();
  const endX = e.clientX - rect.left;
  const endY = e.clientY - rect.top;

  setCurrentBox({
    x: Math.min(startX.current, endX),
    y: Math.min(startY.current, endY),
    width: Math.abs(endX - startX.current),
    height: Math.abs(endY - startY.current),
  });
};

const handleMouseUp = () => {
  if (!drawing) return;
  setDrawing(false);

  if (!currentBox || currentBox.width < 5 || currentBox.height < 5) {
    return;
  }

  const updatedBoxes = [...boundingBoxes];
  updatedBoxes[selectedImageIndex] = [currentBox]; 
  
  setBoundingBoxes(updatedBoxes);
  setCurrentBox(null);
};

  const handleNextImage = () => {
    if (selectedImageIndex < 2) { 
      fetchNewImage();
      setSelectedImageIndex(selectedImageIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    const annotationData = {
      worker_id: workerId,
      annotations: imageIds.map((id, index) => ({
        image_id: id,
        bounding_boxes: boundingBoxes[index] || [],
      })),
    };

    const response = await fetch(`${API_URL}/api/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(annotationData),
    });

    const result = await response.json();

    navigate(`/completion`);
  };

  return (
    <div className="annotation-container">
      <p className="instructions">
        Please create one bounding box around animals present in the picture. Humans do not count as animals. If the animal in the image is a drawing or picture of an animal, it should still be included. If there is a group of animals, please select the largest group at your convinience.
      </p>
      {images.length > 0 && (
        <>
          <div
            className="annotation-area"
            style={{
              position: "relative",
              width: "500px",
              height: "500px",
              border: "2px solid black",
              userSelect: "none",
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <img
              src={images[selectedImageIndex]}
              alt="Annotate"
              style={{
                width: "100%",
                height: "100%",
                position: "absolute",
                pointerEvents: "none",
              }}
              draggable="false"
            />
            {boundingBoxes[selectedImageIndex]?.length > 0 && (
              <div
                className="bounding-box"
                style={{
                  position: "absolute",
                  left: boundingBoxes[selectedImageIndex][0].x,
                  top: boundingBoxes[selectedImageIndex][0].y,
                  width: boundingBoxes[selectedImageIndex][0].width,
                  height: boundingBoxes[selectedImageIndex][0].height,
                  border: "2px solid red",
                  backgroundColor: "rgba(255, 0, 0, 0.2)",
                }}
              />
            )}
            {currentBox && (
              <div
                className="bounding-box"
                style={{
                  position: "absolute",
                  left: currentBox.x,
                  top: currentBox.y,
                  width: currentBox.width,
                  height: currentBox.height,
                  border: "2px solid blue",
                  backgroundColor: "rgba(0, 0, 255, 0.2)",
                }}
              />
            )}
          </div>
          <button onClick={handleNextImage}>
            {selectedImageIndex < 2 ? "Next Image" : "Submit Annotations"}
          </button>
        </>
      )}
    </div>
  );
};

export default BoundingBoxAnnotation;
