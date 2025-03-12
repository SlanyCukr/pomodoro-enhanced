import React, { useState } from 'react';
import { Button, Box, ButtonGroup, Center } from '@chakra-ui/react';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogCloseTrigger,
} from '@/components/ui/dialog';
import { PiSpinnerGapFill } from 'react-icons/pi';
import { AiOutlineSelect } from 'react-icons/ai';
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
            <Center>
              <ButtonGroup size="lg">
                <Button colorPalette="blue" onClick={showSpin}>
                  <PiSpinnerGapFill />
                  Spin Random
                </Button>
                <Button colorPalette="green" onClick={showList}>
                  <AiOutlineSelect />
                  Select from List
                </Button>
              </ButtonGroup>
            </Center>
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
