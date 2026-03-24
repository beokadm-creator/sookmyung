import { useState } from 'react';

export function SkipLink() {
  const [skipTo, setSkipTo] = useState<string | null>(null);

  const handleSkip = (targetId: string) => {
    const element = document.getElementById(targetId);
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <a
      href="#main-content"
      onClick={(e) => {
        e.preventDefault();
        handleSkip('main-content');
      }}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-sookmyung-blue-600 focus:text-white focus:rounded-lg focus:font-medium focus:shadow-lg"
    >
      본문으로 건너뛰기
    </a>
  );
}
