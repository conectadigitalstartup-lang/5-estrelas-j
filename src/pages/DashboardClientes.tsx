import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Users, Phone, MessageSquare, Calendar, Search, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface ClienteComContato {
  id: string;
  client_name: string;
  client_phone: string | null;
  comment: string | null;
  created_at: string;
  rating: number;
}

const DashboardClientes = () => {
  const { user } = useAuth();
  const [clientes, setClientes] = useState<ClienteComContato[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchClientes = async () => {
      if (!user) return;
      setLoading(true);

      // Get user's company
      const { data: company } = await supabase
        .from("companies")
        .select("id")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (!company) {
        setLoading(false);
        return;
      }

      // Get feedbacks with client name (contact info)
      const { data } = await supabase
        .from("feedbacks")
        .select("id, client_name, client_phone, comment, created_at, rating")
        .eq("company_id", company.id)
        .not("client_name", "is", null)
        .order("created_at", { ascending: false });

      if (data) {
        setClientes(data.filter(c => c.client_name) as ClienteComContato[]);
      }
      setLoading(false);
    };

    fetchClientes();
  }, [user]);

  // Filter by search
  const filteredClientes = clientes.filter((cliente) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      cliente.client_name?.toLowerCase().includes(searchLower) ||
      cliente.client_phone?.toLowerCase().includes(searchLower) ||
      cliente.comment?.toLowerCase().includes(searchLower)
    );
  });

  // Count clientes with phone
  const clientesComTelefone = clientes.filter(c => c.client_phone).length;

  const truncateText = (text: string | null, maxLength: number = 50) => {
    if (!text) return "—";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  const handleWhatsAppClick = (phone: string) => {
    // Remove non-numeric characters
    const cleanPhone = phone.replace(/\D/g, "");
    // Add Brazil country code if not present
    const formattedPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
    window.open(`https://wa.me/${formattedPhone}`, "_blank");
  };

  return (
    <>
      <Helmet>
        <title>Meus Clientes - Avalia Pro</title>
        <meta name="description" content="Visualize os clientes que deixaram contato nos feedbacks." />
      </Helmet>

      <DashboardLayout>
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-1">
              Meus Clientes
            </h1>
            <p className="text-muted-foreground">
              Clientes que deixaram contato nos feedbacks
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {loading ? (
            <>
              <Skeleton className="h-24 rounded-xl" />
              <Skeleton className="h-24 rounded-xl" />
            </>
          ) : (
            <>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total de Clientes</p>
                      <p className="text-2xl font-bold">{clientes.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Phone className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Com WhatsApp</p>
                      <p className="text-2xl font-bold text-green-600">{clientesComTelefone}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, telefone ou comentário..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredClientes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {search ? "Nenhum cliente encontrado" : "Nenhum cliente ainda"}
              </h3>
              <p className="text-muted-foreground text-sm">
                {search
                  ? "Tente buscar por outro termo"
                  : "Quando os clientes deixarem nome ou telefone nos feedbacks, eles aparecerão aqui."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {filteredClientes.length} cliente{filteredClientes.length !== 1 ? "s" : ""} encontrado{filteredClientes.length !== 1 ? "s" : ""}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome do Cliente</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead className="hidden md:table-cell">Último Feedback</TableHead>
                      <TableHead className="hidden sm:table-cell">Data</TableHead>
                      <TableHead className="text-right">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClientes.map((cliente) => (
                      <TableRow key={cliente.id}>
                        <TableCell className="font-medium">{cliente.client_name}</TableCell>
                        <TableCell>
                          {cliente.client_phone || (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground text-sm max-w-[200px]">
                          {truncateText(cliente.comment)}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                          {format(new Date(cliente.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </TableCell>
                        <TableCell className="text-right">
                          {cliente.client_phone ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 text-green-600 border-green-200 hover:bg-green-50"
                              onClick={() => handleWhatsAppClick(cliente.client_phone!)}
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">WhatsApp</span>
                            </Button>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </DashboardLayout>
    </>
  );
};

export default DashboardClientes;
