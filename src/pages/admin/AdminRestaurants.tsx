import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { 
  Search, 
  Building2,
  MessageSquare,
  Star,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  owner_email: string;
  owner_name: string;
  feedbacks_count: number;
  average_rating: number;
  created_at: string;
}

const AdminRestaurants = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    const filtered = restaurants.filter(
      (r) =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.owner_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredRestaurants(filtered);
    setCurrentPage(1);
  }, [searchQuery, restaurants]);

  const fetchRestaurants = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("admin-restaurants");
      if (error) throw error;
      setRestaurants(data?.restaurants || []);
      setFilteredRestaurants(data?.restaurants || []);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      toast.error("Erro ao carregar restaurantes");
    } finally {
      setLoading(false);
    }
  };

  const paginatedRestaurants = filteredRestaurants.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredRestaurants.length / itemsPerPage);

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "text-success";
    if (rating >= 4) return "text-amber-500";
    if (rating >= 3) return "text-orange-500";
    return "text-destructive";
  };

  return (
    <AdminLayout>
      <Helmet>
        <title>Gerenciar Restaurantes - Admin | Avalia Pro</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Gerenciamento de Restaurantes
          </h1>
          <p className="text-muted-foreground mt-1">
            Visualize todos os restaurantes cadastrados
          </p>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, slug ou email do dono..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Restaurants Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Restaurantes ({filteredRestaurants.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : paginatedRestaurants.length === 0 ? (
              <div className="py-12 text-center">
                <Building2 className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum restaurante encontrado</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Restaurante</TableHead>
                      <TableHead>Dono</TableHead>
                      <TableHead className="text-center">Feedbacks</TableHead>
                      <TableHead className="text-center">Nota Média</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRestaurants.map((restaurant) => (
                      <TableRow key={restaurant.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{restaurant.name}</p>
                            <p className="text-sm text-muted-foreground">/{restaurant.slug}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{restaurant.owner_name || "-"}</p>
                            <p className="text-sm text-muted-foreground">{restaurant.owner_email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{restaurant.feedbacks_count}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className={`flex items-center justify-center gap-1 font-medium ${getRatingColor(restaurant.average_rating)}`}>
                            <Star className="h-4 w-4 fill-current" />
                            <span>{restaurant.average_rating.toFixed(1)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" asChild>
                                <a
                                  href={`/avaliar/${restaurant.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Ver Página Pública</TooltipContent>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Página {currentPage} de {totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminRestaurants;
