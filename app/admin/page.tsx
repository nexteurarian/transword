"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, Trash2, AlertTriangle } from "lucide-react"
import { getSubmissions, deleteSubmission, deleteAllSubmissions } from "../actions"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type Submission = {
  id: string
  student_name: string | null
  crossword_answers: Record<string, string>
  essay: string
  score: number | null
  submitted_at: string
}

export default function AdminPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deletingAll, setDeletingAll] = useState(false)
  const { toast } = useToast()

  const loadSubmissions = async () => {
    setLoading(true)
    const result = await getSubmissions()
    if (result.success) {
      setSubmissions(result.data)
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to load submissions",
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  const handleDeleteSubmission = async (submissionId: string) => {
    setDeletingId(submissionId)
    const result = await deleteSubmission(submissionId)

    if (result.success) {
      setSubmissions((prev) => prev.filter((sub) => sub.id !== submissionId))
      toast({
        title: "Success",
        description: "Submission deleted successfully",
      })
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to delete submission",
        variant: "destructive",
      })
    }
    setDeletingId(null)
  }

  const handleDeleteAllSubmissions = async () => {
    setDeletingAll(true)
    const result = await deleteAllSubmissions()

    if (result.success) {
      setSubmissions([])
      toast({
        title: "Success",
        description: "All submissions deleted successfully",
      })
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to delete all submissions",
        variant: "destructive",
      })
    }
    setDeletingAll(false)
  }

  useEffect(() => {
    loadSubmissions()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Crossword Submissions</h1>
          <div className="flex items-center gap-2">
            <Button onClick={loadSubmissions} disabled={loading} className="flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>

            {submissions.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={deletingAll} className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    {deletingAll ? "Deleting..." : "Delete All"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      Delete All Submissions
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete all {submissions.length} submissions? This action cannot be
                      undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAllSubmissions} className="bg-red-600 hover:bg-red-700">
                      Delete All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading submissions...</div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-8">No submissions yet.</div>
        ) : (
          <div className="grid gap-6">
            {submissions.map((submission) => (
              <Card key={submission.id}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>{submission.student_name || "Anonymous"}</span>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Score: {submission.score}%</span>
                        <span className="text-gray-500">{formatDate(submission.submitted_at)}</span>
                      </div>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={deletingId === submission.id}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                              <AlertTriangle className="w-5 h-5 text-red-500" />
                              Delete Submission
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the submission by {submission.student_name || "Anonymous"}
                              ? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteSubmission(submission.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Crossword Answers:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                      {Object.entries(submission.crossword_answers || {}).map(([key, value]) => {
                        // Skip the puzzleId field when displaying answers
                        if (key === "puzzleId") return null
                        return (
                          <div key={key} className="bg-gray-100 p-2 rounded">
                            <span className="font-medium">{key}:</span> {value}
                          </div>
                        )
                      })}
                    </div>
                    {submission.crossword_answers?.puzzleId && (
                      <div className="mt-2">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          Group: {submission.crossword_answers.puzzleId}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Essay:</h4>
                    <div className="bg-gray-50 p-3 rounded border max-h-40 overflow-y-auto">
                      {submission.essay || "No essay submitted"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
