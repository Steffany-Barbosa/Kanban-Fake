import React, { useState, useEffect } from "react";
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";

type Task = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  isEditing: boolean;
};

type Column = {
  name: string;
  tasks: Task[];
};

const initialColumns: Column[] = [
  { name: "A Fazer", tasks: [] },
  { name: "Em Progresso", tasks: [] },
  { name: "Concluído", tasks: [] },
];

const App: React.FC = () => {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [newTask, setNewTask] = useState<string>("");
  const [newDescription, setNewDescription] = useState<string>("");

  const userName = "Steffany Barbosa";

  // Função para buscar as tarefas da API
  const fetchTasks = async () => {
    const response = await fetch("http://localhost:5000/tasks");
    const data = await response.json();
    const updatedColumns = [...initialColumns];
    data.forEach((task: Task) => {
      updatedColumns[0].tasks.push(task); // Adiciona na coluna "A Fazer"
    });
    setColumns(updatedColumns);
  };

  useEffect(() => {
    fetchTasks(); // Carrega as tarefas ao iniciar
  }, []);

  const getCurrentDateTime = (): string => {
    const now = new Date();
    return now.toLocaleString();
  };

  const addTask = async () => {
    if (newTask.trim() === "") return;

    const newTaskObj: Task = {
      id: `todo-${Date.now()}`,
      title: newTask,
      description: newDescription,
      createdAt: getCurrentDateTime(),
      updatedAt: getCurrentDateTime(),
      isEditing: false,
    };

    // Enviar tarefa para o servidor
    await fetch("http://localhost:5000/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTaskObj),
    });

    // Atualizar estado local para refletir a nova tarefa
    setColumns((prevColumns) =>
      prevColumns.map((col) =>
        col.name === "A Fazer"
          ? { ...col, tasks: [...col.tasks, newTaskObj] }
          : col
      )
    );

    setNewTask("");
    setNewDescription("");
  };

  const startEditingTask = (taskId: string, columnName: string) => {
    setColumns((prevColumns) =>
      prevColumns.map((col) =>
        col.name === columnName
          ? {
              ...col,
              tasks: col.tasks.map((task) =>
                task.id === taskId ? { ...task, isEditing: true } : task
              ),
            }
          : col
      )
    );
  };

  const deleteTask = async (taskId: string, columnName: string) => {
    // Deletar tarefa da API
    await fetch(`http://localhost:5000/tasks/${taskId}`, {
      method: "DELETE",
    });

    // Atualizar o estado local
    setColumns((prevColumns) =>
      prevColumns.map((col) =>
        col.name === columnName
          ? {
              ...col,
              tasks: col.tasks.filter((task) => task.id !== taskId),
            }
          : col
      )
    );
  };

  const updateTask = async (
    taskId: string,
    updatedTask: Task,
    columnName: string
  ) => {
    // Atualizar tarefa na API
    await fetch(`http://localhost:5000/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedTask),
    });

    // Atualizar estado local
    setColumns((prevColumns) =>
      prevColumns.map((col) =>
        col.name === columnName
          ? {
              ...col,
              tasks: col.tasks.map((task) =>
                task.id === taskId ? updatedTask : task
              ),
            }
          : col
      )
    );
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, toColumnName: string) => {
    const taskId = e.dataTransfer.getData("taskId");
    const fromColumn = e.dataTransfer.getData("fromColumn");

    if (taskId && fromColumn !== toColumnName) {
      moveTask(taskId, fromColumn, toColumnName);
    }
  };

  const moveTask = (
    taskId: string,
    fromColumnName: string,
    toColumnName: string
  ) => {
    setColumns((prevColumns) => {
      const updatedColumns = prevColumns.map((col) => {
        if (col.name === fromColumnName) {
          return {
            ...col,
            tasks: col.tasks.filter((task) => task.id !== taskId),
          };
        }
        if (col.name === toColumnName) {
          const taskToMove = prevColumns
            .find((column) => column.name === fromColumnName)
            ?.tasks.find((task) => task.id === taskId);
          if (taskToMove) {
            return { ...col, tasks: [...col.tasks, taskToMove] };
          }
        }
        return col;
      });

      return updatedColumns;
    });
  };

  const handleDragStart = (
    e: React.DragEvent,
    taskId: string,
    columnName: string
  ) => {
    e.dataTransfer.setData("taskId", taskId);
    e.dataTransfer.setData("fromColumn", columnName);
  };

  return (
    <div className="bg-gray-800 font-poppins text-white min-h-screen">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">
            Kanban App
          </a>
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <a className="nav-link active" href="#">
                  {userName}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div className="container mt-5">
        <div className="row">
          {columns.map((column) => (
            <div
              key={column.name}
              className="col-4"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.name)}
            >
              <div className="card shadow-sm mb-2">
                <div className="card-body">
                  <h5 className="card-title text-center">{column.name}</h5>

                  {column.name === "A Fazer" && (
                    <div className="input-group mb-3">
                      <input
                        type="text"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        className="form-control"
                        placeholder="Tarefa"
                      />
                    </div>
                  )}

                  {column.name === "A Fazer" && (
                    <div className="input-group mb-3">
                      <textarea
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        className="form-control"
                        placeholder="Descrição"
                      />
                    </div>
                  )}

                  {column.name === "A Fazer" && (
                    <div className="d-flex justify-content-end">
                      <button
                        className="btn btn-primary mb-3 ms-auto"
                        onClick={addTask}
                      >
                        Adicionar
                      </button>
                    </div>
                  )}

                  <div className="list-group">
                    {column.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="list-group-item"
                        draggable
                        onDragStart={(e) =>
                          handleDragStart(e, task.id, column.name)
                        }
                      >
                        {task.isEditing ? (
                          <div>
                            <input
                              type="text"
                              className="form-control mb-2"
                              defaultValue={task.title}
                              onChange={(e) => (task.title = e.target.value)}
                              autoFocus
                            />
                            <textarea
                              className="form-control"
                              defaultValue={task.description}
                              onChange={(e) =>
                                (task.description = e.target.value)
                              }
                              autoFocus
                            />
                            <button
                              className="btn btn-success btn-sm mt-2"
                              onClick={() => {
                                const updatedTask = {
                                  ...task,
                                  title: task.title,
                                  description: task.description,
                                  updatedAt: getCurrentDateTime(), // Atualiza a data de modificação
                                  isEditing: false,
                                };
                                updateTask(task.id, updatedTask, column.name); // Chama a função updateTask
                              }}
                            >
                              Salvar
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="d-flex justify-content-between">
                              <span>{task.title}</span>
                              <small className="text-muted">
                                {task.updatedAt}
                              </small>
                            </div>
                            <p className="text-muted mt-2">
                              {task.description}
                            </p>
                          </>
                        )}

                        <div className="d-flex justify-content-end mt-2">
                          <button
                            className="btn btn-sm btn-warning me-2"
                            onClick={() =>
                              startEditingTask(task.id, column.name)
                            }
                          >
                            <img
                              width="24"
                              height="24"
                              src="https://img.icons8.com/material-sharp/24/edit--v1.png"
                              alt="edit--v1"
                            />
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => deleteTask(task.id, column.name)}
                          >
                            <img
                              src="https://img.icons8.com/material-outlined/24/ffffff/trash--v1.png"
                              alt="Delete Icon"
                            />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
