import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { handlers, DEFAULT_USER } from './handlers';

const server = setupServer(...handlers);

export { server, rest, DEFAULT_USER };
