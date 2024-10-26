import { Box, Badge, Text, HStack, IconButton, useColorModeValue, VStack, Tooltip, Progress, Collapse, Button } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { Trash2, Edit2, Calendar, User, MessageSquare, Paperclip, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { Task } from '../store/taskStore';
import { format, isAfter, isBefore, startOfToday, addDays } from 'date-fns';

const MotionBox = motion(Box);

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export const TaskCard = ({ task, onEdit, onDelete }: TaskCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const priorityColors = {
    low: 'green',
    medium: 'yellow',
    high: 'red',
  };

  const getDaysUntilDue = () => {
    const today = startOfToday();
    const dueDate = new Date(task.dueDate);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getTaskStatus = () => {
    const today = startOfToday();
    const dueDate = new Date(task.dueDate);
    const threeDaysFromNow = addDays(today, 3);

    if (isBefore(dueDate, today)) return { label: 'Overdue', color: 'red' };
    if (isBefore(dueDate, threeDaysFromNow)) return { label: 'Due Soon', color: 'orange' };
    return { label: 'On Track', color: 'green' };
  };

  const taskStatus = getTaskStatus();
  const completedSubtasks = task.subtasks.filter(st => st.completed).length;
  const totalSubtasks = task.subtasks.length;
  const subtaskProgress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  return (
    <MotionBox
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      bg={bgColor}
      p={4}
      borderRadius="xl"
      borderWidth="1px"
      borderColor={borderColor}
      boxShadow="lg"
      position="relative"
      transition="all 0.2s"
      _hover={{ boxShadow: "xl" }}
    >
      <VStack align="stretch" spacing={3}>
        <HStack justify="space-between">
          <HStack spacing={2} flexWrap="wrap">
            <Badge 
              colorScheme={priorityColors[task.priority]} 
              borderRadius="full" 
              px={3} 
              py={1}
              textTransform="capitalize"
            >
              {task.priority}
            </Badge>
            <Badge 
              colorScheme={taskStatus.color} 
              borderRadius="full" 
              px={3} 
              py={1}
            >
              {taskStatus.label}
            </Badge>
          </HStack>
          <HStack spacing={2}>
            <Tooltip label="Edit task">
              <IconButton
                aria-label="Edit task"
                icon={<Edit2 size={16} />}
                size="sm"
                variant="ghost"
                colorScheme="blue"
                onClick={() => onEdit(task)}
              />
            </Tooltip>
            <Tooltip label="Delete task">
              <IconButton
                aria-label="Delete task"
                icon={<Trash2 size={16} />}
                size="sm"
                variant="ghost"
                colorScheme="red"
                onClick={() => onDelete(task.id)}
              />
            </Tooltip>
          </HStack>
        </HStack>

        <VStack align="stretch" spacing={2}>
          <Text fontSize="lg" fontWeight="bold">
            {task.title}
          </Text>
          <Text fontSize="sm" color="gray.500" noOfLines={isExpanded ? undefined : 2}>
            {task.description}
          </Text>
        </VStack>

        <Box>
          {task.tags.map((tag) => (
            <Badge
              key={tag}
              colorScheme="purple"
              variant="subtle"
              mr={2}
              mb={2}
              borderRadius="full"
              px={2}
              py={1}
            >
              {tag}
            </Badge>
          ))}
        </Box>

        <VStack spacing={2}>
          <HStack justify="space-between" width="full" fontSize="sm" color="gray.500">
            <HStack>
              <User size={14} />
              <Text>{task.assignee}</Text>
            </HStack>
            <HStack>
              <Calendar size={14} />
              <Text>{format(new Date(task.dueDate), 'MMM d, yyyy')}</Text>
            </HStack>
          </HStack>

          {totalSubtasks > 0 && (
            <Tooltip label={`${completedSubtasks} of ${totalSubtasks} subtasks completed`}>
              <Progress 
                value={subtaskProgress} 
                size="xs" 
                colorScheme="green" 
                borderRadius="full"
                width="full"
              />
            </Tooltip>
          )}

          <HStack spacing={4} fontSize="sm" color="gray.500">
            <HStack>
              <MessageSquare size={14} />
              <Text>{task.comments.length}</Text>
            </HStack>
            <HStack>
              <Paperclip size={14} />
              <Text>{task.attachments.length}</Text>
            </HStack>
          </HStack>
        </VStack>

        <Button
          size="sm"
          variant="ghost"
          rightIcon={isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Show less' : 'Show more'}
        </Button>

        <Collapse in={isExpanded}>
          <VStack align="stretch" spacing={4} pt={4}>
            {task.subtasks.length > 0 && (
              <Box>
                <Text fontWeight="semibold" mb={2}>Subtasks</Text>
                <VStack align="stretch">
                  {task.subtasks.map((subtask) => (
                    <HStack key={subtask.id} justify="space-between">
                      <Text 
                        textDecoration={subtask.completed ? 'line-through' : 'none'}
                        color={subtask.completed ? 'gray.500' : 'inherit'}
                      >
                        {subtask.title}
                      </Text>
                      <Badge colorScheme={subtask.completed ? 'green' : 'gray'}>
                        {subtask.completed ? 'Done' : 'Pending'}
                      </Badge>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            )}

            {task.comments.length > 0 && (
              <Box>
                <Text fontWeight="semibold" mb={2}>Recent Comments</Text>
                <VStack align="stretch">
                  {task.comments.slice(0, 3).map((comment) => (
                    <Box 
                      key={comment.id}
                      p={2}
                      bg={useColorModeValue('gray.50', 'gray.700')}
                      borderRadius="md"
                    >
                      <Text fontSize="sm" fontWeight="medium">{comment.author}</Text>
                      <Text fontSize="sm">{comment.content}</Text>
                      <Text fontSize="xs" color="gray.500">
                        {format(new Date(comment.createdAt), 'MMM d, h:mm a')}
                      </Text>
                    </Box>
                  ))}
                </VStack>
              </Box>
            )}

            {task.attachments.length > 0 && (
              <Box>
                <Text fontWeight="semibold" mb={2}>Attachments</Text>
                <VStack align="stretch">
                  {task.attachments.map((attachment) => (
                    <HStack 
                      key={attachment.id}
                      p={2}
                      bg={useColorModeValue('gray.50', 'gray.700')}
                      borderRadius="md"
                    >
                      <Paperclip size={14} />
                      <Text fontSize="sm">{attachment.name}</Text>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            )}
          </VStack>
        </Collapse>
      </VStack>
    </MotionBox>
  );
};