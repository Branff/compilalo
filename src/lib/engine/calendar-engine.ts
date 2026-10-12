/**
 * Generatore di eventi di calendario (.ics) locale e privo di server
 * Permette all'utente di impostare promemoria per scadenze di legge
 * (es. 60 giorni per ricorso multa, 30 giorni per preavviso disdetta, 30 giorni per risposta PA ex L. 241/90)
 */

export function generateIcsCalendarEvent(params: {
  title: string;
  description: string;
  startDate: Date;
  daysDuration?: number;
}): void {
  const { title, description, startDate, daysDuration = 0 } = params;

  const formatDate = (d: Date) => {
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const endDate = new Date(startDate.getTime() + (daysDuration * 24 * 60 * 60 * 1000));
  const now = new Date();

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//COMPILALO//Civic Calendar Event//IT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:compilalo-${Date.now()}@local`,
    `DTSTAMP:${formatDate(now)}`,
    `DTSTART:${formatDate(startDate)}`,
    `DTEND:${formatDate(endDate)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    'DESCRIPTION:Promemoria Scadenza COMPILALO',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `scadenza-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
