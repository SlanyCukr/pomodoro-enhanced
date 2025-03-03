import React from 'react';
import { Button, Heading, Separator, Box } from '@chakra-ui/react';
import safeColors from '@/utils/safeColors';

const ActivityList = ({ breakActivities, onSelect, onClose, showActivityList }) => {
  if (!showActivityList) return null;

  return (
    <Box className="space-y-6 p-6 bg-gray-50 rounded-lg" marginTop={6}>
      {Object.entries(breakActivities).map(([group, activities], index) => (
        <div
          key={group}
          style={{ backgroundColor: safeColors[group], padding: '16px', borderRadius: '8px' }}
        >
          <Heading size="md" mb={4}>
            {group}
          </Heading>
          <div className="grid gap-2">
            {activities.map((activity, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="md"
                justifyContent="flex-start"
                onClick={() => {
                  onSelect(activity);
                  onClose();
                }}
                backgroundColor="white"
              >
                {activity}
              </Button>
            ))}
          </div>
          {index < Object.entries(breakActivities).length - 1 && <Separator my={6} />}
        </div>
      ))}
    </Box>
  );
};

export default ActivityList;
