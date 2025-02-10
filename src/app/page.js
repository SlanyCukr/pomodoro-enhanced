'use client';

// App.js
import React from 'react';
import PomodoroTimer from '../components/PomodoroTimer';

import { Container, Heading } from '@chakra-ui/react';

function App() {
  return (
    <Container centerContent py={8}>
      <Heading mb={8}>Pomodoro Timer</Heading>
      <PomodoroTimer />
    </Container>
  );
}

export default App;
