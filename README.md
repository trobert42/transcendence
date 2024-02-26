# Website with a pong game and real-time chat

It is the final project of the common core, time to learn some web stuff !

The project involves creating a website featuring an interactive Pong game and a matchmaking system. Client users can create accounts, log in to chat and play.


|    Project Name    |                                                                       ft_transcendence                                                                      |
| :----------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------: |
|    Description     |       A website that runs an online multiplayer pong, a real-time chat and a user management system                                       |
|    Technologies    |  <img alt="React" src="https://img.shields.io/badge/React-20232a.svg?logo=react&logoColor=%2361DAFB"> <img alt="Nest" src="https://img.shields.io/badge/nestjs-%23E0234E.svg?logo=nestjs&logoColor=white"> <img alt="Docker" src="https://img.shields.io/badge/docker-%230db7ed.svg?logo=docker&logoColor=white"> <img alt="PostgreSQL" src ="https://img.shields.io/badge/PostgreSQL-316192.svg?logo=postgresql&logoColor=white"> <img alt="Prisma" src="https://img.shields.io/badge/Prisma-3982CE?logo=Prisma&logoColor=white"> |

## Features 
- User's features include profile data, settings, friend lists, private chats, custom avatars, game stats, and match history.
- Authentication management is handled using the 42 API (OAuth2) and Google Authenticator for 2FA.
- Database management employs an ORM (Object Relational Mapping), Prisma, connecting the server to a PostgreSQL database, ensuring password security and protection against injections via POST forms.
- The frontend built using React, on port __3333__.
- The Backend development utilizes NestJS, providing a project architecture and tools for creating a REST API to enable coherent and structured communication between systems via HTTP. On port __3000__.
- It is Docker-compatible using docker-compose.
- Chat channel management involves websockets programming, supporting both public and private channels.
- The website is one-page and responsive.


## Prerequisite

To run the project, you have to install __docker-compose and docker__. You need to rename "example.env" to ".env" and setup the file __.env with your credentials__ and __42 API credentials__.
```bash
  gcl https://github.com/trobert42/transcendence.git
  cd transcendence
  mv example.env .env
  code .env #or vi .env
```

You have to put a password for the jwt secret and for the refresh jwt secret. You need also to put your __42 API credentials__, if you don't it won't work.
```bash
...
JWT_SECRET=""
JWT_REFRESH_SECRET=""
API_42_UID=""
API_42_PWD=""
...
```

## Usage
```bash
  make
```
When the containers are done building up and are running, you go to your chrome browser (firefox also works) and write on the URL bar "localhost:3000" to access to the application.

## Screenshots
Here are the ideas we gathered and drew on Figma:
![](https://github.com/trobert42/transcendence/blob/main/transcendence_figma.png)

And look how the website ended up ! We succeed to realize what we wanted to display.
![](https://github.com/trobert42/transcendence/blob/main/transcendence_clip.gif)

## 💬
Big thanks to Antoine, Pierre, Elsie and Cyril! We ended the final project together, we can be proud :D
It was a wonderful group experience. I think we gained valuable experience in collaboration, problem-solving, and technical skills development. I really feel a sense of accomplishment and satisfaction in seeing our project come to fruition despite the challenges we faced along the way !
