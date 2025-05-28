"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Send } from "lucide-react"
import { savePuzzleSubmission } from "../actions"
import { useToast } from "@/hooks/use-toast"

// Define the crossword structure based on the image
const crosswordData = {
  puzzleId: "group0",
  title: "why are you here bro",
  answers: {
    "2-across": "FURTHERMORE",
    "3-across": "ESPECIALLY",
    "1-down": "NEVERTHELESS",
  },
  clues: {
    across: [
      { number: 2, clue: "used when we are adding an additional point that reinforces what we've already said" },
      {
        number: 3,
        clue: "used when we are singling out one element as more significant or noteworthy than the others",
      },
    ],
    down: [{ number: 1, clue: "used when we are acknowledging a point but introducing a contrast or concession" }],
  },
}

export default function CrosswordApp() {
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({})
  const [essay, setEssay] = useState("")
  const [checkedAnswers, setCheckedAnswers] = useState<{ [key: string]: boolean }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const [studentName, setStudentName] = useState("")

  const handleInputChange = (clueKey: string, value: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [clueKey]: value.toUpperCase(),
    }))
  }

  const checkAnswers = () => {
    const results: { [key: string]: boolean } = {}

    Object.keys(crosswordData.answers).forEach((clueKey) => {
      const correctAnswer = crosswordData.answers[clueKey as keyof typeof crosswordData.answers]
      const userAnswer = userAnswers[clueKey] || ""
      results[clueKey] = userAnswer === correctAnswer
    })

    setCheckedAnswers(results)

    const correctCount = Object.values(results).filter(Boolean).length
    const totalCount = Object.keys(results).length

    toast({
      title: "Answers Checked",
      description: `${correctCount} out of ${totalCount} answers correct!`,
    })
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const result = await savePuzzleSubmission(studentName, essay, userAnswers, crosswordData.puzzleId)
      if (result.success) {
        toast({
          title: "Submission Saved",
          description: `Your submission has been saved! Score: ${result.score}% (${result.correctCount}/${result.totalQuestions} correct)`,
        })
        setEssay("")
        setUserAnswers({})
        setCheckedAnswers({})
        setStudentName("")
      } else {
        toast({
          title: "Submission Failed",
          description: result.error || "There was an error saving your submission. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was an error saving your submission. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getInputStyle = (clueKey: string) => {
    if (checkedAnswers[clueKey] === true) {
      return "border-green-500 bg-green-50"
    } else if (checkedAnswers[clueKey] === false) {
      return "border-red-500 bg-red-50"
    }
    return ""
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with buttons */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button onClick={checkAnswers} variant="outline" className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              Check Answers
            </Button>
            <Button asChild variant="ghost" size="sm">
              <a href="/admin" target="_blank" rel="noopener noreferrer">
                View Submissions
              </a>
            </Button>
          </div>

          <h1 className="text-2xl font-bold text-center">{crosswordData.title}</h1>

          <Button onClick={handleSubmit} disabled={isSubmitting} className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>

        {/* Navigation */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="bg-blue-50" disabled>
                test
              </Button>
              <Button asChild variant="outline" size="sm">
                <a href="/group1">Group 1</a>
              </Button>
              <Button asChild variant="outline" size="sm">
                <a href="/group2">Group 2</a>
              </Button>
              <Button asChild variant="outline" size="sm">
                <a href="/group3">Group 3</a>
              </Button>
              <Button asChild variant="outline" size="sm">
                <a href="/group4">Group 4</a>
              </Button>
              <Button asChild variant="outline" size="sm">
                <a href="/group5">Group 5</a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Student Name Input */}
        <Card>
          <CardContent className="pt-6">
            <div>
              <label htmlFor="studentName" className="block text-sm font-medium mb-2">
                Student Name
              </label>
              <input
                id="studentName"
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="Enter your name"
              />
            </div>
          </CardContent>
        </Card>

        {/* Crossword Grid and Clues */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Crossword Visual (for reference) */}
          <Card>
            <CardHeader>
              <CardTitle>Crossword Grid</CardTitle>
            </CardHeader>
            <CardContent>
              <img
                src="https://i.ibb.co/bgGFbHGj/tumblr-8e99b559c2bcf4ef964473ac8567ce88-d91c7116-1280.png"
                alt="Crossword puzzle grid"
                className="w-full max-w-md mx-auto"
              />
            </CardContent>
          </Card>

          {/* Clues and Input Fields */}
          <Card>
            <CardHeader>
              <CardTitle>Clues & Answers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Across Clues */}
              <div>
                <h3 className="font-semibold mb-3">Across:</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      (2) used when we are adding an additional point that reinforces what we've already said
                    </label>
                    <input
                      type="text"
                      value={userAnswers["2-across"] || ""}
                      onChange={(e) => handleInputChange("2-across", e.target.value)}
                      className={`w-full p-2 border rounded-md ${getInputStyle("2-across")}`}
                      placeholder="Enter answer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      (3) used when we are singling out one element as more significant or noteworthy than the others
                    </label>
                    <input
                      type="text"
                      value={userAnswers["3-across"] || ""}
                      onChange={(e) => handleInputChange("3-across", e.target.value)}
                      className={`w-full p-2 border rounded-md ${getInputStyle("3-across")}`}
                      placeholder="Enter answer"
                    />
                  </div>
                </div>
              </div>

              {/* Down Clues */}
              <div>
                <h3 className="font-semibold mb-3">Down:</h3>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    (1) used when we are acknowledging a point but introducing a contrast or concession
                  </label>
                  <input
                    type="text"
                    value={userAnswers["1-down"] || ""}
                    onChange={(e) => handleInputChange("1-down", e.target.value)}
                    className={`w-full p-2 border rounded-md ${getInputStyle("1-down")}`}
                    placeholder="Enter answer"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Essay Section */}
        <Card>
          <CardHeader>
            <CardTitle>Essay</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={essay}
              onChange={(e) => setEssay(e.target.value)}
              placeholder="Write your essay here..."
              className="min-h-[200px] w-full"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
