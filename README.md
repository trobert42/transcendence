# Website with a pong game and real-time chat

It is the final project of the common core, time to learn some web stuff !

The project involves creating a website featuring an interactive Pong game and a matchmaking system. Client users can create accounts, log in to chat and play.


|    Project Name    |                                                                       ft_transcendence                                                                      |
| :----------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------: |
|    Description     |       A website that runs an online multiplayer pong, a real-time chat and a user management system                                       |
|    Technologies    |  <img alt="React" src="https://img.shields.io/badge/React-20232a.svg?logo=react&logoColor=%2361DAFB"> <img alt="Nest" src="https://img.shields.io/badge/nestjs-%23E0234E.svg?logo=nestjs&logoColor=white"> <img alt="Docker" src="https://img.shields.io/badge/docker-%230db7ed.svg?logo=docker&logoColor=white"> <img alt="PostgreSQL" src ="https://img.shields.io/badge/PostgreSQL-316192.svg?logo=postgresql&logoColor=white"> <img alt="Prisma" src="https://img.shields.io/badge/Prisma-3982CE?logo=Prisma&logoColor=white"> |

## Features 
- User's features include profile data, settings, friend lists, private chats, custom avatars, game stats, and match history.
- Authentication management is handled using the 42 API (OAuth) and Google Authenticator for 2FA.
- Database management employs an ORM (Object Relational Mapping), Prisma, connecting the server to a PostgreSQL database, ensuring password security and protection against injections via POST forms.
- The frontend built using React, on port __3333__.
- The Backend development utilizes NestJS, providing a project architecture and tools for creating a REST API to enable coherent and structured communication between systems via HTTP. On port __3000__.
- It is Docker-compatible using docker-compose.
- Chat channel management involves websockets programming, supporting both public and private channels.
- The website is one-page and responsive.


## Prerequisite

To run the project, you have to install __docker-compose and docker__. You need to setup __example.env with your credentials__ and __42 API credentials__.


```bash
  gcl https://github.com/trobert42/transcendence.git
  cd transcendence
  make
```

## Usage

When the containers are done building up and are running, you go to your chrome browser (firefox also works) and write on the URL bar "localhost:3000" to access to the application.

## Screenshots
