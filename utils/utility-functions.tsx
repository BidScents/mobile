export const formatAllCapsText = (text: string) => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase().replace('_', ' ');
};

// Helper function to format date
export const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "now";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  } catch {
    return "now";
  }
};
