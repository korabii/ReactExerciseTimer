import React, { useState, useEffect, useRef } from 'react';

const Timer = ({ bundle }) => {
   // props
   const { settings } = bundle;
   // state
   const [currentRound, setCurrentRound] = useState(1);
   const [timerCount, setTimerCount] = useState(0);
   const [isBreak, setIsBreak] = useState(false);
   const [isRunning, setIsRunning] = useState(false);
   // refs
   const intervalRef = useRef(null);
   const lastUpdateRef = useRef(Date.now());
   // Booleans
   const restingTimer = (!isBreak && timerCount >= settings.time);
   const workingTimer = (isBreak && timerCount >= settings.breakTime);

   // Timer logic
   useEffect(() => {
      if (isRunning) {
         //create new interval object if is running is true
         intervalRef.current = setInterval(() => {
            //figure out elapsed time by getting (current time) - (last render time or time user clicked start)
            const now = Date.now();
            const elapsedTime = (now - lastUpdateRef.current) / 1000; // Convert to seconds
            lastUpdateRef.current = now;

            // When timer reaches the user-defined work or break time
            if (restingTimer || workingTimer) {
               // Alternate between break and work
               setIsBreak(prev => !prev);
               // Reset timer
               setTimerCount(0);

               // Stop timer if max rounds reached
               if (!isBreak && currentRound >= settings.rounds) {
                  //base case
                  setIsRunning(false);
               } else if (!isBreak) {
                  // Increment rounds if it was a work round
                  setCurrentRound(prev => prev + 1);
               }
            }

            // Increment timer while app is in running state
            // schedules the use effect to be called again after everything has finished executng, including the 30 millisecond break.
            setTimerCount(prev => prev + elapsedTime);
         }, 27);
      }

      //setTimerCount will cause useeffect to fire on every re-render also calling the unmount function every time, not ideal but works.
      return () => {
         //console.log("unmount");
         clearInterval(intervalRef.current)
      };
   }, [isRunning, timerCount]);



   // Handle start/stop button
   const handleStartStop = () => {
      setIsRunning(prev => !prev);
      //reseting last update time here is crucial as it will re-set everytime the user starts and stops the timer/application.
      lastUpdateRef.current = Date.now();
   };

   // Reset the timer
   const handleReset = () => {
      clearInterval(intervalRef.current); // Clear the interval immediately
      setIsRunning(false);
      setCurrentRound(1);
      setTimerCount(0);
      setIsBreak(false);
   };

   return (
      <div className="bg-white p-4 rounded shadow-md mt-4">
         <h2 className="text-xl font-semibold mb-4">Timer</h2>
         <p>Round: {currentRound} / {settings.rounds}</p>
         <p>{isBreak ? 'Break Time' : 'Work Time'}</p>
         <p>Time Elapsed: {timerCount.toFixed(2)} seconds of {isBreak ? settings.breakTime : settings.time}</p>
         <div className="relative mt-2 h-4 bg-gray-200 rounded overflow-hidden">
            <div
               className={`absolute top-0 left-0 h-full ${isBreak ? "bg-red-500" : "bg-green-500"}`}
               style={{ width: `${isBreak ? (timerCount / settings.breakTime) * 100 : (timerCount / settings.time) * 100}%` }}>
            </div>
         </div>
         <div className="mt-4">
            <button
               className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
               onClick={handleStartStop}
            >
               {isRunning ? 'Pause' : 'Start'}
            </button>
            <button
               className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
               onClick={handleReset}
            >
               Reset
            </button>
         </div>
      </div>
   );
};

export default Timer;
