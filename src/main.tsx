import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

function BootstrapErrorScreen({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto flex max-w-xl flex-col gap-3 px-6 py-16">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground">{message}</p>
        <button
          className="mt-4 inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium"
          onClick={() => window.location.reload()}
        >
          Recarregar
        </button>
      </main>
    </div>
  );
}

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element #root não encontrado.");

const root = createRoot(rootEl);

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Bootstrap error: variáveis públicas do backend ausentes", {
    VITE_SUPABASE_URL: supabaseUrl,
    VITE_SUPABASE_PUBLISHABLE_KEY: supabaseKey ? "[set]" : "[missing]",
  });

  root.render(
    <React.StrictMode>
      <BootstrapErrorScreen
        title="Configuração não carregada"
        message="Não foi possível carregar a configuração do backend para inicializar o app."
      />
    </React.StrictMode>
  );
} else {
  import("./App")
    .then(({ default: App }) => {
      root.render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );
    })
    .catch((error) => {
      console.error("App bootstrap error:", error);
      root.render(
        <React.StrictMode>
          <BootstrapErrorScreen
            title="Erro ao iniciar"
            message="O app falhou ao iniciar. Atualize a página; se persistir, avise o suporte."
          />
        </React.StrictMode>
      );
    });
}
