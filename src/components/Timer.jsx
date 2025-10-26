import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Helper component to keep the main Timer component's JSX clean.
 * It's disabled when the timer is running.
 *
 * STYLING CHANGE: Reduced padding (px-2 py-1.5) and centered text
 * to make the inputs smaller and neater.
 */
const SettingInput = ({ label, value, onChange, disabled }) => (
  <div className="flex flex-col flex-1 min-w-0"> 
    <label
      htmlFor={label}
      className="text-sm font-medium text-gray-500 mb-1 truncate"
    >
      {label}
    </label>
    <input
      type="number"
      id={label}
      value={value}
      onChange={(e) => onChange(Math.max(1, Number(e.target.value)))}
      disabled={disabled}
      className="w-full px-2 py-1.5 text-center rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-800"
      min="1"
    />
  </div>
);


const Timer = ({ bundle }) => {
  // Use 'initialSettings' from props to set the *initial* state
  const { settings: initialSettings } = bundle;

  // --- New State for Timer Settings ---
  const [exerciseTime, setExerciseTime] = useState(
    initialSettings?.time || 30
  );
  const [breakTime, setBreakTime] = useState(
    initialSettings?.breakTime || 10
  );
  const [rounds, setRounds] = useState(initialSettings?.rounds || 4);
  // --- End New State ---

  const [currentRound, setCurrentRound] = useState(1);
  const [isBreak, setIsBreak] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [timerCount, setTimerCount] = useState(0);

  const startTimeRef = useRef(null);
  const requestRef = useRef(null);

  const total = isBreak ? breakTime : exerciseTime;
  const remaining = Math.max(total - timerCount, 0);
  const progress = Math.min((timerCount / total) * 100, 100);

  /** Core high-accuracy timer using requestAnimationFrame */
  const tick = () => {
    const now = Date.now();
    const elapsed = (now - startTimeRef.current) / 1000;
    setTimerCount(elapsed);

    if (elapsed >= total) {
      handlePhaseComplete();
      return;
    }

    requestRef.current = requestAnimationFrame(tick);
  };

  // --- This function is NOT USED directly to start/stop the timer loop ---
  // It's used as a safety function inside handlePhaseComplete
  const stopTimer = () => {
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null; // IMPORTANT: Clear the ref
    }
  };

  /** Handles the transition between work/break phases */
  const handlePhaseComplete = () => {
    // 1. Always stop the current timer loop
    stopTimer();
    setTimerCount(total); // visually complete progress

    setTimeout(() => {
      if (!isBreak) {
        // End of WORK phase → go to BREAK
        if (currentRound >= rounds) {
          // All rounds done - Timer finishes
          setIsRunning(false); // This will stop the useEffect from starting a new timer
          return;
        }
        // Change state to break, the useEffect below will handle starting the new timer
        setIsBreak(true);
      } else {
        // End of BREAK phase → next round WORK
        // Change state to next round and work, useEffect will handle starting
        setIsBreak(false);
        setCurrentRound((prev) => prev + 1);
      }
      setTimerCount(0); // Reset count *after* state change so useEffect can react
    }, 250);
  };

  // --- FIX 1: Simplified handleStartStop ---
  // This function's ONLY job is to toggle the isRunning state.
  // The useEffect hook will see this change and handle the timer logic.
  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    stopTimer(); // Manually stop any running timer
    setIsRunning(false);
    setIsBreak(false);
    setTimerCount(0);
    setCurrentRound(1);
    // Note: This does NOT reset the settings fields, only the timer progress.
  };

  // --- FIX 2: Corrected useEffect for Timer Lifecycle ---
  // This effect now controls ALL starting, stopping, and resuming
  useEffect(() => {
    // This cleanup function runs whenever a dependency changes, or on unmount.
    // It's a safety net to prevent duplicate timer loops.
    const cleanup = () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
    };

    // Make sure any existing loop is cleared before we decide to start a new one
    cleanup();

    if (isRunning) {
      // Timer should be running.
      if (timerCount === 0) {
        // We are starting a *new* phase (from 0)
        startTimeRef.current = Date.now();
      } else {
        // We are *resuming* from a pause
        startTimeRef.current = Date.now() - timerCount * 1000;
      }

      // Start the animation frame loop
      requestRef.current = requestAnimationFrame(tick);
    } else {
      // isRunning is false, so the timer should be stopped/paused.
      // The cleanup() function above already handled this.
    }

    // The component will re-run this effect if any of these change.
    // 'timerCount' has been (correctly) removed from this array.
    return cleanup; // This is the final cleanup on unmount
  }, [isRunning, isBreak, currentRound]);
  
  // Note: The empty useEffect for cleanup on unmount is now
  // handled by the return function in the main useEffect above.

  // Dynamic color classes based on the current phase
  const primaryColor = isBreak ? "text-red-500" : "text-green-500";
  const primaryBgColor = isBreak
    ? "bg-red-500 hover:bg-red-600"
    : "bg-green-500 hover:bg-green-600";
  const startStopBgColor = isRunning
    ? "bg-amber-500 hover:bg-amber-600" // Pause uses Amber
    : primaryBgColor; // Start uses the primary color

  return (
    <div className="flex flex-col items-center justify-center bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm mx-auto select-none">
      {/* Title */}
      <h2
        className={`text-2xl font-extrabold mb-1 ${primaryColor} tracking-tight transition-colors duration-300`}
      >
        {isBreak ? "Break Time" : "Focus Time"}
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Round <span className="font-semibold text-gray-700">{currentRound}</span>{" "}
        of {rounds}
      </p>

      {/* --- STYLING CHANGE: gap-3 changed to gap-2 (already done) --- */}
      <div className="w-full px-4 mb-6">
        {/* The containing flex-row will now correctly distribute space 
            because the children use flex-1 */}
        <div className="flex flex-col sm:flex-row gap-2 min-w-0">
          <SettingInput
            label="Exercise (s)"
            value={exerciseTime}
            onChange={setExerciseTime}
            disabled={isRunning}
          />
          <SettingInput
            label="Break (s)"
            value={breakTime}
            onChange={setBreakTime}
            disabled={isRunning}
          />
          <SettingInput
            label="Rounds"
            value={rounds}
            onChange={setRounds}
            disabled={isRunning}
          />
        </div>
      </div>
      {/* --- End Settings Fields --- */}

      {/* Circular Progress */}
      <div className="relative w-56 h-56 mb-8">
        <svg className="absolute inset-0" viewBox="0 0 100 100">
          <circle
            className="text-gray-200"
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            r="45"
            cx="50"
            cy="50"
          />
          <motion.circle
            className={primaryColor}
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            fill="transparent"
            r="45"
            cx="50"
            cy="50"
            strokeDasharray="282.6"
            strokeDashoffset={282.6 - (progress / 100) * 282.6}
            animate={{ strokeDashoffset: 282.6 - (progress / 100) * 282.6 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          />
        </svg>

        {/* Time Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={isBreak ? "break" : "work"}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center"
              transition={{ duration: 0.2 }}
            >
              <p className="text-6xl font-extrabold text-gray-800 leading-none">
                {remaining.toFixed(1)}
              </p>
              <p className="text-sm font-semibold text-gray-500 mt-2">
                seconds remaining
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-4 w-full px-4">
        <button
          onClick={handleStartStop}
          className={`flex-1 py-3 rounded-xl text-white font-bold shadow-md transition-all duration-200 uppercase tracking-wider ${startStopBgColor}`}
        >
          {isRunning ? "Pause" : "Start"}
        </button>
        <button
          onClick={handleReset}
          className="flex-1 py-3 rounded-xl bg-gray-500 hover:bg-gray-700 text-white font-bold shadow-md transition-all duration-200 uppercase tracking-wider"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default Timer;