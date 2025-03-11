import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

const API_URL = "http://127.0.0.1:5000"; 

const BoundingBoxAnnotation = () => {
  const [images, setImages] = useState([]);
  const [imageIds, setImageIds] = useState([]);
  const [boundingBoxes, setBoundingBoxes] = useState([]);
  const [imageDimensions, setImageDimensions] = useState([]);
  const [drawing, setDrawing] = useState(false);
  const [workerId, setWorkerId] = useState("worker_123");
  const [currentBox, setCurrentBox] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [validationStatus, setValidationStatus] = useState(null);

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
  
        const img = new Image(); 
        img.src = data.image_url;
  
        img.onload = () => {
          const width = img.naturalWidth;  
          const height = img.naturalHeight;
  
          setImages((prevImages) => [...prevImages, data.image_url]);
          setImageIds((prevImageIds) => [...prevImageIds, data.image_id]);
          setBoundingBoxes((prevBoxes) => [...prevBoxes, []]);
          setImageDimensions((prevDims) => [
            ...prevDims,
            { width, height },
          ]);
        };
  
        img.onerror = () => {
          alert("Failed to load image. Please try again.");
        };
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
  
    const finalizedBox = {
      ...currentBox,
      createdAt: Date.now(), 
    };
  
    const updatedBoxes = [...boundingBoxes];
    updatedBoxes[selectedImageIndex] = [finalizedBox];
  
    setBoundingBoxes(updatedBoxes);
    setCurrentBox(null);
  };

const handleValidateClick = () => {
  if (!boundingBoxes[selectedImageIndex]?.length) {
      setValidationStatus("Please draw a bounding box before validating.");
      return;
  }

  const originalBox = convertToOriginalSize(boundingBoxes[selectedImageIndex][0]);

  validateBoundingBox(originalBox);
};

  const convertToOriginalSize = (box) => {
    const { width: origWidth, height: origHeight } = imageDimensions[selectedImageIndex];
    return {
      x: (box.x / 500) * origWidth,
      y: (box.y / 500) * origHeight,
      width: (box.width / 500) * origWidth,
      height: (box.height / 500) * origHeight,
    };
  };

  const validateBoundingBox = async (originalBox) => {
    const validationData = {
        image_id: imageIds[selectedImageIndex],
        bounding_box: [
            Math.round(originalBox.x), 
            Math.round(originalBox.y), 
            Math.round(originalBox.width), 
            Math.round(originalBox.height)
        ], 
    };

    console.log("Sending validation request:", JSON.stringify(validationData));

    try {
        const response = await fetch(`${API_URL}/api/validate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(validationData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Server error:", errorText);
            throw new Error(`Server Error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        console.log("✅ Validation response:", result);

        if (result.error) {
            setValidationStatus(`API Error: ${result.error} (${result.details || "No details"})`);
        } else {
            setValidationStatus(
                result.valid 
                ? `✅ Valid Bounding Box: ${result.reason}` 
                : `❌ Bounding Box Needs Adjustment: ${result.reason}`
            );
        }
    } catch (error) {
        console.error("Validation error:", error);
        setValidationStatus(`⚠️ Error Validating Box: ${error.message}`);
    }
};


  const handleNextImage = () => {
    if (selectedImageIndex < 2) {
      fetchNewImage();
      setSelectedImageIndex(selectedImageIndex + 1);
      setValidationStatus(null);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    const annotationData = {
      worker_id: workerId,
      annotations: imageIds.map((id, index) => ({
        image_id: id,
        bounding_boxes: boundingBoxes[index].map((box) =>
          convertToOriginalSize(box)
        ),
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
        Please create one bounding box around animals present in the picture.
        Humans do not count as animals. If the animal in the image is a drawing
        or picture of an animal, it should still be included. If there is a
        group of animals, please select the largest group at your convenience.
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
          <button onClick={handleValidateClick}>Validate Bounding Box</button>

          <p className="validation-message">{validationStatus}</p>
          <button onClick={handleNextImage}>
            {selectedImageIndex < 2 ? "Next Image" : "Submit Annotations"}
          </button>
        </>
      )}
    </div>
  );
};

export default BoundingBoxAnnotation;
