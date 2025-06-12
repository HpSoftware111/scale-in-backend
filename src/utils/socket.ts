import { Server } from 'socket.io';

let exportIO = null;

export const sio = server => {
  exportIO = new Server(server, {
    cors: {
      origin: '*',
    },
  });
  return exportIO;
};

export const getIO = () => {
  return exportIO;
};

export const emitPhoto = (value: any) => {
  console.log('emitting photo signal');
  exportIO.emit('photo', value);
};

export const connection = io => {
  io.on('connection', socket => {
    console.log('A user is connected id: ', socket.id);

    socket.on('message', message => {
      console.log(`message from ${socket.id} : ${message}`);
    });

    socket.on('disconnect', reason => {
      console.log('disconnected reason ==> ', reason);
    });
  });
};
