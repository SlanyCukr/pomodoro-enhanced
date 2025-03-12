import React from 'react';
import { Button, Heading, Box, Text } from '@chakra-ui/react';
import safeColors from '@/utils/safeColors';
import { AiOutlineSelect } from 'react-icons/ai';

const ActivityList = ({ breakActivities, onSelect, onClose, showActivityList }) => {
  if (!showActivityList) return null;

  return (
    <Box className="space-y-4" marginTop={6}>
      {Object.entries(breakActivities).map(([group, activities]) => (
        <Box key={group} mb={4} borderWidth="0px" borderRadius="md" p={3}>
          <Heading
            size="lg"
            style={{
              textAlign: 'center',
              marginBottom: '0.75rem',
              color: '#333',
              backgroundColor: safeColors[group],
              padding: '8px',
              borderRadius: '8px',
            }}
          >
            {group} Activities
          </Heading>

          {activities.map((activity, index) => (
            <Box
              key={index}
              p={2}
              mb={2}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              borderRadius="md"
              borderWidth="2px"
              _hover={{ backgroundColor: 'gray.900' }}
            >
              <Text fontWeight="medium" flex="1">
                {activity}
              </Text>
              <Button
                size="sm"
                colorPalette="blue"
                variant="ghost"
                onClick={() => {
                  onSelect(activity);
                  onClose();
                }}
              >
                <AiOutlineSelect />
                Select
              </Button>
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
};

export default ActivityList;
