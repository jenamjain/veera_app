import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Incident } from '@/types/incident';
import DashboardHeader from '@/components/veera/DashboardHeader';
import IncidentList from '@/components/veera/IncidentList';
import IncidentMap from '@/components/veera/IncidentMap';
import IncidentDetails from '@/components/veera/IncidentDetails';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { mockIncidents } from '@/data/mockincidents';

const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [incidents] = useState<Incident[]>(mockIncidents);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Check authentication
  useEffect(() => {
    const session = localStorage.getItem('veera_session');
    if (!session) {
      navigate('/');
    }
  }, [navigate]);

  const handleSelectIncident = (incident: Incident) => {
    setSelectedIncident(incident);
    // On tablet, open sheet for details
    if (window.innerWidth < 1024) {
      setIsDetailsOpen(true);
    }
  };

  const handleCloseDetails = () => {
    setSelectedIncident(null);
    setIsDetailsOpen(false);
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <DashboardHeader />

      {/* Main Content - 3 Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Incident List */}
        <div className="w-[340px] shrink-0 hidden md:block">
          <IncidentList
            incidents={incidents}
            selectedId={selectedIncident?.id ?? null}
            onSelect={handleSelectIncident}
          />
        </div>

        {/* Center Panel - Map */}
        <div className="flex-1 min-w-0">
          <IncidentMap
            incidents={incidents}
            selectedIncident={selectedIncident}
            onSelectIncident={handleSelectIncident}
          />
        </div>

        {/* Right Panel - Details (Desktop) */}
        <div className="w-[340px] shrink-0 hidden lg:block">
          <IncidentDetails
            incident={selectedIncident}
            onClose={handleCloseDetails}
          />
        </div>
      </div>

      {/* Mobile/Tablet Bottom Sheet for Incident List */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border max-h-[45vh] overflow-auto rounded-t-3xl shadow-2xl">
        <div className="sticky top-0 bg-card pt-3 pb-2 px-4 border-b border-border/50">
          <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-2" />
        </div>
        <IncidentList
          incidents={incidents}
          selectedId={selectedIncident?.id ?? null}
          onSelect={handleSelectIncident}
        />
      </div>

      {/* Details Sheet for Tablet */}
      <Sheet open={isDetailsOpen && window.innerWidth < 1024} onOpenChange={setIsDetailsOpen}>
        <SheetContent className="w-full sm:max-w-md p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Incident Details</SheetTitle>
          </SheetHeader>
          <IncidentDetails
            incident={selectedIncident}
            onClose={handleCloseDetails}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Dashboard;
