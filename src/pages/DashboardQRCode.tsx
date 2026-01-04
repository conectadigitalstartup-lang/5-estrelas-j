// QR Code generation and download page
import { Helmet } from "react-helmet-async";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PaywallButton from "@/components/subscription/PaywallButton";
import { Download, Copy, Printer, ExternalLink, Lightbulb, Check, Image, FileText, CreditCard, Bookmark, SquareStack, StickyNote } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { QRCodeCanvas } from "qrcode.react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import avaliaProShield from "@/assets/avalia-pro-shield.jpg";

interface Company {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  google_review_link: string | null;
  instagram_handle: string | null;
  whatsapp_number: string | null;
}

// Helper to format WhatsApp number for display
const formatWhatsApp = (number: string): string => {
  if (number.length === 11) {
    return `(${number.slice(0, 2)}) ${number.slice(2, 7)}-${number.slice(7)}`;
  }
  if (number.length === 10) {
    return `(${number.slice(0, 2)}) ${number.slice(2, 6)}-${number.slice(6)}`;
  }
  return number;
};

const DashboardQRCode = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompany = async () => {
      if (!user) return;

      const { data } = await supabase
        .from("companies")
        .select("*")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (data) {
        setCompany(data);
      }
      setLoading(false);
    };

    fetchCompany();
  }, [user]);

  const evaluationUrl = company ? `${window.location.origin}/avaliar/${company.slug}` : "";

  const copyLink = async () => {
    if (evaluationUrl) {
      await navigator.clipboard.writeText(evaluationUrl);
      toast({
        title: "Link copiado!",
        description: "O link foi copiado para a área de transferência.",
      });
    }
  };

  const downloadQRCodePNG = () => {
    setDownloading("png");
    const canvas = document.getElementById("qr-code-canvas") as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `qrcode-${company?.slug || "avaliar"}.png`;
      link.href = url;
      link.click();
      toast({
        title: "Download concluído!",
        description: "Seu QR Code foi baixado em alta resolução.",
      });
    }
    setDownloading(null);
  };

  const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

  const generateQRCodeDataUrl = (): string => {
    // Create a temporary canvas to generate QR Code
    const tempCanvas = document.createElement("canvas");
    const size = 280; // High resolution
    tempCanvas.width = size;
    tempCanvas.height = size;
    
    // Use the existing visible QR Code canvas
    const existingCanvas = document.getElementById("qr-code-canvas") as HTMLCanvasElement;
    if (existingCanvas) {
      const ctx = tempCanvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, size, size);
        ctx.drawImage(existingCanvas, 0, 0, size, size);
        return tempCanvas.toDataURL("image/png");
      }
    }
    
    // Fallback: return empty white image
    const ctx = tempCanvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, size, size);
    }
    return tempCanvas.toDataURL("image/png");
  };

  const loadImageAsDataUrl = async (url: string): Promise<string | null> => {
    try {
      const response = await fetch(url, { mode: 'cors' });
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  };

  // Helper to create circular clipped logo for PDF - using fetch for better CORS handling
  const createCircularLogoDataUrl = async (logoUrl: string): Promise<string | null> => {
    try {
      // For local assets (imported), use directly
      if (logoUrl.startsWith('data:') || logoUrl.startsWith('/')) {
        return loadImageDirectly(logoUrl);
      }

      // For remote URLs, fetch as blob first to avoid CORS issues
      const response = await fetch(logoUrl, { mode: 'cors' });
      if (!response.ok) {
        console.error("Failed to fetch logo:", response.status);
        return null;
      }
      
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const result = await loadImageDirectly(blobUrl);
      URL.revokeObjectURL(blobUrl);
      return result;
    } catch (error) {
      console.error("Error loading logo:", error);
      return null;
    }
  };

  // Helper to load image and create circular clip
  const loadImageDirectly = (src: string): Promise<string | null> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const size = 200; // High res
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        
        if (ctx) {
          // Create circular clipping path
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          
          // Draw image centered and scaled to fit
          const scale = Math.max(size / img.width, size / img.height);
          const x = (size - img.width * scale) / 2;
          const y = (size - img.height * scale) / 2;
          ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
          
          resolve(canvas.toDataURL("image/png"));
        } else {
          resolve(null);
        }
      };
      
      img.onerror = () => {
        console.error("Image load error for:", src.substring(0, 50));
        resolve(null);
      };
      
      img.src = src;
    });
  };

  const downloadMaterialPDF = async () => {
    setDownloading("pdf");
    
    try {
      // Generate QR Code data URL from the high-res hidden canvas
      const qrDataUrl = generateQRCodeDataUrl();
      
      // Load circular company logo or fallback to Avalia Pro logo
      let circularLogoDataUrl: string | null = null;
      if (company?.logo_url) {
        circularLogoDataUrl = await createCircularLogoDataUrl(company.logo_url);
      }
      if (!circularLogoDataUrl) {
        circularLogoDataUrl = await createCircularLogoDataUrl(avaliaProShield);
      }
      
      // Create premium PDF with professional design
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [100, 150], // Slightly taller for elegant proportions
      });

      const pageWidth = 100;
      const pageHeight = 150;
      const companyName = company?.name || "Seu Restaurante";
      const instagramHandle = company?.instagram_handle;
      const whatsappNumber = company?.whatsapp_number;

      // === PREMIUM BACKGROUND ===
      // Main dark navy background
      pdf.setFillColor(15, 23, 42); // Slate-900 - rich dark navy
      pdf.rect(0, 0, pageWidth, pageHeight, "F");

      // Subtle gradient overlay effect (lighter area at top)
      pdf.setFillColor(30, 41, 59); // Slate-800
      pdf.rect(0, 0, pageWidth, 50, "F");

      // === LOGO AREA ===
      if (circularLogoDataUrl) {
        // Add circular clipped logo
        pdf.addImage(circularLogoDataUrl, "PNG", pageWidth / 2 - 14, 10, 28, 28);
      } else {
        // Fallback to "A" emblem if image loading fails
        pdf.setFillColor(212, 175, 55);
        pdf.circle(pageWidth / 2, 22, 8, "F");
        pdf.setFillColor(15, 23, 42);
        pdf.circle(pageWidth / 2, 22, 6, "F");
        pdf.setTextColor(212, 175, 55);
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text("A", pageWidth / 2, 25, { align: "center" });
      }

      // === COMPANY NAME ===
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.text(companyName, pageWidth / 2, 48, { align: "center" });

      // === MAIN MESSAGE ===
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      pdf.text("Sua opinião é importante para nós", pageWidth / 2, 58, { align: "center" });

      // === QR CODE CONTAINER ===
      // Outer white rounded rectangle with shadow effect
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(22, 66, 56, 56, 4, 4, "F");

      // QR Code
      pdf.addImage(qrDataUrl, "PNG", 25, 69, 50, 50);

      // === CALL TO ACTION ===
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text("Aponte a câmera para avaliar", pageWidth / 2, 132, { align: "center" });
      
      // Time indication - reduces friction
      pdf.setTextColor(180, 180, 190);
      pdf.setFontSize(8);
      pdf.text("Leva apenas 15 segundos", pageWidth / 2, 138, { align: "center" });

      // === SOCIAL INFO (if available) ===
      let footerStartY = 143;
      const socialParts: string[] = [];
      if (instagramHandle) socialParts.push(`@${instagramHandle}`);
      if (whatsappNumber) socialParts.push(formatWhatsApp(whatsappNumber));
      
      if (socialParts.length > 0) {
        pdf.setTextColor(200, 200, 210);
        pdf.setFontSize(7);
        pdf.text(socialParts.join("  •  "), pageWidth / 2, footerStartY, { align: "center" });
        footerStartY = 147;
      }

      // === FOOTER WITH BRANDING ===
      // Powered by text
      pdf.setTextColor(120, 120, 130);
      pdf.setFontSize(7);
      pdf.text("Powered by Avalia Pro", pageWidth / 2, footerStartY + 2, { align: "center" });

      pdf.save(`Avalia-Pro-Material-${company?.slug}.pdf`);
      
      toast({
        title: "Material premium gerado!",
        description: "Seu material de mesa profissional foi baixado.",
      });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
    setDownloading(null);
  };

  const downloadA4PDF = async () => {
    setDownloading("a4");
    
    try {
      // Generate QR Code data URL from the high-res hidden canvas
      const qrDataUrl = generateQRCodeDataUrl();

      // Load circular company logo or fallback to Avalia Pro logo
      let circularLogoDataUrl: string | null = null;
      if (company?.logo_url) {
        circularLogoDataUrl = await createCircularLogoDataUrl(company.logo_url);
      }
      if (!circularLogoDataUrl) {
        circularLogoDataUrl = await createCircularLogoDataUrl(avaliaProShield);
      }

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const cardWidth = 90;
      const cardHeight = 135;
      const margin = 10;
      const gap = 5;
      const companyName = company?.name || "Seu Restaurante";
      const instagramHandle = company?.instagram_handle;
      const whatsappNumber = company?.whatsapp_number;

      // Helper function to draw a premium material card
      const drawPremiumCard = (x: number, y: number) => {
        // === PREMIUM BACKGROUND ===
        // Main dark navy background
        pdf.setFillColor(15, 23, 42);
        pdf.roundedRect(x, y, cardWidth, cardHeight, 4, 4, "F");

        // Subtle gradient overlay effect (lighter area at top)
        pdf.setFillColor(30, 41, 59);
        pdf.roundedRect(x, y, cardWidth, 45, 4, 4, "F");
        pdf.setFillColor(15, 23, 42);
        pdf.rect(x, y + 40, cardWidth, 5, "F"); // blend

        // === LOGO AREA ===
        if (circularLogoDataUrl) {
          // Add circular clipped logo
          pdf.addImage(circularLogoDataUrl, "PNG", x + cardWidth / 2 - 12, y + 8, 24, 24);
        } else {
          // Fallback to "A" emblem
          pdf.setFillColor(212, 175, 55);
          pdf.circle(x + cardWidth / 2, y + 18, 7, "F");
          pdf.setFillColor(15, 23, 42);
          pdf.circle(x + cardWidth / 2, y + 18, 5, "F");
          pdf.setTextColor(212, 175, 55);
          pdf.setFontSize(11);
          pdf.setFont("helvetica", "bold");
          pdf.text("A", x + cardWidth / 2, y + 20.5, { align: "center" });
        }

        // === COMPANY NAME ===
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text(companyName, x + cardWidth / 2, y + 38, { align: "center" });

        // === MAIN MESSAGE ===
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "normal");
        pdf.text("Sua opinião é importante para nós", x + cardWidth / 2, y + 48, { align: "center" });

        // === QR CODE CONTAINER ===
        pdf.setFillColor(255, 255, 255);
        pdf.roundedRect(x + 20, y + 54, 50, 50, 3, 3, "F");

        // QR Code
        pdf.addImage(qrDataUrl, "PNG", x + 22.5, y + 56.5, 45, 45);

        // === CALL TO ACTION ===
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "normal");
        pdf.text("Aponte a câmera para avaliar", x + cardWidth / 2, y + 114, { align: "center" });
        
        // Time indication
        pdf.setTextColor(180, 180, 190);
        pdf.setFontSize(7);
        pdf.text("Leva apenas 15 segundos", x + cardWidth / 2, y + 120, { align: "center" });

        // === SOCIAL INFO (if available) ===
        let footerY = 126;
        const socialParts: string[] = [];
        if (instagramHandle) socialParts.push(`@${instagramHandle}`);
        if (whatsappNumber) socialParts.push(formatWhatsApp(whatsappNumber));
        
        if (socialParts.length > 0) {
          pdf.setTextColor(200, 200, 210);
          pdf.setFontSize(5);
          pdf.text(socialParts.join("  •  "), x + cardWidth / 2, y + footerY, { align: "center" });
          footerY = 130;
        }

        // === FOOTER WITH BRANDING ===
        // Powered by text
        pdf.setTextColor(100, 100, 110);
        pdf.setFontSize(6);
        pdf.text("Powered by Avalia Pro", x + cardWidth / 2, y + footerY + 2, { align: "center" });
      };

      // Draw 4 premium cards in 2x2 grid
      drawPremiumCard(margin, margin);
      drawPremiumCard(margin + cardWidth + gap, margin);
      drawPremiumCard(margin, margin + cardHeight + gap);
      drawPremiumCard(margin + cardWidth + gap, margin + cardHeight + gap);

      pdf.save(`Avalia-Pro-Impressao-Premium-${company?.slug}.pdf`);
      
      toast({
        title: "PDF A4 Premium gerado!",
        description: "4 materiais profissionais prontos para impressão.",
      });
    } catch (error) {
      console.error("PDF A4 generation error:", error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
    setDownloading(null);
  };

  // === FORMATOS DE IMPRESSÃO ===
  
  // Tent Card / Display de Mesa - 10x15cm
  const downloadTentCardPDF = async () => {
    setDownloading("tent");
    try {
      const qrDataUrl = generateQRCodeDataUrl();
      let circularLogoDataUrl: string | null = null;
      if (company?.logo_url) {
        circularLogoDataUrl = await createCircularLogoDataUrl(company.logo_url);
      }
      if (!circularLogoDataUrl) {
        circularLogoDataUrl = await createCircularLogoDataUrl(avaliaProShield);
      }

      // 10x15cm tent card (folded)
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [100, 150],
      });

      const pageWidth = 100;
      const pageHeight = 150;
      const companyName = company?.name || "Seu Restaurante";
      const instagramHandle = company?.instagram_handle;
      const whatsappNumber = company?.whatsapp_number;

      // Background
      pdf.setFillColor(15, 23, 42);
      pdf.rect(0, 0, pageWidth, pageHeight, "F");
      pdf.setFillColor(30, 41, 59);
      pdf.rect(0, 0, pageWidth, 50, "F");

      // Logo
      if (circularLogoDataUrl) {
        pdf.addImage(circularLogoDataUrl, "PNG", pageWidth / 2 - 14, 10, 28, 28);
      }

      // Text
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.text(companyName, pageWidth / 2, 48, { align: "center" });
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      pdf.text("Sua opinião é importante para nós", pageWidth / 2, 58, { align: "center" });

      // QR
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(22, 66, 56, 56, 4, 4, "F");
      pdf.addImage(qrDataUrl, "PNG", 25, 69, 50, 50);

      // CTA
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(10);
      pdf.text("Aponte a câmera para avaliar", pageWidth / 2, 132, { align: "center" });
      pdf.setTextColor(180, 180, 190);
      pdf.setFontSize(8);
      pdf.text("Leva apenas 15 segundos", pageWidth / 2, 138, { align: "center" });

      // Social info (if available)
      let footerY = 143;
      const socialParts: string[] = [];
      if (instagramHandle) socialParts.push(`@${instagramHandle}`);
      if (whatsappNumber) socialParts.push(formatWhatsApp(whatsappNumber));
      
      if (socialParts.length > 0) {
        pdf.setTextColor(200, 200, 210);
        pdf.setFontSize(7);
        pdf.text(socialParts.join("  •  "), pageWidth / 2, footerY, { align: "center" });
        footerY = 147;
      }

      // Footer
      pdf.setTextColor(120, 120, 130);
      pdf.setFontSize(7);
      pdf.text("Powered by Avalia Pro", pageWidth / 2, footerY + 2, { align: "center" });

      pdf.save(`Display-Mesa-10x15cm-${company?.slug}.pdf`);
      toast({ title: "Display de mesa gerado!", description: "Formato 10x15cm para display de mesa." });
    } catch (error) {
      toast({ title: "Erro ao gerar PDF", variant: "destructive" });
    }
    setDownloading(null);
  };

  // Adesivo / Sticker - 5x5cm
  const downloadStickerPDF = async () => {
    setDownloading("sticker");
    try {
      const qrDataUrl = generateQRCodeDataUrl();
      
      // A4 page with multiple 5x5cm stickers
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const stickerSize = 50; // 5x5cm
      const margin = 10;
      const gap = 5;
      const cols = 3;
      const rows = 5;

      const drawSticker = (x: number, y: number) => {
        // Background
        pdf.setFillColor(15, 23, 42);
        pdf.roundedRect(x, y, stickerSize, stickerSize, 3, 3, "F");
        
        // QR Code
        pdf.setFillColor(255, 255, 255);
        pdf.roundedRect(x + 5, y + 5, 40, 40, 2, 2, "F");
        pdf.addImage(qrDataUrl, "PNG", x + 7, y + 7, 36, 36);
        
        // Text
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(5);
        pdf.text("Avalie-nos", x + stickerSize / 2, y + 48, { align: "center" });
      };

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = margin + col * (stickerSize + gap);
          const y = margin + row * (stickerSize + gap);
          drawSticker(x, y);
        }
      }

      pdf.save(`Adesivos-5x5cm-${company?.slug}.pdf`);
      toast({ title: "Adesivos gerados!", description: "15 adesivos 5x5cm em uma folha A4." });
    } catch (error) {
      toast({ title: "Erro ao gerar PDF", variant: "destructive" });
    }
    setDownloading(null);
  };

  // Flyer A5 - 14.8x21cm
  const downloadFlyerPDF = async () => {
    setDownloading("flyer");
    try {
      const qrDataUrl = generateQRCodeDataUrl();
      let circularLogoDataUrl: string | null = null;
      if (company?.logo_url) {
        circularLogoDataUrl = await createCircularLogoDataUrl(company.logo_url);
      }
      if (!circularLogoDataUrl) {
        circularLogoDataUrl = await createCircularLogoDataUrl(avaliaProShield);
      }

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a5",
      });

      const pageWidth = 148;
      const pageHeight = 210;
      const companyName = company?.name || "Seu Restaurante";
      const instagramHandle = company?.instagram_handle;
      const whatsappNumber = company?.whatsapp_number;

      // Background gradient effect
      pdf.setFillColor(15, 23, 42);
      pdf.rect(0, 0, pageWidth, pageHeight, "F");
      pdf.setFillColor(30, 41, 59);
      pdf.rect(0, 0, pageWidth, 80, "F");

      // Logo
      if (circularLogoDataUrl) {
        pdf.addImage(circularLogoDataUrl, "PNG", pageWidth / 2 - 18, 17, 36, 36);
      }

      // Company name
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont("helvetica", "bold");
      pdf.text(companyName, pageWidth / 2, 68, { align: "center" });

      // Message
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "normal");
      pdf.text("Sua opinião é muito importante!", pageWidth / 2, 82, { align: "center" });

      // QR Code
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(pageWidth / 2 - 40, 95, 80, 80, 5, 5, "F");
      pdf.addImage(qrDataUrl, "PNG", pageWidth / 2 - 35, 100, 70, 70);

      // CTA
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("Escaneie o QR Code e avalie", pageWidth / 2, 188, { align: "center" });
      pdf.setTextColor(180, 180, 190);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text("Leva apenas 15 segundos", pageWidth / 2, 196, { align: "center" });

      // Social info (if available)
      let footerY = 202;
      const socialParts: string[] = [];
      if (instagramHandle) socialParts.push(`@${instagramHandle}`);
      if (whatsappNumber) socialParts.push(formatWhatsApp(whatsappNumber));
      
      if (socialParts.length > 0) {
        pdf.setTextColor(200, 200, 210);
        pdf.setFontSize(8);
        pdf.text(socialParts.join("  •  "), pageWidth / 2, footerY, { align: "center" });
        footerY = 207;
      }

      // Footer
      pdf.setTextColor(120, 120, 130);
      pdf.setFontSize(8);
      pdf.text("Powered by Avalia Pro", pageWidth / 2, footerY, { align: "center" });

      pdf.save(`Flyer-A5-${company?.slug}.pdf`);
      toast({ title: "Flyer A5 gerado!", description: "Perfeito para distribuição aos clientes." });
    } catch (error) {
      toast({ title: "Erro ao gerar PDF", variant: "destructive" });
    }
    setDownloading(null);
  };

  // Poster A3 - 29.7x42cm
  const downloadPosterPDF = async () => {
    setDownloading("poster");
    try {
      const qrDataUrl = generateQRCodeDataUrl();
      let circularLogoDataUrl: string | null = null;
      if (company?.logo_url) {
        circularLogoDataUrl = await createCircularLogoDataUrl(company.logo_url);
      }
      if (!circularLogoDataUrl) {
        circularLogoDataUrl = await createCircularLogoDataUrl(avaliaProShield);
      }

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a3",
      });

      const pageWidth = 297;
      const pageHeight = 420;
      const companyName = company?.name || "Seu Restaurante";
      const instagramHandle = company?.instagram_handle;
      const whatsappNumber = company?.whatsapp_number;

      // Background
      pdf.setFillColor(15, 23, 42);
      pdf.rect(0, 0, pageWidth, pageHeight, "F");
      pdf.setFillColor(30, 41, 59);
      pdf.rect(0, 0, pageWidth, 140, "F");

      // Logo
      if (circularLogoDataUrl) {
        pdf.addImage(circularLogoDataUrl, "PNG", pageWidth / 2 - 35, 35, 70, 70);
      }

      // Company name
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(42);
      pdf.setFont("helvetica", "bold");
      pdf.text(companyName, pageWidth / 2, 130, { align: "center" });

      // Message
      pdf.setFontSize(22);
      pdf.setFont("helvetica", "normal");
      pdf.text("Sua opinião é muito importante para nós!", pageWidth / 2, 155, { align: "center" });

      // QR Code
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(pageWidth / 2 - 75, 175, 150, 150, 8, 8, "F");
      pdf.addImage(qrDataUrl, "PNG", pageWidth / 2 - 65, 185, 130, 130);

      // CTA
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text("Aponte a câmera do celular e avalie", pageWidth / 2, 350, { align: "center" });
      pdf.setTextColor(180, 180, 190);
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "normal");
      pdf.text("É rápido e fácil - leva apenas 15 segundos", pageWidth / 2, 365, { align: "center" });

      // Social info (if available)
      let footerY = 385;
      const socialParts: string[] = [];
      if (instagramHandle) socialParts.push(`@${instagramHandle}`);
      if (whatsappNumber) socialParts.push(formatWhatsApp(whatsappNumber));
      
      if (socialParts.length > 0) {
        pdf.setTextColor(200, 200, 210);
        pdf.setFontSize(14);
        pdf.text(socialParts.join("  •  "), pageWidth / 2, footerY, { align: "center" });
        footerY = 400;
      }

      // Footer
      pdf.setTextColor(120, 120, 130);
      pdf.setFontSize(12);
      pdf.text("Powered by Avalia Pro", pageWidth / 2, footerY + 5, { align: "center" });

      pdf.save(`Poster-A3-${company?.slug}.pdf`);
      toast({ title: "Poster A3 gerado!", description: "Ideal para parede ou vitrine." });
    } catch (error) {
      toast({ title: "Erro ao gerar PDF", variant: "destructive" });
    }
    setDownloading(null);
  };

  // Insert para Cardápio - 8x5cm
  const downloadMenuInsertPDF = async () => {
    setDownloading("menu");
    try {
      const qrDataUrl = generateQRCodeDataUrl();
      
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const insertWidth = 80;
      const insertHeight = 50;
      const margin = 10;
      const gapX = 5;
      const gapY = 5;
      const cols = 3;
      const rows = 3;
      const companyName = company?.name || "Seu Restaurante";

      const drawInsert = (x: number, y: number) => {
        // Background
        pdf.setFillColor(15, 23, 42);
        pdf.roundedRect(x, y, insertWidth, insertHeight, 3, 3, "F");
        
        // QR Code
        pdf.setFillColor(255, 255, 255);
        pdf.roundedRect(x + 5, y + 7, 36, 36, 2, 2, "F");
        pdf.addImage(qrDataUrl, "PNG", x + 7, y + 9, 32, 32);
        
        // Text
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "bold");
        pdf.text(companyName.substring(0, 15), x + 45, y + 18, { align: "left" });
        
        pdf.setFontSize(7);
        pdf.setFont("helvetica", "normal");
        pdf.text("Avalie sua experiência", x + 45, y + 26, { align: "left" });
        
        pdf.setTextColor(180, 180, 190);
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "bold");
        pdf.text("Escaneie o QR Code", x + 45, y + 38, { align: "left" });
      };

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = margin + col * (insertWidth + gapX);
          const y = margin + row * (insertHeight + gapY);
          drawInsert(x, y);
        }
      }

      pdf.save(`Insert-Cardapio-8x5cm-${company?.slug}.pdf`);
      toast({ title: "Inserts gerados!", description: "9 inserts 8x5cm para colocar no cardápio." });
    } catch (error) {
      toast({ title: "Erro ao gerar PDF", variant: "destructive" });
    }
    setDownloading(null);
  };

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  const printFormats = [
    {
      id: "tent",
      name: "Display de Mesa",
      size: "10 x 15 cm",
      icon: SquareStack,
      description: "Perfeito para ficar em pé nas mesas",
      onClick: downloadTentCardPDF,
    },
    {
      id: "sticker",
      name: "Adesivos",
      size: "5 x 5 cm (15 unidades)",
      icon: StickyNote,
      description: "Cole em cardápios, porta-guardanapos ou caixa",
      onClick: downloadStickerPDF,
    },
    {
      id: "flyer",
      name: "Flyer A5",
      size: "14.8 x 21 cm",
      icon: FileText,
      description: "Ideal para distribuir ou deixar no balcão",
      onClick: downloadFlyerPDF,
    },
    {
      id: "a4",
      name: "Folha A4",
      size: "21 x 29.7 cm (4 cards)",
      icon: Printer,
      description: "4 materiais por folha, recorte e use",
      onClick: downloadA4PDF,
    },
    {
      id: "poster",
      name: "Poster A3",
      size: "29.7 x 42 cm",
      icon: Image,
      description: "Para colar na parede ou vitrine",
      onClick: downloadPosterPDF,
    },
    {
      id: "menu",
      name: "Insert de Cardápio",
      size: "8 x 5 cm (9 unidades)",
      icon: Bookmark,
      description: "Encaixa dentro de cardápios ou porta-contas",
      onClick: downloadMenuInsertPDF,
    },
  ];

  return (
    <>
      <Helmet>
        <title>Meu QR Code - Avalia Pro</title>
        <meta name="description" content="Gere e baixe seu QR Code personalizado para coletar avaliações." />
      </Helmet>

      <DashboardLayout>
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
            Seu QR Code Personalizado
          </h1>
          <p className="text-muted-foreground">
            Coloque nas mesas ou balcão para receber avaliações dos clientes.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* QR Code Preview */}
          <Card className="shadow-elevated">
            <CardHeader className="text-center">
              <CardTitle>Preview do Material</CardTitle>
              <CardDescription>
                É assim que seus clientes verão o QR Code
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {loading ? (
                <Skeleton className="w-72 h-[400px] rounded-3xl" />
              ) : (
                <div
                  id="material-preview"
                  className="relative overflow-hidden rounded-3xl text-center w-80 shadow-2xl border border-amber-500/20"
                  style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1a1a2e 100%)' }}
                >
                  {/* Premium gold accent line at top */}
                  <div className="h-1.5 w-full bg-gradient-to-r from-amber-500/50 via-yellow-400 to-amber-500/50" />
                  
                  {/* Decorative corner elements */}
                  <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-amber-500/30 rounded-tl-lg" />
                  <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-amber-500/30 rounded-tr-lg" />
                  
                  <div className="px-8 pt-10 pb-8">
                    {/* Logo do restaurante ou logo AvaliaP Pro como fallback */}
                    <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 p-1 shadow-lg shadow-amber-500/25">
                      <div className="w-full h-full rounded-full overflow-hidden bg-slate-900 flex items-center justify-center">
                        {company?.logo_url ? (
                          <img 
                            src={company.logo_url} 
                            alt={company.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img 
                            src={avaliaProShield} 
                            alt="Avalia Pro"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    </div>

                    {/* Company name with subtle glow */}
                    <h3 className="text-white font-display text-2xl font-bold mb-2 drop-shadow-lg">
                      {company?.name || "Seu Restaurante"}
                    </h3>
                    
                    {/* Main message */}
                    <p className="text-amber-100/70 text-sm mb-8 tracking-wide">
                      Sua opinião é importante para nós
                    </p>
                    
                    {/* QR Code container with premium styling */}
                    <div className="relative inline-block mb-8">
                      <div className="absolute -inset-1 bg-gradient-to-br from-amber-400/30 via-yellow-500/20 to-amber-600/30 rounded-2xl blur-sm" />
                      <div className="relative bg-white p-5 rounded-2xl shadow-xl">
                        <QRCodeCanvas
                          id="qr-code-material"
                          value={evaluationUrl}
                          size={150}
                          level="H"
                          includeMargin={false}
                          fgColor="#0f172a"
                          bgColor="#FFFFFF"
                        />
                      </div>
                    </div>
                    
                    {/* Call to action with icon */}
                    <div className="mb-6">
                      <p className="text-white text-sm font-semibold mb-1.5 tracking-wide">
                        Aponte a câmera para avaliar
                      </p>
                      <p className="text-slate-400 text-xs">
                        Leva apenas <span className="text-amber-400 font-medium">15 segundos</span>
                      </p>
                    </div>
                    
                    {/* Premium gold divider */}
                    <div className="w-20 h-0.5 mx-auto bg-gradient-to-r from-transparent via-amber-500 to-transparent mb-4" />
                    
                    {/* Footer branding with logo */}
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-6 h-6 rounded-full overflow-hidden border border-amber-500/30 bg-[#0f172a]">
                        <img 
                          src={avaliaProShield} 
                          alt="Avalia Pro"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-slate-400 text-xs font-semibold tracking-wide">
                        Avalia Pro
                      </span>
                    </div>
                  </div>
                  
                  {/* Decorative corner elements bottom */}
                  <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-amber-500/30 rounded-bl-lg" />
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-amber-500/30 rounded-br-lg" />
                </div>
              )}

              {/* Hidden high-res canvas for PNG download */}
              <div className="hidden">
                <QRCodeCanvas
                  id="qr-code-canvas"
                  value={evaluationUrl}
                  size={1024}
                  level="H"
                  includeMargin={true}
                  fgColor="#1A1A2E"
                  bgColor="#FFFFFF"
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-6">
            {/* Link Section */}
            <Card>
              <CardHeader>
                <CardTitle>Link do seu formulário</CardTitle>
                <CardDescription>
                  Compartilhe esse link diretamente com seus clientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    value={evaluationUrl}
                    readOnly
                    className="bg-muted font-mono text-sm"
                  />
                  <Button onClick={copyLink} variant="outline" disabled={!company}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                {evaluationUrl && (
                  <Button
                    variant="link"
                    asChild
                    className="mt-2 p-0 h-auto text-gold"
                  >
                    <a href={evaluationUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Testar página de avaliação
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Download QR Code Only */}
            <Card>
              <CardHeader>
                <CardTitle>Baixar QR Code</CardTitle>
                <CardDescription>
                  Apenas a imagem do QR Code em alta resolução
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <PaywallButton
                  onClick={downloadQRCodePNG}
                  variant="outline"
                  className="w-full justify-start"
                  disabled={!company || !!downloading}
                  featureName="baixar QR Code"
                >
                  <Download className="w-4 h-4 mr-3" />
                  {downloading === "png" ? "Baixando..." : "Baixar QR Code (PNG)"}
                </PaywallButton>
                <PaywallButton
                  onClick={downloadMaterialPDF}
                  className="w-full justify-start bg-gold hover:bg-gold-dark text-primary"
                  disabled={!company || !!downloading}
                  featureName="baixar material premium"
                >
                  <Download className="w-4 h-4 mr-3" />
                  {downloading === "pdf" ? "Gerando PDF..." : "Baixar Material Premium (PDF)"}
                </PaywallButton>
              </CardContent>
            </Card>

            {/* Print Formats Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Printer className="w-5 h-5" />
                  Formatos para Impressão
                </CardTitle>
                <CardDescription>
                  Escolha o tamanho ideal para cada ocasião
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {printFormats.map((format) => (
                  <PaywallButton
                    key={format.id}
                    onClick={format.onClick}
                    variant="outline"
                    className="w-full justify-start h-auto py-3 px-4"
                    disabled={!company || !!downloading}
                    featureName="baixar material de impressão"
                  >
                    <format.icon className="w-5 h-5 mr-3 flex-shrink-0 text-gold" />
                    <div className="flex flex-col items-start text-left">
                      <span className="font-medium">
                        {downloading === format.id ? "Gerando..." : format.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format.size} • {format.description}
                      </span>
                    </div>
                  </PaywallButton>
                ))}
              </CardContent>
            </Card>

            {/* Tips Section */}
            <Card className="border-amber-200 bg-amber-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  Dicas para Melhores Resultados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {[
                    "Coloque o QR Code em todas as mesas",
                    "Posicione próximo ao caixa para pagamento",
                    "Inclua no cardápio ou porta-guardanapos",
                    "Treine a equipe para mencionar a avaliação",
                    "O melhor momento é logo após o cliente pagar",
                  ].map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default DashboardQRCode;