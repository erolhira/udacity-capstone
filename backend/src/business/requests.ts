
interface CreateTaskRequest {
    name: string;
    dueDate: string;
}

interface UpdateTaskRequest {
    name: string;
    dueDate: string;
    done: boolean;
}

export {
    CreateTaskRequest,
    UpdateTaskRequest
};