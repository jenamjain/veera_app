import { cn } from '@/lib/utils';
import { Incident } from '@/types/incident';
import { Clock, MapPin } from 'lucide-react';

interface IncidentCardProps {
  incident: Incident;
  isSelected: boolean;
  onClick: () => void;
}

const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

const getRiskBadgeStyles = (level: Incident['riskLevel']): string => {
  switch (level) {
    case 'high':
      return 'bg-risk-high text-white shadow-sm shadow-risk-high/25';
    case 'medium':
      return 'bg-risk-medium text-white shadow-sm shadow-risk-medium/25';
    case 'low':
      return 'bg-risk-low text-white shadow-sm shadow-risk-low/25';
  }
};

const getRiskLabel = (level: Incident['riskLevel']): string => {
  switch (level) {
    case 'high':
      return 'High';
    case 'medium':
      return 'Medium';
    case 'low':
      return 'Low';
  }
};

const IncidentCard = ({ incident, isSelected, onClick }: IncidentCardProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'group w-full text-left p-4 rounded-xl border transition-all duration-300 ease-out',
        'hover:shadow-lg hover:-translate-y-0.5',
        'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 focus:ring-offset-background',
        'active:scale-[0.98]',
        isSelected
          ? 'bg-accent border-primary/50 shadow-lg shadow-primary/10 -translate-y-0.5'
          : 'bg-card border-border/60 hover:border-primary/30 hover:bg-accent/30'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className={cn(
            'font-semibold text-sm truncate transition-colors duration-200',
            isSelected ? 'text-primary' : 'text-foreground group-hover:text-primary'
          )}>
            {incident.uid}
          </p>
          <div className="flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
            <p className="text-xs text-muted-foreground truncate">
              {incident.location}
            </p>
          </div>
        </div>
        <span
          className={cn(
            'inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold shrink-0',
            'transition-transform duration-200 group-hover:scale-105',
            getRiskBadgeStyles(incident.riskLevel)
          )}
        >
          {getRiskLabel(incident.riskLevel)}
        </span>
      </div>
      
      <div className={cn(
        'flex items-center gap-1.5 mt-3 pt-3 border-t text-xs',
        isSelected ? 'border-primary/20' : 'border-border/50'
      )}>
        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-muted-foreground font-medium">{formatTimeAgo(incident.timestamp)}</span>
      </div>
    </button>
  );
};

export default IncidentCard;
