import logger from '../../utils/logger';

const loggerMiddleware = (store) => (next) => (action) => {
  logger.debug('Dispatching action', {
    type: action.type,
    payload: action.payload
  });

  const result = next(action);

  logger.debug('New state', store.getState());

  return result;
};

export default loggerMiddleware;
