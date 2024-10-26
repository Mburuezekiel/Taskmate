import { useState } from 'react';
import {
  Container,
  Grid,
  Button,
  useDisclosure,
  VStack,
  Heading,
  HStack,
  useColorMode,
  IconButton,
  Text,
  Box,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Progress,
  useToast,
  SimpleGrid,
  Card,
  CardBody,
  Image,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun,
  Moon,
  Plus,
  BarChart2,
  Clock,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { TaskColumn } from './components/TaskColumn';
import { TaskForm } from './components/TaskForm';
import { useTaskStore, Task } from './store/taskStore';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import taskflowLogo from './assets/Taskflow .jpg'; // Adjust this path

// Motion components
const MotionContainer = motion(Container);
const MotionCard = motion(Card);
const MotionGrid = motion(Grid);

function App() {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const toast = useToast();

  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    getTasksByStatus,
    getOverdueTasks,
    getDueSoonTasks,
    getTaskCompletion,
  } = useTaskStore();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: 'easeOut',
      },
    },
    hover: {
      scale: 1.02,
      boxShadow: '0px 8px 15px rgba(0, 0, 0, 0.1)',
      transition: {
        duration: 0.2,
      },
    },
    tap: {
      scale: 0.98,
    },
  };

  const statVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
      },
    },
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    onOpen();
  };

  const handleSubmit = (taskData: Omit<Task, 'id'>) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
      setEditingTask(null);
      toast({
        title: 'Task updated',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } else {
      addTask(taskData);
      toast({
        title: 'Task created',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleAddNew = () => {
    setEditingTask(null);
    onOpen();
  };

  const handleDragEnd = (result: { destination: { droppableId: string }; draggableId: string }) => {
    if (!result.destination) return;
    const taskId = result.draggableId;
    const newStatus = result.destination.droppableId as Task['status'];
    moveTask(taskId, newStatus);
    toast({
      title: 'Task moved',
      description: `Task moved to ${newStatus.replace('-', ' ')}`,
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const todoTasks = getTasksByStatus('todo');
  const inProgressTasks = getTasksByStatus('in-progress');
  const completedTasks = getTasksByStatus('completed');
  const overdueTasks = getOverdueTasks();
  const dueSoonTasks = getDueSoonTasks();
  const completionRate = getTaskCompletion();

  const getTaskActivityData = () => {
    const last365Days = [...Array(365)].map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last365Days.map((date) => ({
      date,
      count: tasks.filter(
        (task) =>
          task.createdAt.split('T')[0] === date ||
          task.updatedAt.split('T')[0] === date
      ).length,
    }));
  };

  return (
    <MotionContainer
      maxW="container.xl"
      py={8}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <VStack spacing={8} align="stretch">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <HStack justify="space-between" wrap="wrap" spacing={4}>
            <HStack alignItems="center">
              <Image 
                src={taskflowLogo} 
                alt="TrackMate Logo" 
                boxSize="50px" 
                borderRadius="full" 
                boxShadow="md" 
                mr={0} 
                zIndex="1"
              />
              <Heading
                size="lg"
                bgGradient="linear(to-r, blue.400, purple.500)"
                bgClip="text"
              >
                TrackMate
              </Heading>
            </HStack>
            <Text color="gray.500" mr={0} >Streamline your workflow, boost productivity</Text>
            <HStack spacing={4}>
              <IconButton
                aria-label="Toggle color mode"
                icon={colorMode === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                onClick={toggleColorMode}
                variant="ghost"
              />
              <Button
                leftIcon={<Plus size={20} />}
                colorScheme="blue"
                onClick={handleAddNew}
                bgGradient="linear(to-r, blue.400, purple.500)"
                _hover={{
                  bgGradient: 'linear(to-r, blue.500, purple.600)',
                }}
              >
                Add Task
              </Button>
            </HStack>
          </HStack>
        </motion.div>

        <SimpleGrid columns={{ base: 2, sm: 2, md: 2, lg: 4 }} spacing={6}>
          <AnimatePresence>
            {[
              { icon: BarChart2, label: "Completion Rate", value: `${completionRate.toFixed(1)}%`, color: "green" },
              { icon: AlertTriangle, label: "Overdue Tasks", value: overdueTasks.length, color: "red" },
              { icon: Clock, label: "Due Soon", value: dueSoonTasks.length, color: "orange" },
              { icon: CheckCircle2, label: "Completed", value: completedTasks.length, color: "green" }
            ].map((stat, index) => (
              <MotionCard
                key={stat.label}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                whileTap="tap"
                custom={index}
              >
                <CardBody>
                  <StatGroup>
                    <Stat>
                      <motion.div variants={statVariants}>
                        <StatLabel>
                          <HStack>
                            <stat.icon size={16} />
                            <Text>{stat.label}</Text>
                          </HStack>
                        </StatLabel>
                        <StatNumber color={`${stat.color}.500`}>
                          {stat.value}
                        </StatNumber>
                        {stat.label === "Completion Rate" && (
                          <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                          >
                            <Progress
                              value={completionRate}
                              size="sm"
                              colorScheme="green"
                              mt={2}
                              borderRadius="full"
                            />
                          </motion.div>
                        )}
                      </motion.div>
                    </Stat>
                  </StatGroup>
                </CardBody>
              </MotionCard>
            ))}
          </AnimatePresence>
        </SimpleGrid>

        <MotionCard variants={cardVariants}>
          <CardBody>
            <Heading size="sm" mb={4}>
              Activity Overview
            </Heading>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <CalendarHeatmap
                startDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))}
                endDate={new Date()}
                values={getTaskActivityData()}
                classForValue={(value) => {
                  if (!value) return 'color-empty';
                  return `color-github-${value.count}`;
                }}
              />
            </motion.div>
          </CardBody>
        </MotionCard>

        {/* Task Columns for To Do, In Progress, and Completed */}
        <SimpleGrid columns={{ base: 1, sm: 2, md: 2, lg: 3 }} spacing={6} align="start">
          <TaskColumn
            title="To Do"
            tasks={todoTasks}
            onEditTask={handleEditTask}
            onDeleteTask={deleteTask}
            onDragEnd={handleDragEnd}
          />
          <TaskColumn
            title="In Progress"
            tasks={inProgressTasks}
            onEditTask={handleEditTask}
            onDeleteTask={deleteTask}
            onDragEnd={handleDragEnd}
          />
          <TaskColumn
            title="Completed"
            tasks={completedTasks}
            onEditTask={handleEditTask}
            onDeleteTask={deleteTask}
            onDragEnd={handleDragEnd}
          />
        </SimpleGrid>
      </VStack>
      <TaskForm
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleSubmit}
        editingTask={editingTask}
      />
    </MotionContainer>
  );
}

export default App;
