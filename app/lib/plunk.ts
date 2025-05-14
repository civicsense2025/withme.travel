import Plunk from '@plunk/node';

const plunk = new Plunk(process.env.PLUNK_SECRET_KEY!);

export default plunk;
