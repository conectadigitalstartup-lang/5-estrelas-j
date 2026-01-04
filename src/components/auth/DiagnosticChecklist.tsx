import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Loader2, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface CheckItem {
  label: string;
  status: "loading" | "ok" | "error";
  value?: string;
}

export default function DiagnosticChecklist() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [checks, setChecks] = useState<CheckItem[]>([
    { label: "Backend URL", status: "loading" },
    { label: "API Key configurada", status: "loading" },
    { label: "Conexão com backend", status: "loading" },
    { label: "Sessão ativa", status: "loading" },
    { label: "Redirect URL", status: "loading" },
  ]);

  useEffect(() => {
    if (!open) return;

    const runChecks = async () => {
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const redirectUrl = `${window.location.origin}/auth`;

      const newChecks: CheckItem[] = [];

      // 1. Backend URL
      newChecks.push({
        label: "Backend URL",
        status: url ? "ok" : "error",
        value: url ? url.replace(/https?:\/\//, "").slice(0, 30) + "..." : "não definida",
      });

      // 2. API Key
      newChecks.push({
        label: "API Key configurada",
        status: key ? "ok" : "error",
        value: key ? `${key.slice(0, 20)}...` : "não definida",
      });

      // 3. Conexão com backend
      let connectionOk = false;
      try {
        const { error } = await supabase.from("profiles").select("id").limit(1);
        connectionOk = !error;
      } catch {
        connectionOk = false;
      }
      newChecks.push({
        label: "Conexão com backend",
        status: connectionOk ? "ok" : "error",
        value: connectionOk ? "OK" : "falhou",
      });

      // 4. Sessão ativa
      let sessionInfo = "nenhuma";
      let sessionOk = false;
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          sessionOk = true;
          sessionInfo = data.session.user.email?.slice(0, 20) + "..." || "usuário autenticado";
        }
      } catch {
        sessionInfo = "erro ao verificar";
      }
      newChecks.push({
        label: "Sessão ativa",
        status: sessionOk ? "ok" : "error",
        value: sessionInfo,
      });

      // 5. Redirect URL
      newChecks.push({
        label: "Redirect URL",
        status: "ok",
        value: redirectUrl,
      });

      setChecks(newChecks);
    };

    runChecks();
  }, [open]);

  const handleCopy = () => {
    const text = checks
      .map((c) => `${c.label}: ${c.status === "ok" ? "✓" : "✗"} ${c.value || ""}`)
      .join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full mt-6">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mx-auto"
      >
        Diagnóstico do sistema
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {open && (
        <div className="mt-3 p-4 rounded-lg border border-border bg-muted/30 text-xs space-y-2">
          {checks.map((check, idx) => (
            <div key={idx} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {check.status === "loading" && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                )}
                {check.status === "ok" && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                )}
                {check.status === "error" && (
                  <XCircle className="w-3.5 h-3.5 text-destructive" />
                )}
                <span className={cn(check.status === "error" && "text-destructive")}>
                  {check.label}
                </span>
              </div>
              {check.value && (
                <span className="text-muted-foreground truncate max-w-[160px]" title={check.value}>
                  {check.value}
                </span>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 mt-3 text-muted-foreground hover:text-foreground transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3" /> Copiado
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" /> Copiar diagnóstico
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
