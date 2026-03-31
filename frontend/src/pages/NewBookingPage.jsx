import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function NewBookingPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-4 -ml-3 text-slate-500 hover:text-slate-900"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Request a Workspace
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Fill out the form below to request a resource. Approvals usually take 24 hours.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-lg">Booking Details</CardTitle>
            <CardDescription className="text-xs">All fields are required unless marked as optional.</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 p-6">
            
            <div className="space-y-2">
              <Label htmlFor="resource">Resource</Label>
              <select 
                id="resource" 
                className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors cursor-pointer"
                required
                defaultValue=""
              >
                <option value="" disabled>Select a resource</option>
                <option value="room-a">Conference Room A</option>
                <option value="room-b">Conference Room B</option>
                <option value="lab">Training Lab</option>
                <option value="projector">Projector XYZ</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="attendees">Expected Attendees</Label>
                <Input id="attendees" type="number" min="1" placeholder="e.g. 5" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input id="startTime" type="time" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input id="endTime" type="time" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose</Label>
              <textarea 
                id="purpose" 
                rows={4}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none transition-colors"
                placeholder="Briefly describe the purpose of this booking..."
                required
              />
            </div>

          </CardContent>
          <CardFooter className="flex justify-end space-x-3 border-t border-slate-100 p-6 bg-slate-50 rounded-b-xl">
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
