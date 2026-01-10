import { Incident } from '@/types/incident';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Navigation, 
  AlertTriangle, 
  Phone, 
  Clock,
  X,
  Copy,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface IncidentDetailsProps {
  incident: Incident | null;
  onClose: () => void;
}

const getRiskBadgeVariant = (level: Incident['riskLevel']) => {
  switch (level) {
    case 'high':
      return 'bg-risk-high text-white border-transparent shadow-sm shadow-risk-high/30';
    case 'medium':
      return 'bg-risk-medium text-white border-transparent shadow-sm shadow-risk-medium/30';
    case 'low':
      return 'bg-risk-low text-white border-transparent shadow-sm shadow-risk-low/30';
  }
};

const getContactStatusStyles = (status: Incident['emergencyContactStatus']) => {
  switch (status) {
    case 'contacted':
      return 'bg-risk-low/15 text-risk-low border-risk-low/30';
    case 'pending':
      return 'bg-risk-medium/15 text-risk-medium border-risk-medium/30';
    case 'not_contacted':
      return 'bg-risk-high/15 text-risk-high border-risk-high/30';
  }
};

const getContactStatusLabel = (status: Incident['emergencyContactStatus']) => {
  switch (status) {
    case 'contacted':
      return 'Contacted';
    case 'pending':
      return 'Pending';
    case 'not_contacted':
      return 'Not Contacted';
  }
};

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-IN', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-IN', { 
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

const IncidentDetails = ({ incident, onClose }: IncidentDetailsProps) => {
  const { toast } = useToast();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast({
      title: 'Copied to clipboard',
      description: `${field} has been copied.`,
    });
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!incident) {
    return (
      <div className="h-full flex items-center justify-center bg-card border-l border-border p-6">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <p className="text-muted-foreground text-sm font-medium">
            Select an incident to view details
          </p>
          <p className="text-muted-foreground/60 text-xs mt-1">
            Click on any incident card from the list
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-card border-l border-border flex flex-col animate-slide-in-right">
      {/* Header */}
      <div className="p-5 border-b border-border flex items-center justify-between shrink-0">
        <div>
          <h2 className="font-semibold text-foreground">Incident Details</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Case #{incident.uid}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors rounded-lg"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {/* UID Card */}
        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Unique ID
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold text-foreground font-mono">{incident.uid}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(incident.uid, 'UID')}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              >
                {copiedField === 'UID' ? (
                  <CheckCircle2 className="h-4 w-4 text-risk-low" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Location Card */}
        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-3">
            <p className="text-sm font-medium text-foreground">{incident.location}</p>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-muted/50 rounded-md">
                <Navigation className="w-3 h-3 text-muted-foreground" />
                <span className="font-mono text-muted-foreground">{incident.latitude.toFixed(4)}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-muted/50 rounded-md">
                <Navigation className="w-3 h-3 rotate-90 text-muted-foreground" />
                <span className="font-mono text-muted-foreground">{incident.longitude.toFixed(4)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Score Card */}
        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className={cn(
                  'text-4xl font-bold tabular-nums',
                  incident.riskLevel === 'high' && 'text-risk-high',
                  incident.riskLevel === 'medium' && 'text-risk-medium',
                  incident.riskLevel === 'low' && 'text-risk-low'
                )}>
                  {incident.riskScore}
                </p>
                <p className="text-xs text-muted-foreground">out of 100</p>
              </div>
              <Badge 
                className={cn(
                  'text-sm px-3 py-1.5 font-semibold',
                  getRiskBadgeVariant(incident.riskLevel)
                )}
              >
                {incident.riskLevel.charAt(0).toUpperCase() + incident.riskLevel.slice(1)} Risk
              </Badge>
            </div>
            {/* Risk bar */}
            <div className="h-2.5 bg-muted rounded-full overflow-hidden">
              <div 
                className={cn(
                  'h-full rounded-full transition-all duration-700 ease-out',
                  incident.riskLevel === 'high' && 'bg-risk-high',
                  incident.riskLevel === 'medium' && 'bg-risk-medium',
                  incident.riskLevel === 'low' && 'bg-risk-low'
                )}
                style={{ width: `${incident.riskScore}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact Card */}
        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" />
              Emergency Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <Badge 
              variant="outline"
              className={cn(
                'text-sm px-3 py-1.5 font-medium',
                getContactStatusStyles(incident.emergencyContactStatus)
              )}
            >
              {getContactStatusLabel(incident.emergencyContactStatus)}
            </Badge>
          </CardContent>
        </Card>

        {/* Timestamp Card */}
        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Reported At
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-lg font-semibold text-foreground">{formatTime(incident.timestamp)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{formatDate(incident.timestamp)}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IncidentDetails;
