// components/PomodoroTimer.js
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Button, Heading, Text, HStack, ProgressCircle } from '@chakra-ui/react';
import { LuArrowRight } from 'react-icons/lu';
import BreakActivitySelector from './BreakActivitySelector';

const PomodoroTimer = () => {
  // Component state
  const [workDuration, setWorkDuration] = useState(25 * 60);
  const [breakDuration, setBreakDuration] = useState(5 * 60);

  const [timeLeft, setTimeLeft] = useState(workDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState('work'); // 'work' or 'break'

  const [breakActivities, setBreakActivities] = useState({
    Yellow: [
      'Kitchen cleaning',
      'Take out trash',
      'Short walk',
      'Watch candle',
      'Short meditation',
      'Plan more tasks for the day',
    ],
    Blue: ['Youtube shorts', 'Instagram reels', 'Read short article/news'],
    Green: ['Read a few pages from book', 'Piano', 'Learn MK1 combos', 'Journaling'],
    Red: ['Yoga Nidra'],
  });

  const [selectedBreakActivity, setSelectedBreakActivity] = useState('');
  const [isBreakActivityModalOpen, setIsBreakActivityModalOpen] = useState(false);

  // Ref to store the timer ID
  const timerId = useRef(null);
  // Ref to store the audio element for start sound
  const soundRefPomodoroStart = useRef(null);
  // Ref to store the audio element for end sound
  const soundRefPomodoroEnd = useRef(null);

  // Function to send a desktop notification and play sound
  const notifyUser = useCallback((message) => {
    // Play the sound if available
    if (soundRefPomodoroEnd.current) {
      // Restart the sound in case it was played before
      soundRefPomodoroEnd.current.currentTime = 0;
      soundRefPomodoroEnd.current.volume = 0.5;
      soundRefPomodoroEnd.current.play().catch((err) => {
        // Some browsers block autoplay until the user interacts with the page.
        console.error('Audio playback failed:', err);
      });
    }

    // Send browser notification if permission is granted
    if (Notification.permission === 'granted') {
      new Notification(message);
    } else if (Notification.permission !== 'denied') {
      // Request permission if not already granted or denied
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification(message);
        }
      });
    }
  }, []);

  const handleTimerComplete = useCallback(() => {
    clearInterval(timerId.current);
    setIsRunning(false);
    if (mode === 'work') {
      notifyUser('Work session complete! Please select a break activity.');
      setIsBreakActivityModalOpen(true);
    } else {
      notifyUser('Break over! Time to work.');
      setMode('work');
      setTimeLeft(workDuration);
      setSelectedBreakActivity('');
    }
  }, [mode, notifyUser, workDuration]);

  // Create audio elements on mount (place your sound files in the public folder)
  useEffect(() => {
    if (!soundRefPomodoroStart.current) {
      soundRefPomodoroStart.current = new Audio('/pomodoro_start.wav');
    }
    if (!soundRefPomodoroEnd.current) {
      soundRefPomodoroEnd.current = new Audio('/pomodoro_stop.wav');
    }

    // Load settings from localStorage
    const savedSettings = localStorage.getItem('pomodoroSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setWorkDuration(parsedSettings.workDuration);
        setBreakDuration(parsedSettings.breakDuration);
        setBreakActivities(parsedSettings.breakActivities);
        // Update timeLeft based on current mode
        setTimeLeft(mode === 'work' ? parsedSettings.workDuration : parsedSettings.breakDuration);
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, [mode]); // Include mode as a dependency since it's used in the effect

  // Update the browser tab title whenever timeLeft or mode changes
  useEffect(() => {
    document.title = `${formatTime(timeLeft)} - ${mode === 'work' ? 'Work' : 'Break'}`;
  }, [timeLeft, mode]);

  // Timer effect
  useEffect(() => {
    if (isRunning) {
      timerId.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime > 0) return prevTime - 1;
          else {
            handleTimerComplete();
            return 0;
          }
        });
      }, 1000);
    }
    return () => clearInterval(timerId.current);
  }, [isRunning, handleTimerComplete]);

  // Listen for settings changes
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'pomodoroSettings') {
        try {
          const parsedSettings = JSON.parse(e.newValue);
          setWorkDuration(parsedSettings.workDuration);
          setBreakDuration(parsedSettings.breakDuration);
          setBreakActivities(parsedSettings.breakActivities);

          // Only update the current timer if it's not running
          if (!isRunning) {
            setTimeLeft(
              mode === 'work' ? parsedSettings.workDuration : parsedSettings.breakDuration
            );
          }
        } catch (error) {
          console.error('Error processing settings change:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isRunning, mode]);

  const handleBreakActivitySelect = (activity) => {
    setSelectedBreakActivity(activity);
    setMode('break');
    setTimeLeft(breakDuration);
    setIsBreakActivityModalOpen(false);
  };

  // Toggle start/pause and play start sound if starting
  const toggleTimer = () => {
    // If the timer is currently paused, play the start sound
    if (!isRunning && soundRefPomodoroStart.current) {
      soundRefPomodoroStart.current.currentTime = 0;
      soundRefPomodoroStart.current.play().catch((err) => {
        console.error('Start sound playback failed:', err);
      });
    }
    setIsRunning((prev) => !prev);
  };

  // Reset the timer to the full duration of the current mode
  const resetTimer = () => {
    clearInterval(timerId.current);
    setIsRunning(false);
    setTimeLeft(mode === 'work' ? workDuration : breakDuration);
  };

  // Function to handle a session being skipped (whether work or break)
  const skipSession = () => {
    clearInterval(timerId.current);
    setIsRunning(false);
    if (mode === 'work') {
      // For a work session, notify and open the break activity selector
      notifyUser('Work session skipped! Please select a break activity.');
      setIsBreakActivityModalOpen(true);
    } else {
      // For a break session, simply notify and transition back to work
      notifyUser('Break session skipped! Time to work.');
      setMode('work');
      setTimeLeft(workDuration);
      setSelectedBreakActivity('');
    }
  };

  // Helper function to format seconds as mm:ss
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // At the top of your component (or inside your render/return), compute:
  const currentSessionDuration = mode === 'work' ? workDuration : breakDuration;
  const progress = ((currentSessionDuration - timeLeft) / currentSessionDuration) * 100;

  return (
    <Box p={10} shadow="lg" borderWidth="1px" borderRadius="lg" textAlign="center">
      <Heading mb={6} fontSize="4xl">
        {mode === 'work' ? 'Work Session' : 'Break Time'}
      </Heading>
      {mode === 'break' && selectedBreakActivity && (
        <Text fontSize="lg" mt={2} mb={2}>
          Activity: {selectedBreakActivity}
        </Text>
      )}
      <Text fontSize="5xl" mb={6}>
        {formatTime(timeLeft)}
      </Text>
      <ProgressCircle.Root size="xl" value={progress} mb={7}>
        <ProgressCircle.Circle thickness="8px">
          <ProgressCircle.Track stroke="#e2e8f0" />
          <ProgressCircle.Range stroke={mode === 'work' ? 'blue.400' : 'green.400'} />
        </ProgressCircle.Circle>
      </ProgressCircle.Root>
      <HStack spacing={4} justify="center">
        <Button colorScheme="blue" onClick={toggleTimer}>
          {isRunning ? 'Pause' : 'Start'}
        </Button>
        <Button variant="outline" colorScheme="red" onClick={resetTimer}>
          Reset
        </Button>
        <Button
          colorScheme="orange"
          variant="outline"
          onClick={skipSession}
          title="Skip current session"
        >
          <LuArrowRight />
        </Button>
      </HStack>

      <BreakActivitySelector
        isOpen={isBreakActivityModalOpen}
        onClose={() => setIsBreakActivityModalOpen(false)}
        breakActivities={breakActivities}
        onSelect={handleBreakActivitySelect}
      />
    </Box>
  );
};

export default PomodoroTimer;
