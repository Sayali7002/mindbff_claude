import React, { useState, useRef, useEffect } from 'react';

interface HelperIconProps {
  content: React.ReactNode;
  icon?: string; // Material icon name
  label?: string; // Accessible label
  className?: string;
}

const HelperIcon: React.FC<HelperIconProps> = ({ content, icon = 'help_outline', label = 'Show tips', className }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className={`relative inline-block ${className || ''}`} ref={ref}>
      <button
        type="button"
        aria-label={label}
        onClick={() => setOpen((v) => !v)}
        className="p-1 rounded-full hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        <span className="material-icons text-blue-500 text-xl align-middle">{icon}</span>
      </button>
      {open && (
        <div className="absolute z-50 left-1/2 -translate-x-1/2 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg p-4 animate-fade-in">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-blue-700 text-sm">Tips</span>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-gray-700 p-1 rounded-full"
              aria-label="Close tips"
            >
              <span className="material-icons text-base">close</span>
            </button>
          </div>
          <div className="text-gray-700 text-sm">{content}</div>
        </div>
      )}
    </div>
  );
};

export default HelperIcon; 