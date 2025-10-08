
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGameScores } from '@/context/GameScoreContext';
import { Brain, Atom, Dna, FlaskConical, Microscope, Rocket, TestTube, Lightbulb, CheckCircle2, Award, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

const ICONS = [
  { icon: Brain, name: 'Brain' },
  { icon: Atom, name: 'Atom' },
  { icon: Dna, name: 'Dna' },
  { icon: FlaskConical, name: 'Flask' },
  { icon: Microscope, name: 'Microscope' },
  { icon: Rocket, name: 'Rocket' },
  { icon: TestTube, name: 'TestTube' },
  { icon: Lightbulb, name: 'Lightbulb' },
];

const shuffleArray = (array: any[]) => {
    // Math.random() is not safe to use on server, but this is a client component
    // so it's fine.
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

const generateCards = () => {
    const duplicatedIcons = [...ICONS, ...ICONS];
    return shuffleArray(duplicatedIcons.map((icon, index) => ({ ...icon, id: index })));
}


export default function MemoryGamePage() {
    const [cards, setCards] = useState(generateCards());
    const [flipped, setFlipped] = useState<number[]>([]);
    const [matched, setMatched] = useState<string[]>([]);
    const [moves, setMoves] = useState(0);
    const { addScore } = useGameScores();
    const [isChecking, setIsChecking] = useState(false);
    const [isRevealing, setIsRevealing] = useState(true);

    const isGameOver = matched.length === ICONS.length;
    
    useEffect(() => {
        setIsRevealing(true);
        const revealTimer = setTimeout(() => {
            setIsRevealing(false);
        }, 2000);

        return () => clearTimeout(revealTimer);
    }, [cards]);

    useEffect(() => {
        if (flipped.length === 2) {
            setIsChecking(true);
            const [firstIndex, secondIndex] = flipped;
            const firstCard = cards[firstIndex];
            const secondCard = cards[secondIndex];

            if (firstCard.name === secondCard.name) {
                setMatched(prev => [...prev, firstCard.name]);
                setFlipped([]);
                setIsChecking(false);
            } else {
                setTimeout(() => {
                    setFlipped([]);
                    setIsChecking(false);
                }, 1000);
            }
        }
    }, [flipped, cards]);

    useEffect(() => {
        if (isGameOver) {
            const score = Math.max(0, 100 - (moves - ICONS.length * 2) * 5); // Example scoring logic
            addScore('memory', score);
        }
    }, [isGameOver, moves, addScore]);


    const handleCardClick = (index: number) => {
        if (isRevealing || isChecking || flipped.includes(index) || matched.includes(cards[index].name) || flipped.length >= 2) {
            return;
        }

        const newFlipped = [...flipped, index];
        setFlipped(newFlipped);
        setMoves(m => m + 1);
    };

    const resetGame = () => {
        setCards(generateCards());
        setFlipped([]);
        setMatched([]);
        setMoves(0);
        setIsRevealing(true);
    };

  return (
    <div className="flex items-center justify-center">
        <Card className="w-full max-w-2xl text-center">
            <CardHeader>
                <CardTitle className="text-2xl font-headline">Memory Game</CardTitle>
                <CardDescription>Match the pairs of icons!</CardDescription>
            </CardHeader>
            <CardContent>
                {isGameOver ? (
                    <div className="flex flex-col items-center gap-4 py-10">
                        <CheckCircle2 className="h-16 w-16 text-green-500" />
                        <h2 className="text-2xl font-bold">You Won!</h2>
                        <p className="text-muted-foreground">You completed the game in {moves} moves.</p>
                        <Button onClick={resetGame}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Play Again
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="mb-4 flex justify-around items-center p-2 rounded-lg bg-secondary">
                             <p className="font-medium text-lg">Moves: <span className="font-bold">{moves}</span></p>
                             <p className="font-medium text-lg flex items-center gap-1"><Award className="w-5 h-5 text-primary"/>Pairs Found: <span className="font-bold">{matched.length} / {ICONS.length}</span></p>
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            {cards.map((card, index) => {
                                const isFlipped = isRevealing || flipped.includes(index) || matched.includes(card.name);
                                const Icon = card.icon;
                                return (
                                    <div key={card.id} className="perspective-[1000px] aspect-square" onClick={() => handleCardClick(index)}>
                                        <div className={cn(
                                            "relative w-full h-full text-center transition-transform duration-500 transform-style-3d",
                                            isFlipped ? 'rotate-y-180' : ''
                                        )}>
                                            {/* Back */}
                                            <div className="absolute w-full h-full backface-hidden flex items-center justify-center rounded-lg bg-primary/20 hover:bg-primary/30 cursor-pointer">
                                                <Brain className="w-1/2 h-1/2 text-primary/50"/>
                                            </div>
                                            {/* Front */}
                                            <div className="absolute w-full h-full backface-hidden rotate-y-180 flex items-center justify-center rounded-lg bg-card border-2 border-primary">
                                                <Icon className="w-1/2 h-1/2 text-primary" />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
        <style jsx>{`
            .transform-style-3d { transform-style: preserve-3d; }
            .perspective-1000 { perspective: 1000px; }
            .rotate-y-180 { transform: rotateY(180deg); }
            .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        `}</style>
    </div>
  );
}
