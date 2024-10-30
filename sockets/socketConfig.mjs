import { Server } from "socket.io";
import docs from '../datamodels/docs.mjs'; // Ensure this path is correct

let typingTimeouts = {};

export const initializeSockets = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:3001", "http://localhost:3002", "https://www.student.bth.se/~sahb23/editor/"],
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('a user connected:', socket.id);

    socket.on('joinDocument', ({ documentId, email }) => {
      socket.join(documentId);
      console.log(`User ${socket.id} (Email: ${email}) joined document ${documentId}`);
    });

    socket.on('typingContent', ({ documentId, content, email }) => {
      console.log(`User ${email} is typing in document ${documentId}: ${content ? content : ''}`);

      if (typingTimeouts[documentId]) clearTimeout(typingTimeouts[documentId]);

      typingTimeouts[documentId] = setTimeout(async () => {
        try {
          const documentData = { id: documentId, content: content };
          const response = await docs.updateOne('documents', documentData);
          console.log(`Document ${documentId} saved with content: ${content} response:`, response);
        } catch (error) {
          console.error(`Error saving document ${documentId}:`, error);
        }
      }, 3000);

      socket.to(documentId).emit('receiveTypingContent', content);
    });

    socket.on('typingTitle', ({ documentId, title, email }) => {
      console.log(`User ${email} is typing in document ${documentId}: ${title ? title : ''}`);

      if (typingTimeouts[documentId]) clearTimeout(typingTimeouts[documentId]);

      typingTimeouts[documentId] = setTimeout(async () => {
        try {
          const documentData = { id: documentId, title: title };
          const response = await docs.updateOne('documents', documentData);
          console.log(`Document ${documentId} saved with title: ${title} response:`, response);
        } catch (error) {
          console.error(`Error saving document ${documentId}:`, error);
        }
      }, 3000);

      socket.to(documentId).emit('receiveTypingTitle', title);
    });

    socket.on('disconnect', () => {
      console.log('user disconnected:', socket.id);
    });
  });
};
