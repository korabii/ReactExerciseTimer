import { useState } from 'react'
import Timer from './components/Timer';

import './App.css'
import TimerForm from './components/TimerForm';


function App() {
   const [rounds, setRounds] = useState(3);
   const [time, setTime] = useState(3);
   const [breakTime, setBreakTime] = useState(2);

   const bundle = {
      rounds,
      setRounds,
      time,
      setTime,
      breakTime,
      setBreakTime,
   };

   return (
      <div className="p-6 bg-gray-100 min-h-screen">
         <h1 className="text-2xl font-bold mb-4">Exercise Timer</h1>
         <TimerForm bundle={bundle} />
         <Timer bundle={bundle} />
      </div>
   );
};

export default App
