import React, { useState } from 'react';
import { Button, Box } from '@chakra-ui/react';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogCloseTrigger,
} from '@/components/ui/dialog';
import SpinningWheel from './SpinningWheel';
import ActivityList from './ActivityList';

const BreakActivitySelector = ({ isOpen, onClose, breakActivities, onSelect }) => {
  const [showWheel, setShowWheel] = useState(false);
  const [showActivityList, setShowActivityList] = useState(false);

  const handleSpinEnd = (activity) => {
    onSelect(activity);
    onClose();
  };

  const showSpin = () => {
    setShowWheel(true);
    setShowActivityList(false);
  };

  const showList = () => {
    setShowWheel(false);
    setShowActivityList(true);
  };

  return (
    <DialogRoot open={isOpen} size="lg">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {showWheel ? 'Spin for Random Activity' : 'Select Break Activity'}
          </DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Box className="space-y-4">
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <Button colorScheme="blue" onClick={showSpin} flex="1">
                Spin Random
              </Button>
              <Button colorScheme="blue" onClick={showList} flex="1">
                Select from List
              </Button>
            </div>
          </Box>

          {showWheel && <SpinningWheel activities={breakActivities} onSpinEnd={handleSpinEnd} />}

          {showActivityList && (
            <ActivityList
              breakActivities={breakActivities}
              onSelect={onSelect}
              onClose={onClose}
              showActivityList={showActivityList}
            />
          )}
        </DialogBody>
        <DialogCloseTrigger onClick={onClose} />
      </DialogContent>
    </DialogRoot>
  );
};

export default BreakActivitySelector;
