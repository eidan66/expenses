import { supabase } from './supabase'
import type { InsertTransaction, InsertGoal } from '@shared/schema'

// =============================================
// Transactions
// =============================================

export async function getTransactions() {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false })
  
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

