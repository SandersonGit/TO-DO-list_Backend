import express, { Request, Response } from "express";
import cors from "cors";
import { db } from "./database/knex";
import { TusersDB } from "./types";

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
      throw new Error("'id' deve iniciar com a letra 'f'")
    }

    if (!usersIdAlreadExist) {
      res.status(404);
      throw new Error("Id não encontrado");
    }

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
