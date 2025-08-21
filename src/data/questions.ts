import { Question } from '@/types';

export const questions: Question[] = [
  {
    id: 'purpose',
    title: '読書の目的は何ですか？',
    description: 'あなたが本を読む主な理由を教えてください',
    type: 'single',
    options: [
      {
        value: 'knowledge',
        label: '知識・教養を身につけたい',
        description: '新しいことを学んで視野を広げたい',
        icon: '🧠'
      },
      {
        value: 'skill',
        label: 'スキルアップしたい',
        description: '仕事や趣味に活かせる技術を習得したい',
        icon: '🚀'
      },
      {
        value: 'growth',
        label: '自己成長したい',
        description: '人間的に成長して良い人生を送りたい',
        icon: '🌱'
      },
      {
        value: 'relaxation',
        label: 'リラックス・娯楽',
        description: '楽しく読書してストレス解消したい',
        icon: '😊'
      }
    ]
  },
  {
    id: 'genre',
    title: 'どんなジャンルに興味がありますか？',
    description: '興味のあるジャンルを選んでください（複数選択可）',
    type: 'multiple',
    options: [
      {
        value: '自己啓発',
        label: '自己啓発',
        description: '成功法則、習慣形成、モチベーション',
        icon: '💪'
      },
      {
        value: 'ビジネス',
        label: 'ビジネス・経済',
        description: '経営、マーケティング、投資',
        icon: '💼'
      },
      {
        value: '心理学',
        label: '心理学',
        description: '人間心理、コミュニケーション',
        icon: '🧭'
      },
      {
        value: '哲学',
        label: '哲学・思想',
        description: '人生論、価値観、思考法',
        icon: '🤔'
      },
      {
        value: '歴史',
        label: '歴史・社会',
        description: '世界史、日本史、社会問題',
        icon: '📚'
      },
      {
        value: '科学',
        label: '科学・技術',
        description: 'IT、テクノロジー、自然科学',
        icon: '🔬'
      },
      {
        value: '健康',
        label: '健康・ライフスタイル',
        description: '健康法、料理、ライフハック',
        icon: '🏃'
      },
      {
        value: '小説',
        label: '小説・文学',
        description: '純文学、エンタメ小説',
        icon: '📖'
      }
    ]
  },
  {
    id: 'difficulty',
    title: '読みやすさの希望は？',
    description: 'どのくらいの読みやすさの本を希望しますか？',
    type: 'single',
    options: [
      {
        value: 'beginner',
        label: '読みやすい本',
        description: '初心者向け、分かりやすい表現',
        icon: '🌟'
      },
      {
        value: 'intermediate',
        label: '標準的な本',
        description: 'ある程度の読書経験が必要',
        icon: '📈'
      },
      {
        value: 'advanced',
        label: '専門的な本',
        description: '深い内容、高度な議論',
        icon: '🎓'
      }
    ]
  }
];