import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/** 🎵 Beep sound with Safari compatibility */
let audioCtx = null;

const playBeep = (frequency = 800, duration = 200) => {
  try {
    // Create a shared audio context if not already created
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    // Safari may suspend the context — resume if needed
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration / 1000);
  } catch (e) {
    console.warn("AudioContext not supported or blocked:", e);
  }
};


/**
 * Helper component for timer settings input.
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
  const { settings: initialSettings } = bundle;

  const [exerciseTime, setExerciseTime] = useState(
    initialSettings?.time || 30
  );
  const [breakTime, setBreakTime] = useState(
    initialSettings?.breakTime || 10
  );
  const [rounds, setRounds] = useState(initialSettings?.rounds || 4);

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

  const stopTimer = () => {
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
  };

  /** Handles the transition between work/break phases */
  const handlePhaseComplete = () => {
    stopTimer();
    setTimerCount(total); // visually complete progress

    // 🎵 NEW: Play a beep when a phase completes
    if (!isBreak) {
      playBeep(600, 200); // lower tone (end of exercise)
    } else {
      playBeep(1000, 300); // higher tone (end of break)
    }

    setTimeout(() => {
      if (!isBreak) {
        // End of WORK phase → go to BREAK
        if (currentRound >= rounds) {
          // All rounds done - Timer finishes
          setIsRunning(false);
          playBeep(1200, 500); // 🎵 final long beep
          return;
        }
        setIsBreak(true);
      } else {
        // End of BREAK phase → next round WORK
        setIsBreak(false);
        setCurrentRound((prev) => prev + 1);
      }
      setTimerCount(0);
    }, 250);
  };

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    stopTimer();
    setIsRunning(false);
    setIsBreak(false);
    setTimerCount(0);
    setCurrentRound(1);
  };

  useEffect(() => {
    const cleanup = () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
    };

    cleanup();

    if (isRunning) {
      if (timerCount === 0) {
        startTimeRef.current = Date.now();
      } else {
        startTimeRef.current = Date.now() - timerCount * 1000;
      }
      requestRef.current = requestAnimationFrame(tick);
    }

    return cleanup;
  }, [isRunning, isBreak, currentRound]);

  const primaryColor = isBreak ? "text-red-500" : "text-green-500";
  const primaryBgColor = isBreak
    ? "bg-red-500 hover:bg-red-600"
    : "bg-green-500 hover:bg-green-600";
  const startStopBgColor = isRunning
    ? "bg-amber-500 hover:bg-amber-600"
    : primaryBgColor;

  return (
    <div className="flex flex-col items-center justify-center bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm mx-auto select-none">
      <h2
        className={`text-2xl font-extrabold mb-1 ${primaryColor} tracking-tight transition-colors duration-300`}
      >
        {isBreak ? "Break Time" : "Focus Time"}
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Round <span className="font-semibold text-gray-700">{currentRound}</span>{" "}
        of {rounds}
      </p>

      {/* Settings */}
      <div className="w-full px-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-2 min-w-0 w-full overflow-hidden">
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
