// components/PomodoroTimer.js
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Button, Heading, Text, HStack, ProgressCircle } from '@chakra-ui/react';
import { LuArrowRight } from 'react-icons/lu';
import BreakActivitySelector from './BreakActivitySelector';

const PomodoroTimer = () => {
  // Initialize state with null values, will be set from localStorage
  const [workDuration, setWorkDuration] = useState(null);
  const [breakDuration, setBreakDuration] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState('work'); // 'work' or 'break'

  // New overtime state
  const [isOvertime, setIsOvertime] = useState(false);
  const [overtimeSeconds, setOvertimeSeconds] = useState(0);

  const [breakActivities, setBreakActivities] = useState(null);
  const [selectedBreakActivity, setSelectedBreakActivity] = useState('');
  const [isBreakActivityModalOpen, setIsBreakActivityModalOpen] = useState(false);

  // Ref to store the timer ID
  const timerId = useRef(null);
  // Ref to store the audio element for start sound
  const soundRefPomodoroStart = useRef(null);
  // Ref to store the audio element for end sound
  const soundRefPomodoroEnd = useRef(null);
  // Flag to track if settings have been loaded
  const settingsLoaded = useRef(false);

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

  // Load settings from localStorage on component mount
  useEffect(() => {
    if (!soundRefPomodoroStart.current) {
      soundRefPomodoroStart.current = new Audio('/pomodoro_start.wav');
    }
    if (!soundRefPomodoroEnd.current) {
      soundRefPomodoroEnd.current = new Audio('/pomodoro_stop.wav');
    }

    // Default settings to use if none are found in localStorage
    const defaultSettings = {
      workDuration: 30 * 60, // 30 minutes
      breakDuration: 8 * 60, // 8 minutes
      breakActivities: {
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
      },
    };

    // Load settings from localStorage
    const savedSettings = localStorage.getItem('pomodoroSettings');
    let settings;

    if (savedSettings) {
      try {
        settings = JSON.parse(savedSettings);
      } catch (error) {
        console.error('Error parsing settings from localStorage:', error);
        settings = defaultSettings;
      }
    } else {
      settings = defaultSettings;
    }

    // Set state with loaded or default settings
    setWorkDuration(settings.workDuration);
    setBreakDuration(settings.breakDuration);
    setBreakActivities(settings.breakActivities);
    setTimeLeft(settings.workDuration); // Start with work duration

    settingsLoaded.current = true;
  }, []); // Only run on mount

  const handleTimerComplete = useCallback(() => {
    if (mode === 'work') {
      // For work mode, start tracking overtime instead of stopping
      notifyUser('Work session complete! You are now in overtime.');
      setIsOvertime(true);
      setOvertimeSeconds(0);
      // Continue running the timer for overtime tracking

      // We don't clear the interval or stop the timer
    } else {
      // For break mode, behavior remains the same
      clearInterval(timerId.current);
      setIsRunning(false);
      notifyUser('Break over! Time to work.');
      setMode('work');
      setTimeLeft(workDuration);
      setSelectedBreakActivity('');
      setIsOvertime(false);
      setOvertimeSeconds(0);
    }
  }, [mode, notifyUser, workDuration]);

  // Update the browser tab title whenever timeLeft, overtime or mode changes
  useEffect(() => {
    if (timeLeft === null) return; // Don't update title until settings are loaded

    if (isOvertime && mode === 'work') {
      document.title = `+${formatTime(overtimeSeconds)} OT - Work`;
    } else {
      document.title = `${formatTime(timeLeft)} - ${mode === 'work' ? 'Work' : 'Break'}`;
    }
  }, [timeLeft, mode, isOvertime, overtimeSeconds]);

  // Timer effect
  useEffect(() => {
    if (isRunning && timeLeft !== null) {
      timerId.current = setInterval(() => {
        if (isOvertime && mode === 'work') {
          // In overtime mode for work, increment the overtime counter
          setOvertimeSeconds((prevOT) => {
            // Check if we need to send a reminder notification
            if ((prevOT + 1) % 300 === 0) {
              // Every 5 minutes (300 seconds)
              notifyUser('Overtime reminder: Check your work emails or team chat');
            }
            return prevOT + 1;
          });
        } else {
          // Regular timer countdown
          setTimeLeft((prevTime) => {
            if (prevTime > 0) return prevTime - 1;
            else {
              handleTimerComplete();
              return 0;
            }
          });
        }
      }, 1000);
    }
    return () => clearInterval(timerId.current);
  }, [isRunning, handleTimerComplete, isOvertime, mode, notifyUser, timeLeft]);

  // Listen for settings changes from other tabs or windows
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

  // Effect to handle mode changes - update timeLeft when mode changes
  useEffect(() => {
    if (!isRunning && workDuration !== null && breakDuration !== null) {
      setTimeLeft(mode === 'work' ? workDuration : breakDuration);
    }
  }, [mode, workDuration, breakDuration, isRunning]);

  const handleBreakActivitySelect = (activity) => {
    setSelectedBreakActivity(activity);
    setMode('break');
    setTimeLeft(breakDuration);
    setIsBreakActivityModalOpen(false);
    setIsOvertime(false);
    setOvertimeSeconds(0);
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
    setIsOvertime(false);
    setOvertimeSeconds(0);
  };

  // Function to handle a session being skipped (whether work or break)
  const skipSession = () => {
    clearInterval(timerId.current);
    setIsRunning(false);
    if (mode === 'work') {
      // For a work session, notify and open the break activity selector
      notifyUser('Work session skipped! Please select a break activity.');
      setIsBreakActivityModalOpen(true);
      setIsOvertime(false);
      setOvertimeSeconds(0);
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
    if (seconds === null) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // If settings haven't loaded yet, show a loading state
  if (
    timeLeft === null ||
    workDuration === null ||
    breakDuration === null ||
    breakActivities === null
  ) {
    return (
      <Box p={10} shadow="lg" borderWidth="1px" borderRadius="lg" textAlign="center">
        <Heading mb={6} fontSize="4xl">
          Loading settings...
        </Heading>
      </Box>
    );
  }

  // For normal mode, compute progress percentage
  let progress = 0;
  let progressColor = mode === 'work' ? 'blue.400' : 'green.400';

  if (isOvertime && mode === 'work') {
    // For overtime, we don't set a progress value since we don't know how long it will be
    progress = null;
    progressColor = 'red.500';
  } else {
    // Regular progress calculation
    const currentSessionDuration = mode === 'work' ? workDuration : breakDuration;
    progress = ((currentSessionDuration - timeLeft) / currentSessionDuration) * 100;
  }

  return (
    <Box p={10} shadow="lg" borderWidth="1px" borderRadius="lg" textAlign="center">
      <Heading mb={6} fontSize="4xl">
        {isOvertime && mode === 'work'
          ? 'Work Overtime'
          : mode === 'work'
            ? 'Work Session'
            : 'Break Time'}
      </Heading>
      {mode === 'break' && selectedBreakActivity && (
        <Text fontSize="lg" mt={2} mb={2}>
          Activity: {selectedBreakActivity}
        </Text>
      )}
      <Text fontSize="5xl" mb={6}>
        {isOvertime && mode === 'work' ? `+${formatTime(overtimeSeconds)}` : formatTime(timeLeft)}
      </Text>
      <ProgressCircle.Root size="xl" value={progress} mb={7}>
        <ProgressCircle.Circle thickness="8px">
          <ProgressCircle.Track stroke="#e2e8f0" />
          <ProgressCircle.Range stroke={progressColor} />
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
