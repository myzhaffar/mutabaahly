import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Award, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import '@/i18n';

interface StatsCardsProps {
  stats: {
    totalStudents: number;
    avgHafalanProgress: number;
    avgTilawahProgress: number;
    completedStudents: number;
  };
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const { t } = useTranslation();

  const cards = [
    {
      title: t('dashboard.stats.totalStudents'),
      value: stats.totalStudents,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: t('dashboard.stats.avgHafalanProgress'),
      value: `${Math.round(stats.avgHafalanProgress)}%`,
      icon: Award,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: t('dashboard.stats.avgTilawahProgress'),
      value: `${Math.round(stats.avgTilawahProgress)}%`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: t('dashboard.stats.completedStudents'),
      value: stats.completedStudents,
      icon: Award,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="bg-white shadow-sm border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-full ${card.bgColor} mr-4`}>
                  <Icon className={`h-6 w-6 ${card.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default StatsCards;
