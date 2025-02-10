import React, { useState } from 'react';
import { Button, Box, Input, Field, Heading } from '@chakra-ui/react';
import {
  DialogRoot,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogActionTrigger,
  DialogCloseTrigger,
} from '@/components/ui/dialog';

const SettingsPanel = ({
  workDuration,
  breakDuration,
  setWorkDuration,
  setBreakDuration,
  breakActivities,
  setBreakActivities,
  onSave,
}) => {
  const [newActivity, setNewActivity] = useState({});

  const styles = {
    Yellow: { bg: '#fefce8', text: '#854d0e', border: '#fef08a' },
    Blue: { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' },
    Green: { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0' },
    Red: { bg: '#fef2f2', text: '#991b1b', border: '#fecaca' },
  };

  return (
    <DialogRoot>
      <DialogTrigger asChild>
        <Button mt={4} colorScheme="gray">
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Box mt={4} p={4}>
            <Field.Root mb={3}>
              <Field.Label>Work Duration (minutes)</Field.Label>
              <Input
                type="number"
                value={workDuration / 60}
                onChange={(e) => setWorkDuration(parseInt(e.target.value, 10) * 60)}
              />
              <Field.HelperText>Enter work duration in minutes</Field.HelperText>
            </Field.Root>

            <Field.Root mb={3}>
              <Field.Label>Break Duration (minutes)</Field.Label>
              <Input
                type="number"
                value={breakDuration / 60}
                onChange={(e) => setBreakDuration(parseInt(e.target.value, 10) * 60)}
              />
              <Field.HelperText>Enter break duration in minutes</Field.HelperText>
            </Field.Root>

            <Box mt={6}>
              <Heading className="text-xl font-bold text-center">Break Activities</Heading>
              <Field.Root>
                {Object.keys(breakActivities).map((group) => (
                  <Box key={group} mb={4} borderWidth="1px" borderRadius="md" p={2}>
                    <h4
                      style={{
                        color: styles[group]?.text || '#1f2937',
                        fontSize: '1.05rem',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        marginBottom: '1rem',
                      }}
                    >
                      {group} Activities
                    </h4>{' '}
                    {breakActivities[group].map((activity, index) => (
                      <Box key={index} pl={2} pb={1}>
                        {activity}
                      </Box>
                    ))}
                    <Field.Root mt={2}>
                      <Input
                        placeholder={`Add new ${group} activity`}
                        value={newActivity[group] || ''}
                        onChange={(e) =>
                          setNewActivity((prev) => ({ ...prev, [group]: e.target.value }))
                        }
                      />
                      <Button
                        mt={2}
                        size="sm"
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
                    </Field.Root>
                  </Box>
                ))}
              </Field.Root>
            </Box>
          </Box>
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button variant="outline">Cancel</Button>
          </DialogActionTrigger>
          <DialogActionTrigger asChild>
            <Button onClick={onSave}>Save</Button>
          </DialogActionTrigger>
          <DialogCloseTrigger />
        </DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
};

export default SettingsPanel;
