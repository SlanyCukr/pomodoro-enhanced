'use client';

import React, { useState, useEffect } from 'react';
import { Container, Heading, Button, Box, Input, Field } from '@chakra-ui/react';
import { LuArrowLeft } from 'react-icons/lu';
import Link from 'next/link';

function SettingsPage() {
  // Component state for settings
  const [workDuration, setWorkDuration] = useState(25 * 60);
  const [breakDuration, setBreakDuration] = useState(5 * 60);
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
  const [newActivity, setNewActivity] = useState({});

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('pomodoroSettings');
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setWorkDuration(parsedSettings.workDuration || workDuration);
      setBreakDuration(parsedSettings.breakDuration || breakDuration);
      setBreakActivities(parsedSettings.breakActivities || breakActivities);
    }
    // We're intentionally only running this on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array is correct here - we only want to load on mount

  // Save settings to localStorage
  const saveSettings = () => {
    const settings = {
      workDuration,
      breakDuration,
      breakActivities,
    };
    localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
    alert('Settings saved successfully!');
  };

  const styles = {
    Yellow: { bg: '#fefce8', text: '#854d0e', border: '#fef08a' },
    Blue: { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' },
    Green: { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0' },
    Red: { bg: '#fef2f2', text: '#991b1b', border: '#fecaca' },
  };

  return (
    <Container centerContent py={8}>
      <Box display="flex" alignItems="center" width="100%" mb={4}>
        <Link href="/" passHref>
          <Button leftIcon={<LuArrowLeft />} variant="outline">
            Back to Timer
          </Button>
        </Link>
        <Heading ml="auto" mr="auto">
          Settings
        </Heading>
      </Box>

      <Box p={6} shadow="lg" borderWidth="1px" borderRadius="lg" width="100%">
        <Field.Root mb={4}>
          <Field.Label>Work Duration (minutes)</Field.Label>
          <Input
            type="number"
            value={workDuration / 60}
            onChange={(e) => setWorkDuration(Math.max(1, parseInt(e.target.value, 10)) * 60)}
            min={1}
          />
          <Field.HelperText>Enter work duration in minutes</Field.HelperText>
        </Field.Root>

        <Field.Root mb={4}>
          <Field.Label>Break Duration (minutes)</Field.Label>
          <Input
            type="number"
            value={breakDuration / 60}
            onChange={(e) => setBreakDuration(Math.max(1, parseInt(e.target.value, 10)) * 60)}
            min={1}
          />
          <Field.HelperText>Enter break duration in minutes</Field.HelperText>
        </Field.Root>

        <Box mt={6}>
          <Heading className="text-xl font-bold text-center" mb={4}>
            Break Activities
          </Heading>

          {Object.keys(breakActivities).map((group) => (
            <Box
              key={group}
              mb={4}
              borderWidth="1px"
              borderRadius="md"
              p={3}
              style={{
                backgroundColor: styles[group]?.bg,
                borderColor: styles[group]?.border,
              }}
            >
              <Heading
                size="md"
                style={{
                  color: styles[group]?.text,
                  textAlign: 'center',
                  marginBottom: '0.75rem',
                }}
              >
                {group} Activities
              </Heading>

              {breakActivities[group].map((activity, index) => (
                <Box
                  key={index}
                  p={2}
                  mb={1}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  borderRadius="md"
                  bg="white"
                >
                  {activity}
                  <Button
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    onClick={() => {
                      setBreakActivities((prev) => ({
                        ...prev,
                        [group]: prev[group].filter((_, i) => i !== index),
                      }));
                    }}
                  >
                    Remove
                  </Button>
                </Box>
              ))}

              <Box mt={3} display="flex" gap={2}>
                <Input
                  placeholder={`Add new ${group} activity`}
                  value={newActivity[group] || ''}
                  onChange={(e) => setNewActivity((prev) => ({ ...prev, [group]: e.target.value }))}
                  flex={1}
                />
                <Button
                  onClick={() => {
                    if (newActivity[group]?.trim()) {
                      setBreakActivities((prev) => ({
                        ...prev,
                        [group]: [...prev[group], newActivity[group].trim()],
                      }));
                      setNewActivity((prev) => ({ ...prev, [group]: '' }));
                    }
                  }}
                >
                  Add
                </Button>
              </Box>
            </Box>
          ))}
        </Box>

        <Button colorScheme="blue" size="lg" width="100%" mt={6} onClick={saveSettings}>
          Save Settings
        </Button>
      </Box>
    </Container>
  );
}

export default SettingsPage;
