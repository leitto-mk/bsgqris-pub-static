import axios from 'axios';

const API_URL = import.meta.env.VITE_BASE_URL + '/api/auth';

const token = localStorage.getItem('qris-merchant-user-token');

const AuthService = {
    async login(formData) {
        try {
            let result = await axios
                .post(API_URL + '/login', {
                    user: formData.user,
                    password: formData.password
                })
                .then((result) => result.data);

            localStorage.setItem('qris-merchant-user-token', result.authorization.token);
            localStorage.setItem('qris-merchant-user-data', JSON.stringify(result.user));
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Login failed');
        }
    },
    validateToken() {
        return async () => {
            await axios
                .get('/api/auth/me', {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + token
                    }
                })
                .then(() => true)
                .catch(() => false);
        };
    },
    requiredAuth(roles = []) {
        return async (to, from, next) => {
            const tokenValid = await this.validateToken();
            const user = JSON.parse(localStorage.getItem('qris-merchant-user-data'));

            if (tokenValid && user && roles.includes(user.level)) {
                next();
            } else {
                next('/login');
            }
        };
    },
    async logout() {
        try {
            await axios.post(API_URL + '/logout', null, {
                headers: {
                    Authorization: 'Bearer ' + token
                }
            });
        } catch (error) {
            return error;
        }
    },
    getJwtPayload() {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(
            window
                .atob(base64)
                .split('')
                .map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                })
                .join('')
        );

        return JSON.parse(jsonPayload);
    }
};

export default AuthService;
