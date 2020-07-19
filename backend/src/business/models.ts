interface TaskItem {
    userId: string;
    taskId: string;
    createdAt: string;
    name: string;
    dueDate: string;
    done: boolean;
    attachmentUrl?: string;
};

interface TaskUpdate {
    name: string;
    dueDate: string;
    done: boolean;
};

export {
    TaskItem,
    TaskUpdate
};