export const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications"); // Ganti dengan API endpoint yang sesuai
      if (!response.ok) throw new Error("Failed to fetch notifications");
      return await response.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  };
  