## Description

This is a [Nest](https://github.com/nestjs/nest) project with MongoDB integration and Swagger documentation for YouApp Coding Assessment.

## Prerequisites

- Node.js (v20 or later)
- npm
- Docker and Docker Compose

## Environment Configuration

Create a .env file in the root directory with the following variables:

```dotenv
NODE_ENV=development
HOST_MONGODB=mongodb://mongo:27017/youapp_test
JWT_SECRET=any-random-and-long-string
```

## Installation

```bash
$ npm install
```

## Running the backend project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# test coverage
$ npm run test:cov
```

## Docker Setup

```bash
# Start the Docker container
$ docker-compose up --build
```

## Access Points

- Backend API: http://localhost:3000
- Swagger Documentation: http://localhost:3000/api-docs
- MongoDB:
  - Host: localhost
  - Port: 27017
  - Connection string: mongodb://mongo:27017/youapp_test

## Socket.IO Integration

This project uses Socket.IO for messaging

### Connection

Connect to the WebSocket server

```javascript
const socket = io('ws://localhost:3000');
```

### Events to Watch
### 1. Message Events

```javascript
// Listen for incoming messages
socket.on('message_data', (data) => {
  console.log('New message data received:', data);
});
```

### 2. Error
```javascript
// Listen for server error
socket.on('error_message', (data) => {
  console.error('Error:', data);
});
```

### Sending Message

`chatId` is optional on first sending. It will be created and send back from `Message Events`. The Next message should be included.

```javascript
socket.emit('send_message', {
  content: 'Hello, laurent here',
  receiverUsername: 'kevin',
  chatId: 'this-is-optional-chat-id'
});
```

## Intellectual Property

This project was developed as a technical assessment for `YouApp`.

© Laurentius Kevin Hendrawanto 2025
