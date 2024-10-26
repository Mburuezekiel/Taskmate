import { VStack, Box, Text, useColorModeValue, Heading, useToken } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { Task } from '../store/taskStore';
import { TaskCard } from './TaskCard';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const MotionBox = motion(Box);

interface TaskColumnProps {
  title: string;
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  status: 'todo' | 'in-progress' | 'completed';
  onDragEnd: (result: any) => void;
}

export const TaskColumn = ({ title, tasks, onEditTask, onDeleteTask, status, onDragEnd }: TaskColumnProps) => {
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const [blue400, blue600, yellow400, yellow600, green400, green600] = useToken(
    'colors',
    ['blue.400', 'blue.600', 'yellow.400', 'yellow.600', 'green.400', 'green.600']
  );

  const getColumnAccent = () => {
    switch (status) {
      case 'todo':
        return `linear-gradient(to right, ${blue400}, ${blue600})`;
      case 'in-progress':
        return `linear-gradient(to right, ${yellow400}, ${yellow600})`;
      case 'completed':
        return `linear-gradient(to right, ${green400}, ${green600})`;
      default:
        return 'gray.500';
    }
  };

  const getColumnIcon = () => {
    switch (status) {
      case 'todo':
        return '📋';
      case 'in-progress':
        return '⚡';
      case 'completed':
        return '✅';
      default:
        return '📝';
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <MotionBox
        width="full"
        minH="600px"
        bg={bgColor}
        borderRadius="xl"
        p={6}
        borderWidth="1px"
        borderColor={borderColor}
        boxShadow="sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        position="relative"
        _before={{
          content: '""',
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          height: '4px',
          background: getColumnAccent(),
          borderTopRadius: 'xl',
        }}
      >
        <Heading size="md" mb={4} display="flex" alignItems="center" gap={2}>
          <Text as="span" fontSize="xl" role="img" aria-label={status}>
            {getColumnIcon()}
          </Text>
          {title}
          <Text 
            as="span" 
            fontSize="sm" 
            color="gray.500" 
            bg={useColorModeValue('gray.100', 'gray.600')}
            px={2}
            py={1}
            borderRadius="full"
          >
            {tasks.length}
          </Text>
        </Heading>

        <Droppable droppableId={status}>
          {(provided, snapshot) => (
            <VStack
              spacing={4}
              ref={provided.innerRef}
              {...provided.droppableProps}
              minH="200px"
              bg={snapshot.isDraggingOver ? useColorModeValue('gray.100', 'gray.600') : 'transparent'}
              borderRadius="lg"
              transition="background-color 0.2s"
              p={2}
            >
              {tasks.map((task, index) => (
                <Draggable key={task.id} draggableId={task.id} index={index}>
                  {(provided, snapshot) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      w="full"
                      transform={snapshot.isDragging ? 'rotate(-2deg)' : undefined}
                      transition="transform 0.2s"
                    >
                      <TaskCard
                        task={task}
                        onEdit={onEditTask}
                        onDelete={onDeleteTask}
                      />
                    </Box>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              {tasks.length === 0 && (
                <Box
                  p={4}
                  textAlign="center"
                  color="gray.500"
                  bg={useColorModeValue('white', 'gray.800')}
                  borderRadius="lg"
                  borderWidth="2px"
                  borderStyle="dashed"
                  borderColor={useColorModeValue('gray.200', 'gray.600')}
                  w="full"
                >
                  <Text>Drop tasks here</Text>
                </Box>
              )}
            </VStack>
          )}
        </Droppable>
      </MotionBox>
    </DragDropContext>
  );
};