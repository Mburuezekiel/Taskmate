import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  VStack,
  HStack,
  useColorModeValue,
  FormErrorMessage,
  InputGroup,
  InputRightElement,
  IconButton,
  Tag,
  TagLabel,
  TagCloseButton,
  Box,
} from '@chakra-ui/react';
import { Task } from '../store/taskStore';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus } from 'lucide-react';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Omit<Task, 'id'>) => void;
  initialData?: Task;
}

interface FormData {
  title: string;
  description: string;
  status: Task['status'];
  priority: Task['priority'];
  dueDate: string;
  assignee: string;
  tags: string[];
}

export const TaskForm = ({ isOpen, onClose, onSubmit, initialData }: TaskFormProps) => {
  const [newTag, setNewTag] = useState('');
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      status: initialData?.status || 'todo',
      priority: initialData?.priority || 'medium',
      dueDate: initialData?.dueDate || new Date().toISOString().split('T')[0],
      assignee: initialData?.assignee || '',
    },
  });

  const modalBg = useColorModeValue('white', 'gray.800');
  const inputBg = useColorModeValue('gray.50', 'gray.700');

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const onFormSubmit = (data: FormData) => {
    onSubmit({
      ...data,
      tags,
      subtasks: initialData?.subtasks || [],
      comments: initialData?.comments || [],
      attachments: initialData?.attachments || [],
    });
    reset();
    setTags([]);
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="xl"
      motionPreset="slideInBottom"
    >
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
      <ModalContent bg={modalBg}>
        <form onSubmit={handleSubmit(onFormSubmit)}>
          <ModalHeader>
            {initialData ? 'Edit Task' : 'Create New Task'}
          </ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isInvalid={!!errors.title} isRequired>
                <FormLabel>Title</FormLabel>
                <Input
                  {...register('title', {
                    required: 'Title is required',
                    minLength: { value: 3, message: 'Minimum length should be 3' }
                  })}
                  placeholder="Task title"
                  bg={inputBg}
                />
                <FormErrorMessage>
                  {errors.title && errors.title.message}
                </FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.description}>
                <FormLabel>Description</FormLabel>
                <Textarea
                  {...register('description')}
                  placeholder="Task description"
                  bg={inputBg}
                  rows={4}
                />
                <FormErrorMessage>
                  {errors.description && errors.description.message}
                </FormErrorMessage>
              </FormControl>

              <HStack width="full" spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Status</FormLabel>
                  <Select {...register('status')} bg={inputBg}>
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Priority</FormLabel>
                  <Select {...register('priority')} bg={inputBg}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Select>
                </FormControl>
              </HStack>

              <FormControl isRequired>
                <FormLabel>Due Date</FormLabel>
                <Input
                  {...register('dueDate')}
                  type="date"
                  bg={inputBg}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Assignee</FormLabel>
                <Input
                  {...register('assignee', {
                    required: 'Assignee is required'
                  })}
                  placeholder="Assignee name"
                  bg={inputBg}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Tags</FormLabel>
                <InputGroup size="md">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add tags"
                    bg={inputBg}
                    pr="4.5rem"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <InputRightElement width="4.5rem">
                    <IconButton
                      h="1.75rem"
                      size="sm"
                      aria-label="Add tag"
                      icon={<Plus size={16} />}
                      onClick={handleAddTag}
                    />
                  </InputRightElement>
                </InputGroup>
                <Box mt={2}>
                  {tags.map((tag) => (
                    <Tag
                      key={tag}
                      size="md"
                      borderRadius="full"
                      variant="subtle"
                      colorScheme="purple"
                      m={1}
                    >
                      <TagLabel>{tag}</TagLabel>
                      <TagCloseButton onClick={() => handleRemoveTag(tag)} />
                    </Tag>
                  ))}
                </Box>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              

              colorScheme="blue" 
              type="submit"
              isLoading={isSubmitting}
              loadingText="Saving"
            >
              {initialData ? 'Update' : 'Create'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};