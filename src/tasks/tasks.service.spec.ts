import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../auth/user.entity';
import { TaskRepository } from './task.repository';
import { TasksService } from './tasks.service';

const mockUser = new User();
mockUser.username = 'Test User';
mockUser.id = 10;

const mockRepository = () => ({
  getTasks: jest.fn(),
  findOne: jest.fn(),
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
});
