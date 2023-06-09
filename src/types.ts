export type TusersDB = {
    id: string,
    name: string,
    email: string,
    password: string
}

export type TtaskDB = {
    id: string,
    title: string,
    description: string,
    created_at: string,
    status: number
}

export type TuserTaskDB = {
    user_id: string,
    task_id: string
}
