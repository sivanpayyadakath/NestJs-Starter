import { PipeTransform, BadRequestException } from "@nestjs/common";
import { TaskStatus } from "../task-status.enum";

export class TaskStatusValidationPipe implements PipeTransform {
    readonly allowedStatus = [
        TaskStatus.OPEN,
        TaskStatus.IN_PROGRESS,
        TaskStatus.DONE
    ]

    transform(value: any) {
        if(this.allowedStatus.indexOf(value) === -1){
            throw new BadRequestException(`invalid status ${value}`)
        }
        return value
    }
}