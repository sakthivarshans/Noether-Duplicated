'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Upload, Zap, Loader2, FileQuestion, Check, X, Award, Info, RefreshCw } from 'lucide-react';
import { generateQuizFromDocument, QuizQuestion, GenerateQuizFromDocumentOutput } from '@/ai/flows/generate-quiz-from-document';
import { gradeQuiz, Explanation } from '@/ai/flows/grade-quiz';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

type GameState = 'upload' | 'generating_quiz' | 'in_progress' | 'grading' | 'results';

export default function QuizPage() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileDataUri, setFileDataUri] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [gameState, setGameState] = useState<GameState>('upload');
  
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [explanations, setExplanations] = useState<Explanation[]>([]);
  const [score, setScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(10);

  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setUploadProgress(0);

      const reader = new FileReader();
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentage = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentage);
        }
      };
      reader.onload = (loadEvent) => {
        setFileDataUri(loadEvent.target?.result as string);
        setUploadProgress(100);
        setTimeout(() => setUploadProgress(null), 1000);
      };
      reader.onerror = () => {
        toast({ variant: "destructive", title: "File Reading Error" });
        setUploadProgress(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!fileDataUri) return;
    setGameState('generating_quiz');
    try {
      const response = await generateQuizFromDocument({ documentDataUri: fileDataUri, questionCount });
      if (response.questions.length === 0) {
        toast({ variant: "destructive", title: "Could not generate quiz", description: "The document may not have enough content." });
        setGameState('upload');
        return;
      }
      setQuestions(response.questions);
      setUserAnswers(new Array(response.questions.length).fill(null));
      setGameState('in_progress');
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Uh oh! Something went wrong." });
      setGameState('upload');
    }
  };

  const handleNextQuestion = async () => {
    if (selectedAnswer === null) return;
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = selectedAnswer;
    setUserAnswers(newAnswers);

    setSelectedAnswer(null);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setGameState('grading');
      const resultsToGrade = questions.map((q, i) => ({
        question: q.question,
        options: q.options,
        correctAnswerIndex: q.correctAnswerIndex,
        userAnswerIndex: newAnswers[i]!,
      }));
      const correctCount = resultsToGrade.filter(r => r.userAnswerIndex === r.correctAnswerIndex).length;
      setScore(correctCount);

      try {
        const gradeResponse = await gradeQuiz({ results: resultsToGrade });
        setExplanations(gradeResponse.explanations);
      } catch (e) {
        console.error("Error grading quiz:", e);
        toast({ variant: "destructive", title: "Could not get explanations." });
      } finally {
        setGameState('results');
      }
    }
  };

  const resetQuiz = () => {
    setGameState('upload');
    setFileName(null);
    setFileDataUri(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setSelectedAnswer(null);
    setExplanations([]);
    setScore(0);
  }

  const renderContent = () => {
    switch (gameState) {
      case 'upload':
      case 'generating_quiz':
        return (
          <Card>
            <CardHeader>
              <CardTitle>AI Quiz Generator</CardTitle>
              <CardDescription>Upload a document (.pdf, .pptx) to generate a quiz from its content.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="file-upload" className="flex items-center justify-center w-full h-32 px-4 transition bg-background border-2 border-dashed rounded-md appearance-none cursor-pointer hover:border-primary">
                  <span className="flex items-center space-x-2">
                    <Upload className="w-6 h-6 text-muted-foreground" />
                    <span className="font-medium text-muted-foreground">{fileName || "Drag & drop a file or click to upload"}</span>
                  </span>
                  <Input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.pptx" />
                </Label>
                {uploadProgress !== null && <Progress value={uploadProgress} className="w-full mt-2" />}
              </div>

              <div className="space-y-2">
                <Label htmlFor="question-count">Number of Questions (1-50)</Label>
                <Input
                  id="question-count"
                  type="number"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Math.max(1, Math.min(50, Number(e.target.value))))}
                  min="1"
                  max="50"
                  className="w-full"
                />
              </div>

              <Button onClick={handleGenerateQuiz} disabled={!fileName || uploadProgress !== null || gameState === 'generating_quiz'} className="w-full">
                {gameState === 'generating_quiz' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
                {gameState === 'generating_quiz' ? 'Generating Quiz...' : 'Start Quiz'}
              </Button>
            </CardContent>
          </Card>
        );

      case 'in_progress':
        const question = questions[currentQuestionIndex];
        return (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Question {currentQuestionIndex + 1} of {questions.length}</CardTitle>
                  <CardDescription className="mt-2 text-lg">{question.question}</CardDescription>
                </div>
                <div className="text-sm text-muted-foreground">{currentQuestionIndex + 1} / {questions.length}</div>
              </div>
              <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="mt-4" />
            </CardHeader>
            <CardContent>
              <RadioGroup value={String(selectedAnswer)} onValueChange={(val) => setSelectedAnswer(Number(val))} className="space-y-3">
                {question.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={String(index)} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="text-base cursor-pointer">{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
            <CardFooter>
              <Button onClick={handleNextQuestion} disabled={selectedAnswer === null} className="w-full">
                {currentQuestionIndex === questions.length - 1 ? 'Finish & See Results' : 'Next Question'}
              </Button>
            </CardFooter>
          </Card>
        );

      case 'grading':
        return (
          <Card className="text-center p-10">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary"/>
            <CardTitle className="mt-4">Grading your answers...</CardTitle>
            <CardDescription>Please wait while we prepare your results and explanations.</CardDescription>
          </Card>
        )

      case 'results':
        return (
            <div className="space-y-6">
                <Card className="text-center">
                    <CardHeader>
                        <CardTitle className="text-3xl font-headline">Quiz Complete!</CardTitle>
                        <div className="flex justify-center items-center gap-4 text-2xl font-bold mt-4">
                            <Award className="w-8 h-8 text-primary"/>
                            <span>Your Score: {score} / {questions.length}</span>
                        </div>
                    </CardHeader>
                    <CardContent>
                       <p className="text-muted-foreground">Below are the detailed explanations for each question.</p>
                       <Button onClick={resetQuiz} className="mt-6">
                          <RefreshCw className="mr-2 h-4 w-4"/>
                          Take Another Quiz
                       </Button>
                    </CardContent>
                </Card>
                <div className="space-y-4">
                  {explanations.length > 0 ? explanations.map((exp, index) => {
                    const userAnswerIndex = userAnswers[index];
                    const correctAnswerIndex = questions[index].correctAnswerIndex;
                    const isCorrect = userAnswerIndex === correctAnswerIndex;

                    return (
                        <Card key={index}>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-start gap-3">
                                  {isCorrect ? <Check className="w-5 h-5 text-green-500 mt-1"/> : <X className="w-5 h-5 text-destructive mt-1"/>}
                                  <span>Q{index + 1}: {exp.question}</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <RadioGroup value={String(userAnswerIndex)} disabled>
                                  {questions[index].options.map((opt, optIndex) => (
                                    <div key={optIndex} className={cn("flex items-center space-x-3 p-3 rounded-md border", 
                                      optIndex === correctAnswerIndex && "border-green-500 bg-green-500/10",
                                      optIndex === userAnswerIndex && !isCorrect && "border-destructive bg-destructive/10"
                                    )}>
                                      <RadioGroupItem value={String(optIndex)} id={`res-${index}-${optIndex}`} />
                                      <Label htmlFor={`res-${index}-${optIndex}`}>{opt}</Label>
                                    </div>
                                  ))}
                                </RadioGroup>
                                <div className="p-4 bg-secondary rounded-lg space-y-2">
                                  <h4 className="font-semibold flex items-center gap-2"><Info className="w-4 h-4 text-primary"/>Explanation</h4>
                                  <p className="text-sm text-muted-foreground">{exp.reasoning}</p>
                                  {exp.wrongAnswerExplanation && (
                                    <>
                                       <h4 className="font-semibold flex items-center gap-2 pt-2"><X className="w-4 h-4 text-destructive"/>Why your answer was incorrect</h4>
                                       <p className="text-sm text-muted-foreground">{exp.wrongAnswerExplanation}</p>
                                    </>
                                  )}
                                </div>
                            </CardContent>
                        </Card>
                    )
                  }) : Array.from({length: questions.length}).map((_, i) => <Skeleton key={i} className="h-32 w-full"/>)}
                </div>
            </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {renderContent()}
    </div>
  );
}
