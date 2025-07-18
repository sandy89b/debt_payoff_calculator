import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Book } from 'lucide-react';

const verses = [
  {
    text: "The rich rule over the poor, and the borrower is slave to the lender.",
    reference: "Proverbs 22:7"
  },
  {
    text: "Let no debt remain outstanding, except the continuing debt to love one another.",
    reference: "Romans 13:8"
  },
  {
    text: "Suppose one of you wants to build a tower. Won't you first sit down and estimate the cost?",
    reference: "Luke 14:28"
  },
  {
    text: "The plans of the diligent lead to profit as surely as haste leads to poverty.",
    reference: "Proverbs 21:5"
  },
  {
    text: "For where your treasure is, there your heart will be also.",
    reference: "Matthew 6:21"
  }
];

interface BiblicalVerseProps {
  className?: string;
}

export const BiblicalVerse: React.FC<BiblicalVerseProps> = ({ className = "" }) => {
  const [currentVerse, setCurrentVerse] = useState(verses[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVerse(verses[Math.floor(Math.random() * verses.length)]);
    }, 30000); // Change verse every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className={`bg-gradient-wisdom shadow-glow ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="mt-1 text-financial-wisdom">
            <Book className="h-5 w-5" />
          </div>
          <div>
            <blockquote className="text-sm font-medium text-foreground italic mb-2">
              "{currentVerse.text}"
            </blockquote>
            <cite className="text-xs font-semibold text-muted-foreground">
              — {currentVerse.reference}
            </cite>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};