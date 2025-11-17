// frontend/src/components/ExerciseDB.js  (or wherever your file actually is)
import React, { useState } from "react";
import axios from "axios";
import "./ExerciseDB.css";

const ExercisePage = () => {
  const [selectedMuscle, setSelectedMuscle] = useState("");
  const [exercises, setExercises] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [exercisesPerPage] = useState(10);

  const handleMuscleChange = (e) => {
    setSelectedMuscle(e.target.value);
  };

  const handleSearch = async () => {
    const options = {
      method: "GET",
      url: `https://exercisedb.p.rapidapi.com/exercises/bodyPart/${selectedMuscle}`,
      headers: {
        "X-RapidAPI-Key": "116a4b095cmsh25d08a929abdfb6p1de9c2jsn1b0f8c3cf912",
        "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
      },
    };

    try {
      const response = await axios.request(options);

      // <- DEBUG: inspect the returned payload
      console.log("EXERCISE API response (first 3 items):", response.data?.slice?.(0,3));
      if (Array.isArray(response.data) && response.data.length) {
        console.log("FIRST EXERCISE keys:", Object.keys(response.data[0]));
        console.log("FIRST EXERCISE sample:", response.data[0]);
      } else {
        console.log("Exercise response not array or empty:", response.data);
      }

      setExercises(response.data);
    } catch (error) {
      console.error("Exercise fetch error:", error);
    }
  };

  const indexOfLastExercise = currentPage * exercisesPerPage;
  const indexOfFirstExercise = indexOfLastExercise - exercisesPerPage;
  const currentExercises = exercises.slice(
    indexOfFirstExercise,
    indexOfLastExercise
  );

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const capitalizeFirstLetter = (string) => {
    return string ? string.charAt(0).toUpperCase() + string.slice(1) : "";
  };

  return (
    <div>
      <h2>Search For A Perfect Exercise</h2>

      <div className="select-container">
        <select value={selectedMuscle} onChange={handleMuscleChange}>
          <option value="">Select A Muscle Group</option>
          <option value="back">Back</option>
          <option value="cardio">Cardio</option>
          <option value="chest">Chest</option>
          <option value="lower%20arms">Lower Arms</option>
          <option value="lower%20legs">Lower Legs</option>
          <option value="neck">Neck</option>
          <option value="shoulders">Shoulders</option>
          <option value="upper%20arms">Upper Arms</option>
          <option value="upper%20legs">Upper Legs</option>
          <option value="waist">Waist</option>
        </select>
        <button onClick={handleSearch} className="mx-3">Search</button>
      </div>

      {currentExercises.length > 0 ? (
        <div className="exercise-container">
          {currentExercises.map((exercise) => {
            // Robustly pick the image URL from common possible keys
            const imageUrl =
              exercise.gifUrl ||
              exercise.gif || 
              exercise.image ||
              (exercise.images && (exercise.images.gif || exercise.images.small || exercise.images.medium)) ||
              "";

            // show the object in console when rendering - helpful while debugging
            // console.log("Rendering exercise:", exercise);

            return (
              <div key={exercise.id || exercise._id || Math.random()} className="exercise-card">
                <h3>{capitalizeFirstLetter(exercise.name)}</h3>

                <div className="gif-container">
                  <img
                    src={imageUrl}
                    alt={exercise.name}
                    className="exercise-gif"
                    onError={(e) => {
                      // fallback image so UI doesn't show broken icon
                      e.target.onerror = null;
                      e.target.src = "/placeholder.png";
                    }}
                  />
                </div>

                {/* TEMP: show the image URL under the card for debugging - remove later */}
                <small style={{display:'block',wordBreak:'break-all', marginTop: '8px'}}>
                  {imageUrl || "[no image url]"}
                </small>

              </div>
            );
          })}
        </div>
      ) : (
        <h3>Exercises and demonstrations will be displayed here.</h3>
      )}

      {exercises.length > exercisesPerPage && (
        <div className="pagination">
          {Array.from({
            length: Math.ceil(exercises.length / exercisesPerPage),
          }).map((_, index) => (
            <button key={index} onClick={() => paginate(index + 1)}>
              {index + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExercisePage;
