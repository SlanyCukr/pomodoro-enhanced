import React, { useState } from 'react';
import { Box, Button, Center } from '@chakra-ui/react';
import safeColors from '@/utils/safeColors';
import { PiSpinnerGapFill } from 'react-icons/pi';

const SpinningWheel = ({ activities, onSpinEnd }) => {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);

  const colors = Object.keys(activities);
  const totalSlices = colors.reduce((acc, color) => acc + activities[color].length, 0);
  const sliceAngle = 360 / totalSlices;

  const getRandomDegrees = () => 3600 + Math.random() * 360;

  const spin = () => {
    if (isSpinning) return;

    const newRotation = rotation + getRandomDegrees();
    setIsSpinning(true);
    setRotation(newRotation);

    // After the spin animation (5s), determine the winning slice.
    setTimeout(() => {
      const finalRotation = newRotation % 360;
      // Pointer is fixed at top center (which corresponds to 270°)
      const pointerAngle = 270;
      // Compute effective angle: the angle on the wheel that aligns with the pointer.
      const effectiveAngle = (pointerAngle - finalRotation + 360) % 360;
      const sliceIndex = Math.floor(effectiveAngle / sliceAngle);

      let count = 0;
      let activity = null;
      for (const color of colors) {
        const colorActivities = activities[color];
        if (sliceIndex < count + colorActivities.length) {
          activity = colorActivities[sliceIndex - count];
          setSelectedActivity(activity);
          if (onSpinEnd) onSpinEnd(activity);
          break;
        }
        count += colorActivities.length;
      }
      setIsSpinning(false);
    }, 5000);
  };

  // Use a 1000x1000 coordinate system for better detail
  const wheelSize = 1000;
  const center = wheelSize / 2; // 500
  const radius = 0.9 * center; // 450

  let currentAngle = 0;
  const slices = [];

  colors.forEach((color) => {
    const colorActivities = activities[color];
    const sliceFillColor = safeColors[color];

    colorActivities.forEach((activity) => {
      const startAngle = currentAngle;
      const endAngle = currentAngle + sliceAngle;
      // Compute the mid–angle for the radial text path.
      const midAngle = startAngle + sliceAngle / 2;
      const midAngleRad = (midAngle * Math.PI) / 180;

      // Determine arc endpoints.
      const start = {
        x: center + radius * Math.cos((startAngle * Math.PI) / 180),
        y: center + radius * Math.sin((startAngle * Math.PI) / 180),
      };
      const end = {
        x: center + radius * Math.cos((endAngle * Math.PI) / 180),
        y: center + radius * Math.sin((endAngle * Math.PI) / 180),
      };

      const largeArcFlag = sliceAngle > 180 ? 1 : 0;
      const pathData = `M ${center} ${center} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`;

      // Build the radial text path from the center to the outer edge along the mid–angle.
      const textPathData = `M ${center} ${center} L ${center + radius * Math.cos(midAngleRad)} ${center + radius * Math.sin(midAngleRad)}`;
      const textPathId = `textPath-${activity.replace(/\s+/g, '-')}`;

      slices.push(
        <g key={activity}>
          <path
            d={pathData}
            fill={sliceFillColor}
            stroke="grey"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <defs>
            <path id={textPathId} d={textPathData} fill="none" />
          </defs>
          <text
            style={{
              fontSize: '2em',
              fontWeight: 'bold',
              dominantBaseline: 'middle',
              textAnchor: 'middle',
              stroke: 'white',
              strokeWidth: '0.5',
            }}
          >
            <textPath
              href={`#${textPathId}`}
              startOffset="50%"
              textAnchor="middle"
              method="align"
              spacing="auto"
            >
              {activity}
            </textPath>
          </text>
        </g>
      );

      currentAngle += sliceAngle;
    });
  });

  return (
    <Box className="flex flex-col items-center space-y-4" marginBottom={4}>
      <Center>
        {/* Responsive square container */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: `${wheelSize}px`,
            margin: '0 auto',
            paddingTop: '100%', // maintains a square aspect ratio
          }}
        >
          {/* Rotating Wheel */}
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${wheelSize} ${wheelSize}`}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'transform 5s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none',
            }}
          >
            {slices}
          </svg>
          {/* Fixed Pointer Overlay */}
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${wheelSize} ${wheelSize}`}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            <defs>
              <filter id="dropShadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="black" />
              </filter>
            </defs>
            {/* 
              For a 640×640 wheel:
              - The top of the circle is at y = center - radius = 320 - 288 = 32.
              - To mimic your previous design, the pointer's tip is placed at (320,32) and its base 20px higher (y = 12).
            */}
            {/* Pointer dimensions scaled up for 1000x1000 wheel */}
            <polygon
              points={`${center - 15},20 ${center + 15},20 ${center},50`}
              fill="white"
              stroke="black"
              strokeWidth="3"
              filter="url(#dropShadow)"
            />
          </svg>
        </div>
      </Center>

      <Center>
        <Button
          onClick={spin}
          disabled={isSpinning}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
          variant="solid"
          colorPalette="blue"
        >
          <PiSpinnerGapFill />
          {isSpinning ? 'Spinning...' : 'Spin'}
        </Button>
      </Center>
    </Box>
  );
};

export default SpinningWheel;
