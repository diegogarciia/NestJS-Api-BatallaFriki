import { Injectable } from '@nestjs/common';
import { ConnectedUser } from './schemas/connected-user.schema';

@Injectable()
export class WebsocketsService {
  private activeUsers: ConnectedUser[] = [];

  addUser(socketId: string, userId: number, nick: string) {
    this.removeUser(socketId);

    const newUser: ConnectedUser = { socketId, userId, nick };
    
    this.activeUsers.push(newUser);
    
    console.log(`Usuario registrado en memoria: ${nick} (ID: ${userId})`);
    return newUser;
  }

  removeUser(socketId: string) {
    this.activeUsers = this.activeUsers.filter(user => user.socketId !== socketId);
  }

  getUserBySocketId(socketId: string): ConnectedUser | undefined {
    return this.activeUsers.find(user => user.socketId === socketId);
  }
}