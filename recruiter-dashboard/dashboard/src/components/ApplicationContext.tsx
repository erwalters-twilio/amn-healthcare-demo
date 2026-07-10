import { AlertTriangle, CheckCircle } from 'lucide-react';

interface ApplicationContextProps {
  applicationContext: {
    job_applied?: string;
    application_id?: string;
    abandonment_step?: string;
  };
}

export function ApplicationContext({ applicationContext }: ApplicationContextProps) {
  const { job_applied, application_id, abandonment_step } = applicationContext;

  if (!job_applied && !application_id && !abandonment_step) {
    return null;
  }

  const hasAbandonment = !!abandonment_step;

  return (
    <div className="bg-white border border-gray-200/60 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Header */}
      <div className={`px-6 py-4 rounded-t-2xl ${hasAbandonment ? 'gradient-amber' : 'gradient-green'}`}>
        <div className="flex items-center gap-3">
          {hasAbandonment ? (
            <>
              <AlertTriangle className="w-6 h-6 text-white" />
              <h2 className="text-xl font-bold text-white">Application Status</h2>
              <span className="ml-auto bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs text-white font-bold shadow-sm">
                Abandoned
              </span>
            </>
          ) : (
            <>
              <CheckCircle className="w-6 h-6 text-white" />
              <h2 className="text-xl font-bold text-white">Application Status</h2>
              <span className="ml-auto bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs text-white font-bold shadow-sm">
                Active
              </span>
            </>
          )}
        </div>
      </div>

      <div className="p-6 space-y-4">
        {job_applied && (
          <div className="bg-gray-50 rounded-lg px-4 py-3">
            <div className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Position Applied</div>
            <div className="text-gray-900 font-bold text-base">{job_applied}</div>
          </div>
        )}

        {application_id && (
          <div className="bg-gray-50 rounded-lg px-4 py-3">
            <div className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Application ID</div>
            <div className="text-gray-800 font-mono text-sm font-semibold">{application_id}</div>
          </div>
        )}

        {abandonment_step && (
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50/50 border-l-4 border-amber-500 px-4 py-3.5 rounded-r-lg shadow-sm">
            <div className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">Abandoned At</div>
            <div className="text-amber-900 font-bold text-base">{abandonment_step}</div>
          </div>
        )}
      </div>
    </div>
  );
}
