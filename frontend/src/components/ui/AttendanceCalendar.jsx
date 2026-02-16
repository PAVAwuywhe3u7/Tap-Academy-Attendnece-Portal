import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';

import { getStatusEventColor, toTitleCase } from '../../utils/format';

const AttendanceCalendar = ({ records = [], onDateClick = null }) => {
  const events = records.map((record) => ({
    id: String(record.id || `${record.attendanceDate}-${record.status}`),
    title: toTitleCase(record.status),
    date: record.attendanceDate,
    color: getStatusEventColor(record.status),
    textColor: '#0f172a'
  }));

  return (
    <div className="glass-card p-4">
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={events}
        dayCellDidMount={(info) => {
          if (!onDateClick) return;
          info.el.style.cursor = 'pointer';
          info.el.onclick = () => onDateClick(info.dateStr);
        }}
        height="auto"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: ''
        }}
      />
    </div>
  );
};

export default AttendanceCalendar;
