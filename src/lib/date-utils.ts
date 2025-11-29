export function formatIssueTime(issueTime: string) {
    if (!issueTime) return "";
    try {
        // Remove timezone offset if present to treat as local wall time
        // e.g. 2025-11-29T13:26:55+11:00 -> 2025-11-29T13:26:55
        const localIso = issueTime.replace(/([+-]\d{2}:?\d{2}|Z)$/, '');
        const date = new Date(localIso);

        if (isNaN(date.getTime())) return issueTime;

        const timeFormatter = new Intl.DateTimeFormat('en-AU', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
        const timeStr = timeFormatter.format(date).toLowerCase().replace(/\s/g, '');

        // Check if today (using AU time as reference)
        const now = new Date();
        const auNow = new Date(now.toLocaleString('en-US', { timeZone: 'Australia/Sydney' }));

        const isToday = date.getDate() === auNow.getDate() &&
            date.getMonth() === auNow.getMonth() &&
            date.getFullYear() === auNow.getFullYear();

        if (isToday) {
            return `Today at ${timeStr}`;
        }

        const dateFormatter = new Intl.DateTimeFormat('en-AU', {
            day: 'numeric',
            month: 'long'
        });
        return `${dateFormatter.format(date)} at ${timeStr}`;
    } catch (e) {
        return issueTime;
    }
}
