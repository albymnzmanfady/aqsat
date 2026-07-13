"use client";

import { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { printHtml, generatePdf } from "@/utils/pdfExport";
import { Printer, Download, Loader2, FileText } from "lucide-react";
import { showError } from "@/utils/toast";

interface PrintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  htmlContent: string;
  title: string;
  filename: string;
}

const PrintDialog = ({
  open,
  onOpenChange,
  htmlContent,
  title,
  filename,
}: PrintDialogProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const handlePrint = () => {
    printHtml(htmlContent);
  };

  const handleExportPdf = async () => {
    if (!contentRef.current) return;
    setExporting(true);
    try {
      await generatePdf(contentRef.current, filename);
    } catch (e) {
      console.error("PDF export error:", e);
      showError("حدث خطأ أثناء إنشاء ملف PDF");
    }
    setExporting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-hidden flex flex-col rounded-3xl p-0 gap-0 [&>button]:hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <DialogTitle className="text-lg font-bold text-slate-800">
              {title}
            </DialogTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="h-9 w-9 rounded-xl hover:bg-slate-100"
          >
            ✕
          </Button>
        </div>

        {/* Preview */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-4" style={{ maxHeight: "60vh" }}>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div
              ref={contentRef}
              className="p-6"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-white">
          <p className="text-xs text-slate-400">معاينة المستند قبل الطباعة</p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handlePrint}
              className="rounded-xl h-11 gap-2 border-slate-200 hover:bg-slate-50 active:scale-[0.97]"
            >
              <Printer className="h-4 w-4" />
              طباعة
            </Button>
            <Button
              onClick={handleExportPdf}
              disabled={exporting}
              className="rounded-xl h-11 gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-md active:scale-[0.97]"
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              تحميل PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrintDialog;