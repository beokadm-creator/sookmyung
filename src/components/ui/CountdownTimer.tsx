import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  targetDate: string; // '2026-05-21T00:00:00'
  className?: string;
}

export default function CountdownTimer({ targetDate, className }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

      if (difference > 0) {
        timeLeft = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return timeLeft;
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const TimeBox = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-lg p-3 md:p-4 min-w-[80px] md:min-w-[120px] border border-white/20 shadow-lg">
      <span className="text-3xl md:text-5xl font-bold text-white font-mono drop-shadow-md">
        {value.toString().padStart(2, '0')}
      </span>
      <span className="text-xs md:text-sm text-white/90 mt-1 font-medium tracking-wider">{label}</span>
    </div>
  );

  return (
    <div className={cn('flex flex-wrap justify-center gap-3 md:gap-6', className)}>
      <TimeBox value={timeLeft.days} label="DAYS" />
      <TimeBox value={timeLeft.hours} label="HOURS" />
      <TimeBox value={timeLeft.minutes} label="MINUTES" />
      <TimeBox value={timeLeft.seconds} label="SECONDS" />
    </div>
  );
}
