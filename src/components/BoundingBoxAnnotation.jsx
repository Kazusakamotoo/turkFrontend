import React, { useState, useEffect } from "react";
import "../App.css";

const API_URL = "https://turkbackend.onrender.com"; // ✅ Update to Render backend URL

const BoundingBoxAnnotation = () => {
  const [images, setImages] = useState([]);
  const [imageIds, setImageIds] = useState([]);
  const [boundingBoxes, setBoundingBoxes] = useState([]);
  const [drawing, setDrawing] = useState(false);
  const [workerId, setWorkerId] = useState("worker_123");
  const [currentBox, setCurrentBox] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    fetchNewImage();
  }, []);

  const fetchNewImage = () => {
    fetch(`${API_URL}/api/image`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          console.error("Error fetching image:", data.error);
          return;
        }

        setImages((prevImages) => [...prevImages, data.image_url]);
        setImageIds((prevImageIds) => [...prevImageIds, data.image_id]);
        setBoundingBoxes((prevBoxes) => [...prevBoxes, []]);
      })
      .catch((err) => console.error("Error fetching image:", err));
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCurrentBox({ x, y, width: 0, height: 0 });
    setDrawing(true);
  };

  const handleMouseMove = (e) => {
    if (!drawing) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;
    setCurrentBox((prevBox) => ({
      ...prevBox,
      width: Math.abs(endX - prevBox.x),
      height: Math.abs(endY - prevBox.y),
    }));
  };

  const handleMouseUp = () => {
    if (!currentBox || currentBox.width < 5 || currentBox.height < 5) return;
    const updatedBoxes = [...boundingBoxes];
    updatedBoxes[selectedImageIndex].push(currentBox);
    setBoundingBoxes(updatedBoxes);
    setCurrentBox(null);
    setDrawing(false);
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
      annotations: imageIds.map((id, index) => ({ image_id: id, bounding_boxes: boundingBoxes[index] })),
    };

    const response = await fetch(`${API_URL}/api/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(annotationData),
    });

    const result = await response.json();
    alert(result.message || "Error submitting annotation");
  };

  return (
    <div className="annotation-container">
      <p className="instructions">
        Please create one bounding box around animals present in the picture. Inanimate pictures of animals should be included. If there is a group of animals, please select the largest group.
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
            {boundingBoxes[selectedImageIndex].map((box, index) => (
              <div
                key={index}
                className="bounding-box"
                style={{
                  position: "absolute",
                  left: box.x,
                  top: box.y,
                  width: box.width,
                  height: box.height,
                  border: "2px solid red",
                  backgroundColor: "rgba(255, 0, 0, 0.2)",
                }}
              />
            ))}
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
