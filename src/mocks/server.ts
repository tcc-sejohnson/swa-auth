import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { handlers, userHandler, DEFAULT_USER } from './handlers';

const server = setupServer(...handlers);

export { server, userHandler, rest, DEFAULT_USER };
