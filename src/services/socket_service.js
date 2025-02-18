const socketIO = require('socket.io');

let io;

module.exports = {
    init: (server) => {
        io = socketIO(server);
        
        io.on('connection', (socket) => {
            socket.on('join', (user_id) => {
                socket.join(`user_${user_id}`);
            });
        });

        return io;
    },

    notify_user: (user_id, notification) => {
        if (io) {
            io.to(`user_${user_id}`).emit('notification', notification);
        }
    }
}; 