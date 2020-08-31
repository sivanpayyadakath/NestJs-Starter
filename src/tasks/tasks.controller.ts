import { Controller, Get, Post, Delete, Patch, Body, Param, UsePipes, ValidationPipe, ParseIntPipe } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TaskStatus } from './task-status.enum';
import { CreateTaskDto } from './dto/create-task.dto'
import { TaskStatusValidationPipe } from './pipes/task-status-validation.pipe';
import { Task } from './task.entity';


@Controller('tasks')
export class TasksController {
    constructor(private tasksService: TasksService) {}

    @Get()
    getAllTasks(): Promise<Task[]> {
        return this.tasksService.getAllTasks();
    }

    @Post()
    @UsePipes(ValidationPipe)
    createTask(
        @Body() CreateTaskDto: CreateTaskDto
    ): Promise<Task> {
       return this.tasksService.createTask(CreateTaskDto);
    }

    @Get('/:id')
    GetTaskById(@Param('id', ParseIntPipe) id: number): Promise<Task> {
        return this.tasksService.getTaskById(id);
    }

    @Delete('/:id')
    DeleteTask(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.tasksService.deleteTask(id);
    }

    @Patch(':id/status')
    UpdateTaskStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body('status', TaskStatusValidationPipe) status: TaskStatus,
    ): Promise<Task> {
        return this.tasksService.updateTaskStatus(id, status)
    }
}
