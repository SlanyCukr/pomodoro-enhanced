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
  createListCollection,
  Separator,
  Card,
  Stack,
} from '@chakra-ui/react';
import {
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from '@/components/ui/select';
import { FaTrash, FaRegSave } from 'react-icons/fa';
import { IoMdAdd } from 'react-icons/io';

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

  const renderDurationSettingsCard = () => (
    <Card.Root>
      <Card.Header>
        <Center>
          <Heading size="3xl">Duration Settings</Heading>
        </Center>
      </Card.Header>
      <Card.Body>
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
      </Card.Body>
    </Card.Root>
  );

  const renderTimeRangesCard = () => (
    <Card.Root>
      <Card.Header>
        <Center>
          <Heading size="3xl">Time Ranges</Heading>
        </Center>
      </Card.Header>
      <Card.Body>
        {timeRanges.map((range, index) => (
          <Box key={index} mb={2} p={3} borderWidth="1px" borderRadius="md">
            <Flex alignItems="center">
              <Box flex="0 0 40%" overflow="hidden" textOverflow="ellipsis">
                <Text fontWeight="bold">{range.name}</Text>
              </Box>
              <Box flex="0 0 30%" textAlign="center">
                <Text>
                  {range.startHour}:{range.startMinute} - {range.endHour}:{range.endMinute}
                </Text>
              </Box>
              <Box flex="0 0 30%" textAlign="right">
                <Button
                  size="sm"
                  colorPalette="red"
                  variant="ghost"
                  onClick={() => removeTimeRange(index)}
                >
                  <FaTrash />
                  Remove
                </Button>
              </Box>
            </Flex>
          </Box>
        ))}

        <Field.Root mb={3} mt={6}>
          <Field.Label>Time Range Name</Field.Label>
          <Input
            placeholder="Work hours, Focus time, etc."
            value={newTimeRange.name}
            onChange={(e) => setNewTimeRange({ ...newTimeRange, name: e.target.value })}
          />
        </Field.Root>

        <Stack>
          <Field.Root flex="1">
            <Field.Label>Start Time</Field.Label>
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
                  width="60px"
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
                  width="60px"
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
          </Field.Root>

          <Field.Root flex="1">
            <Field.Label>End Time</Field.Label>
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
                  width="60px"
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
                  width="60px"
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
          </Field.Root>
        </Stack>

        <Center marginTop="2rem" marginBottom="2">
          <Button colorPalette="green" size="md" width="50%" variant="ghost" onClick={addTimeRange}>
            <IoMdAdd />
            Add Time Range
          </Button>
        </Center>
      </Card.Body>
    </Card.Root>
  );

  const renderBreakActivitiesCard = () => (
    <Card.Root>
      <Card.Header>
        <Center>
          <Heading size="3xl">Break Activities</Heading>
        </Center>
      </Card.Header>
      <Card.Body>
        {Object.keys(breakActivities).map((group) => (
          <Box key={group} mb={4} borderWidth="0px" borderRadius="md" p={3}>
            <Heading
              size="lg"
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
                borderWidth="2px"
              >
                {activity}
                <Button
                  size="sm"
                  colorPalette="red"
                  variant="ghost"
                  onClick={() => {
                    setBreakActivities((prev) => ({
                      ...prev,
                      [group]: prev[group].filter((_, i) => i !== index),
                    }));
                  }}
                >
                  <FaTrash />
                  Remove
                </Button>
              </Box>
            ))}

            <Box mt={3} display="flex" gap={2}>
              <Input
                _placeholder={{ color: 'grey' }}
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
                colorPalette="green"
                variant="ghost"
              >
                <IoMdAdd />
                Add
              </Button>
            </Box>
          </Box>
        ))}
      </Card.Body>
    </Card.Root>
  );

  return (
    <Container centerContent py={8}>
      <Box display="flex" alignItems="center" width="100%" mb={4}>
        <Heading mr="auto" ml="auto" mb={8} fontSize="5xl">
          Settings
        </Heading>
      </Box>

      <Stack spacing={6} width="100%">
        {renderDurationSettingsCard()}
        {renderTimeRangesCard()}
        {renderBreakActivitiesCard()}
        <Center marginTop="2rem">
          <Button colorPalette="blue" size="lg" width="50%" onClick={saveSettings}>
            <FaRegSave />
            Save Settings
          </Button>
        </Center>
      </Stack>
    </Container>
  );
}

export default SettingsPage;
