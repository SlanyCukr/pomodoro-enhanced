import React from 'react';
import { Box, Button, List } from '@chakra-ui/react';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogCloseTrigger,
} from '@/components/ui/dialog';

const BreakActivitySelector = ({ isOpen, onClose, breakActivities, onSelect }) => {
  return (
    <DialogRoot open={isOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select a Break Activity</DialogTitle>
        </DialogHeader>
        <DialogBody>
          {Object.keys(breakActivities).map((group) => (
            <Box key={group} mb={4}>
              <Box fontWeight="bold" mb={2}>
                {group}
              </Box>
              <List.Root spacing={2}>
                {breakActivities[group].map((activity, index) => (
                  <List.Item key={index}>
                    <Button
                      variant="outline"
                      width="100%"
                      onClick={() => {
                        onSelect(activity);
                        onClose();
                      }}
                    >
                      {activity}
                    </Button>
                  </List.Item>
                ))}
              </List.Root>
            </Box>
          ))}
        </DialogBody>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
};

export default BreakActivitySelector;
