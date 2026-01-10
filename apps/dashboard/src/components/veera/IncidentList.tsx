import { Incident } from '@/types/incident';
import IncidentCard from './IncidentCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface IncidentListProps {
  incidents: Incident[];
  selectedId: string | null;
  onSelect: (incident: Incident) => void;
}

const IncidentList = ({ incidents, selectedId, onSelect }: IncidentListProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Sort by risk score (highest first) and then by timestamp (most recent first)
  const sortedIncidents = [...incidents]
    .filter(incident => 
      incident.uid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.location.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (b.riskScore !== a.riskScore) {
        return b.riskScore - a.riskScore;
      }
      return b.timestamp.getTime() - a.timestamp.getTime();
    });

  const highRiskCount = incidents.filter(i => i.riskLevel === 'high').length;

  return (
    <div className="h-full flex flex-col bg-card border-r border-border">
      {/* Header */}
      <div className="p-5 border-b border-border shrink-0 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10">
              <AlertTriangle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Active Incidents</h2>
              <p className="text-xs text-muted-foreground">
                {incidents.length} total • <span className="text-risk-high font-medium">{highRiskCount} high risk</span>
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by ID or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 bg-muted/50 border-border/50 focus:bg-background transition-colors"
          />
        </div>
      </div>

      {/* Incident Cards */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {sortedIncidents.length > 0 ? (
            sortedIncidents.map((incident, index) => (
              <div
                key={incident.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <IncidentCard
                  incident={incident}
                  isSelected={selectedId === incident.id}
                  onClick={() => onSelect(incident)}
                />
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No incidents found</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default IncidentList;
