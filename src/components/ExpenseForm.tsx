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
import { Expense, ExpenseCategory } from "@/types";
import { Sparkles, Image as ImageIcon, Trash2 } from "lucide-react";

interface ExpenseFormProps {
  categories: ExpenseCategory[];
  onSave: (data: any) => void;
  onCancel: () => void;
  initialData?: Expense | null;
}

const ExpenseForm = ({ categories, onSave, onCancel, initialData }: ExpenseFormProps) => {
  const [description, setDescription] = useState(initialData?.description || "");
  const [categoryId, setCategoryId] = useState(initialData?.categoryId?.toString() || "");
  const [amount, setAmount] = useState(initialData?.amount?.toString() || "");
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState(initialData?.note || "");
  const [receiptImage, setReceiptImage] = useState<string | undefined>(initialData?.receiptImage || undefined);
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label className={errors.description ? "text-red-500" : ""}>
          وصف المصروف {errors.description && `* ${errors.description}`}
        </Label>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`rounded-xl h-12 ${errors.description ? "border-red-300 focus-visible:ring-red-400" : ""}`}
          placeholder="مثال: إيجار المحل"
        />
      </div>

      <div className="space-y-2">
        <Label className={errors.category ? "text-red-500" : ""}>
          الفئة {errors.category && `* ${errors.category}`}
        </Label>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger className={`rounded-xl h-12 ${errors.category ? "border-red-300" : ""}`}>
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
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className={errors.amount ? "text-red-500" : ""}>
            المبلغ {errors.amount && `* ${errors.amount}`}
          </Label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={`rounded-xl h-12 ${errors.amount ? "border-red-300" : ""}`}
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <Label className={errors.date ? "text-red-500" : ""}>
            التاريخ {errors.date && `* ${errors.date}`}
          </Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={`rounded-xl h-12 ${errors.date ? "border-red-300" : ""}`}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>ملاحظات</Label>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="rounded-xl resize-none"
          rows={2}
          placeholder="ملاحظة اختيارية"
        />
      </div>

      <div className="space-y-2">
        <Label>صورة الإيصال (اختياري)</Label>
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
              className="h-32 rounded-xl object-cover border border-slate-200"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute -top-2 -right-2 h-7 w-7 p-0 rounded-full bg-red-500 text-white hover:bg-red-600"
              onClick={removeImage}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="rounded-xl h-12 gap-2 border-dashed"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="h-4 w-4" />
            إرفاق صورة
          </Button>
        )}
      </div>

      <DialogFooter className="gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl h-11">
          إلغاء
        </Button>
        <Button type="submit" className="rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 h-11 gap-2">
          <Sparkles className="h-4 w-4" />
          {initialData ? "تحديث" : "حفظ"}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default ExpenseForm;