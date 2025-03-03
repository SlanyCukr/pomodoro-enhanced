'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Heading,
  Button,
  Box,
  Input,
  Field,
  Center,
  Flex,
  Text,
  FormControl,
  FormLabel,
  createListCollection,
} from '@chakra-ui/react';
// import {
//   SelectContent,
//   SelectItem,
//   SelectLabel,
//   SelectRoot,
//   SelectTrigger,
//   SelectValueText,
// } from '@/components/ui/select';
import safeColors from '@/utils/safeColors';

function SettingsPage() {
  // Component state for settings
  const [workDuration, setWorkDuration] = useState(30 * 60);
  const [breakDuration, setBreakDuration] = useState(8 * 60);
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

  // New state for time ranges
  const [timeRanges, setTimeRanges] = useState([]);
  const [newTimeRange, setNewTimeRange] = useState({
    name: '',
    startHour: '09',
    startMinute: '00',
    endHour: '17',
    endMinute: '00',
  });

  // Collections for dropdowns
  const hoursCollection = createListCollection({
    items: Array.from({ length: 24 }, (_, i) => ({
      label: i.toString().padStart(2, '0'),
      value: i.toString().padStart(2, '0'),
    })),
  });

  const minutesCollection = createListCollection({
    items: Array.from({ length: 60 }, (_, i) => ({
      label: i.toString().padStart(2, '0'),
      value: i.toString().padStart(2, '0'),
    })),
  });

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('pomodoroSettings');
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setWorkDuration(parsedSettings.workDuration || workDuration);
      setBreakDuration(parsedSettings.breakDuration || breakDuration);
      setBreakActivities(parsedSettings.breakActivities || breakActivities);
      setTimeRanges(parsedSettings.timeRanges || []);
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
      timeRanges,
    };
    localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
    alert('Settings saved successfully!');
  };

  // Add new time range
  const addTimeRange = () => {
    if (newTimeRange.name.trim() === '') {
      alert('Please enter a name for the time range');
      return;
    }

    setTimeRanges([...timeRanges, { ...newTimeRange }]);
    setNewTimeRange({
      name: '',
      startHour: '09',
      startMinute: '00',
      endHour: '17',
      endMinute: '00',
    });
  };

  // Remove time range
  const removeTimeRange = (index) => {
    setTimeRanges(timeRanges.filter((_, i) => i !== index));
  };

  // Styles for activity groups using safeColors with appropriate text colors
  const getActivityGroupStyles = (group) => {
    // Base styles using safeColors for background
    const styles = {
      backgroundColor: safeColors[group],
      borderColor: safeColors[group],
    };

    // Add appropriate text colors for each group
    switch (group) {
      case 'Yellow':
        styles.color = '#854d0e';
        break;
      case 'Blue':
        styles.color = '#1e40af';
        break;
      case 'Green':
        styles.color = '#166534';
        break;
      case 'Red':
        styles.color = '#991b1b';
        break;
      case 'Purple':
        styles.color = '#5b21b6';
        break;
      case 'Orange':
        styles.color = '#9a3412';
        break;
      default:
        styles.color = '#1f2937';
    }

    return styles;
  };

  return (
    <Container centerContent py={8}>
      <Box display="flex" alignItems="center" width="100%" mb={4}>
        <Heading mr="auto" ml="auto" mb={8} fontSize="5xl">
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

        {/* New Time Ranges Section
        <Box mt={6} mb={6}>
          <Center>
            <Heading fontSize="l" mb={4} mr="auto" ml="auto">
              Time Ranges
            </Heading>
          </Center>

          {timeRanges.map((range, index) => (
            <Box key={index} mb={2} p={3} borderWidth="1px" borderRadius="md" bg="gray.50">
              <Flex justifyContent="space-between" alignItems="center">
                <Text fontWeight="bold">{range.name}</Text>
                <Text>
                  {range.startHour}:{range.startMinute} - {range.endHour}:{range.endMinute}
                </Text>
                <Button size="sm" colorScheme="red" onClick={() => removeTimeRange(index)}>
                  Remove
                </Button>
              </Flex>
            </Box>
          ))}

          <Box mt={4} p={4} borderWidth="1px" borderRadius="md" bg="blue.50">
            <FormControl mb={3}>
              <FormLabel>Time Range Name</FormLabel>
              <Input
                placeholder="Work hours, Focus time, etc."
                value={newTimeRange.name}
                onChange={(e) => setNewTimeRange({ ...newTimeRange, name: e.target.value })}
                bg="white"
              />
            </FormControl>

            <Flex gap={3} mb={3}>
              <FormControl flex="1">
                <FormLabel>Start Time</FormLabel>
                <Flex>
                  <Box flex="1" mr={1}>
                    <SelectRoot
                      collection={hoursCollection}
                      value={[newTimeRange.startHour]}
                      onValueChange={(details) => {
                        if (details.value[0]) {
                          setNewTimeRange({
                            ...newTimeRange,
                            startHour: details.value[0],
                          });
                        }
                      }}
                      size="sm"
                    >
                      <SelectTrigger>
                        <SelectValueText placeholder="Hour" />
                      </SelectTrigger>
                      <SelectContent>
                        {hoursCollection.items.map((hour) => (
                          <SelectItem item={hour} key={`start-hour-${hour.value}`}>
                            {hour.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </SelectRoot>
                  </Box>
                  <Text fontSize="xl" mx={1}>
                    :
                  </Text>
                  <Box flex="1">
                    <SelectRoot
                      collection={minutesCollection}
                      value={[newTimeRange.startMinute]}
                      onValueChange={(details) => {
                        if (details.value[0]) {
                          setNewTimeRange({
                            ...newTimeRange,
                            startMinute: details.value[0],
                          });
                        }
                      }}
                      size="sm"
                    >
                      <SelectTrigger>
                        <SelectValueText placeholder="Min" />
                      </SelectTrigger>
                      <SelectContent>
                        {minutesCollection.items.map((minute) => (
                          <SelectItem item={minute} key={`start-minute-${minute.value}`}>
                            {minute.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </SelectRoot>
                  </Box>
                </Flex>
              </FormControl>

              <FormControl flex="1">
                <FormLabel>End Time</FormLabel>
                <Flex>
                  <Box flex="1" mr={1}>
                    <SelectRoot
                      collection={hoursCollection}
                      value={[newTimeRange.endHour]}
                      onValueChange={(details) => {
                        if (details.value[0]) {
                          setNewTimeRange({
                            ...newTimeRange,
                            endHour: details.value[0],
                          });
                        }
                      }}
                      size="sm"
                    >
                      <SelectTrigger>
                        <SelectValueText placeholder="Hour" />
                      </SelectTrigger>
                      <SelectContent>
                        {hoursCollection.items.map((hour) => (
                          <SelectItem item={hour} key={`end-hour-${hour.value}`}>
                            {hour.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </SelectRoot>
                  </Box>
                  <Text fontSize="xl" mx={1}>
                    :
                  </Text>
                  <Box flex="1">
                    <SelectRoot
                      collection={minutesCollection}
                      value={[newTimeRange.endMinute]}
                      onValueChange={(details) => {
                        if (details.value[0]) {
                          setNewTimeRange({
                            ...newTimeRange,
                            endMinute: details.value[0],
                          });
                        }
                      }}
                      size="sm"
                    >
                      <SelectTrigger>
                        <SelectValueText placeholder="Min" />
                      </SelectTrigger>
                      <SelectContent>
                        {minutesCollection.items.map((minute) => (
                          <SelectItem item={minute} key={`end-minute-${minute.value}`}>
                            {minute.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </SelectRoot>
                  </Box>
                </Flex>
              </FormControl>
            </Flex>

            <Button colorScheme="blue" size="md" width="100%" onClick={addTimeRange}>
              Add Time Range
            </Button>
          </Box>
        </Box> */}

        <Box mt={6}>
          <Center>
            <Heading fontSize="l" mb={4} mr="auto" ml="auto">
              Break Activities
            </Heading>
          </Center>

          {Object.keys(breakActivities).map((group) => (
            <Box
              key={group}
              mb={4}
              borderWidth="1px"
              borderRadius="md"
              p={3}
              style={getActivityGroupStyles(group)}
            >
              <Heading
                size="md"
                style={{
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
                  bg="white"
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
                  bg="white"
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
