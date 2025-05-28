"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Send } from "lucide-react"
import { savePuzzleSubmission } from "../actions"
import { useToast } from "@/hooks/use-toast"

const crosswordData = {
  puzzleId: "group1",
  title: "Crossword Group 1",
  answers: {
    "1-across": "THEREFORE",
    "2-across": "CONVERSELY",
    "3-down": "MEANWHILE",
  },
  clues: {
    across: [
      { number: 1, clue: "used when something happens as a result of something else" },
      { number: 2, clue: "used when presenting a point that is opposite or contrasting" },
    ],
    down: [{ number: 3, clue: "used when referring to something occurring at the same time" }],
  },
}

export default function Puzzle1() {
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
          </div>

          <h1 className="text-2xl font-bold text-center">{crosswordData.title}</h1>

          <Button onClick={handleSubmit} disabled={isSubmitting} className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>

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
                src="https://i.ibb.co/0bspsXn/puzzlemaker.png"
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
                    <label className="block text-sm font-medium mb-1">(1) {crosswordData.clues.across[0].clue}</label>
                    <input
                      type="text"
                      value={userAnswers["1-across"] || ""}
                      onChange={(e) => handleInputChange("1-across", e.target.value)}
                      className={`w-full p-2 border rounded-md ${getInputStyle("1-across")}`}
                      placeholder="Enter answer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">(2) {crosswordData.clues.across[1].clue}</label>
                    <input
                      type="text"
                      value={userAnswers["2-across"] || ""}
                      onChange={(e) => handleInputChange("2-across", e.target.value)}
                      className={`w-full p-2 border rounded-md ${getInputStyle("2-across")}`}
                      placeholder="Enter answer"
                    />
                  </div>
                </div>
              </div>

              {/* Down Clues */}
              <div>
                <h3 className="font-semibold mb-3">Down:</h3>
                <div>
                  <label className="block text-sm font-medium mb-1">(3) {crosswordData.clues.down[0].clue}</label>
                  <input
                    type="text"
                    value={userAnswers["3-down"] || ""}
                    onChange={(e) => handleInputChange("3-down", e.target.value)}
                    className={`w-full p-2 border rounded-md ${getInputStyle("3-down")}`}
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
