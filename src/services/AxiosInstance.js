import router from '@/router';
import axios from 'axios';

const axiosInstance = (token) => {
    return axios.create({
        baseURL: import.meta.env.VITE_BASE_URL + '/api/bank',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token
        },
        responseType: 'json',
        responseEncoding: 'utf-8',
        validateStatus: (code) => {
            switch (code) {
                case 200:
                    return true;
                case 401:
                    localStorage.removeItem('qris-merchant-user-token');
                    localStorage.removeItem('qris-merchant-user-data');
                    router.push('/login');
                    break;
                default:
                    return false;
            }
        }
    });
};

export default axiosInstance;
