"use server"

import { createServerSupabaseClient } from "@/lib/supabase"

const correctAnswers = {
  "2-across": "FURTHERMORE",
  "3-across": "ESPECIALLY",
  "1-down": "NEVERTHELESS",
}

export async function saveSubmission(studentName: string, essay: string, crosswordAnswers: { [key: string]: string }) {
  try {
    // Create a server-side Supabase client
    const supabase = createServerSupabaseClient()

    // Calculate score
    let correctCount = 0
    const totalQuestions = Object.keys(correctAnswers).length

    Object.keys(correctAnswers).forEach((key) => {
      if (crosswordAnswers[key]?.toUpperCase() === correctAnswers[key as keyof typeof correctAnswers]) {
        correctCount++
      }
    })

    const score = Math.round((correctCount / totalQuestions) * 100)

    // First, check if the table exists
    const { error: tableCheckError } = await supabase.from("crossword_submissions").select("id").limit(1)

    // If table doesn't exist, create it
    if (tableCheckError) {
      console.log("Table might not exist, creating it now...")

      await supabase.query(`
        CREATE TABLE IF NOT EXISTS crossword_submissions (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          student_name TEXT,
          crossword_answers JSONB NOT NULL,
          essay TEXT NOT NULL,
          score INTEGER,
          submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `)
    }

    // Save to database
    const { data, error } = await supabase
      .from("crossword_submissions")
      .insert({
        student_name: studentName || "Anonymous",
        crossword_answers: crosswordAnswers,
        essay: essay,
        score: score,
        submitted_at: new Date().toISOString(),
      })
      .select()

    if (error) {
      console.error("Database error details:", JSON.stringify(error))
      return { success: false, error: error.message || "Database error occurred" }
    }

    return {
      success: true,
      data: data?.[0] || null,
      score: score,
      correctCount: correctCount,
      totalQuestions: totalQuestions,
    }
  } catch (error) {
    console.error("Error saving submission:", error)
    return { success: false, error: "Failed to save submission. Please try again." }
  }
}

export async function savePuzzleSubmission(
  studentName: string,
  essay: string,
  crosswordAnswers: { [key: string]: string },
  puzzleId: string,
) {
  try {
    // Create a server-side Supabase client
    const supabase = createServerSupabaseClient()

    // Define correct answers for each puzzle
    const puzzleAnswers = {
      group0: {
        "2-across": "FURTHERMORE",
        "3-across": "ESPECIALLY",
        "1-down": "NEVERTHELESS",
      },
      group1: {
        "1-across": "THEREFORE",
        "2-across": "CONVERSELY",
        "3-down": "MEANWHILE",
      },
      group2: {
        "1-across": "CONSEQUENTLY",
        "2-across": "INSTEAD",
        "3-down": "SIMILARLY",
      },
      group3: {
        "1-across": "OTHERWISE",
        "2-across": "AFTERWARD",
        "3-down": "NEVERTHELESS",
      },
      group4: {
        "1-across": "ANYWAY",
        "2-across": "THUS",
        "3-down": "ALTHOUGH",
      },
      group5: {
        "1-across": "MEANWHILE",
        "2-across": "NONETHELESS",
        "3-down": "SURPRISINGLY",
      },
    }

    const correctAnswers = puzzleAnswers[puzzleId as keyof typeof puzzleAnswers] || {}

    // Calculate score
    let correctCount = 0
    const totalQuestions = Object.keys(correctAnswers).length

    Object.keys(correctAnswers).forEach((key) => {
      if (crosswordAnswers[key]?.toUpperCase() === correctAnswers[key as keyof typeof correctAnswers]) {
        correctCount++
      }
    })

    const score = Math.round((correctCount / totalQuestions) * 100)

    // Save to database with puzzle ID
    const { data, error } = await supabase
      .from("crossword_submissions")
      .insert({
        student_name: studentName || "Anonymous",
        crossword_answers: { ...crosswordAnswers, puzzleId: puzzleId },
        essay: essay,
        score: score,
        submitted_at: new Date().toISOString(),
      })
      .select()

    if (error) {
      console.error("Database error details:", JSON.stringify(error))
      return { success: false, error: error.message || "Database error occurred" }
    }

    return {
      success: true,
      data: data?.[0] || null,
      score: score,
      correctCount: correctCount,
      totalQuestions: totalQuestions,
    }
  } catch (error) {
    console.error("Error saving submission:", error)
    return { success: false, error: "Failed to save submission. Please try again." }
  }
}

export async function getSubmissions() {
  try {
    const supabase = createServerSupabaseClient()

    // Check if table exists first
    const { error: tableCheckError } = await supabase.from("crossword_submissions").select("id").limit(1)

    // If table doesn't exist yet, return empty array
    if (tableCheckError) {
      return { success: true, data: [] }
    }

    const { data, error } = await supabase
      .from("crossword_submissions")
      .select("*")
      .order("submitted_at", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error("Error fetching submissions:", error)
    return { success: false, error: "Failed to fetch submissions" }
  }
}

export async function deleteSubmission(submissionId: string) {
  try {
    const supabase = createServerSupabaseClient()

    const { error } = await supabase.from("crossword_submissions").delete().eq("id", submissionId)

    if (error) {
      console.error("Database error:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Error deleting submission:", error)
    return { success: false, error: "Failed to delete submission" }
  }
}

export async function deleteAllSubmissions() {
  try {
    const supabase = createServerSupabaseClient()

    const { error } = await supabase
      .from("crossword_submissions")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000") // Delete all records

    if (error) {
      console.error("Database error:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Error deleting all submissions:", error)
    return { success: false, error: "Failed to delete all submissions" }
  }
}
