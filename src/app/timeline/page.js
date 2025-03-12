'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Button,
  HStack,
  IconButton,
} from '@chakra-ui/react';
import {
  TimelineConnector,
  TimelineContent,
  TimelineDescription,
  TimelineItem,
  TimelineRoot,
  TimelineTitle,
} from '@/components/ui/timeline';
import { LuClock, LuCoffee, LuClockAlert } from 'react-icons/lu';
import { MdDelete } from 'react-icons/md';
import { toaster } from '@/components/ui/toaster';
import { FaTrash } from 'react-icons/fa';

const formatDateTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
};

const formatDuration = (seconds) => {
  if (!seconds && seconds !== 0) return '';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

const isToday = (timestamp) => {
  if (!timestamp) return false;
  const date = new Date(timestamp);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

const TimelinePage = () => {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    // Load session history from localStorage
    const savedSessions = localStorage.getItem('pomodoroSessions');
    if (savedSessions) {
      try {
        const parsedSessions = JSON.parse(savedSessions);
        console.log('Loaded sessions:', parsedSessions);

        // Filter sessions to only show today's sessions
        const todaySessions = parsedSessions.filter((session) => isToday(session.startTime));

        // Sort sessions by start time in descending order (newest first)
        const sortedSessions = todaySessions.sort((a, b) => b.startTime - a.startTime);
        setSessions(sortedSessions);
      } catch (error) {
        console.error('Error parsing session history:', error);
        setSessions([]);
      }
    }
  }, []);

  const clearTodaySessions = () => {
    const savedSessions = localStorage.getItem('pomodoroSessions');
    if (savedSessions) {
      try {
        const parsedSessions = JSON.parse(savedSessions);
        // Filter out today's sessions
        const filteredSessions = parsedSessions.filter((session) => !isToday(session.startTime));
        // Save the filtered sessions back to local storage
        localStorage.setItem('pomodoroSessions', JSON.stringify(filteredSessions));
        // Update the state
        setSessions([]);

        // Use toaster
        toaster.create({
          description: 'All sessions for today have been removed',
          type: 'success',
        });
      } catch (error) {
        console.error("Error clearing today's sessions:", error);

        // Use toaster for error message
        toaster.create({
          description: "Failed to clear today's sessions",
          type: 'error',
        });
      }
    }
  };

  if (sessions.length === 0) {
    return (
      <Container maxW="container.md" centerContent py={10}>
        <Heading mb={6} fontSize="4xl" textAlign="center">
          Today's Sessions
        </Heading>
        <Text>
          No sessions recorded today. Complete some work or break sessions to see them here.
        </Text>
      </Container>
    );
  }

  return (
    <Container maxW="container.md" py={10}>
      <VStack spacing={6} align="stretch">
        <Heading mb={4} fontSize="4xl" textAlign="center">
          Today's Sessions
        </Heading>

        <Box p={6} borderRadius="lg" shadow="md">
          <Box display="flex" justifyContent="flex-end" mb={4}>
            <Button size="sm" colorPalette="red" variant="ghost" onClick={clearTodaySessions}>
              <FaTrash />
              Clear today's sessions
            </Button>
          </Box>

          <TimelineRoot>
            {sessions.map((session, index) => (
              <TimelineItem key={session.id} isLast={index === sessions.length - 1}>
                <TimelineConnector>
                  {session.type === 'work' ? (
                    <LuClock />
                  ) : session.type === 'break' ? (
                    <LuCoffee />
                  ) : (
                    <LuClockAlert />
                  )}
                </TimelineConnector>
                <TimelineContent>
                  <TimelineTitle>
                    {session.type === 'work' ? 'Work Session' : 'Break Session'}
                    {session.overtime && ' (Overtime)'}
                  </TimelineTitle>
                  <TimelineDescription>{formatDateTime(session.startTime)}</TimelineDescription>
                  <Box mt={2}>
                    <Text fontSize="sm">Duration: {formatDuration(session.duration)}</Text>
                    {session.type === 'work' && (
                      <Text
                        fontSize="sm"
                        color={session.offTrackCount > 0 ? 'orange.500' : 'green.500'}
                      >
                        Off-track count: {session.offTrackCount || 0}
                      </Text>
                    )}
                    {session.type === 'break' && session.activity && (
                      <Text fontSize="sm">Activity: {session.activity}</Text>
                    )}
                  </Box>
                </TimelineContent>
              </TimelineItem>
            ))}
          </TimelineRoot>
        </Box>
      </VStack>
    </Container>
  );
};

export default TimelinePage;
