import React, { useState, useEffect } from 'react';

const TimerForm = ({ bundle }) => {
  const { settings, setSettings } = bundle;

  // Local state to hold the string value currently displayed in the input fields.
  const [formValues, setFormValues] = useState({
    time: String(settings.time),
    rounds: String(settings.rounds),
    breakTime: String(settings.breakTime),
  });

  // Sync local form state with global settings
  useEffect(() => {
    setFormValues({
      time: String(settings.time),
      rounds: String(settings.rounds),
      breakTime: String(settings.breakTime),
    });
  }, [settings.time, settings.rounds, settings.breakTime]);


  // Handler for live typing/deleting. It only updates the local state with the filtered string.
  // We keep this simple string update to prevent focus loss during typing.
  const handleLiveChange = (key, value) => {
    // Only allow valid number input (including empty string)
    if (value === '' || /^[0-9]+$/.test(value)) {
      setFormValues(prev => ({ ...prev, [key]: value }));
    }
  };


  // Handler for when the input loses focus (onBlur). This sanitizes and updates the global settings.
  const handleBlur = (key) => {
    // 1. Get the current string value from the local state.
    const valueToSanitize = formValues[key];
    
    // 2. Convert to number. If it was "" (cleared field), it becomes NaN.
    let numericValue = parseInt(valueToSanitize, 10);

    // 3. Sanitation: If NaN (empty field) or less than 1, force the value to 1.
    if (isNaN(numericValue) || numericValue < 1) {
      numericValue = 1;
    }
    
    // 4. Update the local state to display the sanitized number (e.g., changes "" to "1").
    setFormValues(prev => ({ ...prev, [key]: String(numericValue) }));

    // 5. Update the global settings state (used by the Timer component).
    setSettings(prev => ({ ...prev, [key]: numericValue }));
  };

// ----------------------------------------------------------------------------------

  const InputField = ({ label, id, value, onChange, onBlur, unit }) => (
    <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50/70 border border-gray-200 transition-shadow hover:shadow-lg">
      <label 
        className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1" 
        htmlFor={id}
      >
        {label}
      </label>
      <div className="flex items-center">
        <input
          // **CRITICAL CHANGE: Reverted type to "number"**
          type="number" 
          id={id}
          // The value is taken from the local state (which is a string)
          value={value}
          min="1" // Re-introduced min constraint for the arrows
          className="text-center bg-transparent text-2xl font-bold text-gray-800 w-16 p-0 border-none focus:ring-0 appearance-none leading-none"
          onChange={onChange}
          onBlur={onBlur} 
        />
        {unit && <span className="text-sm text-gray-500 ml-1">{unit}</span>}
      </div>
    </div>
  );
// ----------------------------------------------------------------------------------

  return (
    <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm mx-auto transform transition-all duration-300 hover:scale-[1.01]">
      <h2 className="text-xl font-extrabold mb-5 text-center text-gray-800 tracking-tight border-b pb-3 border-gray-100">
        ⚙️ Customize Session
      </h2>
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        
        {/* Focus Time Input */}
        <InputField
          label="Focus Time"
          id="time"
          value={formValues.time}
          unit="s"
          onChange={(e) => handleLiveChange('time', e.target.value)}
          onBlur={() => handleBlur('time')}
        />

        {/* Break Time Input */}
        <InputField
          label="Break Time"
          id="breakTime"
          value={formValues.breakTime}
          unit="s"
          onChange={(e) => handleLiveChange('breakTime', e.target.value)}
          onBlur={() => handleBlur('breakTime')}
        />
        
        {/* Rounds Input */}
        <InputField
          label="Rounds"
          id="rounds"
          value={formValues.rounds}
          unit=""
          onChange={(e) => handleLiveChange('rounds', e.target.value)}
          onBlur={() => handleBlur('rounds')}
        />
      </div>
    </div>
  );
};

export default TimerForm;