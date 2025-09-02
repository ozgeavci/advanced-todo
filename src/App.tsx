import React, { useEffect, useMemo, useState } from "react";

// --- Types ---
type Filter = "Tümü" | "Tamamlanan" | "Tamamlanmayan";
type Category = "Genel" | "İş" | "Okul" | "Kişisel";


interface Todo {
  id: string;
  text: string;
  completed: boolean;
  category: Category;
  createdAt: number;
}

// --- Helpers ---
const CATEGORIES: Category[] = ["Genel", "İş", "Okul", "Kişisel"];
const uid = () => crypto.randomUUID?.() ?? String(Date.now() + Math.random());

const loadLS = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

function App() {
  // persistent states
  const [todos, setTodos] = useState<Todo[]>(() => loadLS<Todo[]>("todos", []));
  const [dark, setDark] = useState<boolean>(() => loadLS<boolean>("themeDark", false));

  // ui states
  const [input, setInput] = useState("");
  const [category, setCategory] = useState<Category>("Genel");
  const [filter, setFilter] = useState<Filter>("Tümü");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);


  // persist
  useEffect(() => localStorage.setItem("todos", JSON.stringify(todos)), [todos]);
  useEffect(() => localStorage.setItem("themeDark", JSON.stringify(dark)), [dark]);

  // filter logic
  const filtered = useMemo(() => {
    return todos.filter((t) => {
      if (filter === "Tamamlanan") return t.completed;
      if (filter === "Tamamlanmayan") return !t.completed;
      return true;
    });
  }, [todos, filter]);

  const remainingCount = todos.filter((t) => !t.completed).length;

  // actions
  const addTodo = () => {
    const text = input.trim();
    if (!text) return;
    const todo: Todo = {
      id: uid(),
      text,
      completed: false,
      category,
      createdAt: Date.now(),
    };
    setTodos((prev) => [todo, ...prev]);
    setInput("");
  };

  const toggleTodo = (id: string) =>
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));

  const deleteTodo = (id: string) =>
    setTodos((prev) => prev.filter((t) => t.id !== id));

  const startEdit = (id: string, current: string) => {
    setEditingId(id);
    setEditingText(current);
  };

  const saveEdit = (id: string) => {
    const txt = editingText.trim();
    if (!txt) return;
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, text: txt } : t)));
    setEditingId(null);
    setEditingText("");
  };

  const clearCompleted = () =>
    setTodos((prev) => prev.filter((t) => !t.completed));

  const onKeyDownInput: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") addTodo();
  };

  const themeClass = dark ? "dark" : "";

  return (
    <div className={`${themeClass}`}>
      <div className="min-h-screen bg-gray-100 text-gray-900 transition-colors duration-200 dark:bg-gray-900 dark:text-gray-100">
        <div className="max-w-xl mx-auto px-4 py-8">
          
          {/* Header */}
          <header className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-extrabold tracking-tight">📝 Advanced Todo</h1>
            <button
              onClick={() => setDark((d) => !d)}
              className="rounded-xl px-3 py-2 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 active:scale-[.98] transition"
              aria-label="Tema değiştir"
            >
              {dark ? "☀️ Light" : "🌙 Dark"}
            </button>
          </header>

          {/* Input Row */}
          <div className="flex gap-2 mb-4">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDownInput}
              placeholder="Yeni görev ekle…"
              className="flex-1 rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none ring-0 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-700"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="rounded-xl border border-gray-300 bg-white px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <button
              onClick={addTodo}
              className="rounded-xl px-4 py-2 bg-green-600 text-white font-semibold hover:bg-green-500 active:scale-[.98] transition"
            >
              ➕ Ekle
            </button>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="text-sm opacity-80">{remainingCount} görev kaldı</div>
            <div className="flex gap-2">
              {(["Tümü", "Tamamlanan", "Tamamlanmayan"] as Filter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-lg px-3 py-1 text-sm border transition
                    ${filter === f
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "border-gray-300 hover:border-indigo-400 dark:border-gray-700"}`}
                >
                  {f}
                </button>
              ))}
            </div>
            <button
              onClick={clearCompleted}
              className="rounded-lg px-3 py-1 text-sm border border-gray-300 hover:border-red-400 dark:border-gray-700"
            >
              Tamamlananları temizle
            </button>
          </div>

          {/* List */}
          <ul className="space-y-2">
            {filtered.length === 0 && (
              <li className="text-sm opacity-70 py-6 text-center">
                Henüz görev yok. Bir tane eklemeyi deneyin ✨
              </li>
            )}

            {filtered.map((todo) => (
              <li
                key={todo.id}
                className="group flex items-center justify-between rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-2 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    className="size-5 accent-indigo-600"
                    aria-label="Görevi tamamla"
                  />

                  {editingId === todo.id ? (
                    <input
                      autoFocus
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit(todo.id);
                        if (e.key === "Escape") {
                          setEditingId(null);
                          setEditingText("");
                        }
                      }}
                      className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm dark:bg-gray-900 dark:border-gray-700"
                    />
                  ) : (
                    <div>
                      <div
                        className={`font-medium ${todo.completed ? "line-through opacity-60" : ""}`}
                        title={new Date(todo.createdAt).toLocaleString()}
                      >
                        {todo.text}
                      </div>
                      <div className="text-xs opacity-70">
                        [{todo.category}] • {new Date(todo.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 opacity-80">
                  {editingId === todo.id ? (
                    <button
                      onClick={() => saveEdit(todo.id)}
                      className="rounded-md px-2 py-1 text-xs bg-emerald-600 text-white hover:bg-emerald-500"
                    >
                      Kaydet
                    </button>
                  ) : (
                    <button
                      onClick={() => startEdit(todo.id, todo.text)}
                      className="rounded-md px-2 py-1 text-xs border border-gray-300 hover:border-indigo-400 dark:border-gray-700"
                    >
                      Düzenle
                    </button>
                  )}
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="rounded-md px-2 py-1 text-xs border border-gray-300 hover:border-red-400 dark:border-gray-700"
                  >
                    Sil
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {/* Footer */}
          <footer className="mt-8 text-xs opacity-60 text-center">
            React + TypeScript + Tailwind • LocalStorage • Dark/Light • Filtre • Kategori • Düzenle
          </footer>
        </div>
      </div>
    </div>
  );
}

export default App;
<div className="h-10 bg-red-500 rounded-xl" />
