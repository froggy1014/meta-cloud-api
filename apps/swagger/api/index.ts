import express, { Request, Response } from 'express';
import { apidocsRouter } from '../src/routes/apidocs';

const PORT = process.env.LISTENER_PORT || 8080;
const app = express();

app.use(express.json());
app.use('/api-docs', apidocsRouter);
app.use('/', (req: Request, res: Response) => res.redirect('/api-docs'));

app.listen(PORT, () => console.log(`Server ready on port ${PORT}.`));

module.exports = app;
