import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RedisService } from '../redis/redis.service';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class EventsGateway {
    @WebSocketServer()
    server: Server;

    constructor(private readonly redisService: RedisService) { }

    @SubscribeMessage('joinRoom')
    handleJoinRoom(@MessageBody() room: string, @ConnectedSocket() client: Socket) {
        client.join(room);
        return { event: 'joined', room };
    }

    @SubscribeMessage('locationUpdate')
    async handleLocationUpdate(@MessageBody() data: any) {
        // Data expectation: { vehicleId, lat, lng, tripId, timestamp }
        if (data.vehicleId && data.lat && data.lng) {
            // Update Redis/Mock with latest location
            await this.redisService.geoAdd('vehicles', data.lat, data.lng, data.vehicleId);
        }

        // Broadcast to admins
        this.server.to('admins').emit('vehicleLocation', data);

        // Broadcast to specific trip room if active
        if (data.tripId) {
            this.server.to(`trip_${data.tripId}`).emit('tripUpdate', data);
        }
    }
}
