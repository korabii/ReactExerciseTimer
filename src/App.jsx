import { useState } from 'react'
import Timer from './components/Timer';

import './App.css'
import TimerForm from './components/TimerForm';


function App() {
   
   const [settings, setSettings] = useState({rounds: 3, time: 30, breakTime: 20});

   const bundle = {
      settings,
      setSettings
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
