"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiExpense, ApiExpenseCategory } from "@/lib/api";
import { Sparkles, Image as ImageIcon, Trash2, FileText, Tag, DollarSign, Calendar } from "lucide-react";

interface ExpenseFormProps {
  categories: ApiExpenseCategory[];
  onSave: (data: any) => void;
  onCancel: () => void;
  initialData?: ApiExpense | null;
}

const ExpenseForm = ({ categories, onSave, onCancel, initialData }: ExpenseFormProps) => {
  const [description, setDescription] = useState(initialData?.description || "");
  const [categoryId, setCategoryId] = useState(initialData?.category_id?.toString() || "");
  const [amount, setAmount] = useState(initialData?.amount?.toString() || "");
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState(initialData?.note || "");
  const [receiptImage, setReceiptImage] = useState<string | undefined>(initialData?.receipt_image || undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setReceiptImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setReceiptImage(undefined);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!description.trim()) newErrors.description = "الوصف مطلوب";
    if (!categoryId) newErrors.category = "اختر الفئة";
    if (!amount || Number(amount) <= 0) newErrors.amount = "المبلغ غير صحيح";
    if (!date) newErrors.date = "التاريخ مطلوب";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      description: description.trim(),
      categoryId: Number(categoryId),
      amount: Number(amount),
      date,
      note: note.trim(),
      receiptImage,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="px-8 pb-2 space-y-5">
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-slate-600 flex items-center gap-2">
          <FileText className="h-3.5 w-3.5 text-slate-400" />
          وصف المصروف
        </Label>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={errors.description ? "border-red-300 focus-visible:ring-red-400/40" : ""}
          placeholder="مثال: إيجار المحل"
        />
        {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-slate-600 flex items-center gap-2">
          <Tag className="h-3.5 w-3.5 text-slate-400" />
          الفئة
        </Label>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger className={errors.category ? "border-red-300 focus:ring-red-400/40" : ""}>
            <SelectValue placeholder="اختر الفئة" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id.toString()}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-slate-600 flex items-center gap-2">
            <DollarSign className="h-3.5 w-3.5 text-slate-400" />
            المبلغ
          </Label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={errors.amount ? "border-red-300 focus-visible:ring-red-400/40" : ""}
            placeholder="0"
          />
          {errors.amount && <p className="text-xs text-red-500">{errors.amount}</p>}
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-slate-600 flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            التاريخ
          </Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={errors.date ? "border-red-300 focus-visible:ring-red-400/40" : ""}
          />
          {errors.date && <p className="text-xs text-red-500">{errors.date}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-slate-600">ملاحظات</Label>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="resize-none"
          rows={2}
          placeholder="ملاحظة اختيارية"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-slate-600">صورة الإيصال (اختياري)</Label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        {receiptImage ? (
          <div className="relative inline-block">
            <img
              src={receiptImage}
              alt="إيصال"
              className="h-32 rounded-2xl object-cover border border-slate-200"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute -top-2 -right-2 h-7 w-7 p-0 rounded-full bg-red-500 text-white hover:bg-red-600 shadow-lg"
              onClick={removeImage}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="rounded-xl h-12 gap-2 border-dashed border-slate-300 text-slate-500 hover:text-violet-600 hover:border-violet-300 hover:bg-violet-50/50"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="h-4 w-4" />
            إرفاق صورة
          </Button>
        )}
      </div>

      <DialogFooter className="gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl h-11 px-6 border-slate-200 text-slate-600 hover:bg-slate-50">
          إلغاء
        </Button>
        <Button type="submit" className="rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 h-11 px-8 shadow-lg shadow-rose-500/20 gap-2">
          <Sparkles className="h-4 w-4" />
          {initialData ? "تحديث" : "حفظ"}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default ExpenseForm;