import { useState } from 'react';
import { User, Mail, Phone, Briefcase, CheckCircle } from 'lucide-react';
import { SegmentProfile } from '../types';

interface ProfileSectionProps {
  profile: SegmentProfile;
}

export function ProfileSection({ profile }: ProfileSectionProps) {
  const { traits } = profile;
  const [isCompleting, setIsCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleCompletePlacement = async () => {
    setIsCompleting(true);

    try {
      // Send event to Segment with anonymousId as phone number
      // Do NOT include email or phone in properties per demo requirements
      const response = await fetch('https://api.segment.io/v1/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa('JFvPd0OsxWNOnOaTRqrNBlYBTnn6Xnyp:')
        },
        body: JSON.stringify({
          anonymousId: traits.phone || '+13304027149',
          event: 'Complete Placement',
          properties: {
            role: traits.profession || traits.specialty,
            specialty: traits.specialty,
            location: traits.city,
            state: traits.state,
            candidateName: `${traits.firstName} ${traits.lastName}`
          },
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        setCompleted(true);
        setTimeout(() => setCompleted(false), 3000);
      } else {
        console.error('Failed to send event to Segment');
      }
    } catch (error) {
      console.error('Error sending event:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200/60 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Header */}
      <div className="gradient-blue px-8 py-6 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white tracking-tight">
                {traits.firstName} {traits.lastName}
              </h2>
              {traits.profession && (
                <p className="text-blue-100 font-semibold text-lg mt-1">{traits.profession}</p>
              )}
            </div>
          </div>
          <button
            onClick={handleCompletePlacement}
            disabled={isCompleting || completed}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold transition-all duration-200 shadow-lg ${
              completed
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-white text-blue-700 hover:bg-blue-50 hover:shadow-xl'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {completed ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Placement Completed!
              </>
            ) : isCompleting ? (
              <>
                <div className="w-5 h-5 border-2 border-blue-700 border-t-transparent rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Complete Placement
              </>
            )}
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-6 px-8 py-6 border-b border-gray-200/60 bg-gradient-to-br from-gray-50 to-blue-50/20">
        {traits.specialty && (
          <div className="text-center">
            <div className="text-xs text-gray-600 font-bold uppercase tracking-wider mb-2">Specialty</div>
            <div className="font-bold text-gray-900 text-base">{traits.specialty}</div>
          </div>
        )}
        {traits.yearsExperience && (
          <div className="text-center">
            <div className="text-xs text-gray-600 font-bold uppercase tracking-wider mb-2">Experience</div>
            <div className="font-bold text-gray-900 text-base">{traits.yearsExperience} years</div>
          </div>
        )}
        {traits.city && (
          <div className="text-center">
            <div className="text-xs text-gray-600 font-bold uppercase tracking-wider mb-2">Location</div>
            <div className="font-bold text-gray-900 text-base">{traits.city}</div>
          </div>
        )}
        {traits.state && (
          <div className="text-center">
            <div className="text-xs text-gray-600 font-bold uppercase tracking-wider mb-2">State</div>
            <div className="font-bold text-gray-900 text-base">{traits.state}</div>
          </div>
        )}
      </div>

      {/* Contact & Professional Details */}
      <div className="px-8 py-6 space-y-6">
        {/* Contact */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2.5">
            <User className="w-5 h-5 text-blue-600" />
            Contact Information
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {traits.email && (
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3">
                <Mail className="w-5 h-5 text-gray-500" />
                <span className="text-gray-800 font-medium">{traits.email}</span>
              </div>
            )}
            {traits.phone && (
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3">
                <Phone className="w-5 h-5 text-gray-500" />
                <span className="text-gray-800 font-medium">{traits.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Professional Info */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2.5">
            <Briefcase className="w-5 h-5 text-blue-600" />
            Professional Details
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {traits.discipline && (
              <div className="bg-gray-50 rounded-lg px-4 py-3">
                <div className="text-xs text-gray-600 font-bold uppercase tracking-wide mb-1">Discipline</div>
                <div className="text-sm font-bold text-gray-900">{traits.discipline}</div>
              </div>
            )}
            {traits.otherSpecialty && (
              <div className="bg-gray-50 rounded-lg px-4 py-3">
                <div className="text-xs text-gray-600 font-bold uppercase tracking-wide mb-1">Other Specialty</div>
                <div className="text-sm font-bold text-gray-900">{traits.otherSpecialty}</div>
              </div>
            )}
            {traits.licenseNumber && (
              <div className="bg-gray-50 rounded-lg px-4 py-3">
                <div className="text-xs text-gray-600 font-bold uppercase tracking-wide mb-1">License Number</div>
                <div className="text-sm font-bold text-gray-900">{traits.licenseNumber}</div>
              </div>
            )}
            {traits.applicationStatus && (
              <div className="bg-gray-50 rounded-lg px-4 py-3">
                <div className="text-xs text-gray-600 font-bold uppercase tracking-wide mb-1">Status</div>
                <div className="text-sm font-bold text-gray-900 capitalize">{traits.applicationStatus}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
