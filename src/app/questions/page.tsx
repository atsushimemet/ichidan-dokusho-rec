'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ProgressIndicator from '@/components/ui/ProgressIndicator';
import { questions } from '@/data/questions';
import { QuestionResponse } from '@/types';

export default function QuestionsPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [responses, setResponses] = useState<Partial<QuestionResponse>>({
    genre_preference: []
  });
  const [isAnimating, setIsAnimating] = useState(false);

  const currentQuestion = questions[currentStep - 1];
  const isLastStep = currentStep === questions.length;

  const handleSingleSelect = (value: string) => {
    if (currentQuestion.id === 'purpose') {
      setResponses(prev => ({ ...prev, purpose: value }));
    }
    
    // 自動で次の質問に進む（遅延あり）
    setTimeout(() => {
      handleNext();
    }, 300);
  };

  const handleMultipleSelect = (value: string) => {
    setResponses(prev => {
      const currentGenres = prev.genre_preference || [];
      const newGenres = currentGenres.includes(value)
        ? currentGenres.filter(g => g !== value)
        : [...currentGenres, value];
      
      return { ...prev, genre_preference: newGenres };
    });
  };

  const handleNext = () => {
    if (currentStep < questions.length) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsAnimating(false);
      }, 200);
    } else {
      // 回答完了、結果ページへ遷移
      const queryParams = new URLSearchParams({
        purpose: responses.purpose || '',
        genres: (responses.genre_preference || []).join(',')
      });
      router.push(`/results?${queryParams.toString()}`);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev - 1);
        setIsAnimating(false);
      }, 200);
    }
  };

  useEffect(() => {
    // ページ遷移時にスクロール位置を最上部に設定
    window.scrollTo(0, 0);
  }, []);

  const canProceed = () => {
    if (currentQuestion.id === 'purpose') {
      return responses.purpose;
    } else if (currentQuestion.id === 'genre') {
      return responses.genre_preference && responses.genre_preference.length > 0;
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ios-blue/5 via-white to-ios-purple/5 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-ios-gray-800 mb-4">
            あなたにぴったりの本を見つけましょう
          </h1>
          <ProgressIndicator 
            currentStep={currentStep} 
            totalSteps={questions.length}
            className="mb-6"
          />
        </div>

        {/* 質問カード */}
        <div className={`transition-all duration-300 ${isAnimating ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}>
          <Card variant="glass" className="p-8 mb-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-ios-gray-800 mb-3">
                {currentQuestion.title}
              </h2>
              <p className="text-ios-gray-600">
                {currentQuestion.description}
              </p>
            </div>

            {/* 選択肢 */}
            <div className={`grid gap-4 ${currentQuestion.type === 'multiple' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2'}`}>
              {currentQuestion.options.map((option) => {
                const isSelected = currentQuestion.type === 'single' 
                  ? responses.purpose === option.value
                  : responses.genre_preference?.includes(option.value);

                return (
                  <Card
                    key={option.value}
                    variant="default"
                    selectable
                    selected={isSelected}
                    className="p-6 cursor-pointer"
                    onClick={() => 
                      currentQuestion.type === 'single' 
                        ? handleSingleSelect(option.value)
                        : handleMultipleSelect(option.value)
                    }
                  >
                    <div className="text-center space-y-3">
                      <div className="text-4xl">{option.icon}</div>
                      <h3 className="font-semibold text-ios-gray-800">
                        {option.label}
                      </h3>
                      <p className="text-sm text-ios-gray-600">
                        {option.description}
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>
          </Card>
        </div>

        {/* ナビゲーションボタン */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className={currentStep === 1 ? 'invisible' : ''}
          >
            ← 戻る
          </Button>

          {currentQuestion.type === 'multiple' && (
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={!canProceed()}
              className="ml-auto"
            >
              {isLastStep ? '結果を見る' : '次へ →'}
            </Button>
          )}
        </div>

        {/* ヒント */}
        <div className="text-center mt-8">
          <p className="text-sm text-ios-gray-500">
            {currentQuestion.type === 'multiple' 
              ? '複数選択できます。選択後「次へ」ボタンを押してください。'
              : '選択すると自動で次の質問に進みます。'
            }
          </p>
        </div>
      </div>
    </div>
  );
}