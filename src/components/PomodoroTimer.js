// components/PomodoroTimer.js
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Button, Heading, Text, HStack, ProgressCircle, Highlight } from '@chakra-ui/react';
import { LuArrowRight } from 'react-icons/lu';
import BreakActivitySelector from './BreakActivitySelector';
import WorkSessionPrepDialog from './WorkSessionPrepDialog';

const PomodoroTimer = () => {
  // Initialize state with null values, will be set from localStorage
  const [workDuration, setWorkDuration] = useState(null);
  const [breakDuration, setBreakDuration] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState('work'); // 'work' or 'break'
  const [offTrackCount, setOffTrackCount] = useState(0); // Track number of times user went off-track

  // New overtime state
  const [isOvertime, setIsOvertime] = useState(false);
  const [overtimeSeconds, setOvertimeSeconds] = useState(0);

  const [breakActivities, setBreakActivities] = useState(null);
  const [selectedBreakActivity, setSelectedBreakActivity] = useState('');
  const [isBreakActivityModalOpen, setIsBreakActivityModalOpen] = useState(false);

  const [timeRanges, setTimeRanges] = useState([]);
  const [currentTimeRange, setCurrentTimeRange] = useState(null);

  // Ref to store the timer ID
  const timerId = useRef(null);
  // Ref to store the audio element for start sound
  const soundRefPomodoroStart = useRef(null);
  // Ref to store the audio element for end sound
  const soundRefPomodoroEnd = useRef(null);
  // Flag to track if settings have been loaded
  const settingsLoaded = useRef(false);
  // Store the timestamp when timer was started/resumed
  const timerStartTimestamp = useRef(null);
  // Store the timeLeft value when timer was last started/resumed
  const timerStartTimeLeft = useRef(null);
  // Track the previous mode to detect actual mode changes
  const prevModeRef = useRef(mode);

  const incrementOffTrackCount = () => {
    setOffTrackCount((prevCount) => prevCount + 1);
  };

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
      timeRanges: [],
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
    setTimeRanges(settings.timeRanges || []);
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
      timerStartTimestamp.current = Date.now();
      timerStartTimeLeft.current = 0;
      // We don't clear the interval or stop the timer
    } else {
      // For break mode, save the session before transitioning back to work
      const breakSession = {
        id: Date.now(),
        type: 'break',
        startTime: timerStartTimestamp.current,
        duration: breakDuration,
        offTrackCount: 0,
        overtime: false,
        activity: selectedBreakActivity,
      };
      saveSessionToLocalStorage(breakSession);

      // Then proceed with break completion
      clearInterval(timerId.current);
      setIsRunning(false);
      notifyUser('Break over! Time to work.');
      setMode('work');
      setTimeLeft(workDuration);
      setSelectedBreakActivity('');
      setIsOvertime(false);
      setOvertimeSeconds(0);
      setOffTrackCount(0); // Reset off-track count when new work session starts
      timerStartTimestamp.current = null;
    }
  }, [mode, notifyUser, workDuration, breakDuration, selectedBreakActivity]);

  // Make saveSessionToLocalStorage available at component level
  const saveSessionToLocalStorage = (session) => {
    const savedSessions = localStorage.getItem('pomodoroSessions');
    let sessions = [];
    if (savedSessions) {
      try {
        sessions = JSON.parse(savedSessions);
      } catch (error) {
        console.error('Error parsing session history:', error);
      }
    }
    sessions.push(session);
    localStorage.setItem('pomodoroSessions', JSON.stringify(sessions));
    console.log('Session saved:', session);
  };

  // Update the browser tab title whenever timeLeft, overtime or mode changes
  useEffect(() => {
    if (timeLeft === null) return; // Don't update title until settings are loaded

    if (isOvertime && mode === 'work') {
      document.title = `+${formatTime(overtimeSeconds)} OT - Work`;
    } else {
      document.title = `${formatTime(timeLeft)} - ${mode === 'work' ? 'Work' : 'Break'}`;
    }
  }, [timeLeft, mode, isOvertime, overtimeSeconds]);

  // Timer effect with Date-based approach to handle background tab throttling
  useEffect(() => {
    if (isRunning && timeLeft !== null) {
      // Store starting time and timeLeft values when timer starts
      if (!timerStartTimestamp.current) {
        timerStartTimestamp.current = Date.now();
        timerStartTimeLeft.current = isOvertime && mode === 'work' ? overtimeSeconds : timeLeft;
      }

      timerId.current = setInterval(() => {
        const currentTime = Date.now();
        const elapsedSeconds = Math.floor((currentTime - timerStartTimestamp.current) / 1000);

        if (isOvertime && mode === 'work') {
          // In overtime mode for work, increment the overtime counter based on actual elapsed time
          const newOvertimeSeconds = timerStartTimeLeft.current + elapsedSeconds;

          // Check if we need to send a reminder notification (every 5 minutes)
          if (Math.floor(newOvertimeSeconds / 300) > Math.floor(overtimeSeconds / 300)) {
            notifyUser('Overtime reminder: Check your work emails or team chat');
          }

          setOvertimeSeconds(newOvertimeSeconds);
        } else {
          // Regular timer countdown based on actual elapsed time
          const newTimeLeft = Math.max(0, timerStartTimeLeft.current - elapsedSeconds);

          // Update the timeLeft
          setTimeLeft(newTimeLeft);

          // Check if timer completed
          if (newTimeLeft === 0 && timerStartTimeLeft.current > 0) {
            handleTimerComplete();
          }
        }
      }, 1000);
    }

    return () => {
      clearInterval(timerId.current);
      // Save current values if we're stopping the timer
      if (!isRunning || timeLeft === null) {
        timerStartTimestamp.current = null;
      }
    };
  }, [isRunning, handleTimerComplete, isOvertime, mode, notifyUser, timeLeft, overtimeSeconds]);

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

  // Effect to handle actual mode changes - reset timeLeft only when mode truly changes
  useEffect(() => {
    // If this is a genuine mode change (not just a render)
    if (mode !== prevModeRef.current && workDuration !== null && breakDuration !== null) {
      prevModeRef.current = mode;

      // Only reset the timer if we're not currently running
      // This prevents mode changes from affecting a running timer
      if (!isRunning) {
        setTimeLeft(mode === 'work' ? workDuration : breakDuration);
      }
    }
  }, [mode, workDuration, breakDuration, isRunning]);

  // Effect to update current time range
  useEffect(() => {
    const updateCurrentTimeRange = () => {
      const now = new Date();
      const currentHour = now.getHours().toString().padStart(2, '0');
      const currentMinute = now.getMinutes().toString().padStart(2, '0');
      const currentTime = `${currentHour}:${currentMinute}`;

      const currentRange = timeRanges.find((range) => {
        const startTime = `${range.startHour}:${range.startMinute}`;
        const endTime = `${range.endHour}:${range.endMinute}`;
        return currentTime >= startTime && currentTime <= endTime;
      });

      setCurrentTimeRange(currentRange);
    };

    // Update immediately and then every minute
    updateCurrentTimeRange();
    const interval = setInterval(updateCurrentTimeRange, 60000);

    return () => clearInterval(interval);
  }, [timeRanges]);

  useEffect(() => {
    const saveSessionToLocalStorage = (session) => {
      const savedSessions = localStorage.getItem('pomodoroSessions');
      let sessions = [];
      if (savedSessions) {
        try {
          sessions = JSON.parse(savedSessions);
        } catch (error) {
          console.error('Error parsing session history:', error);
        }
      }
      sessions.push(session);
      localStorage.setItem('pomodoroSessions', JSON.stringify(sessions));
      console.log('Session saved:', session); // Log the saved session
    };

    if (!isRunning && timeLeft === 0 && timerStartTimestamp.current) {
      const session = {
        id: Date.now(),
        type: mode,
        startTime: timerStartTimestamp.current,
        duration: mode === 'work' ? workDuration : breakDuration,
        offTrackCount,
        overtime: isOvertime,
        activity: selectedBreakActivity,
      };
      saveSessionToLocalStorage(session);
    }
  }, [
    isRunning,
    timeLeft,
    mode,
    workDuration,
    breakDuration,
    offTrackCount,
    isOvertime,
    selectedBreakActivity,
  ]);

  const handleBreakActivitySelect = (activity) => {
    setSelectedBreakActivity(activity);
    setMode('break');
    setTimeLeft(breakDuration);
    setIsBreakActivityModalOpen(false);
    setIsOvertime(false);
    setOvertimeSeconds(0);
    timerStartTimestamp.current = null;
  };

  // Add state for the prep dialog
  const [isPrepDialogOpen, setIsPrepDialogOpen] = useState(false);

  // Toggle start/pause and play start sound if starting
  const toggleTimer = () => {
    const willBeRunning = !isRunning;

    // If we are in work mode and going to start the timer, show the prep dialog
    if (willBeRunning && mode === 'work' && !isOvertime) {
      setIsPrepDialogOpen(true);
      return; // Don't start the timer yet
    }

    // If the timer is currently paused, play the start sound
    if (willBeRunning && soundRefPomodoroStart.current) {
      soundRefPomodoroStart.current.currentTime = 0;
      soundRefPomodoroStart.current.play().catch((err) => {
        console.error('Start sound playback failed:', err);
      });
    }

    if (willBeRunning) {
      // Starting/resuming the timer - store current timestamp and timeLeft
      timerStartTimestamp.current = Date.now();
      timerStartTimeLeft.current = isOvertime && mode === 'work' ? overtimeSeconds : timeLeft;
    } else {
      // Pausing the timer - update timeLeft/overtimeSeconds based on actual elapsed time
      const elapsedSeconds = Math.floor((Date.now() - timerStartTimestamp.current) / 1000);

      if (isOvertime && mode === 'work') {
        setOvertimeSeconds(timerStartTimeLeft.current + elapsedSeconds);
      } else {
        setTimeLeft(Math.max(0, timerStartTimeLeft.current - elapsedSeconds));
      }

      // Clear the start timestamp
      timerStartTimestamp.current = null;
    }

    setIsRunning(willBeRunning);
  };

  // Handle actual start of session after prep
  const handleStartAfterPrep = () => {
    // Play start sound
    if (soundRefPomodoroStart.current) {
      soundRefPomodoroStart.current.currentTime = 0;
      soundRefPomodoroStart.current.play().catch((err) => {
        console.error('Start sound playback failed:', err);
      });
    }

    // Start the timer
    timerStartTimestamp.current = Date.now();
    timerStartTimeLeft.current = timeLeft;
    setIsRunning(true);
  };

  // Reset the timer to the full duration of the current mode
  const resetTimer = () => {
    clearInterval(timerId.current);
    setIsRunning(false);
    setTimeLeft(mode === 'work' ? workDuration : breakDuration);
    setIsOvertime(false);
    setOvertimeSeconds(0);
    timerStartTimestamp.current = null;
  };

  // Function to handle a session being skipped (whether work or break)
  const skipSession = () => {
    clearInterval(timerId.current);
    setIsRunning(false);

    if (mode === 'work') {
      // For a work session, save it before transitioning to break
      const workSession = {
        id: Date.now(),
        type: 'work',
        startTime: timerStartTimestamp.current || Date.now() - (workDuration - timeLeft) * 1000,
        duration: workDuration - timeLeft,
        offTrackCount,
        overtime: isOvertime,
        activity: null,
      };
      saveSessionToLocalStorage(workSession);

      // Now notify and open the break activity selector
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
      setOffTrackCount(0); // Reset off-track count when skipping from break to work
    }
    timerStartTimestamp.current = null;
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
      <Heading mb={3} fontSize="4xl">
        {isOvertime && mode === 'work'
          ? 'Work Overtime'
          : mode === 'work'
            ? 'Work Session'
            : 'Break Time'}
      </Heading>
      {currentTimeRange && (
        <Heading size="lg" color="gray.500" mb={2}>
          <Highlight query={currentTimeRange.name} styles={{ color: 'teal.600' }}>
            {`Current time block: ${currentTimeRange.name}`}
          </Highlight>
        </Heading>
      )}
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
          variant="outline"
          colorScheme="yellow"
          onClick={incrementOffTrackCount}
          title="Increment off-track count"
        >
          Off-Track ({offTrackCount})
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

      {/* Add WorkSessionPrepDialog */}
      <WorkSessionPrepDialog
        isOpen={isPrepDialogOpen}
        onClose={() => setIsPrepDialogOpen(false)}
        onStartSession={handleStartAfterPrep}
      />
    </Box>
  );
};

export default PomodoroTimer;
