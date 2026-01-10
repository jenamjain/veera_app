import { Incident } from '@/types/incident';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IncidentMapProps {
  incidents: Incident[];
  selectedIncident: Incident | null;
  onSelectIncident: (incident: Incident) => void;
}

const getMarkerColor = (level: Incident['riskLevel']): string => {
  switch (level) {
    case 'high':
      return 'text-risk-high';
    case 'medium':
      return 'text-risk-medium';
    case 'low':
      return 'text-risk-low';
  }
};

const getMarkerBg = (level: Incident['riskLevel']): string => {
  switch (level) {
    case 'high':
      return 'bg-risk-high/20';
    case 'medium':
      return 'bg-risk-medium/20';
    case 'low':
      return 'bg-risk-low/20';
  }
};

const IncidentMap = ({ incidents, selectedIncident, onSelectIncident }: IncidentMapProps) => {
  // Placeholder map - positions are relative to the container
  // In production, this would be replaced with Mapbox
  const getRelativePosition = (incident: Incident) => {
    // Normalize lat/long to percentage positions for the placeholder
    // Using rough India bounds: lat 8-35, long 68-97
    const latNorm = ((incident.latitude - 8) / (35 - 8)) * 100;
    const longNorm = ((incident.longitude - 68) / (97 - 68)) * 100;
    
    return {
      top: `${100 - latNorm}%`,
      left: `${longNorm}%`,
    };
  };

  return (
    <div className="h-full flex flex-col bg-muted/20">
      {/* Map Container */}
      <div className="flex-1 relative overflow-hidden m-4 rounded-2xl bg-gradient-to-br from-secondary via-muted/50 to-muted border border-border/50 shadow-inner">
        {/* Placeholder grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-background/10 pointer-events-none" />
        
        {/* Map placeholder label */}
        <div className="absolute top-4 left-4 px-4 py-2.5 bg-card/95 backdrop-blur-sm rounded-xl border border-border/50 shadow-lg">
          <p className="text-xs font-medium text-muted-foreground">
            📍 Interactive Map • Connect Mapbox for live data
          </p>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 px-4 py-3 bg-card/95 backdrop-blur-sm rounded-xl border border-border/50 shadow-lg">
          <p className="text-xs font-medium text-muted-foreground mb-2">Risk Levels</p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-risk-high" />
              <span className="text-xs text-muted-foreground">High</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-risk-medium" />
              <span className="text-xs text-muted-foreground">Medium</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-risk-low" />
              <span className="text-xs text-muted-foreground">Low</span>
            </div>
          </div>
        </div>

        {/* Incident Markers */}
        {incidents.map((incident) => {
          const position = getRelativePosition(incident);
          const isSelected = selectedIncident?.id === incident.id;

          return (
            <button
              key={incident.id}
              onClick={() => onSelectIncident(incident)}
              className={cn(
                'absolute transform -translate-x-1/2 -translate-y-full transition-all duration-300 ease-out',
                'hover:scale-110 focus:outline-none focus:scale-110',
                'group',
                isSelected && 'scale-125 z-20'
              )}
              style={{ top: position.top, left: position.left }}
              title={`${incident.uid} - ${incident.location}`}
            >
              {/* Pulse ring for selected */}
              {isSelected && (
                <span className={cn(
                  'absolute -inset-3 rounded-full animate-ping opacity-30',
                  getMarkerBg(incident.riskLevel)
                )} />
              )}
              
              {/* Marker shadow/glow */}
              <span className={cn(
                'absolute inset-0 rounded-full blur-sm transition-opacity duration-300',
                getMarkerBg(incident.riskLevel),
                isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
              )} />
              
              <MapPin 
                className={cn(
                  'w-8 h-8 drop-shadow-lg relative transition-all duration-300',
                  getMarkerColor(incident.riskLevel),
                  isSelected && 'animate-pulse-soft'
                )}
                fill={isSelected ? 'currentColor' : 'white'}
                strokeWidth={isSelected ? 2.5 : 2}
              />
            </button>
          );
        })}

        {/* Selected incident callout */}
        {selectedIncident && (
          <div 
            className={cn(
              'absolute bg-card rounded-xl shadow-xl border border-border/50 p-4 max-w-[220px] z-30',
              'transform -translate-x-1/2 animate-scale-in'
            )}
            style={{ 
              top: `calc(${getRelativePosition(selectedIncident).top} - 90px)`,
              left: getRelativePosition(selectedIncident).left,
            }}
          >
            {/* Arrow */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-card border-r border-b border-border/50 rotate-45" />
            
            <p className="text-sm font-bold text-foreground">{selectedIncident.uid}</p>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{selectedIncident.location}</p>
            <div className={cn(
              'mt-2 pt-2 border-t border-border/50 flex items-center gap-1.5'
            )}>
              <span className={cn(
                'w-2 h-2 rounded-full',
                selectedIncident.riskLevel === 'high' && 'bg-risk-high',
                selectedIncident.riskLevel === 'medium' && 'bg-risk-medium',
                selectedIncident.riskLevel === 'low' && 'bg-risk-low'
              )} />
              <span className="text-xs font-medium text-muted-foreground">
                Risk Score: {selectedIncident.riskScore}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncidentMap;
