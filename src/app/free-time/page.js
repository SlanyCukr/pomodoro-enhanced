'use client';

import React, { useState } from 'react';
import { Container, Heading, Box, Highlight } from '@chakra-ui/react';
import SpinningWheel from '@/components/SpinningWheel';
import safeColors from '@/utils/safeColors';

const freeTimeActivities = {
  Yellow: [
    'Go for a walk',
    'Read a book',
    'Study with Dr. Huberman',
    'Study with Dr. K',
    'Watch a movie',
  ],
  Blue: ['Play The Witcher 3'],
  Green: ['Exercise', 'Piano practice', 'Practice MK1 combos', 'Practice CS2'],
  Red: ['Meditate', 'Deep breathing', 'Yoga'],
};

function FreeTimePage() {
  const [selectedActivity, setSelectedActivity] = useState('');

  const handleActivitySelected = (activity) => {
    setSelectedActivity(String(activity));
  };

  // Get activity color group based on the selected activity
  const getActivityColor = (activity) => {
    for (const [color, activities] of Object.entries(freeTimeActivities)) {
      if (activities.includes(activity)) {
        return color;
      }
    }
    return null;
  };

  const renderSelectedActivity = () => {
    if (!selectedActivity) return null;

    const activityColor = getActivityColor(selectedActivity);
    const highlightColor = activityColor ? safeColors[activityColor] : 'teal.600';

    return (
      <Heading size="lg" letterSpacing="tight">
        <Highlight query={selectedActivity} styles={{ backgroundColor: highlightColor }}>
          {`Selected Activity: ${selectedActivity}`}
        </Highlight>
      </Heading>
    );
  };

  return (
    <Container centerContent py={8}>
      <Heading mb={8} fontSize="5xl">
        Free Time
      </Heading>
      <Box p={10} shadow="lg" borderWidth="1px" borderRadius="lg" textAlign="center">
        {renderSelectedActivity()}
        <Box width="400px" mx="auto">
          <SpinningWheel activities={freeTimeActivities} onSpinEnd={handleActivitySelected} />
        </Box>
      </Box>
    </Container>
  );
}

export default FreeTimePage;
