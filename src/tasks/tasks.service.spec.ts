import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../auth/user.entity';
import { TaskStatus } from './task-status.enum';
import { TaskRepository } from './task.repository';
import { TasksService } from './tasks.service';

const mockUser = new User();
mockUser.username = 'Test User';
mockUser.id = 10;

const mockRepository = () => ({
  getTasks: jest.fn(),
  findOne: jest.fn(),
  createTask: jest.fn(),
  delete: jest.fn(),
});

describe('TasksService', () => {
  let taskService: TasksService;
  let taskRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TaskRepository, useFactory: mockRepository },
      ],
    }).compile();

    taskService = module.get<TasksService>(TasksService);
    taskRepository = module.get<TaskRepository>(TaskRepository);
  });

  it('should be defined', () => {
    expect(taskService).toBeDefined();
  });

  describe('get tasks', () => {
    it('gets all tasks from the repository', async () => {
      taskRepository.getTasks.mockResolvedValue('someValue');

      expect(taskRepository.getTasks).not.toHaveBeenCalled();

      const result = await taskService.getAllTasks(mockUser);
      expect(taskRepository.getTasks).toHaveBeenCalled();
      expect(result).toEqual('someValue');
    });
  });

  describe('get task by id', () => {
    it('gets tasks by id and return result', async () => {
      const mockTask = { title: 'Test title', description: 'Test description' };
      taskRepository.findOne.mockResolvedValue(mockTask);

      const result = await taskService.getTaskById(1, mockUser);
      expect(result).toEqual(mockTask);

      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, user: mockUser },
      });
    });

    it('throws error when task not found', () => {
      taskRepository.findOne.mockResolvedValue(null);

      expect(taskService.getTaskById(1, mockUser)).rejects.toThrow();
    });
  });

  describe('create task', () => {
    it('creates a task, calls repo and returns result', async () => {
      taskRepository.createTask.mockResolvedValue('hello');

      const createTaskDto = {
        title: 'Test title',
        description: 'Test description',
      };

      expect(taskRepository.createTask).not.toHaveBeenCalled();
      const createdTask = await taskService.createTask(createTaskDto, mockUser);
      expect(taskRepository.createTask).toHaveBeenCalledWith(
        createTaskDto,
        mockUser,
      );
      expect(createdTask).toEqual('hello');
    });
  });

  describe('delete task', () => {
    it('deletes a tasks and', async () => {
      taskRepository.delete.mockResolvedValue({ affected: 1 });
      expect(taskRepository.delete).not.toHaveBeenCalled();
      await taskService.deleteTask(1, mockUser);
      expect(taskRepository.delete).toHaveBeenCalledWith({
        id: 1,
        user: mockUser,
      });
    });

    it('throws error if task not found', async () => {
      taskRepository.delete.mockResolvedValue({ affected: 0 });
      expect(taskService.deleteTask(1, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update Task status', () => {
    it('update a task status and then returns the task', async () => {
      const save = jest.fn().mockResolvedValue(true);
      taskService.getTaskById = jest.fn().mockResolvedValue({
        status: TaskStatus.OPEN,
        save,
      });

      expect(taskService.getTaskById).not.toHaveBeenCalled();
      expect(save).not.toHaveBeenCalled();
      const result = await taskService.updateTaskStatus(
        1,
        TaskStatus.DONE,
        mockUser,
      );
      expect(taskService.getTaskById).toHaveBeenCalled();
      expect(save).toHaveBeenCalled();
    });
  });
});
