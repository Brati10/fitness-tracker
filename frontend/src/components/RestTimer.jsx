import { useState, useEffect } from 'react';

function RestTimer({ onComplete, onSkip }) {
  const [timeLeft, setTimeLeft] = useState(60);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) {
      if (timeLeft <= 0) {
        onComplete();
      }
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, onComplete]);

  const adjustTime = (seconds) => {
    setTimeLeft((prev) => Math.max(0, prev + seconds));
  };

  const handleSkip = () => {
    setIsRunning(false);
    onSkip();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed top-16 left-0 right-0 bg-blue-500 text-white p-3 shadow-lg z-40 animate-pulse">
      <div className="flex items-center justify-between max-w-md mx-auto">
        <button
          onClick={() => adjustTime(-10)}
          className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded font-bold"
        >
          -10s
        </button>

        <div className="text-center">
          <div className="text-2xl font-bold">{formatTime(timeLeft)}</div>
          <div className="text-xs">Pausenzeit</div>
        </div>

        <button
          onClick={() => adjustTime(10)}
          className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded font-bold"
        >
          +10s
        </button>

        <button
          onClick={handleSkip}
          className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm"
        >
          Skip
        </button>
      </div>
    </div>
  );
}

export default RestTimer;