import axios from './index';

const getAccount = () => axios.get('/me');

export default getAccount;
