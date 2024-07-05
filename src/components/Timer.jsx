import React, { useState, useEffect } from 'react';

const Timer = ({ bundle }) => {
   const { settings, setSettings } = bundle;
   const [currentRound, setCurrentRound] = useState(1);
   const [timerCount, setTimerCount] = useState(0);
   const [isBreak, setIsBreak] = useState(false);
   const [isRunning, setIsRunning] = useState(false);

   //booleans
   const restingTimer = (!isBreak && timerCount >= settings.time);
   const workingTimer = (isBreak && timerCount >= settings.breakTime);

   // Timer logic
   useEffect(() => {
      const interval = setInterval(() => {
         // when timer reaches the user defined work or break time
         if (restingTimer || workingTimer) {
            //alternate between break and work
            setIsBreak(prev => !prev)
            //reset timer
            setTimerCount(0)

            //stop timer if max rounds reached
            if (isBreak) {
               //dont increment rounds during break
            } else if (currentRound < settings.rounds) {
               //incement rounds if it was a work round
               setCurrentRound(prev => prev + 1)
            } else {
               //if its not a break and its past the last round stop the app
               setIsRunning(false)
            }
         }

         //increment timer while app is in running state
         if (isRunning) {
            setTimerCount(prev => prev + 0.1)
         }

      }, 100);

      // Clean up interval on component unmount
      return () => clearInterval(interval);
   }, [isBreak, isRunning, timerCount]); // isBreak is not needed but may be needed when changes are made.


   // Handle start/stop button
   const handleStartStop = () => {
      setIsRunning(prev => !prev);
   };

   // Reset the timer
   const handleReset = () => {
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
         <p>Time Elapsed: {timerCount.toFixed(1)} seconds of {isBreak ? settings.breakTime : settings.time}</p>
         <div className="relative mt-2 h-4 bg-gray-200 rounded overflow-hidden">
            <div
               className={`absolute top-0 left-0 h-full ${isBreak ? "bg-red-500":"bg-green-500"}`}
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
