import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import globalErrorHandler from './app/middlewares/globalErrorhandler';
import notFound from './app/middlewares/notFound';
import router from './app/routes';

const app: Application = express();

//parsers
app.use(express.json());
app.use(cookieParser());

// Corrected CORS configuration
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://camp-shop-client-djw596iv3-shakilahmmed8882s-projects.vercel.app',
    ],
    credentials: true,
  }),
);

// application routes
app.use('/api/v1', router);

app.get('/', (req: Request, res: Response) => {
  res.send('Hi Next Level Developer !');
});

app.use(globalErrorHandler);

// Not Found
app.use(notFound);

export default app;
