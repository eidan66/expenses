import { supabase } from './supabase'
import type { InsertTransaction, InsertGoal } from '@shared/schema'

// =============================================
// Transactions
// =============================================

export async function getTransactions() {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('updated_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function createTransaction(tx: InsertTransaction) {
  const userId = (await supabase.auth.getUser()).data.user?.id
  if (!userId) throw new Error('Not authenticated')

  const insertData = {
    user_id: userId,
    title: tx.title,
    amount: tx.amount,
    category: tx.category,
    subcategory: tx.subcategory || null,
    date: tx.date,
    month: tx.month,
    year: tx.year,
    notes: tx.notes || null
  }

  const { data, error } = await supabase
    .from('transactions')
    .insert(insertData)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteTransaction(id: string) {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

export async function updateTransaction(id: string, updates: Partial<InsertTransaction>) {
  const updateData: any = {}
  if (updates.title !== undefined) updateData.title = updates.title
  if (updates.amount !== undefined) updateData.amount = updates.amount
  if (updates.category !== undefined) updateData.category = updates.category
  if (updates.subcategory !== undefined) updateData.subcategory = updates.subcategory
  if (updates.date !== undefined) updateData.date = updates.date
  if (updates.month !== undefined) updateData.month = updates.month
  if (updates.year !== undefined) updateData.year = updates.year
  if (updates.notes !== undefined) updateData.notes = updates.notes

  const { data, error } = await supabase
    .from('transactions')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// =============================================
// Goals
// =============================================

export async function getGoals() {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
  
  if (error) throw error
  return data
}

export async function createGoal(goal: InsertGoal) {
  const userId = (await supabase.auth.getUser()).data.user?.id
  if (!userId) throw new Error('Not authenticated')

  const insertData = {
    user_id: userId,
    name: goal.name,
    target_amount: goal.targetAmount,
    current_amount: goal.currentAmount
  }

  const { data, error } = await supabase
    .from('goals')
    .insert(insertData)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateGoal(id: string, updates: Partial<InsertGoal>) {
  const updateData: any = {}
  if (updates.name !== undefined) updateData.name = updates.name
  if (updates.targetAmount !== undefined) updateData.target_amount = updates.targetAmount
  if (updates.currentAmount !== undefined) updateData.current_amount = updates.currentAmount

  const { data, error } = await supabase
    .from('goals')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteGoal(id: string) {
  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// =============================================
// Categories and Subcategories
// =============================================

export interface Category {
  id: string
  name: string
  type: 'Expense' | 'Income'
  subcategories?: Subcategory[]
}

export interface Subcategory {
  id: string
  category_id: string
  name: string
}

// Get all categories with their subcategories
export async function getCategories(): Promise<Record<string, string[]>> {
  // First, get all categories
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('id, name')
    .order('name')
  
  if (categoriesError) throw categoriesError
  
  // Then, get all subcategories
  const { data: subcategories, error: subcategoriesError } = await supabase
    .from('subcategories')
    .select('id, category_id, name')
    .order('name')
  
  if (subcategoriesError) throw subcategoriesError
  
  // Build the categories object in the format expected by the UI
  const categoriesMap: Record<string, string[]> = {}
  
  categories?.forEach(cat => {
    const subs = subcategories
      ?.filter(sub => sub.category_id === cat.id)
      .map(sub => sub.name) || []
    categoriesMap[cat.name] = subs
  })
  
  return categoriesMap
}

// Get categories only (without subcategories)
export async function getCategoriesList(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, type')
    .order('name')
  
  if (error) throw error
  return data || []
}

// Get subcategories for a specific category
export async function getSubcategories(categoryName: string): Promise<string[]> {
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('id')
    .eq('name', categoryName)
    .single()
  
  if (categoryError) throw categoryError
  if (!category) return []
  
  const { data: subcategories, error: subcategoriesError } = await supabase
    .from('subcategories')
    .select('name')
    .eq('category_id', category.id)
    .order('name')
  
  if (subcategoriesError) throw subcategoriesError
  return subcategories?.map(s => s.name) || []
}

// Get categories with full subcategory objects (for management UI)
export async function getCategoriesWithSubcategories(): Promise<(Category & { subcategories: Subcategory[] })[]> {
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('id, name, type')
    .order('name')
  
  if (categoriesError) throw categoriesError
  if (!categories?.length) return []
  
  const { data: subcategories, error: subcategoriesError } = await supabase
    .from('subcategories')
    .select('id, category_id, name')
    .order('name')
  
  if (subcategoriesError) throw subcategoriesError
  
  return categories.map(cat => ({
    ...cat,
    subcategories: subcategories?.filter(sub => sub.category_id === cat.id) || [],
  }))
}

// Update category - cascades to transactions
export async function updateCategory(id: string, updates: { name?: string; type?: 'Expense' | 'Income' }) {
  if (!updates.name && updates.type === undefined) return
  
  // Get old category name for transaction updates
  const { data: oldCategory, error: fetchError } = await supabase
    .from('categories')
    .select('name')
    .eq('id', id)
    .single()
  
  if (fetchError) throw fetchError
  if (!oldCategory) throw new Error('Category not found')
  
  const updateData: Record<string, unknown> = {}
  if (updates.name !== undefined) updateData.name = updates.name
  if (updates.type !== undefined) updateData.type = updates.type
  
  const { data: updated, error } = await supabase
    .from('categories')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  
  // Update transactions that reference the old category name
  if (updates.name && updates.name !== oldCategory.name) {
    const { error: txError } = await supabase
      .from('transactions')
      .update({ category: updates.name })
      .eq('category', oldCategory.name)
    
    if (txError) throw txError
  }
  
  return updated
}

// Update subcategory - cascades to transactions
export async function updateSubcategory(
  id: string,
  updates: { name?: string; category_id?: string }
) {
  if (!updates.name && !updates.category_id) return
  
  const { data: oldSub, error: fetchError } = await supabase
    .from('subcategories')
    .select('name, category_id')
    .eq('id', id)
    .single()
  
  if (fetchError) throw fetchError
  if (!oldSub) throw new Error('Subcategory not found')
  
  // Get parent category name(s) for transaction updates
  const { data: category, error: catError } = await supabase
    .from('categories')
    .select('name')
    .eq('id', oldSub.category_id)
    .single()
  
  if (catError) throw catError
  const oldCategoryName = category?.name
  
  const updateData: Record<string, unknown> = {}
  if (updates.name !== undefined) updateData.name = updates.name
  if (updates.category_id !== undefined) updateData.category_id = updates.category_id
  
  const { data: updated, error } = await supabase
    .from('subcategories')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  
  // Update transactions that reference this subcategory (by old category + subcategory names)
  const needsTransactionUpdate = oldCategoryName && (
    (updates.name && updates.name !== oldSub.name) ||
    (updates.category_id && updates.category_id !== oldSub.category_id)
  )
  
  if (needsTransactionUpdate) {
    const txUpdates: { subcategory?: string; category?: string } = {}
    if (updates.name) txUpdates.subcategory = updates.name
    if (updates.category_id && updates.category_id !== oldSub.category_id) {
      const { data: newCategory, error: newCatError } = await supabase
        .from('categories')
        .select('name')
        .eq('id', updates.category_id)
        .single()
      if (newCatError) throw newCatError
      if (newCategory?.name) txUpdates.category = newCategory.name
    }
    if (Object.keys(txUpdates).length > 0) {
      const { error: txError } = await supabase
        .from('transactions')
        .update(txUpdates)
        .eq('category', oldCategoryName)
        .eq('subcategory', oldSub.name)
      if (txError) throw txError
    }
  }
  
  return updated
}

// Create category
export async function createCategory(data: { name: string; type: 'Expense' | 'Income' }) {
  const { data: created, error } = await supabase
    .from('categories')
    .insert({ name: data.name, type: data.type })
    .select()
    .single()
  
  if (error) throw error
  return created
}

// Create subcategory
export async function createSubcategory(data: { category_id: string; name: string }) {
  const { data: created, error } = await supabase
    .from('subcategories')
    .insert({ category_id: data.category_id, name: data.name })
    .select()
    .single()
  
  if (error) throw error
  return created
}

// Delete category - cascades to subcategories (ON DELETE CASCADE), transactions keep old category name
export async function deleteCategory(id: string) {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Delete subcategory
export async function deleteSubcategory(id: string) {
  const { error } = await supabase
    .from('subcategories')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

