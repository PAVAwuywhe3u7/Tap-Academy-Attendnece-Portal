import { toTitleCase } from '../../utils/format';
import { statusColor } from '../../utils/format';

const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-wide ${statusColor(status)}`}>
    {toTitleCase(status || 'unknown')}
  </span>
);

export default StatusBadge;