import { Repository, EntityRepository } from "typeorm"
import { Task } from './task.entity'
import { CreateTaskDto } from "./dto/create-task.dto"
import { TaskStatus } from "./task-status.enum"
import { User } from "src/auth/user.entity"

@EntityRepository(Task)
export class TaskRepository extends Repository<Task> {

    async getTasks(): Promise<Task[]> {
        const query = this.createQueryBuilder('task')
        const tasks = await query.getMany()

        return tasks
    }

    async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task>{
        const { title, description } = createTaskDto

        const task = new Task()

        task.title = title
        task.description = description
        task.status = TaskStatus.OPEN
        task.user = user
        await task.save();

        delete task.user;
        return task
    }
}
