// server/websockets/socket.js
import jwt from 'jsonwebtoken';
import Document from '../models/Document.js';
import User from '../models/User.js';

/**
 * Real-time socket manager with:
 * - JWT handshake authentication
 * - Room per document: `document:<docId>`
 * - Presence tracking (who's online in each doc)
 * - cursor-update events
 * - text-change broadcasting and save-document handling
 *
 * Usage:
 *   In server.js you already do: attachSocket(io)
 *
 * Handshake:
 *   The client should send token in handshake auth:
 *     const socket = io(API_URL, { auth: { token: 'Bearer <token>' } });
 *   Or send the raw token (without 'Bearer ') as auth.token.
 */

const rooms = new Map(); // map docId -> Map(socketId -> { userId, name, socketId })
const userSocketMap = new Map(); // map userId -> Set(socketId)

function addPresence(docId, socket, user) {
  if (!rooms.has(docId)) rooms.set(docId, new Map());
  rooms.get(docId).set(socket.id, { userId: user.id, name: user.name, socketId: socket.id });
  // add to userSocketMap
  const set = userSocketMap.get(user.id) || new Set();
  set.add(socket.id);
  userSocketMap.set(user.id, set);
}

function removePresence(docId, socket) {
  if (!rooms.has(docId)) return;
  const roomMap = rooms.get(docId);
  const info = roomMap.get(socket.id);
  if (info) {
    roomMap.delete(socket.id);
    // remove from userSocketMap
    const uset = userSocketMap.get(info.userId);
    if (uset) {
      uset.delete(socket.id);
      if (uset.size === 0) userSocketMap.delete(info.userId);
      else userSocketMap.set(info.userId, uset);
    }
    if (roomMap.size === 0) rooms.delete(docId);
    return info;
  }
  return null;
}

function listPresence(docId) {
  const roomMap = rooms.get(docId);
  if (!roomMap) return [];
  const seen = new Map(); // userId -> { userId, name, sockets }
  for (const [sockId, info] of roomMap) {
    if (!seen.has(info.userId)) seen.set(info.userId, { userId: info.userId, name: info.name, sockets: [sockId] });
    else seen.get(info.userId).sockets.push(sockId);
  }
  return Array.from(seen.values());
}

// Verify token helper
function verifyTokenFromHandshake(socket) {
  try {
    // handshake.auth.token preferred (client: io(url, { auth: { token } }))
    let token = socket.handshake.auth?.token;

    // fallback: client may send "Bearer <token>" or raw token
    if (token && token.startsWith('Bearer ')) token = token.split(' ')[1];

    // fallback: try cookies header (if client sends cookies)
    if (!token && socket.handshake.headers?.cookie) {
      // simple cookie parse for 'token' or 'refreshToken'
      const cookies = socket.handshake.headers.cookie.split(';').map((c) => c.trim());
      for (const c of cookies) {
        if (c.startsWith('token=')) {
          token = decodeURIComponent(c.split('=')[1]);
          break;
        }
      }
    }

    if (!token) return null;
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return payload; // { id, role, iat, exp }
  } catch (err) {
    return null;
  }
}

export function attachSocket(io) {
  // middleware to authenticate socket
  io.use((socket, next) => {
    const payload = verifyTokenFromHandshake(socket);
    if (!payload) {
      return next(new Error('Authentication error: invalid or missing token'));
    }
    // attach user info to socket for later use
    socket.user = { id: payload.id, role: payload.role || 'editor' };
    return next();
  });

  io.on('connection', (socket) => {
    // When connected, we have socket.user
    console.log('Socket connected:', socket.id, 'userId:', socket.user?.id);

    // client should emit 'join-document' with { docId, user: { id, name } }
    socket.on('join-document', async ({ docId, user }) => {
      if (!docId) return;
      // verify user permission server-side optionally (quick check)
      try {
        const doc = await Document.findById(docId).select('owner permissions content title');
        if (!doc) {
          socket.emit('error', { message: 'Document not found' });
          return;
        }

        // check permission: owner or in permissions
        const isOwner = doc.owner?.toString() === socket.user.id;
        const isShared = doc.permissions?.some((p) => p.user.toString() === socket.user.id);
        if (!isOwner && !isShared) {
          socket.emit('error', { message: 'No access to document' });
          return;
        }

        socket.join(`document:${docId}`);

        // Save a friendly name if client did not send one
        const clientUser = user || { id: socket.user.id, name: 'Unknown' };

        addPresence(docId, socket, clientUser);

        // Send current document content to the newly joined socket
        socket.emit('document-load', { content: doc.content || { ops: [] }, title: doc.title });

        // Broadcast presence update to room
        io.to(`document:${docId}`).emit('user-joined', {
          userId: clientUser.id,
          name: clientUser.name,
          presence: listPresence(docId)
        });

        // also send presence snapshot to the joining socket
        socket.emit('presence-update', { presence: listPresence(docId) });

      } catch (err) {
        console.error('join-document error', err);
        socket.emit('error', { message: 'Server error joining document' });
      }
    });

    // text-change events (delta broadcast)
    socket.on('text-change', ({ docId, delta }) => {
      if (!docId) return;
      socket.to(`document:${docId}`).emit('text-change', { delta, socketId: socket.id });
    });

    // cursor updates
    socket.on('cursor-update', ({ docId, cursor }) => {
      if (!docId) return;
      // broadcast cursor positions to others
      socket.to(`document:${docId}`).emit('cursor-update', {
        socketId: socket.id,
        userId: socket.user.id,
        cursor
      });
    });

    // save-document: client sends full content for persistence
    socket.on('save-document', async ({ docId, content }) => {
      if (!docId) return;
      try {
        await Document.findByIdAndUpdate(docId, { content, updatedAt: new Date() }, { new: true });
        socket.to(`document:${docId}`).emit('document-saved', { docId, by: socket.user.id });
      } catch (err) {
        console.error('save-document error', err);
        socket.emit('error', { message: 'Save failed' });
      }
    });

    // client requests presence list
    socket.on('presence-request', ({ docId }) => {
      socket.emit('presence-update', { presence: listPresence(docId) });
    });

    socket.on('disconnecting', () => {
      // note: socket.rooms still contains rooms we are in
      for (const room of socket.rooms) {
        if (room.startsWith('document:')) {
          const docId = room.split(':')[1];
          const info = removePresence(docId, socket);
          if (info) {
            // broadcast user-left and updated presence snapshot
            io.to(room).emit('user-left', { userId: info.userId, socketId: socket.id, presence: listPresence(docId) });
            io.to(room).emit('presence-update', { presence: listPresence(docId) });
          }
        }
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected', socket.id, reason);
    });
  });
}
