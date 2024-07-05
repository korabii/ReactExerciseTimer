import React from 'react';

const TimerForm = ({ bundle }) => {
  const { settings, setSettings } = bundle;

  return (
    <div className="bg-white p-4 rounded shadow-md">
      <h2 className="text-xl font-semibold mb-4">Timer Settings</h2>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="time">
          Time (in minutes):
        </label>
        <input
          type="number"
          id="time"
          value={settings.time}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          onChange={(e) => setSettings({...settings, time: e.target.value}) }
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="rounds">
          Rounds:
        </label>
        <input
          type="number"
          id="rounds"
          value={settings.rounds}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          onChange={(e) => setSettings({...settings, rounds: e.target.value})}
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="breakTime">
          Break Time (in seconds):
        </label>
        <input
          type="number"
          id="breakTime"
          value={settings.breakTime}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          onChange={(e) => setSettings({...settings, breakTime: e.target.value})}
        />
      </div>
    </div>
  );
};

export default TimerForm;
