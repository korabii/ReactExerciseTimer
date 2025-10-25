import React from 'react';

const TimerForm = ({ bundle }) => {
  const { settings, setSettings } = bundle;

  // Function to handle number input changes and ensure they are positive integers
  const handleSettingChange = (key, value) => {
    // Basic validation to ensure it's a number and non-negative
    const numericValue = Math.max(1, parseInt(value, 10) || 1); 
    setSettings({...settings, [key]: numericValue});
  };

  const InputField = ({ label, id, value, onChange, unit }) => (
    <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50/70 border border-gray-200 transition-shadow hover:shadow-lg">
      <label 
        className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1" 
        htmlFor={id}
      >
        {label}
      </label>
      <div className="flex items-center">
        <input
          type="number"
          id={id}
          value={value}
          min="1" // Ensure minimum is 1 for rounds/time
          className="text-center bg-transparent text-2xl font-bold text-gray-800 w-16 p-0 border-none focus:ring-0 appearance-none leading-none"
          onChange={onChange}
        />
        {unit && <span className="text-sm text-gray-500 ml-1">{unit}</span>}
      </div>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm mx-auto transform transition-all duration-300 hover:scale-[1.01]">
      <h2 className="text-xl font-extrabold mb-5 text-center text-gray-800 tracking-tight border-b pb-3 border-gray-100">
        ⚙️ Customize Session
      </h2>
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {/* Time Input */}
        <InputField
          label="Focus Time"
          id="time"
          value={settings.time}
          unit="s"
          onChange={(e) => handleSettingChange('time', e.target.value)}
        />

        {/* Break Time Input */}
        <InputField
          label="Break Time"
          id="breakTime"
          value={settings.breakTime}
          unit="s"
          onChange={(e) => handleSettingChange('breakTime', e.target.value)}
        />
        
        {/* Rounds Input */}
        <InputField
          label="Rounds"
          id="rounds"
          value={settings.rounds}
          unit=""
          onChange={(e) => handleSettingChange('rounds', e.target.value)}
        />
      </div>
    </div>
  );
};

export default TimerForm;