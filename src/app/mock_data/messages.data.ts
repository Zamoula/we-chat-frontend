import { Message } from "../models/message.model";

export const messages: Message[] = [
  {
    id: 0,
    sender: { id: 1, username: "Jamel M'rad" },
    content: 'Hey, are you online?',
    chat: { id: 101 },
    type: 'TEXT',
    timestamp: new Date('2025-12-21T18:30:00'),
    edited: false
  },
  {
    id: 1,
    sender: { id: 1, username: 'alice' },
    content: 'Hey, are you online?',
    chat: { id: 101 },
    type: 'TEXT',
    timestamp: new Date('2025-12-21T18:30:00'),
    edited: false
  },
  {
    id: 2,
    sender: { id: 2, username: 'bob' },
    content: 'Yep, what’s up?',
    chat: { id: 101 },
    type: 'TEXT',
    timestamp: new Date('2025-12-21T18:31:10'),
    edited: false
  },
  {
    id: 3,
    sender: { id: 1, username: 'alice' },
    content: 'Did you push the fix?',
    chat: { id: 101 },
    type: 'TEXT',
    timestamp: new Date('2025-12-21T18:32:00'),
    edited: false
  },
  {
    id: 4,
    sender: { id: 2, username: 'bob' },
    content: 'Yes, pipeline is green.',
    chat: { id: 101 },
    type: 'TEXT',
    timestamp: new Date('2025-12-21T18:32:45'),
    edited: false
  },
  {
    id: 5,
    sender: { id: 1, username: 'alice' },
    content: 'Perfect. Shipping it.',
    chat: { id: 101 },
    type: 'TEXT',
    timestamp: new Date('2025-12-21T18:33:20'),
    edited: true
  },
  {
    id: 6,
    sender: { id: 2, username: 'bob' },
    content: '🚀',
    chat: { id: 101 },
    type: 'EMOJI',
    timestamp: new Date('2025-12-21T18:33:50'),
    edited: false
  },
  {
    id: 7,
    sender: { id: 1, username: 'alice' },
    content: 'Meeting at 10 tomorrow.',
    chat: { id: 101 },
    type: 'SYSTEM',
    timestamp: new Date('2025-12-21T18:34:30'),
    edited: false
  },
  {
    id: 8,
    sender: { id: 2, username: 'bob' },
    content: 'Got it.',
    chat: { id: 101 },
    type: 'TEXT',
    timestamp: new Date('2025-12-21T18:35:00'),
    edited: false
  }
];
