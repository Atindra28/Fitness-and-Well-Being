// src/components/MealPlan.js
import React, { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import {
  useCreateMealPlanMutation,
  useUpdateMealPlanMutation,
} from "../slices/usersApiSlice";

const MealPlan = () => {
  // Use ISO date (YYYY-MM-DD) and don't keep setCurrentDate if you don't change the date.
  const [currentDate] = useState(new Date().toISOString().slice(0, 10));

  // initialize all inputs to empty strings to avoid controlled/uncontrolled warnings
  const [meal1, setMeal1] = useState("");
  const [meal2, setMeal2] = useState("");
  const [meal3, setMeal3] = useState("");
  const [meal4, setMeal4] = useState("");
  const [meal5, setMeal5] = useState("");
  const [snacks, setSnacks] = useState("");

  // keep the same RTK hooks you already used
  const [createMealPlan] = useCreateMealPlanMutation();
  const [updateMealPlan] = useUpdateMealPlanMutation();

  useEffect(() => {
    const fetchMealPlan = async () => {
      try {
        const res = await fetch(
          `/api/user/meal-plan/${encodeURIComponent(currentDate)}`
        );

        if (!res.ok) {
          // If server returns 404 (not found) that's fine — we'll keep inputs empty
          // but log the response text for debugging.
          const txt = await res.text();
          console.warn("Fetch meal plan non-OK response:", res.status, txt);
          return;
        }

        const data = await res.json();

        // use nullish coalescing so undefined never gets set into inputs
        setMeal1(data?.meal1 ?? "");
        setMeal2(data?.meal2 ?? "");
        setMeal3(data?.meal3 ?? "");
        setMeal4(data?.meal4 ?? "");
        setMeal5(data?.meal5 ?? "");
        setSnacks(data?.snacks ?? "");

        localStorage.setItem("mealPlan", JSON.stringify(data));
      } catch (error) {
        console.error("Fetch meal plan error:", error);
        // fallback to localStorage if present
        const stored = localStorage.getItem("mealPlan");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setMeal1(parsed?.meal1 ?? "");
            setMeal2(parsed?.meal2 ?? "");
            setMeal3(parsed?.meal3 ?? "");
            setMeal4(parsed?.meal4 ?? "");
            setMeal5(parsed?.meal5 ?? "");
            setSnacks(parsed?.snacks ?? "");
          } catch (e) {
            console.error("Failed to parse stored mealPlan:", e);
          }
        }
      }
    };

    fetchMealPlan();
  }, [currentDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // guard: ensure date format is valid
    if (!/^\d{4}-\d{2}-\d{2}$/.test(currentDate)) {
      toast.error("Invalid date format. Please refresh the page.");
      return;
    }

    const mealPlanData = {
      date: currentDate,
      meal1: meal1 ?? "",
      meal2: meal2 ?? "",
      meal3: meal3 ?? "",
      meal4: meal4 ?? "",
      meal5: meal5 ?? "",
      snacks: snacks ?? "",
    };

    try {
      // Save locally first (nice UX)
      localStorage.setItem("mealPlan", JSON.stringify(mealPlanData));

      // Call update first; your backend now accepts date in body or params.
      const existing = await updateMealPlan(mealPlanData).unwrap();

      if (existing) {
        toast.success("Meal plan updated successfully!");
      } else {
        const created = await createMealPlan(mealPlanData).unwrap();
        if (created) toast.success("Meal plan created successfully!");
      }
    } catch (error) {
      // log full error for debugging; Redux/RTK will often give structured error
      console.error("Save meal plan error:", error);
      toast.error("Failed to save the meal plan.");
    }
  };

  return (
    <div>
      <h1>Meal Plan</h1>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="date">
          <Form.Label>Date</Form.Label>
          <Form.Control type="text" value={currentDate} readOnly />
        </Form.Group>

        <Form.Group controlId="meal1">
          <Form.Label>Meal 1</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter meal 1"
            value={meal1}
            onChange={(e) => setMeal1(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="meal2">
          <Form.Label>Meal 2</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter meal 2"
            value={meal2}
            onChange={(e) => setMeal2(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="meal3">
          <Form.Label>Meal 3</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter meal 3"
            value={meal3}
            onChange={(e) => setMeal3(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="meal4">
          <Form.Label>Meal 4</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter meal 4"
            value={meal4}
            onChange={(e) => setMeal4(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="meal5">
          <Form.Label>Meal 5</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter meal 5"
            value={meal5}
            onChange={(e) => setMeal5(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="snacks">
          <Form.Label>Snacks</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter snacks"
            value={snacks}
            onChange={(e) => setSnacks(e.target.value)}
          />
        </Form.Group>

        <Button variant="primary" type="submit" className="my-3">
          Save
        </Button>
      </Form>
    </div>
  );
};

export default MealPlan;
