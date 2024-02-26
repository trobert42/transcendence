import { config } from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as passport from 'passport';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);


  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  app.use(cookieParser());
  app.use(passport.initialize());
  const cors = require('cors');
  const corsOptions = {
    origin: [process.env.REACT_APP_SITE_URL+':3000'],
    credentials: true,
  };
  app.use(cors(corsOptions));
  app.use(function (req, res, next) { 
    res.header('Access-Control-Allow-Origin', process.env.REACT_APP_SITE_URL+':3000');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    next();
  });

  await app.listen(3333, () => {
    console.log('Serveur en cours d exécution sur le port 3333');
  });
}

bootstrap();