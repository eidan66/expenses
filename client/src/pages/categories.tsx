import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  getCategoriesWithSubcategories,
  updateCategory,
  updateSubcategory,
  createCategory,
  createSubcategory,
  deleteCategory,
  deleteSubcategory,
  type Category,
  type Subcategory,
} from "@/lib/supabaseQueries";

export default function CategoriesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categoriesData = [], isLoading } = useQuery({
    queryKey: ["categories-with-subcategories"],
    queryFn: getCategoriesWithSubcategories,
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: { name?: string; type?: "Expense" | "Income" } }) =>
      updateCategory(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories-with-subcategories"] });
      toast({ title: "הקטגוריה עודכנה בהצלחה" });
      setEditCategoryDialogOpen(false);
    },
    onError: (err: Error) => {
      toast({ title: "שגיאה בעדכון", description: err.message, variant: "destructive" });
    },
  });

  const updateSubcategoryMutation = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: { name?: string; category_id?: string };
    }) => updateSubcategory(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories-with-subcategories"] });
      toast({ title: "תת-הקטגוריה עודכנה בהצלחה" });
      setEditSubcategoryDialogOpen(false);
    },
    onError: (err: Error) => {
      toast({ title: "שגיאה בעדכון", description: err.message, variant: "destructive" });
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: (data: { name: string; type: "Expense" | "Income" }) => createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories-with-subcategories"] });
      toast({ title: "הקטגוריה נוצרה בהצלחה" });
      setAddCategoryDialogOpen(false);
      setNewCategory({ name: "", type: "Expense" });
    },
    onError: (err: Error) => {
      toast({ title: "שגיאה ביצירה", description: err.message, variant: "destructive" });
    },
  });

  const createSubcategoryMutation = useMutation({
    mutationFn: (data: { category_id: string; name: string }) => createSubcategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories-with-subcategories"] });
      toast({ title: "תת-הקטגוריה נוצרה בהצלחה" });
      setAddSubcategoryDialogOpen(false);
      setNewSubcategory({ categoryId: "", name: "" });
    },
    onError: (err: Error) => {
      toast({ title: "שגיאה ביצירה", description: err.message, variant: "destructive" });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories-with-subcategories"] });
      toast({ title: "הקטגוריה נמחקה" });
      setDeleteCategoryDialogOpen(false);
    },
    onError: (err: Error) => {
      toast({ title: "שגיאה במחיקה", description: err.message, variant: "destructive" });
    },
  });

  const deleteSubcategoryMutation = useMutation({
    mutationFn: (id: string) => deleteSubcategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories-with-subcategories"] });
      toast({ title: "תת-הקטגוריה נמחקה" });
      setDeleteSubcategoryDialogOpen(false);
    },
    onError: (err: Error) => {
      toast({ title: "שגיאה במחיקה", description: err.message, variant: "destructive" });
    },
  });

  const [editCategoryDialogOpen, setEditCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editSubcategoryDialogOpen, setEditSubcategoryDialogOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [editingSubcategoryParentName, setEditingSubcategoryParentName] = useState("");
  const [addCategoryDialogOpen, setAddCategoryDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState<{ name: string; type: "Expense" | "Income" }>({ name: "", type: "Expense" });
  const [addSubcategoryDialogOpen, setAddSubcategoryDialogOpen] = useState(false);
  const [newSubcategory, setNewSubcategory] = useState({ categoryId: "", name: "" });
  const [deleteCategoryDialogOpen, setDeleteCategoryDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [deleteSubcategoryDialogOpen, setDeleteSubcategoryDialogOpen] = useState(false);
  const [subcategoryToDelete, setSubcategoryToDelete] = useState<Subcategory | null>(null);

  const openEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setEditCategoryDialogOpen(true);
  };

  const openEditSubcategory = (sub: Subcategory, parentName: string) => {
    setEditingSubcategory(sub);
    setEditingSubcategoryParentName(parentName);
    setEditSubcategoryDialogOpen(true);
  };

  const handleUpdateCategory = () => {
    if (!editingCategory) return;
    updateCategoryMutation.mutate({
      id: editingCategory.id,
      updates: { name: editingCategory.name, type: editingCategory.type },
    });
  };

  const handleUpdateSubcategory = () => {
    if (!editingSubcategory) return;
    updateSubcategoryMutation.mutate({
      id: editingSubcategory.id,
      updates: { name: editingSubcategory.name },
    });
  };

  const handleAddCategory = () => {
    if (!newCategory.name.trim()) return;
    createCategoryMutation.mutate(newCategory);
  };

  const handleAddSubcategory = () => {
    if (!newSubcategory.categoryId || !newSubcategory.name.trim()) return;
    createSubcategoryMutation.mutate({
      category_id: newSubcategory.categoryId,
      name: newSubcategory.name.trim(),
    });
  };

  const handleDeleteCategory = () => {
    if (!categoryToDelete) return;
    deleteCategoryMutation.mutate(categoryToDelete.id);
  };

  const handleDeleteSubcategory = () => {
    if (!subcategoryToDelete) return;
    deleteSubcategoryMutation.mutate(subcategoryToDelete.id);
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6 text-right" dir="rtl">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold">ניהול קטגוריות</h1>
        <p className="text-muted-foreground">
          ערכו את הקטגוריות ותת-הקטגוריות. שינויים יעודכנו אוטומטית בכל העסקאות הקשורות.
        </p>

        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg">קטגוריות ותת-קטגוריות</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAddSubcategoryDialogOpen(true)}
              >
                <Plus className="w-4 h-4 ml-2" /> תת-קטגוריה
              </Button>
              <Button size="sm" onClick={() => setAddCategoryDialogOpen(true)}>
                <Plus className="w-4 h-4 ml-2" /> קטגוריה
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground text-center py-8">טוען...</p>
            ) : (
              <Accordion type="multiple" className="w-full">
                {categoriesData.map((cat) => (
                  <AccordionItem key={cat.id} value={cat.id}>
                    <AccordionTrigger className="text-right hover:no-underline">
                      <div className="flex items-center justify-between w-full pr-4">
                        <span className="font-medium">{cat.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {cat.type === "Income" ? "הכנסה" : "הוצאה"}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditCategory(cat)}
                        >
                          <Pencil className="w-4 h-4 ml-1" /> ערוך קטגוריה
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            setCategoryToDelete(cat);
                            setDeleteCategoryDialogOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4 ml-1" /> מחק
                        </Button>
                      </div>
                      <ul className="space-y-2">
                        {cat.subcategories.map((sub) => (
                          <li
                            key={sub.id}
                            className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50"
                          >
                            <span>{sub.name}</span>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openEditSubcategory(sub, cat.name)}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => {
                                  setSubcategoryToDelete(sub);
                                  setDeleteSubcategoryDialogOpen(true);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Category Dialog */}
      <Dialog open={editCategoryDialogOpen} onOpenChange={setEditCategoryDialogOpen}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>עריכת קטגוריה</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>שם</Label>
              <Input
                value={editingCategory?.name ?? ""}
                onChange={(e) =>
                  setEditingCategory(
                    editingCategory ? { ...editingCategory, name: e.target.value } : null
                  )
                }
                className="text-right"
              />
            </div>
            <div className="space-y-2">
              <Label>סוג</Label>
              <Select
                value={editingCategory?.type ?? "Expense"}
                onValueChange={(v) =>
                  setEditingCategory(
                    editingCategory ? { ...editingCategory, type: v as "Expense" | "Income" } : null
                  )
                }
              >
                <SelectTrigger className="text-right">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  <SelectItem value="Expense">הוצאה</SelectItem>
                  <SelectItem value="Income">הכנסה</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full"
              onClick={handleUpdateCategory}
              disabled={updateCategoryMutation.isPending}
            >
              שמירה
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Subcategory Dialog */}
      <Dialog open={editSubcategoryDialogOpen} onOpenChange={setEditSubcategoryDialogOpen}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>עריכת תת-קטגוריה</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>קטגוריה: {editingSubcategoryParentName}</Label>
              <Label>שם תת-קטגוריה</Label>
              <Input
                value={editingSubcategory?.name ?? ""}
                onChange={(e) =>
                  setEditingSubcategory(
                    editingSubcategory ? { ...editingSubcategory, name: e.target.value } : null
                  )
                }
                className="text-right"
              />
            </div>
            <Button
              className="w-full"
              onClick={handleUpdateSubcategory}
              disabled={updateSubcategoryMutation.isPending}
            >
              שמירה
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Category Dialog */}
      <Dialog open={addCategoryDialogOpen} onOpenChange={setAddCategoryDialogOpen}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>הוספת קטגוריה</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>שם</Label>
              <Input
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                className="text-right"
              />
            </div>
            <div className="space-y-2">
              <Label>סוג</Label>
              <Select
                value={newCategory.type}
                onValueChange={(v) =>
                  setNewCategory({ ...newCategory, type: v as "Expense" | "Income" })
                }
              >
                <SelectTrigger className="text-right">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  <SelectItem value="Expense">הוצאה</SelectItem>
                  <SelectItem value="Income">הכנסה</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full"
              onClick={handleAddCategory}
              disabled={createCategoryMutation.isPending || !newCategory.name.trim()}
            >
              הוסף
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Subcategory Dialog */}
      <Dialog open={addSubcategoryDialogOpen} onOpenChange={setAddSubcategoryDialogOpen}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>הוספת תת-קטגוריה</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>קטגוריה</Label>
              <Select
                value={newSubcategory.categoryId}
                onValueChange={(v) =>
                  setNewSubcategory({ ...newSubcategory, categoryId: v })
                }
              >
                <SelectTrigger className="text-right">
                  <SelectValue placeholder="בחר קטגוריה" />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  {categoriesData.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>שם תת-קטגוריה</Label>
              <Input
                value={newSubcategory.name}
                onChange={(e) =>
                  setNewSubcategory({ ...newSubcategory, name: e.target.value })
                }
                className="text-right"
              />
            </div>
            <Button
              className="w-full"
              onClick={handleAddSubcategory}
              disabled={
                createSubcategoryMutation.isPending ||
                !newSubcategory.categoryId ||
                !newSubcategory.name.trim()
              }
            >
              הוסף
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Category Confirmation */}
      <Dialog open={deleteCategoryDialogOpen} onOpenChange={setDeleteCategoryDialogOpen}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>מחיקת קטגוריה</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            האם אתם בטוחים? קטגוריה זו ותת-הקטגוריות שלה יימחקו. עסקאות קיימות ישמרו את שם הקטגוריה הישן.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setDeleteCategoryDialogOpen(false)}>
              ביטול
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCategory}
              disabled={deleteCategoryMutation.isPending}
            >
              מחק
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Subcategory Confirmation */}
      <Dialog open={deleteSubcategoryDialogOpen} onOpenChange={setDeleteSubcategoryDialogOpen}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>מחיקת תת-קטגוריה</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            האם אתם בטוחים? תת-הקטגוריה תימחק. עסקאות קיימות ישמרו את התת-קטגוריה הישנה.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setDeleteSubcategoryDialogOpen(false)}>
              ביטול
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteSubcategory}
              disabled={deleteSubcategoryMutation.isPending}
            >
              מחק
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
