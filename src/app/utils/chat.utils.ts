export type RoomPreview = {
  id: string;
  name: string;
  lastMessage: string | null;
  unreadCount: number;
};

export function buildRoomPreviews(
  rooms: any[],
  currentUserId: string
): RoomPreview[] {

  return rooms.map(room => {
    const messages = room.messages ?? [];

    let lastMessage: string | null = null;
    let timestamp: string | null = null;
    let unreadCount = 0;

    for (const msg of messages) {
      // update last message if this message is newer
      if (!timestamp || msg.timestamp > timestamp) {
        lastMessage = msg.content;
        timestamp = msg.timestamp;
      }

      // count unread messages for current user
      if (
        msg.statuses?.some(
          (s: any) =>
            s.user.id === currentUserId &&
            s.status === 'UNREAD'
        )
      ) {
        unreadCount++;
      }
    }

    return {
      id: room.id,
      name: room.name,
      lastMessage,
      timestamp,
      unreadCount
    };
  });
}

export function setAvatar(username: any): string {
  return username[0];
}

export function getRandomHexColor(): string {
    const hex = Math.floor(Math.random() * 0xffffff).toString(16);
    return `#${hex.padStart(6, '0')}`;
}

export function formatTimestamp(timestamp: Date | string): string {
    const date = new Date(timestamp);
    const now = new Date();

    const isToday =
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate();

    const time = date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });

    if (isToday) {
      return time;
    }

    const day = date.toLocaleDateString([], {
      weekday: 'short'
    });

    return `${day} ${time}`;
  }