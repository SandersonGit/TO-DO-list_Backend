import express, { Request, Response } from "express";
import cors from "cors";
import { db } from "./database/knex";
import { TtaskDB, TuserTaskDB, TusersDB } from "./types";

const app = express();

app.use(cors());
app.use(express.json());

app.listen(3003, () => {
  console.log(`Servidor rodando na porta ${3003}`);
});

// app.get("/ping", async (req: Request, res: Response) => {
//     try {
//         res.status(200).send({ message: "Pong!" })
//     } catch (error) {
//         console.log(error)

//         if (req.statusCode === 200) {
//             res.status(500)
//         }

//         if (error instanceof Error) {
//             res.send(error.message)
//         } else {
//             res.send("Erro inesperado")
//         }
//     }
// })

// app.get("/users", async (req: Request, res: Response) => {
//   try {
//     const result = await db("users");
//     res.status(200).send(result);
//   } catch (error) {
//     console.log(error);

//     if (req.statusCode === 200) {
//       res.status(500);
//     }

//     if (error instanceof Error) {
//       res.send(error.message);
//     } else {
//       res.send("Erro inesperado");
//     }
//   }
// });

app.get("/users", async (req: Request, res: Response) => {
  try {
    const searchTerm = req.query.q as string | undefined;

    if (searchTerm === undefined) {
      const result = await db("users");
      res.status(200).send(result);
    } else {
      const result = await db("users").where("name", "like", `%${searchTerm}%`);
      res.status(200).send(result);
    }
  } catch (error) {
    console.log(error);

    if (req.statusCode === 200) {
      res.status(500);
    }

    if (error instanceof Error) {
      res.send(error.message);
    } else {
      res.send("Erro inesperado");
    }
  }
});

app.post("/users", async (req: Request, res: Response) => {
  try {
    const { id, name, email, password } = req.body;

    // validação ID

    if (typeof id !== "string") {
      res.status(400);
      throw new Error("Id deve ser uma string");
    }
    if (id.length < 4) {
      res.status(400);
      throw new Error("Id deve ser uma string");
    }
    // validação name

    if (typeof name !== "string") {
      res.status(400);
      throw new Error("Name deve ser uma string");
    }
    if (name.length < 2) {
      res.status(400);
      throw new Error("Name deve ser uma string");
    }

    // validação email

    if (typeof email !== "string") {
      res.status(400);
      throw new Error("Email deve ser uma string");
    }

    // validação password

    if (typeof password !== "string") {
      res.status(400);
      throw new Error("'password ' deve ser uma string");
    }

    if (
      !password.match(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,12}$/g
      )
    ) {
      res.status(400);
      throw new Error(
        "'password' deve possuir entre 8 e 12 caracteres, com letras maiúsculas e minúsculas e no mínimo um número e um caractere especial"
      );
    }

    // validação se ID e EMAIL já existem

    const [usersIdAlreadExist]: TusersDB[] | undefined[] = await db(
      "users"
    ).where({ id });

    if (usersIdAlreadExist) {
      res.status(400);
      throw new Error("Id já existente");
    }
    const [usersEmailAlreadExist]: TusersDB[] | undefined[] = await db(
      "users"
    ).where({ email });

    if (usersEmailAlreadExist) {
      res.status(400);
      throw new Error("Email já existente");
    }

    //tipagem da validação  e retorno de um novo usuário

    const newUser: TusersDB = {
      id,
      name,
      email,
      password,
    };

    await db("users").insert(newUser);

    res.status(201).send("Usuario cadastrado com sucesso");
  } catch (error) {
    console.log(error);

    if (req.statusCode === 200) {
      res.status(500);
    }

    if (error instanceof Error) {
      res.send(error.message);
    } else {
      res.send("Erro inesperado");
    }
  }
});

app.delete("/users/:id", async (req: Request, res: Response) => {
  try {
    const idToDelete = req.params.id;

    const [usersIdAlreadExist]: TusersDB[] | undefined[] = await db(
      "users"
    ).where({ id: idToDelete });

    if (idToDelete[0] !== "f") {
      res.status(400);
      throw new Error("'id' deve iniciar com a letra 'f'");
    }

    if (!usersIdAlreadExist) {
      res.status(404);
      throw new Error("Id não encontrado");
    }

    // await db("users").del().where({ user_id: idToDelete });
    await db("users").del().where({ id: idToDelete });
    res.status(200).send("Usuário deletado com sucesso");
  } catch (error) {
    console.log(error);

    if (req.statusCode === 200) {
      res.status(500);
    }

    if (error instanceof Error) {
      res.send(error.message);
    } else {
      res.send("Erro inesperado");
    }
  }
});

app.get("/tasks", async (req: Request, res: Response) => {
  try {
    const searchTerm = req.query.q as string | undefined;

    if (searchTerm === undefined) {
      const result = await db("tasks");
      res.status(200).send(result);
    } else {
      const result = await db("tasks")
        .where("title", "like", `%${searchTerm}%`)
        .orWhere("description", "like", `%${searchTerm}%`);
      res.status(200).send(result);
    }
  } catch (error) {
    console.log(error);

    if (req.statusCode === 200) {
      res.status(500);
    }

    if (error instanceof Error) {
      res.send(error.message);
    } else {
      res.send("Erro inesperado");
    }
  }
});

app.post("/tasks", async (req: Request, res: Response) => {
  try {
    const { id, title, description } = req.body;

    // validação ID

    if (typeof id !== "string") {
      res.status(400);
      throw new Error("Id deve ser uma string");
    }
    if (id.length < 4) {
      res.status(400);
      throw new Error("Id deve ter no mínimo 4 letras");
    }
    // validação title

    if (typeof title !== "string") {
      res.status(400);
      throw new Error("Title deve ser uma string");
    }
    if (title.length < 2) {
      res.status(400);
      throw new Error("Title deve ter no mínimo 2 letras");
    }

    if (typeof description !== "string") {
      res.status(400);
      throw new Error("'description' deve ser uma string");
    }

    // validação se ID já existe

    const [taskIdAlreadExist]: TtaskDB[] | undefined[] = await db(
      "tasks"
    ).where({ id });

    if (taskIdAlreadExist) {
      res.status(400);
      throw new Error("Id já existente");
    }

    //tipagem da validação  e retorno de um novo usuário

    const newTask = {
      id,
      title,
      description,
    };

    await db("tasks").insert(newTask);

    res.status(201).send("Task cadastrada com sucesso");
  } catch (error) {
    console.log(error);

    if (req.statusCode === 200) {
      res.status(500);
    }

    if (error instanceof Error) {
      res.send(error.message);
    } else {
      res.send("Erro inesperado");
    }
  }
});
app.put("/tasks/:id", async (req: Request, res: Response) => {
  try {
    const idToEdit = req.params.id;

    // const { id, title, description, createdAt, status } = req.body;

    const newId = req.params.id;
    const newTitle = req.params.title;
    const newDescription = req.params.description;
    const newCreatedAt = req.params.created_at;
    const newStatus = req.params.status;

    // validação ID
    if (newId !== undefined) {
      if (typeof newId !== "string") {
        res.status(400);
        throw new Error("Id deve ser uma string");
      }
      if (newId.length < 4) {
        res.status(400);
        throw new Error("Id deve ter no mínimo 4 letras");
      }
    }

    // validação title
    if (newTitle !== undefined) {
      if (typeof newTitle !== "string") {
        res.status(400);
        throw new Error("Title deve ser uma string");
      }
      if (newTitle.length < 2) {
        res.status(400);
        throw new Error("Title deve ter no mínimo 2 letras");
      }
    }

    if (newDescription !== undefined) {
      if (typeof newDescription !== "string") {
        res.status(400);
        throw new Error("'description' deve ser uma string");
      }
    }

    // validação createdAt

    if (newCreatedAt !== undefined) {
      if (typeof newCreatedAt !== "string") {
        res.status(400);
        throw new Error("'CreatedAt' deve ser uma string");
      }
    }

    //validação status

    if (newStatus !== undefined) {
      if (typeof newStatus !== "number") {
        res.status(400);
        throw new Error(
          "'Status' deve ser um number '0 para imcompleta e 1 para completa"
        );
      }
    }

    // validação se ID já existe

    const [task]: TtaskDB[] | undefined[] = await db("tasks").where({
      id: idToEdit,
    });

    if (!task) {
      res.status(404);
      throw new Error("Id não encontrado");
    }

    //tipagem da validação  e retorno de um novo usuário

    const newTask: TtaskDB = {
      id: newId || task.id,
      title: newTitle || task.title,
      description: newDescription || task.description,
      created_at: newCreatedAt || task.created_at,
      status: isNaN(newStatus) ? task.status : newStatus,
    };

    await db("tasks").update(newTask).where({ id: idToEdit });

    res.status(200).send({
      message: "Task editado com sucesso!",
      task: newTask,
    });
  } catch (error) {
    console.log(error);

    if (req.statusCode === 200) {
      res.status(500);
    }

    if (error instanceof Error) {
      res.send(error.message);
    } else {
      res.send("Erro inesperado");
    }
  }
});

app.delete("/tasks/:id", async (req: Request, res: Response) => {
  try {
    const idToDelete = req.params.id;

    if (idToDelete[0] !== "t") {
      res.status(400);
      throw new Error("'id' deve iniciar com a letra 't'");
    }

    const [TaskIdToDelete]: TtaskDB[] | undefined[] = await db("tasks").where({
      id: idToDelete,
    });

    if (!TaskIdToDelete) {
      res.status(404);
      throw new Error("Id não encontrado");
    }

    await db("tasks").del().where({ id: idToDelete });

    res.status(200).send({
      message: "Task deletada com sucesso!",
    });
  } catch (error) {
    console.log(error);

    if (req.statusCode === 200) {
      res.status(500);
    }

    if (error instanceof Error) {
      res.send(error.message);
    } else {
      res.send("Erro inesperado");
    }
  }
});

app.post(
  "/tasks/:taskId/users/:userId",
  async (req: Request, res: Response) => {
    try {
      const taskId = req.params.taskId;
      const userId = req.params.userId;

      const [Task]: TtaskDB[] | undefined[] = await db("tasks").where({
        id: taskId,
      });

      if (!Task) {
        res.status(404);
        throw new Error("TaskId não encontrado");
      }
      const [user]: TtaskDB[] | undefined[] = await db("users").where({
        id: userId,
      });

      if (!user) {
        res.status(404);
        throw new Error("UserId não encontrado");
      }

      const newUserTasck: TuserTaskDB = {
        user_id: userId,
        task_id: taskId
      };

      await db("users_tasks").insert( newUserTasck );

      res.status(201).send({
        message: "User atribuido na tarefa com sucesso!"
      })
    } catch (error) {
      console.log(error);

      if (req.statusCode === 200) {
        res.status(500);
      }

      if (error instanceof Error) {
        res.send(error.message);
      } else {
        res.send("Erro inesperado");
      }
    }
  }
);
