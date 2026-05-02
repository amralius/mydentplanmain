import { useState } from 'react';
import { getToothName } from './ToothNames';

interface ToothChartProps {
  selectedTeeth: (number | string)[];
  onToothClick: (toothNumber: number | string) => void;
  isPediatric: boolean;
}

export default function ToothChart({ selectedTeeth, onToothClick, isPediatric }: ToothChartProps) {
  const [hoveredTooth, setHoveredTooth] = useState<number | string | null>(null);

  const adultUpperRight = [1, 2, 3, 4, 5, 6, 7, 8];
  const adultUpperLeft = [9, 10, 11, 12, 13, 14, 15, 16];
  const adultLowerRight = [32, 31, 30, 29, 28, 27, 26, 25];
  const adultLowerLeft = [24, 23, 22, 21, 20, 19, 18, 17];

  const pediatricUpperRight = ['A', 'B', 'C', 'D', 'E'];
  const pediatricUpperLeft = ['F', 'G', 'H', 'I', 'J'];
  const pediatricLowerRight = ['T', 'S', 'R', 'Q', 'P'];
  const pediatricLowerLeft = ['O', 'N', 'M', 'L', 'K'];

  const upperRight = isPediatric ? pediatricUpperRight : adultUpperRight;
  const upperLeft = isPediatric ? pediatricUpperLeft : adultUpperLeft;
  const lowerRight = isPediatric ? pediatricLowerRight : adultLowerRight;
  const lowerLeft = isPediatric ? pediatricLowerLeft : adultLowerLeft;

  const isSelected = (tooth: number | string) => selectedTeeth.includes(tooth);
  const isHovered = (tooth: number | string) => hoveredTooth === tooth;

  const isFrontTooth = (tooth: number | string): boolean => {
    if (isPediatric) {
      return ['C', 'D', 'E', 'F', 'G', 'H', 'M', 'N', 'O', 'P', 'Q', 'R'].includes(tooth as string);
    }
    const toothNum = tooth as number;
    return (toothNum >= 6 && toothNum <= 11) || (toothNum >= 22 && toothNum <= 27);
  };

  const FrontToothIcon = ({ selected, hovered }: { selected: boolean; hovered: boolean }) => (
    <svg className="w-full h-full" viewBox="0 0 20 36" fill="none">
      <path
        d="M10 2C7.5 2 6 3.5 5.5 6C5 9 4.5 13 4.5 17C4.5 21 5 26 6.5 30C7.5 32.5 8.5 34 10 34C11.5 34 12.5 32.5 13.5 30C15 26 15.5 21 15.5 17C15.5 13 15 9 14.5 6C14 3.5 12.5 2 10 2Z"
        fill={selected ? 'currentColor' : hovered ? '#EFF6FF' : 'white'}
        stroke={selected ? 'currentColor' : hovered ? '#3B82F6' : '#E5E7EB'}
        strokeWidth={selected ? '2.5' : hovered ? '2' : '1.5'}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const BackToothIcon = ({ selected, hovered }: { selected: boolean; hovered: boolean }) => (
    <svg className="w-full h-full" viewBox="0 0 28 36" fill="none">
      <path
        d="M14 2C10.5 2 8 4 7 7C6 10 5.5 14 5.5 18C5.5 22 6 27 8 30.5C9.5 33 11.5 34 14 34C16.5 34 18.5 33 20 30.5C22 27 22.5 22 22.5 18C22.5 14 22 10 21 7C20 4 17.5 2 14 2Z"
        fill={selected ? 'currentColor' : hovered ? '#EFF6FF' : 'white'}
        stroke={selected ? 'currentColor' : hovered ? '#3B82F6' : '#E5E7EB'}
        strokeWidth={selected ? '2.5' : hovered ? '2' : '1.5'}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const renderTooth = (tooth: number | string) => {
    const ToothIcon = isFrontTooth(tooth) ? FrontToothIcon : BackToothIcon;

    return (
      <div key={tooth} className="relative group">
        <button
          onClick={() => onToothClick(tooth)}
          onMouseEnter={() => setHoveredTooth(tooth)}
          onMouseLeave={() => setHoveredTooth(null)}
          className={`relative flex flex-col items-center justify-center gap-1 transition-all duration-300 ease-out ${
            isSelected(tooth)
              ? 'scale-110'
              : isHovered(tooth)
              ? 'scale-105'
              : 'scale-100'
          }`}
          title={getToothName(tooth, isPediatric)}
        >
          <div
            className={`h-12 transition-all duration-300 ${
              isFrontTooth(tooth) ? 'w-8' : 'w-10'
            } ${
              isSelected(tooth)
                ? 'text-primary drop-shadow-lg'
                : isHovered(tooth)
                ? 'text-blue-400'
                : 'text-gray-300'
            }`}
          >
            <ToothIcon selected={isSelected(tooth)} hovered={isHovered(tooth)} />
          </div>
          <span
            className={`text-[10px] font-medium transition-all duration-300 ${
              isSelected(tooth)
                ? 'text-primary font-semibold'
                : isHovered(tooth)
                ? 'text-gray-700'
                : 'text-gray-400'
            }`}
          >
            {tooth}
          </span>
        </button>

        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-gray-900 text-white text-[10px] rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20 shadow-lg">
          {getToothName(tooth, isPediatric)}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    );
  };

  const renderLowerTooth = (tooth: number | string) => {
    const ToothIcon = isFrontTooth(tooth) ? FrontToothIcon : BackToothIcon;

    return (
      <div key={tooth} className="relative group">
        <button
          onClick={() => onToothClick(tooth)}
          onMouseEnter={() => setHoveredTooth(tooth)}
          onMouseLeave={() => setHoveredTooth(null)}
          className={`relative flex flex-col-reverse items-center justify-center gap-1 transition-all duration-300 ease-out ${
            isSelected(tooth)
              ? 'scale-110'
              : isHovered(tooth)
              ? 'scale-105'
              : 'scale-100'
          }`}
          title={getToothName(tooth, isPediatric)}
        >
          <div
            className={`h-12 transform rotate-180 transition-all duration-300 ${
              isFrontTooth(tooth) ? 'w-8' : 'w-10'
            } ${
              isSelected(tooth)
                ? 'text-primary drop-shadow-lg'
                : isHovered(tooth)
                ? 'text-blue-400'
                : 'text-gray-300'
            }`}
          >
            <ToothIcon selected={isSelected(tooth)} hovered={isHovered(tooth)} />
          </div>
          <span
            className={`text-[10px] font-medium transition-all duration-300 ${
              isSelected(tooth)
                ? 'text-primary font-semibold'
                : isHovered(tooth)
                ? 'text-gray-700'
                : 'text-gray-400'
            }`}
          >
            {tooth}
          </span>
        </button>

        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1 bg-gray-900 text-white text-[10px] rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20 shadow-lg">
          {getToothName(tooth, isPediatric)}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-900"></div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-[700px] mx-auto space-y-10">
      {/* Upper Teeth */}
      <div className="bg-gradient-to-b from-blue-50/50 to-white rounded-3xl p-6">
        <div className="text-center mb-5">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Upper Teeth</span>
        </div>
        <div className="flex justify-center items-end gap-6">
          <div className="flex items-end gap-1">
            {upperRight.map(tooth => renderTooth(tooth))}
          </div>
          <div className="flex items-end gap-1">
            {upperLeft.map(tooth => renderTooth(tooth))}
          </div>
        </div>
      </div>

      {/* Lower Teeth */}
      <div className="bg-gradient-to-t from-blue-50/50 to-white rounded-3xl p-6">
        <div className="flex justify-center items-start gap-6">
          <div className="flex items-start gap-1">
            {lowerRight.map(tooth => renderLowerTooth(tooth))}
          </div>
          <div className="flex items-start gap-1">
            {lowerLeft.map(tooth => renderLowerTooth(tooth))}
          </div>
        </div>
        <div className="text-center mt-5">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Lower Teeth</span>
        </div>
      </div>
    </div>
  );
}
