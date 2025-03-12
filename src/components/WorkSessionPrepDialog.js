'use client';

import React from 'react';
import { VStack, Button, Text, HStack, Box } from '@chakra-ui/react';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogCloseTrigger,
} from '@/components/ui/dialog';
import { CheckboxCard } from '@/components/ui/checkbox-card';
import { FaCheck } from 'react-icons/fa';
import { IoMdWater } from 'react-icons/io';
import { LuBrain, LuSmartphone, LuBellOff } from 'react-icons/lu';

const PREPARATION_STEPS = [
  {
    id: 'clean-workspace',
    label: 'Working place clean',
    icon: <FaCheck />,
    description: 'Make sure your desk is organized and clean',
  },
  {
    id: 'water-ready',
    label: 'Water ready',
    icon: <IoMdWater />,
    description: 'Have water nearby to stay hydrated',
  },
  {
    id: 'mentally-ready',
    label: 'Mentally ready',
    icon: <LuBrain />,
    description: 'Take a deep breath and focus your mind',
  },
  {
    id: 'phone-away',
    label: 'Phone in next room (notifications disabled)',
    icon: <LuSmartphone />,
    description: 'Keep your phone away to avoid distractions',
  },
  {
    id: 'pc-dnd',
    label: 'PC set to do not disturb',
    icon: <LuBellOff />,
    description: 'Enable do not disturb mode on your computer',
  },
];

const WorkSessionPrepDialog = ({ isOpen, onClose, onStartSession }) => {
  const handleStartSession = () => {
    onClose();
    onStartSession();
  };

  return (
    <DialogRoot open={isOpen} onClose={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Prepare for Work Session</DialogTitle>
          <DialogCloseTrigger />
        </DialogHeader>

        <DialogBody>
          <Text mb={4}>Check these steps before starting your work session:</Text>
          <VStack spacing={3} align="stretch">
            {PREPARATION_STEPS.map((step) => (
              <CheckboxCard
                key={step.id}
                label={step.label}
                description={step.description}
                icon={
                  <Box fontSize="xl" color="gray.500" mr={3}>
                    {step.icon}
                  </Box>
                }
              />
            ))}
          </VStack>
        </DialogBody>

        <DialogFooter>
          <HStack spacing={3}>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleStartSession}>
              Start Session
            </Button>
          </HStack>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

export default WorkSessionPrepDialog;
