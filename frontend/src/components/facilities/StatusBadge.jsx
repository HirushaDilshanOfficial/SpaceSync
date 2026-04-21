const STYLES = {
  ACTIVE:         'bg-green-100 text-green-800 border border-green-300',
  OUT_OF_SERVICE: 'bg-red-100 text-red-800 border border-red-300',
};

const LABELS = {
  ACTIVE:         'Available',
  OUT_OF_SERVICE: 'Unavailable',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STYLES[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {LABELS[status] ?? status}
    </span>
  );
}