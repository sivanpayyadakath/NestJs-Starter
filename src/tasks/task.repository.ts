import { Repository, EntityRepository } from "typeorm"
import { Task } from './task.entity'
import { CreateTaskDto } from "./dto/create-task.dto"
import { TaskStatus } from "./task-status.enum"
import { User } from "../auth/user.entity"
import { InternalServerErrorException, Logger } from "@nestjs/common"

@EntityRepository(Task)
export class TaskRepository extends Repository<Task> {
  private logger = new Logger('TaskRepositoryLOG')

  async getTasks(user: User): Promise<Task[]> {
    const query = this.createQueryBuilder('task');
    
    query.where('task.user.id = :userId', { userId: user.id });
    try {
      const tasks = await query.getMany();
      return tasks;
    } catch (error) {
      this.logger.error(`failed to get tasks for user "${user.username}"`, error.stack)
      throw new InternalServerErrorException();
    }

  }

  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const { title, description } = createTaskDto;

    const task = new Task();

    task.title = title;
    task.description = description;
    task.status = TaskStatus.OPEN;
    task.user = user;
    await task.save();

    delete task.user;
    return task;
  }
}
